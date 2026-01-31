"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wallet, BarChart3 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "./card";

// Dynamically import WalletMultiButton to avoid hydration mismatch
const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false, loading: () => <div className="h-11 w-36 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl animate-pulse" /> }
);

interface EmptyStateProps {
  title?: string;
  description?: string;
  showConnectWallet?: boolean;
}

export function EmptyState({
  title = "No Trading Data",
  description = "Connect your wallet to view your Deriverse trading analytics",
  showConnectWallet = true,
}: EmptyStateProps) {
  const { connected } = useWallet();

  return (
    <Card className="border-dashed border-slate-700/40">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center relative">
        {/* Decorative background gradient */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(59, 130, 246, 0.05), transparent)",
          }}
        />
        
        <motion.div 
          className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 flex items-center justify-center mb-6 shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle glow */}
          <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl" />
          {connected ? (
            <BarChart3 className="w-7 h-7 text-slate-400 relative z-10" />
          ) : (
            <Wallet className="w-7 h-7 text-slate-400 relative z-10" />
          )}
        </motion.div>
        
        <motion.h3 
          className="text-lg font-medium text-slate-200 mb-2"
          style={{ fontFamily: 'var(--font-instrument)' }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {title}
        </motion.h3>
        <motion.p 
          className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          {description}
        </motion.p>
        
        {showConnectWallet && !connected && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <WalletMultiButton className="!bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-500 hover:!to-indigo-500 !text-white !rounded-xl !h-11 !px-6 !text-sm !font-medium !transition-all !shadow-lg !shadow-blue-500/20" />
          </motion.div>
        )}
        
        {connected && (
          <motion.div 
            className="text-sm text-slate-500 space-y-1"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <p>No trading history found on Deriverse.</p>
            <p>
              Start trading on{" "}
              <a
                href="https://deriverse.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 transition-colors"
              >
                Deriverse
              </a>{" "}
              to see your analytics here.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
