/**
 * Deriverse Service
 * Client-side service that fetches data from the Deriverse API route
 * Uses the @deriverse/kit SDK server-side for accurate real-time data
 */

import type { Trade, Position } from "@/types";

// API base path
const API_BASE = "/api/deriverse";

// Map instrument ID to symbol
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

// Cache for prices (10 second TTL)
let priceCache: { data: Record<string, PriceData>; timestamp: number } | null = null;
const PRICE_CACHE_TTL = 10000;

interface PriceData {
  lastPrice: number;
  bestBid: number;
  bestAsk: number;
  midPrice: number;
}

interface ClientDataResponse {
  hasAccount: boolean;
  clientId: number | null;
  spotTrades: number;
  perpTrades: number;
  lpTrades: number;
  points: number;
  balances: Array<{ tokenId: number; amount: number }>;
  spotPositions: Array<{ instrId: number; clientId: number }>;
  perpPositions: Array<{ instrId: number; clientId: number }>;
}

interface SpotOrdersResponse {
  ordersInfo?: {
    tempAssetTokens: number;
    tempCrncyTokens: number;
    inOrdersAssetTokens: number;
    inOrdersCrncyTokens: number;
  };
  bids: Array<{
    orderId: number;
    line: number;
    quantity: number;
    filled: number;
    timestamp: number;
  }>;
  asks: Array<{
    orderId: number;
    line: number;
    quantity: number;
    filled: number;
    timestamp: number;
  }>;
}

interface PerpOrdersResponse {
  ordersInfo?: object;
  position?: {
    perps: number;
    funds: number;
    inOrdersPerps: number;
    inOrdersFunds: number;
    fees: number;
    rebates: number;
    result: number;
    cost: number;
    leverage: number;
    fundingFunds: number;
    socLossFunds: number;
  };
  bids: Array<{
    orderId: number;
    line: number;
    quantity: number;
    filled: number;
    timestamp: number;
  }>;
  asks: Array<{
    orderId: number;
    line: number;
    quantity: number;
    filled: number;
    timestamp: number;
  }>;
}

/**
 * Fetch all live prices from Deriverse markets
 */
async function fetchLivePrices(): Promise<Record<string, PriceData>> {
  // Check cache
  if (priceCache && Date.now() - priceCache.timestamp < PRICE_CACHE_TTL) {
    return priceCache.data;
  }

  try {
    const response = await fetch(`${API_BASE}?action=prices`);
    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.status}`);
    }
    const data = await response.json();
    priceCache = { data: data.prices || {}, timestamp: Date.now() };
    return priceCache.data;
  } catch (error) {
    console.error("[DeriverseService] Failed to fetch prices:", error);
    return priceCache?.data || {};
  }
}

/**
 * Fetch live price for a specific symbol
 * Prices come from CoinGecko via the API (SDK doesn't provide orderbook prices)
 */
export async function fetchLivePrice(symbol: string): Promise<number> {
  const prices = await fetchLivePrices();
  const priceData = prices[symbol];
  if (priceData) {
    const price = priceData.midPrice || priceData.lastPrice;
    console.log(`[Price] ${symbol}: $${price}`);
    return price;
  }
  console.warn(`[Price] No price data for ${symbol}`);
  return 0;
}

/**
 * Update PnL for open trades using current live prices
 */
export async function updateTradesPnL(trades: Trade[]): Promise<Trade[]> {
  const openTrades = trades.filter(t => t.status === "open");
  if (openTrades.length === 0) return trades;

  const prices = await fetchLivePrices();

  return trades.map((trade) => {
    if (trade.status !== "open") return trade;

    const priceData = prices[trade.symbol];
    const currentPrice = priceData?.midPrice || priceData?.lastPrice || trade.entryPrice;
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
 * Main service class for Deriverse data
 */
export class DeriverseService {
  private walletAddress: string | null = null;
  private clientData: ClientDataResponse | null = null;

  /**
   * Initialize the service
   */
  async initialize(): Promise<boolean> {
    console.log("[DeriverseService] Initializing...");
    return true;
  }

  /**
   * Set the wallet address and fetch client data
   */
  async setWallet(walletAddress: string): Promise<boolean> {
    console.log("[DeriverseService] Setting wallet:", walletAddress);
    this.walletAddress = walletAddress;
    
    try {
      // Fetch client data from Deriverse API
      const response = await fetch(`${API_BASE}?action=client&wallet=${walletAddress}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch client data: ${response.status}`);
      }
      
      this.clientData = await response.json();
      console.log("[DeriverseService] Client data:", this.clientData);
      
      return this.clientData?.hasAccount || false;
    } catch (error) {
      console.error("[DeriverseService] Failed to set wallet:", error);
      return false;
    }
  }

  /**
   * Fetch complete trading history and positions
   */
  async getTradingHistory(): Promise<Trade[]> {
    if (!this.walletAddress || !this.clientData?.hasAccount) {
      console.log("[DeriverseService] No wallet or account, returning empty trades");
      return [];
    }

    const trades: Trade[] = [];
    const prices = await fetchLivePrices();
    let tradeId = 1;

    // Process spot positions
    for (const spotPos of this.clientData.spotPositions) {
      try {
        const response = await fetch(
          `${API_BASE}?action=spotOrders&wallet=${this.walletAddress}&instrId=${spotPos.instrId}`
        );
        
        if (!response.ok) {
          continue;
        }
        
        const ordersData: SpotOrdersResponse = await response.json();
        
        // Check if SDK returned an error
        if ('sdkError' in ordersData) {
          console.log("[DeriverseService] SDK error on spotOrders");
          continue;
        }
        
        const symbol = getSymbolFromInstrId(spotPos.instrId);
        const priceData = prices[symbol];
        const currentPrice = priceData?.midPrice || priceData?.lastPrice || 0;

        // Convert bids (buy orders) to trades
        // Note: SDK orders don't include entry price, using current price as reference
        for (const bid of ordersData.bids) {
          trades.push({
            id: `spot-bid-${tradeId++}`,
            txSignature: `spot-${spotPos.instrId}-bid-${bid.orderId}`,
            symbol,
            marketType: "spot",
            side: "long",
            orderType: "limit",
            status: bid.filled >= bid.quantity ? "closed" : "open",
            entryPrice: currentPrice,
            currentPrice,
            quantity: bid.quantity,
            entryTime: new Date(bid.timestamp * 1000),
            fees: {
              makerFee: 0,
              takerFee: 0,
              totalFee: 0,
            },
          });
        }

        // Convert asks (sell orders) to trades
        for (const ask of ordersData.asks) {
          trades.push({
            id: `spot-ask-${tradeId++}`,
            txSignature: `spot-${spotPos.instrId}-ask-${ask.orderId}`,
            symbol,
            marketType: "spot",
            side: "short",
            orderType: "limit",
            status: ask.filled >= ask.quantity ? "closed" : "open",
            entryPrice: currentPrice,
            currentPrice,
            quantity: ask.quantity,
            entryTime: new Date(ask.timestamp * 1000),
            fees: {
              makerFee: 0,
              takerFee: 0,
              totalFee: 0,
            },
          });
        }
      } catch (error) {
        console.error(`[DeriverseService] Failed to fetch spot orders for instr ${spotPos.instrId}:`, error);
      }
    }

    // Process perp positions
    for (const perpPos of this.clientData.perpPositions) {
      try {
        const response = await fetch(
          `${API_BASE}?action=perpOrders&wallet=${this.walletAddress}&instrId=${perpPos.instrId}`
        );
        
        if (!response.ok) {
          continue;
        }
        
        const ordersData: PerpOrdersResponse = await response.json();
        
        // Check if SDK returned an error
        if ('sdkError' in ordersData) {
          console.log("[DeriverseService] SDK error on perpOrders");
          continue;
        }
        
        const symbol = getSymbolFromInstrId(perpPos.instrId);
        const priceData = prices[symbol];
        const currentPrice = priceData?.midPrice || priceData?.lastPrice || 0;
        const position = ordersData.position;

        // Fetch trade timeline once - used for both open and closed trade display
        let timeline: { firstTradeTime: number; lastTradeTime: number; totalTxs: number; timestamps: number[] } | null = null;
        
        if (position && (position.perps !== 0 || position.result !== 0 || position.fees !== 0)) {
          try {
            const timelineRes = await fetch(
              `${API_BASE}?action=tradeTimeline&wallet=${this.walletAddress}`
            );
            if (timelineRes.ok) {
              timeline = await timelineRes.json();
            }
          } catch (err) {
            console.warn("[DeriverseService] Timeline fetch failed:", err);
          }
        }

        // If there's an active perp position (perps != 0), create a trade for it
        if (position && position.perps !== 0) {
          const isLong = position.perps > 0;
          const size = Math.abs(position.perps);
          const entryPrice = position.cost !== 0 ? Math.abs(position.cost / position.perps) : currentPrice;
          
          // Calculate ACTUAL unrealized PnL from price difference
          // result is cumulative REALIZED PnL from all past trades, not unrealized
          const unrealizedPnl = currentPrice * position.perps - position.cost;
          
          // Figure out entry time from timeline (last tx is most recent = current position entry)
          let entryTime = new Date();
          if (timeline && timeline.timestamps && timeline.timestamps.length > 0) {
            // The latest timestamp is the current position's entry
            entryTime = new Date(timeline.timestamps[timeline.timestamps.length - 1] * 1000);
          }
          
          // Estimate current position's fees from total cost basis
          // New position fee ≈ |cost| × fee_rate (typically ~0.05%)
          const estimatedNewFees = Math.abs(position.cost) * 0.0005;
          const currentFees = Math.min(estimatedNewFees * 1.5, position.fees); // cap at total fees
          
          trades.push({
            id: `perp-pos-${tradeId++}`,
            txSignature: `perp-${perpPos.instrId}-position`,
            symbol,
            marketType: "perpetual",
            side: isLong ? "long" : "short",
            orderType: "market",
            status: "open",
            entryPrice,
            currentPrice,
            quantity: size,
            leverage: position.leverage || 1,
            entryTime,
            pnl: unrealizedPnl,
            pnlPercentage: entryPrice > 0 && size > 0 ? (unrealizedPnl / (entryPrice * size)) * 100 : 0,
            fees: {
              makerFee: currentFees,
              takerFee: 0,
              fundingFee: 0,
              totalFee: currentFees,
            },
          });
          
          console.log(`[DeriverseService] Open perp position for ${symbol}: Side=${isLong ? 'long' : 'short'}, Entry=$${entryPrice.toFixed(2)}, Size=${size}, UnrealizedPnL=${unrealizedPnl.toFixed(4)}, Leverage=${position.leverage}x`);
          
          // ALSO show old closed trade(s) if there's realized PnL from previous positions
          if (position.result !== 0) {
            const realizedPnl = position.result;
            const leverage = position.leverage || 1;
            
            let oldEntryPrice = currentPrice;
            let oldExitPrice = currentPrice;
            let oldEntryTime = new Date();
            let oldExitTime = new Date();
            let inferredSide: "long" | "short" = "short";
            let estimatedSize = 0;
            
            // Use timeline to find old trade's time range
            // All timestamps before the last one belong to the old trade
            if (timeline && timeline.timestamps && timeline.timestamps.length > 1) {
              const oldTimestamps = timeline.timestamps.slice(0, -1); // all but the newest
              oldEntryTime = new Date(oldTimestamps[0] * 1000);
              oldExitTime = new Date(oldTimestamps[oldTimestamps.length - 1] * 1000);
              
              try {
                const histPrices = await this.fetchHistoricalPrices(
                  oldTimestamps[0],
                  oldTimestamps[oldTimestamps.length - 1]
                );
                
                if (histPrices.entryPrice > 0 && histPrices.exitPrice > 0) {
                  oldEntryPrice = histPrices.entryPrice;
                  oldExitPrice = histPrices.exitPrice;
                  
                  const priceWentUp = oldExitPrice > oldEntryPrice;
                  const isProfit = realizedPnl > 0;
                  inferredSide = (priceWentUp === isProfit) ? "long" : "short";
                  
                  const priceDiff = inferredSide === "short"
                    ? oldEntryPrice - oldExitPrice
                    : oldExitPrice - oldEntryPrice;
                  
                  if (Math.abs(priceDiff) > 0.01) {
                    estimatedSize = Math.abs(realizedPnl / priceDiff);
                  }
                }
              } catch (err) {
                console.warn("[DeriverseService] Historical price fetch for old trade failed:", err);
              }
            }
            
            // Fallback: estimate from margin data
            if (estimatedSize === 0) {
              estimatedSize = currentPrice > 0 ? Math.abs(realizedPnl * leverage) / currentPrice : 0;
            }
            
            // Old trade fees = total fees - estimated new trade fees
            const oldFees = Math.max(0, position.fees - estimatedNewFees);
            const oldTotalFees = oldFees - position.rebates + position.fundingFunds;
            
            const notionalValue = oldEntryPrice * estimatedSize;
            const pnlPct = notionalValue > 0 ? (realizedPnl / notionalValue) * 100 : 0;
            
            trades.push({
              id: `perp-realized-${tradeId++}`,
              txSignature: `perp-${perpPos.instrId}-realized`,
              symbol,
              marketType: "perpetual",
              side: inferredSide,
              orderType: "market",
              status: "closed",
              entryPrice: oldEntryPrice,
              currentPrice: oldExitPrice,
              exitPrice: oldExitPrice,
              quantity: estimatedSize,
              leverage,
              entryTime: oldEntryTime,
              exitTime: oldExitTime,
              pnl: realizedPnl,
              pnlPercentage: pnlPct,
              fees: {
                makerFee: oldFees,
                takerFee: 0,
                fundingFee: position.fundingFunds,
                totalFee: oldTotalFees,
              },
            });
            
            console.log(`[DeriverseService] Old closed trade for ${symbol}: PnL=${realizedPnl}, Side=${inferredSide}, Entry=$${oldEntryPrice.toFixed(2)}, Exit=$${oldExitPrice.toFixed(2)}, Size=${estimatedSize.toFixed(4)}`);
          }
        }
        // If position is closed (perps === 0) but has a realized result, create a closed trade
        // This captures the SDK's accurate PnL for positions that were closed
        else if (position && position.perps === 0 && (position.result !== 0 || position.fees !== 0)) {
          const realizedPnl = position.result || 0;
          const totalFees = (position.fees || 0) - (position.rebates || 0) + (position.fundingFunds || 0);
          const leverage = position.leverage || 1;
          
          let entryPrice = currentPrice;
          let exitPrice = currentPrice;
          let entryTime = new Date();
          let exitTime = new Date();
          let inferredSide: "long" | "short" = "short";
          let estimatedSize = 0;
          
          if (timeline && timeline.firstTradeTime > 0 && timeline.lastTradeTime > 0) {
            entryTime = new Date(timeline.firstTradeTime * 1000);
            exitTime = new Date(timeline.lastTradeTime * 1000);
            
            try {
              const histPrices = await this.fetchHistoricalPrices(
                timeline.firstTradeTime,
                timeline.lastTradeTime
              );
              
              if (histPrices.entryPrice > 0 && histPrices.exitPrice > 0) {
                entryPrice = histPrices.entryPrice;
                exitPrice = histPrices.exitPrice;
                
                const priceWentUp = exitPrice > entryPrice;
                const isProfit = realizedPnl > 0;
                inferredSide = (priceWentUp === isProfit) ? "long" : "short";
                
                const priceDiff = inferredSide === "short"
                  ? entryPrice - exitPrice
                  : exitPrice - entryPrice;
                
                if (Math.abs(priceDiff) > 0.01) {
                  estimatedSize = Math.abs(realizedPnl / priceDiff);
                }
              }
            } catch (err) {
              console.warn("[DeriverseService] Historical price fetch failed:", err);
            }
          }
          
          // Fallback: estimate size from SDK margin data if historical prices didn't work
          if (estimatedSize === 0) {
            const initialMargin = Math.abs(position.funds) + Math.abs(realizedPnl) + Math.abs(position.fees);
            const notionalValue = initialMargin * leverage;
            estimatedSize = currentPrice > 0 ? notionalValue / currentPrice : 0;
          }
          
          const notionalValue = entryPrice * estimatedSize;
          const pnlPct = notionalValue > 0 ? (realizedPnl / notionalValue) * 100 : 0;
          
          trades.push({
            id: `perp-realized-${tradeId++}`,
            txSignature: `perp-${perpPos.instrId}-realized`,
            symbol,
            marketType: "perpetual",
            side: inferredSide,
            orderType: "market",
            status: "closed",
            entryPrice,
            currentPrice: exitPrice,
            exitPrice,
            quantity: estimatedSize,
            leverage,
            entryTime,
            exitTime,
            pnl: realizedPnl,
            pnlPercentage: pnlPct,
            fees: {
              makerFee: position.fees - position.rebates,
              takerFee: 0,
              fundingFee: position.fundingFunds,
              totalFee: totalFees,
            },
          });
          
          console.log(`[DeriverseService] Closed perp position for ${symbol}: PnL=${realizedPnl}, Side=${inferredSide}, Entry=$${entryPrice.toFixed(2)}, Exit=$${exitPrice.toFixed(2)}, Size=${estimatedSize.toFixed(4)}, Leverage=${leverage}x`);
        }

        // Add open orders as pending trades
        // Note: Orders don't have direct price, using current price as reference
        for (const bid of ordersData.bids) {
          trades.push({
            id: `perp-bid-${tradeId++}`,
            txSignature: `perp-${perpPos.instrId}-bid-${bid.orderId}`,
            symbol,
            marketType: "perpetual",
            side: "long",
            orderType: "limit",
            status: "open",
            entryPrice: currentPrice,
            currentPrice,
            quantity: bid.quantity,
            leverage: position?.leverage || 1,
            entryTime: new Date(bid.timestamp * 1000),
            fees: {
              makerFee: 0,
              takerFee: 0,
              totalFee: 0,
            },
          });
        }

        for (const ask of ordersData.asks) {
          trades.push({
            id: `perp-ask-${tradeId++}`,
            txSignature: `perp-${perpPos.instrId}-ask-${ask.orderId}`,
            symbol,
            marketType: "perpetual",
            side: "short",
            orderType: "limit",
            status: "open",
            entryPrice: currentPrice,
            currentPrice,
            quantity: ask.quantity,
            leverage: position?.leverage || 1,
            entryTime: new Date(ask.timestamp * 1000),
            fees: {
              makerFee: 0,
              takerFee: 0,
              totalFee: 0,
            },
          });
        }
      } catch (error) {
        console.error(`[DeriverseService] Failed to fetch perp orders for instr ${perpPos.instrId}:`, error);
      }
    }

    // SDK provides accurate data for OPEN positions
    // Return immediately without waiting for slow tradeHistory
    
    console.log(`[DeriverseService] SDK provided ${trades.length} open positions/orders`);
    
    return trades;
  }

  /**
   * Fetch closed trade history from Solana transaction history (SLOW)
   * This is separate from getTradingHistory so it doesn't block the initial render
   * Returns both individual trades and a timeline summary for enriching SDK trades
   */
  async fetchClosedTradeHistory(): Promise<{
    trades: Trade[];
    timeline: {
      firstTradeTime: number;
      lastTradeTime: number;
      tradeCount: number;
    } | null;
  }> {
    if (!this.walletAddress || !this.clientData?.hasAccount) {
      return { trades: [], timeline: null };
    }

    const closedTrades: Trade[] = [];
    let firstTradeTime = Infinity;
    let lastTradeTime = 0;
    let tradeCount = 0;

    try {
      const prices = await fetchLivePrices();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const historyResponse = await fetch(
        `${API_BASE}?action=tradeHistory&wallet=${this.walletAddress}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        console.log(`[DeriverseService] Got ${historyData.trades?.length || 0} transactions from history`);
        
        // Log types for debugging
        const typeCounts: Record<string, number> = {};
        for (const tx of historyData.trades || []) {
          typeCounts[tx.type] = (typeCounts[tx.type] || 0) + 1;
        }
        console.log(`[DeriverseService] Transaction types:`, typeCounts);
        
        const currentPrice = prices["SOL/USDC"]?.midPrice || prices["SOL/USDC"]?.lastPrice || 0;
        
        // Track timeline across ALL Deriverse transactions (not just filtered ones)
        for (const tx of historyData.trades || []) {
          const ts = tx.timestamp || 0;
          if (ts > 0) {
            if (ts < firstTradeTime) firstTradeTime = ts;
            if (ts > lastTradeTime) lastTradeTime = ts;
            tradeCount++;
          }
        }
        
        // Include all Deriverse transactions that represent actual trades
        // Skip only cancellations, deposits, and withdrawals
        for (const tx of historyData.trades || []) {
          // Skip non-trade transaction types
          if (["cancelOrder", "deposit", "withdraw"].includes(tx.type)) {
            continue;
          }
          
          // Skip if no meaningful trade data (no token changes = unfilled order)
          const quantity = tx.size || 0;
          const solChanged = Math.abs(tx.solChange || 0);
          if (quantity === 0 && solChanged === 0) {
            continue;
          }
          
          const symbol = tx.instrId !== undefined ? getSymbolFromInstrId(tx.instrId) : "SOL/USDC";
          const txDate = new Date(tx.timestamp * 1000);
          const isLong = tx.side === "buy" || tx.side === "long";
          const tradeQuantity = quantity || solChanged;
          
          closedTrades.push({
            id: `history-${tx.signature.slice(0, 8)}`,
            txSignature: tx.signature,
            symbol,
            marketType: "perpetual",
            side: isLong ? "long" : "short",
            orderType: "market",
            status: "closed",
            entryPrice: currentPrice,
            currentPrice,
            exitPrice: currentPrice,
            quantity: tradeQuantity,
            leverage: 1,
            entryTime: txDate,
            exitTime: txDate,
            pnl: 0,
            pnlPercentage: 0,
            fees: {
              makerFee: (tx.fee / 1e9) * currentPrice || 0,
              takerFee: 0,
              totalFee: (tx.fee / 1e9) * currentPrice || 0,
            },
          });
        }
        
        console.log(`[DeriverseService] Found ${closedTrades.length} closed trades from history`);
        console.log(`[DeriverseService] Timeline: first=${new Date(firstTradeTime * 1000).toISOString()}, last=${new Date(lastTradeTime * 1000).toISOString()}, count=${tradeCount}`);
      }
    } catch (historyErr) {
      if (historyErr instanceof DOMException && historyErr.name === 'AbortError') {
        console.warn("[DeriverseService] Trade history fetch timed out after 30s");
      } else {
        console.warn("[DeriverseService] Failed to fetch closed trade history:", historyErr);
      }
    }
    
    const timeline = tradeCount > 0 ? {
      firstTradeTime: firstTradeTime === Infinity ? 0 : firstTradeTime,
      lastTradeTime,
      tradeCount,
    } : null;
    
    return { trades: closedTrades, timeline };
  }

  /**
   * Fetch historical SOL prices at specific timestamps
   * Used to estimate entry/exit prices for closed positions
   */
  async fetchHistoricalPrices(fromTimestamp: number, toTimestamp: number): Promise<{
    entryPrice: number;
    exitPrice: number;
  }> {
    try {
      const response = await fetch(
        `${API_BASE}?action=historicalPrice&from=${fromTimestamp}&to=${toTimestamp}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.entryPrice > 0 && data.exitPrice > 0) {
          return { entryPrice: data.entryPrice, exitPrice: data.exitPrice };
        }
      }
    } catch (error) {
      console.warn("[DeriverseService] Historical price fetch failed:", error);
    }
    return { entryPrice: 0, exitPrice: 0 };
  }

  /**
   * Fetch current open positions from SDK
   * Uses the SDK's accurate position data including real PnL
   */
  async getPositions(): Promise<Position[]> {
    if (!this.walletAddress || !this.clientData?.hasAccount) {
      return [];
    }

    const positions: Position[] = [];
    const prices = await fetchLivePrices();

    // Fetch positions from SDK
    for (const perpPos of this.clientData.perpPositions) {
      try {
        const response = await fetch(
          `${API_BASE}?action=perpOrders&wallet=${this.walletAddress}&instrId=${perpPos.instrId}`
        );
        
        if (!response.ok) {
          console.error(`[DeriverseService] Failed to fetch perp position: ${response.status}`);
          continue;
        }
        
        const ordersData: PerpOrdersResponse = await response.json();
        
        // Check if SDK returned error
        if ('sdkError' in ordersData) {
          console.error("[DeriverseService] SDK error fetching position:", ordersData);
          continue;
        }
        
        const position = ordersData.position;
        
        if (position && position.perps !== 0) {
          const symbol = getSymbolFromInstrId(perpPos.instrId);
          const priceData = prices[symbol];
          const currentPrice = priceData?.midPrice || priceData?.lastPrice || 0;
          const isLong = position.perps > 0;
          const size = Math.abs(position.perps);
          const entryPrice = position.cost !== 0 ? Math.abs(position.cost / position.perps) : currentPrice;
          
          // Calculate ACTUAL unrealized PnL from price difference
          // result is cumulative REALIZED PnL from all past trades, not unrealized
          const unrealizedPnl = currentPrice * position.perps - position.cost;

          positions.push({
            id: `perp-${perpPos.instrId}`,
            symbol,
            marketType: "perpetual",
            side: isLong ? "long" : "short",
            entryPrice,
            currentPrice,
            quantity: size,
            leverage: position.leverage || 1,
            unrealizedPnl,
            unrealizedPnlPercentage: entryPrice > 0 && size > 0 ? (unrealizedPnl / (entryPrice * size)) * 100 : 0,
            margin: position.funds,
            openTime: new Date(),
          });
        }
      } catch (error) {
        console.error(`[DeriverseService] Failed to fetch perp position for instr ${perpPos.instrId}:`, error);
      }
    }

    return positions;
  }

  /**
   * Get account balances
   */
  getBalances(): Array<{ tokenId: number; amount: number }> {
    return this.clientData?.balances || [];
  }

  /**
   * Get client statistics
   */
  getStats(): { spotTrades: number; perpTrades: number; lpTrades: number; points: number } {
    return {
      spotTrades: this.clientData?.spotTrades || 0,
      perpTrades: this.clientData?.perpTrades || 0,
      lpTrades: this.clientData?.lpTrades || 0,
      points: this.clientData?.points || 0,
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.walletAddress !== null;
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string | null {
    return this.walletAddress;
  }

  /**
   * Check if wallet has Deriverse activity
   */
  hasActivity(): boolean {
    return this.clientData?.hasAccount || false;
  }
}

// Singleton instance
export const deriverseService = new DeriverseService();
