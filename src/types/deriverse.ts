// Deriverse SDK specific types and interfaces

export interface DeriverseConfig {
  programId: string;
  rpcHttp: string;
  rpcWs: string;
  version: number;
}

export interface ClientData {
  clientId: number | null;
  tokens: Map<number, ClientTokenData>;
  spot: Map<number, ClientSpotData>;
  perp: Map<number, ClientPerpData>;
  // Trade counts from direct RPC fallback
  spotTrades?: number;
  perpTrades?: number;
  lpTrades?: number;
  points?: number;
}

export interface ClientTokenData {
  tokenId: number;
  amount: number;
  locked: number;
}

export interface ClientSpotData {
  clientId: number;
  instrId: number;
  position: number;
  averagePrice: number;
}

export interface ClientPerpData {
  clientId: number;
  instrId: number;
  size: number;
  entryPrice: number;
  leverage: number;
  margin: number;
  lastFundingTime: number;
}

export interface SpotOrderInfo {
  orderId: number;
  side: 0 | 1; // 0 = bid, 1 = ask
  price: number;
  quantity: number;
  filled: number;
  timestamp: number;
}

export interface PerpOrderInfo {
  orderId: number;
  side: 0 | 1;
  price: number;
  size: number;
  filled: number;
  leverage: number;
  reduceOnly: boolean;
  timestamp: number;
}

export interface InstrumentInfo {
  instrId: number;
  assetTokenId: number;
  crncyTokenId: number;
  lastPx: number;
  bestBid: number;
  bestAsk: number;
  volume24h: number;
  openInterest?: number;
  fundingRate?: number;
  nextFundingTime?: number;
}

export interface TokenInfo {
  tokenId: number;
  mint: string;
  decimals: number;
  symbol: string;
  name: string;
}

export interface TradeEvent {
  txSignature: string;
  timestamp: number;
  instrId: number;
  side: 0 | 1;
  price: number;
  quantity: number;
  maker: string;
  taker: string;
  makerFee: number;
  takerFee: number;
}

export interface FundingEvent {
  timestamp: number;
  instrId: number;
  fundingRate: number;
  fundingPayment: number;
}

// Order types matching Deriverse SDK
export enum DeriverseOrderType {
  Limit = 0,
  Market = 1,
  Stop = 2,
  StopLimit = 3,
  IOC = 4, // Immediate or Cancel
  FOK = 5, // Fill or Kill
}

export enum DeriverseOrderSide {
  Bid = 0,
  Ask = 1,
}

export enum DeriverseMarketType {
  Spot = 0,
  Perp = 1,
  Options = 2,
}

// Network configuration presets (Official Deriverse v1 on Solana Devnet)
export const DERIVERSE_DEVNET_CONFIG: DeriverseConfig = {
  programId: "CDESjex4EDBKLwx9ZPzVbjiHEHatasb5fhSJZMzNfvw2",
  rpcHttp: "https://api.devnet.solana.com",
  rpcWs: "wss://api.devnet.solana.com",
  version: 6,
};

// Common token mints for devnet
export const DEVNET_TOKENS = {
  WSOL: "9pan9bMn5HatX4EJdBwg9VgCa7Uz5HL8N1m5D3NdXejP",
  USDC: "A2Pz6rVyXuadFkKnhMXd1w9xgSrZd8m8sEGpuGuyFhaj",
} as const;
