"use client";

import React, { useMemo, useEffect, useCallback, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { deriverseService } from "@/lib/deriverse-service";
import { useTradingStore } from "@/store";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletContextProviderProps {
  children: React.ReactNode;
}

// Inner component to handle wallet state changes
function WalletStateHandler({ children }: { children: React.ReactNode }) {
  const { connected, publicKey } = useWallet();
  const { setTrades, setPositions, setConnected } = useTradingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);

  // Initialize Deriverse SDK on mount
  useEffect(() => {
    const initSDK = async () => {
      const success = await deriverseService.initialize();
      setSdkInitialized(success);
    };
    initSDK();
  }, []);

  // Fetch live data when wallet connects
  const fetchLiveData = useCallback(async (walletAddress: string) => {
    setIsLoading(true);
    try {
      // Try to set wallet and fetch live data
      const hasActivity = await deriverseService.setWallet(walletAddress);
      
      // Always try to fetch trading history - even if hasActivity is false,
      // we want to scan for any Deriverse transactions
      const [trades, positions] = await Promise.all([
        deriverseService.getTradingHistory(),
        deriverseService.getPositions(),
      ]);

      console.log(`Loaded ${trades.length} trades and ${positions.length} positions from Deriverse`);
      
      if (trades.length > 0 || hasActivity) {
        setTrades(trades);
        setPositions(positions);
      } else {
        // No Deriverse activity for this wallet - show empty state
        console.log("No Deriverse trading activity found for this wallet");
        setTrades([]);
        setPositions([]);
      }
    } catch (error) {
      console.warn("Failed to fetch live data:", error);
      // Clear data on error
      setTrades([]);
      setPositions([]);
    } finally {
      setIsLoading(false);
    }
  }, [setTrades, setPositions]);

  // Handle wallet connection state changes
  useEffect(() => {
    if (connected && publicKey) {
      setConnected(true, publicKey.toBase58());
      // Always try to fetch data when wallet connects
      fetchLiveData(publicKey.toBase58());
    } else {
      setConnected(false);
      // Clear data when wallet disconnects
      setTrades([]);
      setPositions([]);
    }
  }, [connected, publicKey, setConnected, fetchLiveData, setTrades, setPositions]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-zinc-900 rounded-xl p-6 flex items-center gap-4">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-white">Loading trading data from Deriverse...</span>
          </div>
        </div>
      )}
      {children}
    </>
  );
}

export function WalletContextProvider({ children }: WalletContextProviderProps) {
  // Use devnet for Deriverse
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletStateHandler>{children}</WalletStateHandler>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
