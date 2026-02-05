// Core trading types for the analytics dashboard

export type TradeSide = "long" | "short";
export type TradeStatus = "open" | "closed" | "liquidated";
export type OrderType = "market" | "limit" | "stop" | "stop_limit";
export type MarketType = "spot" | "perpetual" | "options";

export interface Trade {
  id: string;
  txSignature: string;
  symbol: string;
  marketType: MarketType;
  side: TradeSide;
  orderType: OrderType;
  status: TradeStatus;
  entryPrice: number;
  currentPrice?: number; // Live price for real-time PnL
  exitPrice?: number;
  quantity: number;
  leverage?: number;
  entryTime: Date;
  exitTime?: Date;
  pnl?: number;
  pnlPercentage?: number;
  fees: TradeFees;
  notes?: string;
  tags?: string[];
}

export interface TradeFees {
  makerFee: number;
  takerFee: number;
  fundingFee?: number;
  totalFee: number;
}

export interface Position {
  id: string;
  symbol: string;
  marketType: MarketType;
  side: TradeSide;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  leverage?: number;
  unrealizedPnl: number;
  unrealizedPnlPercentage: number;
  margin?: number;
  liquidationPrice?: number;
  openTime: Date;
}

export interface PortfolioMetrics {
  totalPnl: number;
  totalPnlPercentage: number;
  totalVolume: number;
  totalFees: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
  averageTradeDuration: number;
  longShortRatio: number;
  maxDrawdown: number;
  maxDrawdownPercentage: number;
  sharpeRatio?: number;
}

export interface DailyPerformance {
  date: Date;
  pnl: number;
  cumulativePnl: number;
  volume: number;
  fees: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  drawdown: number;
  drawdownPercentage: number;
}

export interface TimeBasedMetrics {
  hour: number;
  pnl: number;
  tradeCount: number;
  winRate: number;
}

export interface SessionMetrics {
  session: "asian" | "european" | "american";
  pnl: number;
  tradeCount: number;
  winRate: number;
  averageDuration: number;
}

export interface SymbolMetrics {
  symbol: string;
  pnl: number;
  volume: number;
  tradeCount: number;
  winRate: number;
  averagePnl: number;
  fees: number;
}

export interface FeeBreakdown {
  makerFees: number;
  takerFees: number;
  fundingFees: number;
  totalFees: number;
  feesOverTime: Array<{
    date: Date;
    fees: number;
    cumulativeFees: number;
  }>;
}

export interface JournalEntry {
  id: string;
  tradeId?: string;
  date: Date;
  title: string;
  content: string;
  tags: string[];
  mood?: "positive" | "neutral" | "negative";
  lessonLearned?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterOptions {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  symbols: string[];
  marketTypes: MarketType[];
  sides: TradeSide[];
  status: TradeStatus[];
  minPnl?: number;
  maxPnl?: number;
}

export interface ChartDataPoint {
  timestamp: number;
  date: string;
  value: number;
  label?: string;
}

// Deriverse specific types
export interface DeriverseAccount {
  clientId: number;
  walletAddress: string;
  tokenBalances: Map<number, TokenBalance>;
  spotPositions: Map<number, SpotPosition>;
  perpPositions: Map<number, PerpPosition>;
}

export interface TokenBalance {
  tokenId: number;
  amount: number;
  locked: number;
  available: number;
}

export interface SpotPosition {
  instrId: number;
  quantity: number;
  averagePrice: number;
}

export interface PerpPosition {
  instrId: number;
  size: number;
  entryPrice: number;
  leverage: number;
  margin: number;
  unrealizedPnl: number;
  liquidationPrice: number;
}

export interface Instrument {
  instrId: number;
  symbol: string;
  assetToken: string;
  currencyToken: string;
  marketType: MarketType;
  lastPrice: number;
  bestBid: number;
  bestAsk: number;
  volume24h: number;
  priceChange24h: number;
}
