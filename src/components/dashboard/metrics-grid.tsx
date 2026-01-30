"use client";

import React from "react";
import { StatCard } from "@/components/ui";
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Activity,
  Clock,
  Scale,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatPercentage, formatDuration } from "@/lib/utils";
import type { PortfolioMetrics } from "@/types";

interface MetricsGridProps {
  metrics: PortfolioMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total PnL */}
      <StatCard
        title="Total PnL"
        value={formatCurrency(metrics.totalPnl)}
        trend={metrics.totalPnlPercentage}
        valueClassName={metrics.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}
        icon={metrics.totalPnl >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
      />

      {/* Win Rate */}
      <StatCard
        title="Win Rate"
        value={`${metrics.winRate.toFixed(1)}%`}
        subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
        icon={<Target className="w-6 h-6" />}
        valueClassName={metrics.winRate >= 50 ? "text-emerald-400" : "text-amber-400"}
      />

      {/* Total Volume */}
      <StatCard
        title="Total Volume"
        value={formatCurrency(metrics.totalVolume)}
        subtitle={`${metrics.totalTrades} trades`}
        icon={<DollarSign className="w-6 h-6" />}
      />

      {/* Total Fees */}
      <StatCard
        title="Total Fees"
        value={formatCurrency(metrics.totalFees)}
        icon={<Activity className="w-6 h-6" />}
        valueClassName="text-amber-400"
      />

      {/* Average Win */}
      <StatCard
        title="Average Win"
        value={formatCurrency(metrics.averageWin)}
        icon={<TrendingUp className="w-6 h-6" />}
        valueClassName="text-emerald-400"
      />

      {/* Average Loss */}
      <StatCard
        title="Average Loss"
        value={formatCurrency(metrics.averageLoss)}
        icon={<TrendingDown className="w-6 h-6" />}
        valueClassName="text-red-400"
      />

      {/* Profit Factor */}
      <StatCard
        title="Profit Factor"
        value={metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2)}
        subtitle="Gross Profit / Gross Loss"
        icon={<Scale className="w-6 h-6" />}
        valueClassName={metrics.profitFactor >= 1 ? "text-emerald-400" : "text-red-400"}
      />

      {/* Avg Trade Duration */}
      <StatCard
        title="Avg Duration"
        value={formatDuration(metrics.averageTradeDuration)}
        icon={<Clock className="w-6 h-6" />}
      />

      {/* Largest Win */}
      <StatCard
        title="Largest Win"
        value={formatCurrency(metrics.largestWin)}
        icon={<TrendingUp className="w-6 h-6" />}
        valueClassName="text-emerald-400"
      />

      {/* Largest Loss */}
      <StatCard
        title="Largest Loss"
        value={formatCurrency(metrics.largestLoss)}
        icon={<TrendingDown className="w-6 h-6" />}
        valueClassName="text-red-400"
      />

      {/* Long/Short Ratio */}
      <StatCard
        title="Long/Short Ratio"
        value={metrics.longShortRatio.toFixed(2)}
        subtitle={metrics.longShortRatio > 1 ? "Long biased" : metrics.longShortRatio < 1 ? "Short biased" : "Balanced"}
        icon={<Scale className="w-6 h-6" />}
      />

      {/* Max Drawdown */}
      <StatCard
        title="Max Drawdown"
        value={formatCurrency(metrics.maxDrawdown)}
        subtitle={formatPercentage(-metrics.maxDrawdownPercentage)}
        icon={<AlertTriangle className="w-6 h-6" />}
        valueClassName="text-red-400"
      />
    </div>
  );
}
