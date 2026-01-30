"use client";

import React from "react";
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
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
          {connected ? (
            <BarChart3 className="w-8 h-8 text-zinc-500" />
          ) : (
            <Wallet className="w-8 h-8 text-zinc-500" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 max-w-md mb-6">{description}</p>
        
        {showConnectWallet && !connected && (
          <WalletMultiButton className="!bg-emerald-600 hover:!bg-emerald-700 !rounded-lg !h-10 !text-sm !font-medium !transition-colors" />
        )}
        
        {connected && (
          <div className="text-sm text-zinc-500">
            <p>No trading history found on Deriverse.</p>
            <p className="mt-1">
              Start trading on{" "}
              <a
                href="https://deriverse.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                Deriverse
              </a>{" "}
              to see your analytics here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
