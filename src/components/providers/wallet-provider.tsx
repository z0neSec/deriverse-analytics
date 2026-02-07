"use client";

import React, { useMemo, useEffect, useCallback, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { deriverseService, updateTradesPnL } from "@/lib/deriverse-service";
import { useTradingStore } from "@/store";
import type { Trade } from "@/types";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletContextProviderProps {
  children: React.ReactNode;
}

// Deriverse-style loading component with theme colors
function DeriverseLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm">
      <span className="text-slate-400 text-sm tracking-widest uppercase mb-4">Loading</span>
      <div className="flex gap-1.5">
        <div className="w-1 h-3 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-3 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500 animate-bounce" style={{ animationDelay: '100ms' }} />
        <div className="w-1 h-3 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500 animate-bounce" style={{ animationDelay: '200ms' }} />
        <div className="w-1 h-3 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        <div className="w-1 h-3 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500 animate-bounce" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
}

// Inner component to handle wallet state changes
function WalletStateHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { connected, publicKey } = useWallet();
  const setTrades = useTradingStore((state) => state.setTrades);
  const trades = useTradingStore((state) => state.trades);
  const setPositions = useTradingStore((state) => state.setPositions);
  const setConnected = useTradingStore((state) => state.setConnected);
  const clearData = useTradingStore((state) => state.clearData);
  
  const [isLoading, setIsLoading] = useState(false);
  const prevConnectedRef = useRef<boolean>(false);
  const prevAddressRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);
  const pnlIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Deriverse SDK on mount
  useEffect(() => {
    deriverseService.initialize();
  }, []);

  // Track whether we have trades (to avoid running interval when no trades)
  const hasTrades = trades.length > 0;
  const tradesRef = useRef(trades);
  tradesRef.current = trades;

  // Real-time PnL update interval (every 30 seconds)
  useEffect(() => {
    // Clear any existing interval
    if (pnlIntervalRef.current) {
      clearInterval(pnlIntervalRef.current);
      pnlIntervalRef.current = null;
    }

    // Only run if connected and has trades
    if (!connected || !hasTrades) return;

    const updatePnL = async () => {
      try {
        const currentTrades = tradesRef.current;
        const updatedTrades = await updateTradesPnL(currentTrades);
        // Only update if there are actual changes
        const hasChanges = updatedTrades.some((t: Trade, i: number) => 
          t.pnl !== currentTrades[i]?.pnl || t.currentPrice !== currentTrades[i]?.currentPrice
        );
        if (hasChanges) {
          console.log('[WalletProvider] Real-time PnL updated');
          setTrades(updatedTrades);
        }
      } catch (error) {
        console.warn('[WalletProvider] PnL update failed:', error);
      }
    };

    // Run immediately
    updatePnL();

    // Then every 30 seconds
    pnlIntervalRef.current = setInterval(updatePnL, 30000);

    return () => {
      if (pnlIntervalRef.current) {
        clearInterval(pnlIntervalRef.current);
        pnlIntervalRef.current = null;
      }
    };
  }, [connected, hasTrades, setTrades]);

  // Fetch live data when wallet connects
  const fetchLiveData = useCallback(async (walletAddress: string) => {
    setIsLoading(true);
    console.log('[WalletProvider] Starting data fetch for:', walletAddress);
    try {
      const hasActivity = await deriverseService.setWallet(walletAddress);
      console.log('[WalletProvider] Deriverse activity check:', hasActivity);
      
      const [trades, positions] = await Promise.all([
        deriverseService.getTradingHistory(),
        deriverseService.getPositions(),
      ]);

      console.log('[WalletProvider] Fetched data:', { trades: trades.length, positions: positions.length });
      console.log('[WalletProvider] Trades:', trades);
      
      setTrades(trades.length > 0 ? trades : []);
      setPositions(positions.length > 0 ? positions : []);
      
      return { trades, positions, hasActivity };
    } catch (error) {
      console.warn("[WalletProvider] Failed to fetch live data:", error);
      setTrades([]);
      setPositions([]);
      return { trades: [], positions: [], hasActivity: false };
    } finally {
      setIsLoading(false);
    }
  }, [setTrades, setPositions]);

  // Handle wallet connection state changes
  useEffect(() => {
    const currentAddress = publicKey?.toBase58() || null;
    const wasConnected = prevConnectedRef.current;
    const prevAddress = prevAddressRef.current;
    
    // Skip on initial mount to avoid unnecessary actions
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      prevConnectedRef.current = connected;
      prevAddressRef.current = currentAddress;
      if (connected && currentAddress) {
        setConnected(true, currentAddress);
        fetchLiveData(currentAddress);
      }
      return;
    }
    
    console.log('[WalletProvider] State check:', { 
      connected, 
      wasConnected,
      currentAddress,
      prevAddress,
    });
    
    // Wallet just connected
    if (connected && publicKey && (!wasConnected || prevAddress !== currentAddress)) {
      console.log('[WalletProvider] Wallet connected, fetching data and redirecting...');
      setConnected(true, currentAddress!);
      
      // Fetch data then redirect to portfolio
      fetchLiveData(currentAddress!).then(() => {
        // Navigate to portfolio page after data loads
        if (pathname === '/') {
          router.push('/portfolio');
        } else {
          // Refresh current page to update UI
          router.refresh();
        }
      });
      
      prevConnectedRef.current = true;
      prevAddressRef.current = currentAddress;
    } 
    // Wallet just disconnected
    else if (!connected && wasConnected) {
      console.log('[WalletProvider] Wallet disconnected, clearing state and refreshing...');
      setConnected(false);
      clearData();
      prevConnectedRef.current = false;
      prevAddressRef.current = null;
      
      // Refresh the page on disconnect
      window.location.reload();
    }
  }, [connected, publicKey, setConnected, fetchLiveData, clearData, router, pathname]);

  return (
    <>
      {isLoading && <DeriverseLoader />}
      {children}
    </>
  );
}

export function WalletContextProvider({ children }: WalletContextProviderProps) {
  // Use devnet for Deriverse
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  // Use empty wallets array - the StandardWalletAdapter will auto-detect installed wallets
  // This prevents duplicate entries like "MetaMask" appearing twice
  const wallets = useMemo(() => [], []);

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
