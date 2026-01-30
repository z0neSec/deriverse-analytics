"use client";

import React from "react";
import { Wallet, Bell, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui";
import { useTradingStore } from "@/store";
import { shortenAddress } from "@/lib/utils";

export function Header() {
  const { isConnected, walletAddress, setConnected } = useTradingStore();

  const handleConnect = async () => {
    // Simulate wallet connection for demo
    // In production, this would use @solana/wallet-adapter-react
    setConnected(true, "DemoWallet1234567890abcdefghijklmnopqrstuvwxyz");
  };

  const handleDisconnect = () => {
    setConnected(false);
  };

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

          {/* Wallet Connection */}
          {isConnected && walletAddress ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-white">
                  {shortenAddress(walletAddress)}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={handleConnect}>
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
