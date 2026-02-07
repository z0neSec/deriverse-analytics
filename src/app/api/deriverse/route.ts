/**
 * Deriverse API Route
 * Server-side handler that uses the @deriverse/kit SDK
 * This bypasses browser Buffer issues and provides clean data to the client
 */

import { NextRequest, NextResponse } from "next/server";
import { createSolanaRpc, address } from "@solana/kit";
import { Engine } from "@deriverse/kit";
import { PublicKey, Connection } from "@solana/web3.js";

// Deriverse Devnet Configuration
const DERIVERSE_CONFIG = {
  PROGRAM_ID: "Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu",
  RPC_HTTP: "https://api.devnet.solana.com",
  VERSION: 12,
};

// Token mints on Deriverse Devnet
const TOKEN_MINTS = {
  SOL: "9pan9bMn5HatX4EJdBwg9VgCa7Uz5HL8N1m5D3NdXejP",
  USDC: "A2Pz6rVyXuadFkKnhMXd1w9xgSrZd8m8sEGpuGuyFhaj",
};

// Create RPC connection
const rpc = createSolanaRpc(DERIVERSE_CONFIG.RPC_HTTP);

// web3.js connection for fallback RPC calls
const web3Connection = new Connection(DERIVERSE_CONFIG.RPC_HTTP, "confirmed");

// Account type tag for client primary accounts
const CLIENT_PRIMARY_TAG = 31;

// Engine singleton (cached)
let engineInstance: Engine | null = null;
let engineInitialized = false;
let initializationError: string | null = null;
let instrumentsLoaded = false;

// Fallback price cache for when SDK fails
let fallbackPriceCache: { data: Record<string, number>; timestamp: number } | null = null;
const PRICE_CACHE_TTL = 30000; // 30 seconds

/**
 * Direct RPC fallback to find client accounts when SDK fails
 * Uses getProgramAccounts to search for accounts owned by the wallet
 */
async function findClientAccountsDirect(walletAddress: string): Promise<{
  hasAccount: boolean;
  clientId: number | null;
  spotTrades: number;
  perpTrades: number;
  lpTrades: number;
  points: number;
  spotPositions: Array<{ instrId: number }>;
  perpPositions: Array<{ instrId: number }>;
}> {
  try {
    const programId = new PublicKey(DERIVERSE_CONFIG.PROGRAM_ID);
    const walletPubkey = new PublicKey(walletAddress);

    console.log("[DeriverseAPI] Direct RPC: Searching for client accounts for", walletAddress);

    // Create the tag buffer: version (4 bytes LE) + account type (4 bytes LE)
    // CLIENT_PRIMARY = 31 (0x1F)
    const tagBuf = Buffer.alloc(8);
    tagBuf.writeUInt32LE(DERIVERSE_CONFIG.VERSION, 0); // version = 12
    tagBuf.writeUInt32LE(CLIENT_PRIMARY_TAG, 4); // CLIENT_PRIMARY = 31

    // Find client primary account PDA using the same derivation as SDK
    const [clientPda] = PublicKey.findProgramAddressSync(
      [
        tagBuf,
        walletPubkey.toBuffer(),
      ],
      programId
    );

    console.log("[DeriverseAPI] Direct RPC: Client PDA:", clientPda.toBase58());

    // Try to fetch the account
    const accountInfo = await web3Connection.getAccountInfo(clientPda);

    if (!accountInfo) {
      console.log("[DeriverseAPI] Direct RPC: No client account found at PDA");
      return {
        hasAccount: false,
        clientId: null,
        spotTrades: 0,
        perpTrades: 0,
        lpTrades: 0,
        points: 0,
        spotPositions: [],
        perpPositions: [],
      };
    }

    console.log("[DeriverseAPI] Direct RPC: Found client account, data length:", accountInfo.data.length);

    const data = accountInfo.data;
    
    // Parse client primary account structure based on SDK offsets
    // ClientPrimaryAccountHeaderModel offsets:
    const OFFSET_ID = 248;
    const OFFSET_SPOT_TRADES = 280;
    const OFFSET_PERP_TRADES = 284;
    const OFFSET_LP_TRADES = 288;
    const OFFSET_POINTS = 292;
    const OFFSET_ASSETS_COUNT = 300;
    
    let clientId = 0;
    let spotTrades = 0;
    let perpTrades = 0;
    let lpTrades = 0;
    let points = 0;
    let assetsCount = 0;
    
    try {
      if (data.length > OFFSET_ID + 4) {
        clientId = data.readUInt32LE(OFFSET_ID);
      }
      if (data.length > OFFSET_SPOT_TRADES + 4) {
        spotTrades = data.readUInt32LE(OFFSET_SPOT_TRADES);
      }
      if (data.length > OFFSET_PERP_TRADES + 4) {
        perpTrades = data.readUInt32LE(OFFSET_PERP_TRADES);
      }
      if (data.length > OFFSET_LP_TRADES + 4) {
        lpTrades = data.readUInt32LE(OFFSET_LP_TRADES);
      }
      if (data.length > OFFSET_POINTS + 4) {
        points = data.readUInt32LE(OFFSET_POINTS);
      }
      if (data.length > OFFSET_ASSETS_COUNT + 4) {
        assetsCount = data.readUInt32LE(OFFSET_ASSETS_COUNT);
      }
    } catch (err) {
      console.warn("[DeriverseAPI] Direct RPC: Error parsing account data:", err);
    }

    console.log("[DeriverseAPI] Direct RPC: Parsed data:", { 
      clientId, 
      spotTrades, 
      perpTrades, 
      lpTrades, 
      points,
      assetsCount
    });

    // For now, assume the user has positions in SOL/USDC (instrId 0)
    // If they have any trades, they likely have positions
    const hasActivity = spotTrades > 0 || perpTrades > 0;
    const spotPositions = hasActivity ? [{ instrId: 0 }] : [];
    const perpPositions = hasActivity ? [{ instrId: 0 }] : [];

    return {
      hasAccount: true,
      clientId,
      spotTrades,
      perpTrades,
      lpTrades,
      points,
      spotPositions,
      perpPositions,
    };
  } catch (error) {
    console.warn("[DeriverseAPI] Direct RPC fallback failed:", error);
    return {
      hasAccount: false,
      clientId: null,
      spotTrades: 0,
      perpTrades: 0,
      lpTrades: 0,
      points: 0,
      spotPositions: [],
      perpPositions: [],
    };
  }
}

async function fetchFallbackPrices(): Promise<Record<string, number>> {
  if (fallbackPriceCache && Date.now() - fallbackPriceCache.timestamp < PRICE_CACHE_TTL) {
    return fallbackPriceCache.data;
  }

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin,ethereum&vs_currencies=usd",
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      const prices: Record<string, number> = {
        "SOL/USDC": data.solana?.usd || 180,
        "BTC/USDC": data.bitcoin?.usd || 95000,
        "ETH/USDC": data.ethereum?.usd || 3200,
      };
      fallbackPriceCache = { data: prices, timestamp: Date.now() };
      console.log("[DeriverseAPI] Fetched fallback prices:", prices);
      return prices;
    }
  } catch (error) {
    console.warn("[DeriverseAPI] Failed to fetch fallback prices:", error);
  }

  // Return static fallbacks
  return {
    "SOL/USDC": 180,
    "BTC/USDC": 95000,
    "ETH/USDC": 3200,
  };
}

async function getEngine(): Promise<Engine | null> {
  if (initializationError) {
    console.warn("[DeriverseAPI] Skipping engine - previous initialization failed:", initializationError);
    return null;
  }

  if (!engineInstance) {
    engineInstance = new Engine(rpc, {
      programId: address(DERIVERSE_CONFIG.PROGRAM_ID),
      version: DERIVERSE_CONFIG.VERSION,
    });
  }
  
  if (!engineInitialized) {
    try {
      await engineInstance.initialize();
      engineInitialized = true;
      console.log("[DeriverseAPI] Engine initialized successfully");
    } catch (error) {
      console.error("[DeriverseAPI] Initialization failed:", error);
      initializationError = error instanceof Error ? error.message : String(error);
      return null;
    }
  }

  // Try to load the SOL/USDC instrument on demand
  if (!instrumentsLoaded && engineInstance) {
    try {
      // Get token IDs first
      const solTokenId = await engineInstance.getTokenId(address(TOKEN_MINTS.SOL));
      const usdcTokenId = await engineInstance.getTokenId(address(TOKEN_MINTS.USDC));
      
      console.log("[DeriverseAPI] Token IDs - SOL:", solTokenId, "USDC:", usdcTokenId);
      
      if (solTokenId !== null && usdcTokenId !== null) {
        // Get the instrument ID for SOL/USDC
        const instrId = await engineInstance.getInstrId({ 
          assetTokenId: solTokenId, 
          crncyTokenId: usdcTokenId 
        });
        
        console.log("[DeriverseAPI] SOL/USDC Instrument ID:", instrId);
        
        if (instrId !== null) {
          // Try to update instrument data
          try {
            await engineInstance.updateInstrData({ instrId });
            console.log("[DeriverseAPI] Loaded instrument data for SOL/USDC");
          } catch (instrError) {
            console.warn("[DeriverseAPI] Failed to update instrument data:", instrError);
          }
        }
      }
      
      instrumentsLoaded = true;
      console.log("[DeriverseAPI] Instruments count after load:", engineInstance.instruments?.size || 0);
    } catch (error) {
      console.error("[DeriverseAPI] Failed to load instruments:", error);
      instrumentsLoaded = true;
    }
  }
  
  return engineInstance;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");
  const walletAddress = searchParams.get("wallet");

  if (!action) {
    return NextResponse.json({ error: "Missing action parameter" }, { status: 400 });
  }

  try {
    const engine = await getEngine();

    // Handle SDK initialization failure gracefully
    if (!engine) {
      console.warn("[DeriverseAPI] Engine not available, returning empty data");
      switch (action) {
        case "instruments":
          return NextResponse.json({ instruments: [], sdkError: initializationError });
        case "prices":
          return NextResponse.json({ prices: {}, sdkError: initializationError });
        case "client":
          return NextResponse.json({ 
            hasAccount: false, 
            clientId: null, 
            balances: [], 
            spotPositions: [], 
            perpPositions: [],
            sdkError: initializationError
          });
        default:
          return NextResponse.json({ error: "SDK not initialized", sdkError: initializationError }, { status: 503 });
      }
    }

    switch (action) {
      case "instruments": {
        // Return all available instruments
        const instruments: Array<{
          id: number;
          symbol: string;
          lastPrice: number;
          bestBid: number;
          bestAsk: number;
          volume24h: number;
          hasPerp: boolean;
          source?: string;
        }> = [];

        if (engine.instruments && engine.instruments.size > 0) {
          for (const [id, instr] of engine.instruments) {
            instruments.push({
              id,
              symbol: getSymbolFromInstrId(id),
              lastPrice: instr.header.lastPx,
              bestBid: instr.header.bestBid,
              bestAsk: instr.header.bestAsk,
              volume24h: instr.header.dayAssetTokens || 0,
              hasPerp: (instr.header.mask & 0x40000000) !== 0, // PERP flag
              source: "deriverse-sdk",
            });
          }
        }
        
        // If no instruments from SDK, provide fallback data
        if (instruments.length === 0) {
          console.log("[DeriverseAPI] No SDK instruments available, using fallback");
          const fallbackPrices = await fetchFallbackPrices();
          
          instruments.push({
            id: 0,
            symbol: "SOL/USDC",
            lastPrice: fallbackPrices["SOL/USDC"] || 180,
            bestBid: (fallbackPrices["SOL/USDC"] || 180) * 0.999,
            bestAsk: (fallbackPrices["SOL/USDC"] || 180) * 1.001,
            volume24h: 0, // Unknown from fallback
            hasPerp: true,
            source: "coingecko-fallback",
          });
        }

        return NextResponse.json({ instruments });
      }

      case "client": {
        if (!walletAddress) {
          return NextResponse.json({ error: "Missing wallet parameter" }, { status: 400 });
        }

        try {
          // Set the signer to fetch client data
          await engine.setSigner(address(walletAddress));

          if (!engine.originalClientId) {
            // No Deriverse account for this wallet
            return NextResponse.json({ 
              hasAccount: false,
              clientId: null,
              balances: [],
              spotPositions: [],
              perpPositions: [],
            });
          }

          const clientData = await engine.getClientData();

          // Convert Map to array for JSON
          const balances: Array<{ tokenId: number; amount: number }> = [];
          for (const [tokenId, data] of clientData.tokens) {
            balances.push({ tokenId, amount: data.amount });
          }

          const spotPositions: Array<{ instrId: number; clientId: number }> = [];
          for (const [instrId, data] of clientData.spot) {
            spotPositions.push({ instrId, clientId: data.clientId });
          }

          const perpPositions: Array<{ instrId: number; clientId: number }> = [];
          for (const [instrId, data] of clientData.perp) {
            perpPositions.push({ instrId, clientId: data.clientId });
          }

          return NextResponse.json({
            hasAccount: true,
            clientId: clientData.clientId,
            spotTrades: clientData.spotTrades,
            perpTrades: clientData.perpTrades,
            lpTrades: clientData.lpTrades,
            points: clientData.points,
            balances,
            spotPositions,
            perpPositions,
          });
        } catch (error) {
          console.warn("[DeriverseAPI] SDK client data fetch failed, trying direct RPC:", error);
          
          // Try direct RPC fallback
          const directResult = await findClientAccountsDirect(walletAddress);
          
          if (directResult.hasAccount) {
            console.log("[DeriverseAPI] Direct RPC found client account:", directResult);
            return NextResponse.json({
              hasAccount: true,
              clientId: directResult.clientId,
              spotTrades: directResult.spotTrades,
              perpTrades: directResult.perpTrades,
              lpTrades: directResult.lpTrades,
              points: directResult.points,
              balances: [],
              spotPositions: directResult.spotPositions.map(p => ({ instrId: p.instrId, clientId: directResult.clientId || 0 })),
              perpPositions: directResult.perpPositions.map(p => ({ instrId: p.instrId, clientId: directResult.clientId || 0 })),
              source: "direct-rpc",
            });
          }
          
          // Return empty data if both methods fail
          return NextResponse.json({ 
            hasAccount: false,
            clientId: null,
            balances: [],
            spotPositions: [],
            perpPositions: [],
            sdkError: error instanceof Error ? error.message : "SDK client fetch failed",
          });
        }
      }

      case "spotOrders": {
        if (!walletAddress) {
          return NextResponse.json({ error: "Missing wallet parameter" }, { status: 400 });
        }

        const instrId = parseInt(searchParams.get("instrId") || "0");
        
        try {
          await engine.setSigner(address(walletAddress));
          
          if (!engine.originalClientId) {
            return NextResponse.json({ bids: [], asks: [] });
          }

          const clientData = await engine.getClientData();
          const spotData = clientData.spot.get(instrId);

          if (!spotData) {
            return NextResponse.json({ bids: [], asks: [] });
          }

          const ordersInfo = await engine.getClientSpotOrdersInfo({
            clientId: spotData.clientId,
            instrId,
          });

          if (ordersInfo.bidsCount === 0 && ordersInfo.asksCount === 0) {
            return NextResponse.json({ bids: [], asks: [], ordersInfo });
          }

          const orders = await engine.getClientSpotOrders({
            instrId,
            bidsCount: ordersInfo.bidsCount,
            asksCount: ordersInfo.asksCount,
            bidsEntry: ordersInfo.bidsEntry,
            asksEntry: ordersInfo.asksEntry,
          });

          return NextResponse.json({
            ordersInfo,
            bids: orders.bids.map(o => ({
              orderId: o.orderId,
              line: o.line, // Price level reference
              quantity: o.qty,
              filled: o.sum,
              timestamp: o.time,
            })),
            asks: orders.asks.map(o => ({
              orderId: o.orderId,
              line: o.line, // Price level reference
              quantity: o.qty,
              filled: o.sum,
              timestamp: o.time,
            })),
          });
        } catch (error) {
          console.warn("[DeriverseAPI] Spot orders fetch failed:", error);
          return NextResponse.json({ bids: [], asks: [], sdkError: error instanceof Error ? error.message : "SDK error" });
        }
      }

      case "perpOrders": {
        if (!walletAddress) {
          return NextResponse.json({ error: "Missing wallet parameter" }, { status: 400 });
        }

        const instrId = parseInt(searchParams.get("instrId") || "0");
        
        try {
          await engine.setSigner(address(walletAddress));
          
          if (!engine.originalClientId) {
            return NextResponse.json({ bids: [], asks: [], position: null });
          }

          const clientData = await engine.getClientData();
          const perpData = clientData.perp.get(instrId);

          if (!perpData) {
            return NextResponse.json({ bids: [], asks: [], position: null });
          }

          const ordersInfo = await engine.getClientPerpOrdersInfo({
            clientId: perpData.clientId,
            instrId,
          });

          // Extract position data
          const position = {
            perps: ordersInfo.perps,
            funds: ordersInfo.funds,
            inOrdersPerps: ordersInfo.inOrdersPerps,
            inOrdersFunds: ordersInfo.inOrdersFunds,
            fees: ordersInfo.fees,
            rebates: ordersInfo.rebates,
            result: ordersInfo.result, // Realized PnL
            cost: ordersInfo.cost, // Position cost
            leverage: ordersInfo.mask & 0xFF, // First byte is leverage
            fundingFunds: ordersInfo.fundingFunds,
            socLossFunds: ordersInfo.socLossFunds,
          };

          if (ordersInfo.bidsCount === 0 && ordersInfo.asksCount === 0) {
            return NextResponse.json({ bids: [], asks: [], position, ordersInfo });
          }

          const orders = await engine.getClientPerpOrders({
            instrId,
            bidsCount: ordersInfo.bidsCount,
            asksCount: ordersInfo.asksCount,
            bidsEntry: ordersInfo.bidsEntry,
            asksEntry: ordersInfo.asksEntry,
          });

          return NextResponse.json({
            ordersInfo,
            position,
            bids: orders.bids.map(o => ({
              orderId: o.orderId,
              line: o.line, // Price level reference
              quantity: o.qty,
              filled: o.sum,
              timestamp: o.time,
            })),
            asks: orders.asks.map(o => ({
              orderId: o.orderId,
              line: o.line, // Price level reference
              quantity: o.qty,
              filled: o.sum,
              timestamp: o.time,
            })),
          });
        } catch (error) {
          console.warn("[DeriverseAPI] Perp orders fetch failed:", error);
          return NextResponse.json({ bids: [], asks: [], position: null, sdkError: error instanceof Error ? error.message : "SDK error" });
        }
      }

      case "marketData": {
        const instrId = parseInt(searchParams.get("instrId") || "0");
        
        // Try to update instrument data
        try {
          await engine.updateInstrData({ instrId });
        } catch {
          console.log("[DeriverseAPI] marketData: Failed to update instrument data, using fallback");
        }
        
        const instr = engine.instruments.get(instrId);
        if (!instr) {
          // Fallback: return price from CoinGecko
          const fallbackPrices = await fetchFallbackPrices();
          const symbol = getSymbolFromInstrId(instrId);
          const price = fallbackPrices[symbol] || fallbackPrices["SOL"] || 0;
          
          return NextResponse.json({
            instrId,
            symbol,
            lastPrice: price,
            bestBid: price * 0.999,
            bestAsk: price * 1.001,
            spotBids: [],
            spotAsks: [],
            perpBids: [],
            perpAsks: [],
            source: "coingecko-fallback",
          });
        }

        return NextResponse.json({
          instrId,
          symbol: getSymbolFromInstrId(instrId),
          lastPrice: instr.header.lastPx,
          bestBid: instr.header.bestBid,
          bestAsk: instr.header.bestAsk,
          spotBids: instr.spotBids.slice(0, 10).map(l => ({ price: l.px, quantity: l.qty })),
          spotAsks: instr.spotAsks.slice(0, 10).map(l => ({ price: l.px, quantity: l.qty })),
          perpBids: instr.perpBids.slice(0, 10).map(l => ({ price: l.px, quantity: l.qty })),
          perpAsks: instr.perpAsks.slice(0, 10).map(l => ({ price: l.px, quantity: l.qty })),
          source: "deriverse-sdk",
        });
      }

      case "prices": {
        // Get all current prices from instruments
        const prices: Record<string, { 
          lastPrice: number; 
          bestBid: number; 
          bestAsk: number;
          midPrice: number;
        }> = {};

        // Try to load instrument data from SDK
        let usedFallback = false;
        
        if (engine.instruments && engine.instruments.size > 0) {
          for (const [id, instr] of engine.instruments) {
            const symbol = getSymbolFromInstrId(id);
            const midPrice = (instr.header.bestBid + instr.header.bestAsk) / 2;
            prices[symbol] = {
              lastPrice: instr.header.lastPx,
              bestBid: instr.header.bestBid,
              bestAsk: instr.header.bestAsk,
              midPrice: midPrice || instr.header.lastPx,
            };
          }
        }
        
        // If SDK instruments are empty, use fallback prices
        if (Object.keys(prices).length === 0) {
          console.log("[DeriverseAPI] No SDK prices available, using CoinGecko fallback");
          usedFallback = true;
          const fallbackPrices = await fetchFallbackPrices();
          
          // Convert fallback prices to expected format
          for (const [symbol, price] of Object.entries(fallbackPrices)) {
            prices[symbol] = {
              lastPrice: price,
              bestBid: price * 0.999, // Simulate small spread
              bestAsk: price * 1.001,
              midPrice: price,
            };
          }
        }

        return NextResponse.json({ prices, source: usedFallback ? "coingecko" : "deriverse-sdk" });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Deriverse API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Helper to map instrument ID to symbol
function getSymbolFromInstrId(instrId: number): string {
  const symbols: Record<number, string> = {
    0: "SOL/USDC",
    1: "BTC/USDC",
    2: "ETH/USDC",
    3: "RAY/USDC",
    4: "BONK/USDC",
    5: "JUP/USDC",
    6: "PYTH/USDC",
  };
  return symbols[instrId] || `UNKNOWN-${instrId}/USDC`;
}
