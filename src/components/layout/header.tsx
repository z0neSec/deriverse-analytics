"use client";

import React, { useEffect } from "react";
import { Bell, ExternalLink } from "lucide-react";
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
    <header className="fixed top-0 right-0 left-64 z-30 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Network</span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Devnet
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Documentation Link */}
          <a
            href="https://deriverse.gitbook.io/deriverse-v1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <span>Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          {/* Wallet Connection - Using Solana Wallet Adapter */}
          <WalletMultiButton className="!bg-emerald-600 hover:!bg-emerald-700 !rounded-lg !h-10 !text-sm !font-medium !transition-colors" />
        </div>
      </div>
    </header>
  );
}
