"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { SymbolMetrics } from "@/types";
import { cn } from "@/lib/utils";

interface SymbolPerformanceProps {
  data: SymbolMetrics[];
}

export function SymbolPerformance({ data }: SymbolPerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Symbol</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((symbol) => (
            <div
              key={symbol.symbol}
              className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-white font-bold text-sm">
                  {symbol.symbol.split("/")[0].slice(0, 3)}
                </div>
                <div>
                  <p className="font-medium text-white">{symbol.symbol}</p>
                  <p className="text-xs text-zinc-400">{symbol.tradeCount} trades</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-zinc-400 mb-0.5">Volume</p>
                  <p className="text-sm text-white">{formatCurrency(symbol.volume)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400 mb-0.5">Win Rate</p>
                  <p className={cn(
                    "text-sm font-medium",
                    symbol.winRate >= 50 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {symbol.winRate.toFixed(1)}%
                  </p>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-xs text-zinc-400 mb-0.5">PnL</p>
                  <p className={cn(
                    "text-sm font-bold",
                    symbol.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {formatCurrency(symbol.pnl)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
