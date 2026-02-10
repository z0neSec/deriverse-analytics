"use client";

import React, { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { TrendingUp, TrendingDown, AlertTriangle, ExternalLink, X, Loader2 } from "lucide-react";
import { formatCurrency, formatPercentage, getCoinLogo } from "@/lib/utils";
import type { Position } from "@/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { openDeriverseToClose } from "@/lib/use-close-position";

interface OpenPositionsProps {
  positions: Position[];
}

export function OpenPositions({ positions }: OpenPositionsProps) {
  const [closingId, setClosingId] = useState<string | null>(null);

  const handleClosePosition = async (position: Position) => {
    setClosingId(position.id);
    
    // Open Deriverse exchange with instructions
    openDeriverseToClose(
      position.symbol, 
      position.side as "long" | "short", 
      position.quantity
    );
    
    setClosingId(null);
  };

  if (positions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4" style={{ fontFamily: 'var(--font-instrument)' }}>Open Positions</h3>
        <div className="text-center py-8">
          <p className="text-slate-500">No open positions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm p-6">
      <h3 className="text-lg font-semibold text-slate-200 mb-4" style={{ fontFamily: 'var(--font-instrument)' }}>Open Positions</h3>
      <div className="space-y-4">
        {positions.map((position) => (
          <div
            key={position.id}
            className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image 
                  src={getCoinLogo(position.symbol)} 
                  alt={position.symbol} 
                  width={24} 
                  height={24} 
                  className="rounded-full"
                  unoptimized
                />
                <span className="font-medium text-slate-200">{position.symbol}</span>
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
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex items-center gap-1 font-medium tabular-nums",
                    position.unrealizedPnl >= 0 ? "text-emerald-500/90" : "text-rose-500/90"
                  )}
                  style={{ fontFamily: 'var(--font-jetbrains)' }}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClosePosition(position)}
                  disabled={closingId === position.id}
                  className="gap-1.5 text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500/50"
                >
                  {closingId === position.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                  Close
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1 text-[10px] uppercase tracking-wider">Entry Price</p>
                <p className="text-slate-300 font-medium tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>{formatCurrency(position.entryPrice)}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1 text-[10px] uppercase tracking-wider">Current Price</p>
                <p className="text-slate-300 font-medium tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>{formatCurrency(position.currentPrice)}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1 text-[10px] uppercase tracking-wider">Size</p>
                <p className="text-slate-300 font-medium tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>{position.quantity.toFixed(4)}</p>
              </div>
              {position.liquidationPrice && (
                <div>
                  <p className="text-slate-500 mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                    Liquidation
                    <AlertTriangle className="w-3 h-3 text-amber-500/90" />
                  </p>
                  <p className="text-amber-500/90 font-medium tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>
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
