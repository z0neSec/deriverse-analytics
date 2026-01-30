"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wallet, BarChart3 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Card, CardContent } from "./card";

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
    <Card className="border-dashed border-slate-800/60">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div 
          className="w-14 h-14 rounded-xl bg-slate-800/50 flex items-center justify-center mb-5"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {connected ? (
            <BarChart3 className="w-6 h-6 text-slate-500" />
          ) : (
            <Wallet className="w-6 h-6 text-slate-500" />
          )}
        </motion.div>
        <motion.h3 
          className="text-base font-medium text-slate-200 mb-2"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {title}
        </motion.h3>
        <motion.p 
          className="text-sm text-slate-500 max-w-md mb-6"
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
            <WalletMultiButton className="!bg-slate-200 hover:!bg-white !text-slate-900 !rounded-lg !h-9 !text-xs !font-medium !transition-colors" />
          </motion.div>
        )}
        
        {connected && (
          <motion.div 
            className="text-xs text-slate-500"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <p>No trading history found on Deriverse.</p>
            <p className="mt-1">
              Start trading on{" "}
              <a
                href="https://deriverse.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-slate-100 underline underline-offset-2"
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
