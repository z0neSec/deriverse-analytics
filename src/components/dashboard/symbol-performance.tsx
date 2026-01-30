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
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center text-slate-300 font-bold text-sm">
                  {symbol.symbol.split("/")[0].slice(0, 3)}
                </div>
                <div>
                  <p className="font-medium text-slate-200">{symbol.symbol}</p>
                  <p className="text-xs text-slate-500">{symbol.tradeCount} trades</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider">Volume</p>
                  <p className="text-sm text-slate-300 tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>{formatCurrency(symbol.volume)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider">Win Rate</p>
                  <p className={cn(
                    "text-sm font-medium tabular-nums",
                    symbol.winRate >= 50 ? "text-emerald-500/90" : "text-rose-500/90"
                  )} style={{ fontFamily: 'var(--font-jetbrains)' }}>
                    {symbol.winRate.toFixed(1)}%
                  </p>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider">PnL</p>
                  <p className={cn(
                    "text-sm font-semibold tabular-nums",
                    symbol.pnl >= 0 ? "text-emerald-500/90" : "text-rose-500/90"
                  )} style={{ fontFamily: 'var(--font-jetbrains)' }}>
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
