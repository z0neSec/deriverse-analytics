/**
 * useClosePosition Hook
 * Handles closing positions on Deriverse
 * Since direct transaction execution requires complex SDK integration,
 * this hook fetches position data and guides users to close on Deriverse exchange
 */

import { useState, useCallback } from "react";
import type { Trade } from "@/types";

interface ClosePositionResult {
  success: boolean;
  position?: {
    instrId: number;
    symbol: string;
    side: string;
    size: number;
    entryPrice: number;
    currentPrice: number;
    pnl: number;
    leverage: number;
  };
  closeInstruction?: {
    action: string;
    size: number;
    instrId: number;
    exchangeUrl: string;
  };
  message?: string;
  error?: string;
}

interface UseClosePositionReturn {
  closePosition: (trade: Trade, walletAddress: string) => Promise<ClosePositionResult>;
  isLoading: boolean;
  error: string | null;
}

export function useClosePosition(): UseClosePositionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closePosition = useCallback(async (trade: Trade, walletAddress: string): Promise<ClosePositionResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the instrument ID from the symbol
      const instrIdMap: Record<string, number> = {
        "SOL/USDC": 0,
        "BTC/USDC": 1,
        "ETH/USDC": 2,
        "RAY/USDC": 3,
        "BONK/USDC": 4,
        "JUP/USDC": 5,
        "PYTH/USDC": 6,
      };

      const instrId = instrIdMap[trade.symbol] ?? 0;

      // Fetch close position instructions from API
      const response = await fetch(
        `/api/deriverse?action=buildClosePosition&wallet=${walletAddress}&instrId=${instrId}`
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to get close instructions");
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to close position";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    closePosition,
    isLoading,
    error,
  };
}

/**
 * Open Deriverse exchange in a new tab to close position
 */
export function openDeriverseToClose(symbol: string, side: "long" | "short", size: number): void {
  const baseUrl = "https://devnet.deriverse.io";
  const marketSymbol = symbol.replace("/", "-").toLowerCase();
  const url = `${baseUrl}/trade/${marketSymbol}`;
  
  // Show instructions
  const action = side === "long" ? "SELL" : "BUY";
  const asset = symbol.split("/")[0];
  
  const confirmed = confirm(
    `To close your ${side.toUpperCase()} position:\n\n` +
    `1. Click OK to open Deriverse exchange\n` +
    `2. Place a ${action} order for ${size.toFixed(4)} ${asset}\n` +
    `3. Confirm the transaction in your wallet\n\n` +
    `This will close your position and realize your PnL.`
  );

  if (confirmed) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
