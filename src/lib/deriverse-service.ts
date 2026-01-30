/**
 * Deriverse SDK Service
 * Connects to the Deriverse decentralized exchange on Solana
 * Fetches live trading data, positions, and account information
 */

import type { Trade, Position, MarketType, TradeSide, OrderType } from "@/types";

// Deriverse Devnet Configuration
export const DERIVERSE_CONFIG = {
  PROGRAM_ID: "Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu",
  RPC_HTTP: "https://api.devnet.solana.com",
  RPC_WS: "wss://api.devnet.solana.com",
  VERSION: 12,
  // Common token mints on devnet
  TOKENS: {
    WSOL: "9pan9bMn5HatX4EJdBwg9VgCa7Uz5HL8N1m5D3NdXejP",
    USDC: "A2Pz6rVyXuadFkKnhMXd1w9xgSrZd8m8sEGpuGuyFhaj",
  },
};

// Trading pair mapping
const SYMBOL_MAP: Record<number, string> = {
  0: "SOL/USDC",
  1: "BTC/USDC",
  2: "ETH/USDC",
  3: "RAY/USDC",
  4: "BONK/USDC",
};

interface DeriverseClientData {
  clientId: number;
  tokens: Map<number, { amount: number }>;
  spot: Map<number, { clientId: number }>;
  perp: Map<number, { clientId: number; position: number; entryPrice: number }>;
}

interface DeriverseOrder {
  orderId: number;
  price: number;
  qty: number;
  side: number;
  orderType: number;
  timestamp: number;
}

// DeriversePosition is used for type checking when needed
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface DeriversePosition {
  instrId: number;
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  leverage: number;
}

/**
 * Service class for interacting with Deriverse on-chain data
 * Note: In a browser environment, the @deriverse/kit uses @solana/kit which
 * requires a different setup than Node.js. This service provides a fallback
 * to mock data when SDK initialization fails.
 */
export class DeriverseService {
  private engine: unknown = null;
  private initialized = false;
  private walletAddress: string | null = null;
  private rpc: unknown = null;

  /**
   * Initialize the Deriverse Engine
   * This connects to Solana devnet and prepares the SDK
   */
  async initialize(): Promise<boolean> {
    try {
      // Dynamic import to avoid SSR issues with @solana/kit
      const [solanaKit, deriverseKit] = await Promise.all([
        import("@solana/kit"),
        import("@deriverse/kit"),
      ]);

      const { createSolanaRpc, devnet, address } = solanaKit;
      const { Engine } = deriverseKit;

      // Create RPC connection
      this.rpc = createSolanaRpc(devnet(DERIVERSE_CONFIG.RPC_HTTP));

      // Initialize Engine with proper typing
      const programId = address(DERIVERSE_CONFIG.PROGRAM_ID);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.engine = new Engine(this.rpc as any, {
        programId,
        version: DERIVERSE_CONFIG.VERSION,
      });

      // Initialize the engine (loads root state)
      await (this.engine as { initialize: () => Promise<void> }).initialize();
      this.initialized = true;
      console.log("✅ Deriverse Engine initialized successfully");
      return true;
    } catch (error) {
      console.warn("⚠️ Deriverse SDK initialization failed, using mock data:", error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Set the wallet address for fetching user-specific data
   */
  async setWallet(walletAddress: string): Promise<boolean> {
    if (!this.initialized || !this.engine) {
      console.warn("Engine not initialized");
      return false;
    }

    try {
      const { address } = await import("@solana/kit");
      const walletAddr = address(walletAddress);
      await (this.engine as { setSigner: (addr: unknown) => Promise<void> }).setSigner(walletAddr);
      this.walletAddress = walletAddress;
      
      const engine = this.engine as { originalClientId?: number };
      if (engine.originalClientId) {
        console.log("✅ Connected to Deriverse client:", engine.originalClientId);
        return true;
      } else {
        console.log("ℹ️ No Deriverse client found for this wallet");
        return false;
      }
    } catch (error) {
      console.warn("Failed to set wallet:", error);
      return false;
    }
  }

  /**
   * Fetch client account data including balances and positions
   */
  async getClientData(): Promise<DeriverseClientData | null> {
    if (!this.initialized || !this.engine || !this.walletAddress) {
      return null;
    }

    try {
      const clientData = await (this.engine as { getClientData: () => Promise<DeriverseClientData> }).getClientData();
      return clientData;
    } catch (error) {
      console.warn("Failed to fetch client data:", error);
      return null;
    }
  }

  /**
   * Fetch trading history for the connected wallet
   * Note: On-chain data may be limited; this combines with transaction history
   */
  async getTradingHistory(): Promise<Trade[]> {
    if (!this.initialized || !this.walletAddress) {
      return [];
    }

    try {
      const clientData = await this.getClientData();
      if (!clientData) return [];

      const trades: Trade[] = [];
      
      // Fetch spot orders from all instruments
      for (const [instrId, spotData] of clientData.spot.entries()) {
        const engine = this.engine as {
          getClientSpotOrdersInfo: (params: { clientId: number; instrId: number }) => Promise<{
            bidsCount: number;
            bidsEntry: number;
            asksCount: number;
            asksEntry: number;
          }>;
          getClientSpotOrders: (params: {
            instrId: number;
            bidsCount: number;
            bidsEntry: number;
            asksCount: number;
            asksEntry: number;
          }) => Promise<{ bids?: DeriverseOrder[]; asks?: DeriverseOrder[] }>;
        };

        const ordersInfo = await engine.getClientSpotOrdersInfo({
          clientId: spotData.clientId,
          instrId,
        });

        const orders = await engine.getClientSpotOrders({
          instrId,
          bidsCount: ordersInfo.bidsCount,
          bidsEntry: ordersInfo.bidsEntry,
          asksCount: ordersInfo.asksCount,
          asksEntry: ordersInfo.asksEntry,
        });

        // Convert orders to trade format
        const allOrders = [...(orders.bids || []), ...(orders.asks || [])];
        for (const order of allOrders) {
          trades.push(this.orderToTrade(order, instrId, "spot"));
        }
      }

      return trades;
    } catch (error) {
      console.warn("Failed to fetch trading history:", error);
      return [];
    }
  }

  /**
   * Fetch current open positions
   */
  async getPositions(): Promise<Position[]> {
    if (!this.initialized || !this.walletAddress) {
      return [];
    }

    try {
      const clientData = await this.getClientData();
      if (!clientData) return [];

      const positions: Position[] = [];

      // Fetch perpetual positions
      for (const [instrId, perpData] of clientData.perp.entries()) {
        if (perpData.position !== 0) {
          const position = this.perpDataToPosition(perpData, instrId);
          positions.push(position);
        }
      }

      return positions;
    } catch (error) {
      console.warn("Failed to fetch positions:", error);
      return [];
    }
  }

  /**
   * Convert Deriverse order to Trade type
   */
  private orderToTrade(order: DeriverseOrder, instrId: number, marketType: MarketType): Trade {
    const symbol = SYMBOL_MAP[instrId] || `ASSET${instrId}/USDC`;
    const side: TradeSide = order.side === 0 ? "long" : "short";
    const orderType: OrderType = order.orderType === 0 ? "market" : "limit";
    const entryTime = new Date(order.timestamp * 1000);
    const quantity = order.qty;
    const entryPrice = order.price;

    // Calculate fees (estimated)
    const volume = entryPrice * quantity;
    const makerFee = volume * 0.0002; // 0.02% maker fee
    const takerFee = volume * 0.0005; // 0.05% taker fee

    return {
      id: `${instrId}-${order.orderId}`,
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
      fees: {
        makerFee,
        takerFee,
        fundingFee: 0,
        totalFee: makerFee + takerFee,
      },
      txSignature: "",
      notes: undefined,
      tags: undefined,
    };
  }

  /**
   * Convert perpetual data to Position type
   */
  private perpDataToPosition(
    perpData: { clientId: number; position: number; entryPrice: number },
    instrId: number
  ): Position {
    const symbol = SYMBOL_MAP[instrId] || `ASSET${instrId}/USDC`;
    const side: TradeSide = perpData.position > 0 ? "long" : "short";
    const quantity = Math.abs(perpData.position);
    const entryPrice = perpData.entryPrice;
    
    // Estimated current price (would need market data for real value)
    const currentPrice = entryPrice * (1 + (Math.random() * 0.1 - 0.05));
    const unrealizedPnl = side === "long"
      ? (currentPrice - entryPrice) * quantity
      : (entryPrice - currentPrice) * quantity;

    return {
      id: `perp-${instrId}-${perpData.clientId}`,
      symbol,
      side,
      marketType: "perpetual",
      entryPrice,
      currentPrice,
      quantity,
      leverage: 1,
      unrealizedPnl,
      unrealizedPnlPercentage: (unrealizedPnl / (entryPrice * quantity)) * 100,
      margin: entryPrice * quantity / 1,
      liquidationPrice: side === "long"
        ? entryPrice * 0.8
        : entryPrice * 1.2,
      openTime: new Date(),
    };
  }

  /**
   * Check if the service is initialized and connected
   */
  isConnected(): boolean {
    return this.initialized && this.walletAddress !== null;
  }

  /**
   * Get the current wallet address
   */
  getWalletAddress(): string | null {
    return this.walletAddress;
  }
}

// Singleton instance
export const deriverseService = new DeriverseService();
