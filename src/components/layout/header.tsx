"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, ExternalLink, Circle } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useTradingStore } from "@/store";

export function Header() {
  const { connected, publicKey } = useWallet();
  const { setConnected } = useTradingStore();

  // Sync wallet state with store
  useEffect(() => {
    if (connected && publicKey) {
      setConnected(true, publicKey.toBase58());
    } else {
      setConnected(false);
    }
  }, [connected, publicKey, setConnected]);

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-30 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left Section - Hidden on mobile to make room for hamburger menu */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">Network</span>
            <motion.span 
              className="flex items-center gap-1.5 text-xs font-medium text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Circle className="w-1.5 h-1.5 fill-current animate-pulse-subtle" />
              Devnet
            </motion.span>
          </div>
          
          {/* Separator */}
          <div className="h-4 w-px bg-slate-800" />
          
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">Status</span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500/80">
              <Circle className="w-1.5 h-1.5 fill-current" />
              Operational
            </span>
          </div>
        </div>

        {/* Mobile Spacer for hamburger button */}
        <div className="w-10 md:hidden" />

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Network indicator - Mobile only */}
          <span className="flex md:hidden items-center gap-1 text-[10px] font-medium text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
            <Circle className="w-1 h-1 fill-current animate-pulse-subtle" />
            Devnet
          </span>

          {/* Documentation Link */}
          <a
            href="https://deriverse.gitbook.io/deriverse-v1"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors rounded-md hover:bg-slate-800/30"
          >
            <span className="font-medium">Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Notifications */}
          <motion.button 
            className="relative p-2 rounded-lg hover:bg-slate-800/30 text-slate-500 hover:text-slate-300 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-400" />
          </motion.button>

          {/* Wallet Connection - Using Solana Wallet Adapter */}
          <WalletMultiButton className="!bg-slate-800 hover:!bg-slate-700 !border !border-slate-700 hover:!border-slate-600 !rounded-lg !h-9 md:!h-9 !text-xs !font-medium !transition-all !px-3 md:!px-4 !text-slate-300" />
        </div>
      </div>
    </header>
  );
}
