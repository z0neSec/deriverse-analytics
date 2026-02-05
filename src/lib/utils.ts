import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely convert a date-like value to a Date object
 * Handles Date objects, strings, and numbers (timestamps)
 */
export function toDate(date: Date | string | number): Date {
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
}

/**
 * Safely get timestamp from a date-like value
 */
export function getTime(date: Date | string | number): number {
  if (date instanceof Date) {
    return date.getTime();
  }
  if (typeof date === 'number') {
    return date;
  }
  return new Date(date).getTime();
}

export function formatCurrency(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Get official coin logo URL
 * Uses CoinGecko's CDN for official token logos
 */
export function getCoinLogoUrl(symbol: string): string {
  // Extract base symbol from pair (e.g., "SOL/USDC" -> "sol")
  const baseSymbol = symbol.split("/")[0].toLowerCase();
  
  // CoinGecko coin IDs mapping
  const coinIds: Record<string, string> = {
    sol: "solana",
    btc: "bitcoin",
    eth: "ethereum",
    ray: "raydium",
    bonk: "bonk",
    jup: "jupiter-exchange-solana",
    pyth: "pyth-network",
    usdc: "usd-coin",
    usdt: "tether",
  };
  
  const coinId = coinIds[baseSymbol];
  
  if (coinId) {
    return `https://assets.coingecko.com/coins/images/${getCoinGeckoImageId(coinId)}/small/${coinId}.png`;
  }
  
  // Fallback to generic placeholder
  return `https://ui-avatars.com/api/?name=${baseSymbol.toUpperCase()}&background=1e293b&color=e2e8f0&size=32&bold=true`;
}

/**
 * CoinGecko image IDs (they use numeric IDs for images)
 */
function getCoinGeckoImageId(coinId: string): number {
  const imageIds: Record<string, number> = {
    solana: 4128,
    bitcoin: 1,
    ethereum: 279,
    raydium: 13928,
    bonk: 28600,
    "jupiter-exchange-solana": 31036,
    "pyth-network": 31924,
    "usd-coin": 6319,
    tether: 325,
  };
  return imageIds[coinId] || 1;
}

/**
 * Get coin logo with fallback - simpler approach using known working URLs
 */
export function getCoinLogo(symbol: string): string {
  const baseSymbol = symbol.split("/")[0].toUpperCase();
  
  // Direct CDN URLs for common coins (more reliable)
  const logos: Record<string, string> = {
    SOL: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    RAY: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
    BONK: "https://assets.coingecko.com/coins/images/28600/small/bonk.jpg",
    JUP: "https://assets.coingecko.com/coins/images/31036/small/jup.png",
    PYTH: "https://assets.coingecko.com/coins/images/31924/small/pyth.png",
    USDC: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  };
  
  return logos[baseSymbol] || `https://ui-avatars.com/api/?name=${baseSymbol}&background=1e293b&color=e2e8f0&size=32&bold=true&format=svg`;
}
