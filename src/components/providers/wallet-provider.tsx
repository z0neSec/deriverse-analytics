"use client";

import React, { useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { deriverseService, updateTradesPnL } from "../../lib/deriverse-service";
import { useTradingStore } from "@/store";
import type { Trade } from "@/types";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletContextProviderProps {
  children: React.ReactNode;
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
  const setLoading = useTradingStore((state) => state.setLoading);
  const clearData = useTradingStore((state) => state.clearData);
  
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
  useEffect(() => {
    tradesRef.current = trades;
  }, [trades]);

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
  // Split into fast (SDK) and slow (history) phases
  const fetchLiveData = useCallback(async (walletAddress: string) => {
    setLoading(true);
    console.log('[WalletProvider] Starting data fetch for:', walletAddress);
    
    try {
      // Phase 1: Fast SDK data (client info, positions, orders) - ~2-3 seconds
      const hasActivity = await deriverseService.setWallet(walletAddress);
      console.log('[WalletProvider] Deriverse activity check:', hasActivity);
      
      // Fetch SDK trades (open positions + orders only - fast)
      const sdkTrades = await deriverseService.getTradingHistory();
      console.log('[WalletProvider] SDK trades (fast):', sdkTrades.length);
      
      // Fetch positions
      const positions = await deriverseService.getPositions();
      console.log('[WalletProvider] Positions:', positions.length);

      // Set SDK data IMMEDIATELY - this makes the dashboard show data right away
      setTrades(sdkTrades);
      setPositions(positions);
      setLoading(false);
      
      // Phase 2: Slow transaction history (closed trades) - runs in background
      // This can take 10-30s due to Solana RPC rate limiting
      // Note: Realized PnL data is already complete from Phase 1 (timeline + historical prices)
      // This phase only adds trades for OTHER symbols not covered by SDK
      deriverseService.fetchClosedTradeHistory().then(({ trades: closedTrades }) => {
        if (closedTrades.length > 0) {
          const currentTrades = tradesRef.current;
          const existingSignatures = new Set(currentTrades.map(t => t.txSignature));
          const sdkCoveredSymbols = new Set(currentTrades.map(t => t.symbol));
          const newClosedTrades = closedTrades.filter(t => 
            !existingSignatures.has(t.txSignature) && !sdkCoveredSymbols.has(t.symbol)
          );
          if (newClosedTrades.length > 0) {
            setTrades([...currentTrades, ...newClosedTrades]);
            console.log('[WalletProvider] Merged new symbol trades:', newClosedTrades.length);
          }
        }
      }).catch(err => {
        console.warn('[WalletProvider] Background history fetch failed:', err);
      });
      
      return { trades: sdkTrades, positions, hasActivity };
    } catch (error) {
      console.warn("[WalletProvider] Failed to fetch live data:", error);
      setTrades([]);
      setPositions([]);
      setLoading(false);
      return { trades: [], positions: [], hasActivity: false };
    }
  }, [setTrades, setPositions, setLoading]);

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
      console.log('[WalletProvider] Wallet connected, fetching data...');
      setConnected(true, currentAddress!);
      
      // Fetch data then redirect to portfolio
      fetchLiveData(currentAddress!).then(() => {
        // Navigate to portfolio page after data loads
        if (pathname === '/') {
          router.push('/portfolio');
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
      
      // Refresh the page on disconnect
      window.location.reload();
    }
  }, [connected, publicKey, setConnected, fetchLiveData, clearData, router, pathname]);

  return children;
}

export function WalletContextProvider({ children }: WalletContextProviderProps) {
  // Use devnet for Deriverse
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  // Use empty wallets array - the StandardWalletAdapter will auto-detect installed wallets
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
