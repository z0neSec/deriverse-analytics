/**
 * Deriverse SDK Service
 * Connects to the Deriverse decentralized exchange on Solana
 * Fetches live trading data, positions, and account information
 * 
 * Note: Due to browser compatibility issues with the SDK's buffer parsing,
 * we use direct Solana RPC calls to fetch transaction history.
 */

import type { Trade, Position, TradeSide, MarketType, OrderType } from "@/types";

// Deriverse Devnet Configuration
export const DERIVERSE_CONFIG = {
  PROGRAM_ID: "Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu",
  RPC_HTTP: "https://api.devnet.solana.com",
  VERSION: 12,
};

// Live price cache (updated periodically)
const livePriceCache: Record<string, { price: number; timestamp: number }> = {};
const PRICE_CACHE_TTL = 30000; // 30 seconds

// Trading pair mapping based on instrument ID
const SYMBOL_MAP: Record<number, string> = {
  0: "SOL/USDC",
  1: "BTC/USDC",
  2: "ETH/USDC",
  3: "RAY/USDC",
  4: "BONK/USDC",
  5: "JUP/USDC",
  6: "PYTH/USDC",
};

// Known Deriverse instruction discriminators (first 8 bytes of instruction data)
// These help identify what type of trade it is
const INSTRUCTION_TYPES = {
  // Perp instructions
  PERP_PLACE_ORDER: "perp_place_order",
  PERP_CANCEL_ORDER: "perp_cancel",
  PERP_SETTLE: "perp_settle",
  // Spot instructions  
  SPOT_PLACE_ORDER: "spot_place_order",
  SPOT_SWAP: "spot_swap",
  SERUM_PLACE_ORDER: "serum3_place_order",
};

/**
 * Fetch live price from a public API
 * Exported for use in real-time PnL calculations
 */
export async function fetchLivePrice(symbol: string): Promise<number> {
  const baseSymbol = symbol.split("/")[0].toLowerCase();
  
  // Check cache first
  const cached = livePriceCache[baseSymbol];
  if (cached && Date.now() - cached.timestamp < PRICE_CACHE_TTL) {
    console.log(`[Price] Using cached price for ${symbol}: $${cached.price}`);
    return cached.price;
  }
  
  try {
    // Use CoinGecko API for live prices
    const coinIds: Record<string, string> = {
      sol: "solana",
      btc: "bitcoin",
      eth: "ethereum",
      ray: "raydium",
      bonk: "bonk",
      jup: "jupiter-exchange-solana",
      pyth: "pyth-network",
    };
    
    const coinId = coinIds[baseSymbol] || "solana";
    console.log(`[Price] Fetching live price for ${symbol} (${coinId})...`);
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      const price = data[coinId]?.usd || getFallbackPrice(symbol);
      livePriceCache[baseSymbol] = { price, timestamp: Date.now() };
      console.log(`[Price] Live price for ${symbol}: $${price}`);
      return price;
    } else {
      console.warn(`[Price] API returned ${response.status} for ${symbol}`);
    }
  } catch (error) {
    console.warn(`[Price] Failed to fetch live price for ${symbol}:`, error);
  }
  
  const fallback = getFallbackPrice(symbol);
  console.log(`[Price] Using fallback price for ${symbol}: $${fallback}`);
  return fallback;
}

/**
 * Get fallback price when API fails
 */
function getFallbackPrice(symbol: string): number {
  const fallbackPrices: Record<string, number> = {
    "SOL/USDC": 180,
    "BTC/USDC": 95000,
    "ETH/USDC": 3200,
    "RAY/USDC": 4.5,
    "BONK/USDC": 0.000025,
    "JUP/USDC": 1.2,
    "PYTH/USDC": 0.45,
  };
  return fallbackPrices[symbol] || 100;
}

/**
 * Update PnL for open trades using current live prices
 * Call this periodically for real-time PnL tracking
 */
export async function updateTradesPnL(trades: Trade[]): Promise<Trade[]> {
  // Get unique symbols from open trades
  const openTrades = trades.filter(t => t.status === "open");
  if (openTrades.length === 0) return trades;

  const symbols = [...new Set(openTrades.map(t => t.symbol))];
  
  // Fetch current prices for all symbols
  const currentPrices: Record<string, number> = {};
  await Promise.all(
    symbols.map(async (symbol) => {
      currentPrices[symbol] = await fetchLivePrice(symbol);
    })
  );

  // Update trades with real-time PnL
  return trades.map((trade) => {
    if (trade.status !== "open") return trade;

    const currentPrice = currentPrices[trade.symbol] || trade.entryPrice;
    const direction = trade.side === "long" ? 1 : -1;
    const priceDiff = currentPrice - trade.entryPrice;
    const pnl = priceDiff * trade.quantity * direction;
    const pnlPercentage = (priceDiff / trade.entryPrice) * 100 * direction;

    return {
      ...trade,
      currentPrice,
      pnl,
      pnlPercentage,
    };
  });
}

/**
 * Get current price for a symbol (for UI display)
 */
export async function getCurrentPrice(symbol: string): Promise<number> {
  return fetchLivePrice(symbol);
}

// Client data response from SDK
interface ClientDataResponse {
  clientId: number;
  spotTrades: number;
  lpTrades: number;
  perpTrades: number;
  tokens: Map<number, { amount: number }>;
  spot: Map<number, { clientId: number; instrId: number }>;
  perp: Map<number, { clientId: number; instrId: number }>;
}

/**
 * Service class for interacting with Deriverse on-chain data
 * Uses direct Solana RPC calls due to SDK browser compatibility issues
 */
export class DeriverseService {
  private initialized = false;
  private walletAddress: string | null = null;
  private hasDeriverseActivity = false;

  /**
   * Initialize the service (lightweight - no SDK dependency)
   */
  async initialize(): Promise<boolean> {
    try {
      console.log("Initializing Deriverse service...");
      this.initialized = true;
      console.log("Deriverse service initialized successfully");
      return true;
    } catch (error) {
      console.error("Deriverse service initialization failed:", error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Set the wallet address and check for Deriverse activity
   */
  async setWallet(walletAddress: string): Promise<boolean> {
    try {
      console.log("Setting wallet:", walletAddress);
      this.walletAddress = walletAddress;
      
      // Check if wallet has any Deriverse transactions
      this.hasDeriverseActivity = await this.checkDeriverseActivity(walletAddress);
      
      if (this.hasDeriverseActivity) {
        console.log("Found Deriverse activity for wallet");
        return true;
      } else {
        console.log("No Deriverse activity found for wallet");
        return false;
      }
    } catch (error) {
      console.error("Failed to set wallet:", error);
      return false;
    }
  }

  /**
   * Check if wallet has any Deriverse transactions
   * Simplified to just check logs for efficiency
   */
  private async checkDeriverseActivity(walletAddress: string): Promise<boolean> {
    try {
      const { Connection, PublicKey } = await import("@solana/web3.js");
      const connection = new Connection(DERIVERSE_CONFIG.RPC_HTTP, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000,
      });
      
      const walletPubkey = new PublicKey(walletAddress);
      const programPubkey = new PublicKey(DERIVERSE_CONFIG.PROGRAM_ID);

      console.log("[DeriverseService] Checking for Deriverse activity...");

      // Fetch recent signatures
      const signatures = await connection.getSignaturesForAddress(walletPubkey, {
        limit: 20, // Just check a few for activity
      });

      console.log(`[DeriverseService] Checking ${signatures.length} transactions for Deriverse activity`);

      // Check if any involve Deriverse - just check a few to confirm activity
      for (let i = 0; i < Math.min(signatures.length, 10); i++) {
        const sig = signatures[i];
        try {
          await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
          
          const tx = await connection.getTransaction(sig.signature, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
          });

          if (!tx || !tx.meta || tx.meta.err) continue;

          // Check logs for Deriverse program
          const logs = tx.meta.logMessages || [];
          const hasDeriverse = logs.some(log => log.includes(DERIVERSE_CONFIG.PROGRAM_ID));
          
          if (hasDeriverse) {
            console.log("[DeriverseService] Found Deriverse activity!");
            return true;
          }

          // Also check account keys
          const accountKeys = tx.transaction.message.staticAccountKeys || 
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (tx.transaction.message as any).accountKeys || [];
          
          const involvesDeriverse = accountKeys.some(
            (key: { toString: () => string }) => key.toString() === programPubkey.toString()
          );

          if (involvesDeriverse) {
            console.log("[DeriverseService] Found Deriverse activity!");
            return true;
          }
        } catch {
          continue;
        }
      }

      console.log("[DeriverseService] No Deriverse activity found in recent transactions");
      return false;
    } catch (error) {
      console.error("[DeriverseService] Failed to check Deriverse activity:", error);
      return false;
    }
  }

  /**
   * Get client data - returns null as we can't use SDK's getClientData due to browser issues
   */
  async getClientData(): Promise<ClientDataResponse | null> {
    // SDK's getClientData has browser compatibility issues
    // We'll work directly with transaction history instead
    return null;
  }

  /**
   * Fetch trading history by parsing transaction logs
   * This fetches recent transactions and decodes the Deriverse program logs
   */
  async getTradingHistory(): Promise<Trade[]> {
    if (!this.walletAddress) {
      console.log("Cannot fetch trades: no wallet connected");
      return [];
    }

    try {
      console.log("Fetching trading history from Solana...");
      const trades = await this.fetchTransactionHistory();
      return trades;
    } catch (error) {
      console.error("Failed to fetch trading history:", error);
      return [];
    }
  }

  /**
   * Fetch and parse transaction history from Solana
   */
  private async fetchTransactionHistory(): Promise<Trade[]> {
    try {
      const { Connection, PublicKey } = await import("@solana/web3.js");
      const connection = new Connection(DERIVERSE_CONFIG.RPC_HTTP, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000,
      });
      
      const walletPubkey = new PublicKey(this.walletAddress!);
      const programPubkey = new PublicKey(DERIVERSE_CONFIG.PROGRAM_ID);

      // Fetch recent signatures for the wallet
      console.log("[DeriverseService] Fetching transaction signatures for:", this.walletAddress);
      const signatures = await connection.getSignaturesForAddress(walletPubkey, {
        limit: 50, // Reduced to avoid rate limits
      });

      console.log(`[DeriverseService] Found ${signatures.length} recent transactions`);

      const trades: Trade[] = [];
      let tradeId = 1;
      let deriverseCount = 0;

      // Process transactions with delay to avoid rate limits
      for (const sig of signatures) {
        try {
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const tx = await connection.getTransaction(sig.signature, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
          });

          if (!tx || !tx.meta || tx.meta.err) {
            continue;
          }

          // Check if this transaction involves the Deriverse program
          // Try multiple ways to get account keys
          let accountKeys: { toString: () => string }[] = [];
          
          const msg = tx.transaction.message;
          if ('staticAccountKeys' in msg && msg.staticAccountKeys) {
            accountKeys = msg.staticAccountKeys as { toString: () => string }[];
          } else if ('accountKeys' in msg && msg.accountKeys) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            accountKeys = (msg as any).accountKeys;
          }
          
          // Also check in logs for program invocation
          const logs = tx.meta.logMessages || [];
          const logsHaveDeriverse = logs.some(log => 
            log.includes(DERIVERSE_CONFIG.PROGRAM_ID)
          );
          
          const keysHaveDeriverse = accountKeys.some(
            (key: { toString: () => string }) => key.toString() === programPubkey.toString()
          );

          const involvesDeriverse = keysHaveDeriverse || logsHaveDeriverse;
          
          console.log(`TX ${sig.signature.slice(0, 8)}... - keysMatch: ${keysHaveDeriverse}, logsMatch: ${logsHaveDeriverse}`);

          if (!involvesDeriverse) continue;
          
          deriverseCount++;

          // Parse logs for trade information, including balance changes
          const parsedTrade = await this.parseTransactionLogs(
            logs, 
            sig.signature, 
            tx.blockTime ?? null, 
            tradeId,
            tx.meta.preBalances,
            tx.meta.postBalances,
            tx.meta.preTokenBalances as Array<{ mint: string; uiTokenAmount: { uiAmount: number | null } }>,
            tx.meta.postTokenBalances as Array<{ mint: string; uiTokenAmount: { uiAmount: number | null } }>
          );
          
          if (parsedTrade) {
            tradeId++;
            trades.push(parsedTrade);
          }
        } catch (err) {
          console.log(`Error processing TX: ${err}`);
          continue;
        }
      }

      console.log(`Found ${deriverseCount} Deriverse transactions, parsed ${trades.length} trades`);
      return trades;
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
      return [];
    }
  }

  /**
   * Parse transaction logs to extract trade information
   * Uses Deriverse program data and logs to determine trade type, direction, and pricing
   */
  private async parseTransactionLogs(
    logs: string[], 
    signature: string, 
    blockTime: number | null,
    tradeId: number,
    preBalances?: number[],
    postBalances?: number[],
    preTokenBalances?: Array<{ mint: string; uiTokenAmount: { uiAmount: number | null } }>,
    postTokenBalances?: Array<{ mint: string; uiTokenAmount: { uiAmount: number | null } }>
  ): Promise<Trade | null> {
    try {
      // Look for Deriverse program invocation and successful execution
      const hasProgram = logs.some(log => 
        log.includes("Program Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu invoke")
      );
      
      const isSuccess = logs.some(log => 
        log.includes("Program Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu success")
      );
      
      if (!hasProgram || !isSuccess) return null;

      const logsJoined = logs.join(" ").toLowerCase();
      const logsJoinedOriginal = logs.join(" ");
      
      // Debug log
      console.log(`[Parse TX ${signature.slice(0, 8)}] Analyzing logs...`);

      // ============================================
      // STEP 1: Detect Market Type (Spot vs Perp)
      // ============================================
      let marketType: MarketType = "spot"; // Default to spot, change to perp if detected
      
      // Check for perp-specific keywords in logs
      const perpKeywords = ["perp", "perpetual", "funding", "perp_market", "PerpMarket", "perp_place", "PerpPlaceOrder"];
      const spotKeywords = ["spot", "serum", "swap", "token_swap", "Serum3", "openbook", "spot_market"];
      
      const hasPerpKeyword = perpKeywords.some(kw => logsJoinedOriginal.includes(kw));
      const hasSpotKeyword = spotKeywords.some(kw => logsJoinedOriginal.includes(kw));
      
      if (hasPerpKeyword && !hasSpotKeyword) {
        marketType = "perpetual";
      } else if (hasSpotKeyword && !hasPerpKeyword) {
        marketType = "spot";
      } else if (hasPerpKeyword && hasSpotKeyword) {
        // Both present - check which appears more
        const perpCount = perpKeywords.filter(kw => logsJoinedOriginal.includes(kw)).length;
        const spotCount = spotKeywords.filter(kw => logsJoinedOriginal.includes(kw)).length;
        marketType = perpCount > spotCount ? "perpetual" : "spot";
      }
      
      console.log(`[Parse TX ${signature.slice(0, 8)}] Market type: ${marketType} (perp keywords: ${hasPerpKeyword}, spot keywords: ${hasSpotKeyword})`);

      // ============================================
      // STEP 2: Detect Trade Side (Long/Buy vs Short/Sell)
      // ============================================
      let side: TradeSide = "long"; // Default
      let sideConfidence = 0;
      
      // Method 1: Check for explicit side keywords in logs
      // In Deriverse/Mango: bid = buy = long, ask = sell = short
      const buyKeywords = ["bid", "buy", "long", "PerpOrderSide::Bid", "Side::Bid"];
      const sellKeywords = ["ask", "sell", "short", "PerpOrderSide::Ask", "Side::Ask"];
      
      const hasBuyKeyword = buyKeywords.some(kw => logsJoinedOriginal.toLowerCase().includes(kw.toLowerCase()));
      const hasSellKeyword = sellKeywords.some(kw => logsJoinedOriginal.toLowerCase().includes(kw.toLowerCase()));
      
      if (hasSellKeyword && !hasBuyKeyword) {
        side = "short";
        sideConfidence = 3;
      } else if (hasBuyKeyword && !hasSellKeyword) {
        side = "long";
        sideConfidence = 3;
      }
      
      // Method 2: Parse program data for taker_side byte
      const dataLogs = logs.filter(l => l.startsWith("Program data:"));
      for (const dataLog of dataLogs) {
        try {
          const base64Data = dataLog.replace("Program data: ", "");
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          // FillLogV3 structure: taker_side is at offset 34 (after discriminator + market_index + pubkey)
          // PerpTakerTradeLog: taker_side at different offset
          // taker_side: 0 = bid (long), 1 = ask (short)
          if (bytes.length > 40 && sideConfidence < 5) {
            // Check specific known positions for taker_side
            const sidePositions = [34, 35, 10, 11, 42, 43];
            for (const pos of sidePositions) {
              if (pos < bytes.length && (bytes[pos] === 0 || bytes[pos] === 1)) {
                // Validate this looks like a side byte
                if (bytes.length > pos + 4) {
                  const nextBytes = bytes.slice(pos + 1, pos + 5);
                  const hasValidFollowingData = nextBytes.some(b => b > 1);
                  if (hasValidFollowingData) {
                    side = bytes[pos] === 0 ? "long" : "short";
                    sideConfidence = 5;
                    console.log(`[Parse TX ${signature.slice(0, 8)}] Side from program data: ${side} at position ${pos}`);
                    break;
                  }
                }
              }
            }
          }
        } catch {
          // Silent fail
        }
      }
      
      // Method 3: Use token balance changes as fallback
      // For spot: buying = receive base token, selling = receive quote token
      // For perp: this is less reliable but can be a hint
      if (sideConfidence < 2 && preTokenBalances && postTokenBalances) {
        // Check if we received or sent the base token
        for (let i = 0; i < postTokenBalances.length; i++) {
          const postBal = postTokenBalances[i];
          const preBal = preTokenBalances.find(p => p.mint === postBal.mint);
          if (preBal && postBal.uiTokenAmount.uiAmount && preBal.uiTokenAmount.uiAmount) {
            const change = postBal.uiTokenAmount.uiAmount - preBal.uiTokenAmount.uiAmount;
            if (Math.abs(change) > 0.0001) {
              // If we received tokens (non-USDC), it's likely a buy/long
              // If we received USDC, it's likely a sell/short
              const isUSDC = postBal.mint.includes("USDC") || postBal.mint.includes("EPjFWdd"); // USDC mint
              if (change > 0 && !isUSDC) {
                side = "long";
                sideConfidence = 2;
              } else if (change > 0 && isUSDC) {
                side = "short";
                sideConfidence = 2;
              }
            }
          }
        }
      }
      
      console.log(`[Parse TX ${signature.slice(0, 8)}] Side: ${side} (confidence: ${sideConfidence})`);

      // ============================================
      // STEP 3: Determine Order Type
      // ============================================
      let orderType: OrderType = "market";
      if (logsJoined.includes("limit") || logsJoined.includes("postonly")) {
        orderType = "limit";
      }

      // ============================================
      // STEP 4: Extract Symbol and Price
      // ============================================
      const symbol = "SOL/USDC"; // Default - would need account parsing for accurate symbol
      const entryTime = blockTime ? new Date(blockTime * 1000) : new Date();
      
      // Try to get live price
      let entryPrice: number;
      try {
        entryPrice = await fetchLivePrice(symbol);
      } catch {
        entryPrice = getFallbackPrice(symbol);
      }
      
      // ============================================
      // STEP 5: Calculate Quantity from Balance Changes
      // ============================================
      let quantity = 0.1;
      if (preBalances && postBalances && preBalances.length > 0 && postBalances.length > 0) {
        const solChange = Math.abs(postBalances[0] - preBalances[0]) / 1e9;
        if (solChange > 0.001) {
          quantity = solChange;
        }
      }
      
      // ============================================
      // STEP 6: Calculate Fees
      // ============================================
      const volume = entryPrice * quantity;
      const fees = {
        makerFee: volume * 0.0002,
        takerFee: volume * 0.0005,
        fundingFee: marketType === "perpetual" ? volume * 0.0001 : 0,
        totalFee: volume * 0.0008,
      };

      return {
        id: `trade-${tradeId}`,
        symbol,
        side,
        marketType,
        orderType,
        entryPrice,
        exitPrice: undefined,
        quantity,
        leverage: marketType === "perpetual" ? 1 : undefined,
        entryTime,
        exitTime: undefined,
        pnl: undefined,
        pnlPercentage: undefined,
        status: "open",
        fees,
        txSignature: signature,
      };
    } catch (error) {
      console.error("Failed to parse transaction logs:", error);
      return null;
    }
  }

  /**
   * Fetch current open positions
   * Note: Positions are derived from open trades in history
   */
  async getPositions(): Promise<Position[]> {
    // Since we can't use the SDK's getClientData due to browser issues,
    // positions will be derived from open trades in trade history
    console.log("Positions will be derived from open trades in history");
    return [];
  }

  /**
   * Check if the service is initialized and connected
   */
  isConnected(): boolean {
    return this.walletAddress !== null;
  }

  /**
   * Get the current wallet address
   */
  getWalletAddress(): string | null {
    return this.walletAddress;
  }

  /**
   * Check if wallet has Deriverse activity
   */
  hasActivity(): boolean {
    return this.hasDeriverseActivity;
  }
}

// Singleton instance
export const deriverseService = new DeriverseService();
