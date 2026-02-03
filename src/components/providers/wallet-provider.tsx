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
import { deriverseService } from "@/lib/deriverse-service";
import { useTradingStore } from "@/store";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletContextProviderProps {
  children: React.ReactNode;
}

// Deriverse-style loading component
function DeriverseLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <span className="text-slate-400 text-sm tracking-wide mb-3">Loading</span>
      <div className="flex gap-1">
        <div className="w-1.5 h-2.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-2.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-2.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        <div className="w-1.5 h-2.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '450ms' }} />
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
  const setPositions = useTradingStore((state) => state.setPositions);
  const setConnected = useTradingStore((state) => state.setConnected);
  const clearData = useTradingStore((state) => state.clearData);
  
  const [isLoading, setIsLoading] = useState(false);
  const prevConnectedRef = useRef<boolean>(false);
  const prevAddressRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

  // Initialize Deriverse SDK on mount
  useEffect(() => {
    deriverseService.initialize();
  }, []);

  // Fetch live data when wallet connects
  const fetchLiveData = useCallback(async (walletAddress: string) => {
    setIsLoading(true);
    try {
      const hasActivity = await deriverseService.setWallet(walletAddress);
      
      const [trades, positions] = await Promise.all([
        deriverseService.getTradingHistory(),
        deriverseService.getPositions(),
      ]);

      console.log(`Loaded ${trades.length} trades and ${positions.length} positions from Deriverse`);
      
      setTrades(trades.length > 0 ? trades : []);
      setPositions(positions.length > 0 ? positions : []);
      
      return { trades, positions, hasActivity };
    } catch (error) {
      console.warn("Failed to fetch live data:", error);
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
      console.log('[WalletProvider] Wallet disconnected, clearing state...');
      setConnected(false);
      clearData();
      prevConnectedRef.current = false;
      prevAddressRef.current = null;
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
