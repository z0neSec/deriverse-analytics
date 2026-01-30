"use client";

import React from "react";
import { Badge } from "@/components/ui";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import type { Position } from "@/types";
import { cn } from "@/lib/utils";

interface OpenPositionsProps {
  positions: Position[];
}

export function OpenPositions({ positions }: OpenPositionsProps) {
  if (positions.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Open Positions</h3>
        <div className="text-center py-8">
          <p className="text-zinc-400">No open positions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Open Positions</h3>
      <div className="space-y-4">
        {positions.map((position) => (
          <div
            key={position.id}
            className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{position.symbol}</span>
                <Badge variant={position.side === "long" ? "success" : "danger"}>
                  {position.side.toUpperCase()}
                </Badge>
                <Badge variant={position.marketType === "spot" ? "info" : "warning"}>
                  {position.marketType}
                </Badge>
                {position.leverage && (
                  <Badge variant="default">{position.leverage}x</Badge>
                )}
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 font-medium",
                  position.unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {position.unrealizedPnl >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {formatCurrency(position.unrealizedPnl)}
                <span className="text-xs">
                  ({formatPercentage(position.unrealizedPnlPercentage)})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-zinc-400 mb-1">Entry Price</p>
                <p className="text-white font-medium">{formatCurrency(position.entryPrice)}</p>
              </div>
              <div>
                <p className="text-zinc-400 mb-1">Current Price</p>
                <p className="text-white font-medium">{formatCurrency(position.currentPrice)}</p>
              </div>
              <div>
                <p className="text-zinc-400 mb-1">Size</p>
                <p className="text-white font-medium">{position.quantity.toFixed(4)}</p>
              </div>
              {position.liquidationPrice && (
                <div>
                  <p className="text-zinc-400 mb-1 flex items-center gap-1">
                    Liquidation
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  </p>
                  <p className="text-amber-400 font-medium">
                    {formatCurrency(position.liquidationPrice)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
