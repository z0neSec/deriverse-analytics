"use client";

import React, { useMemo } from "react";
import { useTradingStore } from "@/store";
import { Card, CardHeader, CardTitle, CardContent, StatCard, EmptyState } from "@/components/ui";
import { OpenPositions, FilterBar } from "@/components/dashboard";
import { calculatePortfolioMetrics, calculateSymbolMetrics, filterTrades, generateDailyPerformance } from "@/lib/analytics";
import { formatCurrency, toDate } from "@/lib/utils";
import { format } from "date-fns";
import { PnLChart } from "@/components/charts";
import { Wallet, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const ALLOCATION_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899"];

export default function PortfolioPage() {
  const { trades, positions, filters } = useTradingStore();

  const filteredTrades = useMemo(() => filterTrades(trades, filters), [trades, filters]);
  const metrics = useMemo(() => calculatePortfolioMetrics(filteredTrades), [filteredTrades]);
  const symbolMetrics = useMemo(() => calculateSymbolMetrics(filteredTrades), [filteredTrades]);
  const dailyPerformance = useMemo(() => generateDailyPerformance(filteredTrades), [filteredTrades]);

  // Calculate portfolio allocation
  const allocationData = symbolMetrics.slice(0, 5).map((s, index) => ({
    name: s.symbol,
    value: s.volume,
    color: ALLOCATION_COLORS[index % ALLOCATION_COLORS.length],
  }));

  const totalAllocationVolume = allocationData.reduce((sum, d) => sum + d.value, 0);
  const maxAllocationValue = Math.max(...allocationData.map(d => d.value), 1);

  // Calculate unrealized PnL from positions
  const totalUnrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const totalPositionValue = positions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0);

  // Calculate total portfolio value (simulated)
  const accountBalance = 10000; // Simulated starting balance
  const totalValue = accountBalance + metrics.totalPnl + totalUnrealizedPnl;

  const pnlChartData = dailyPerformance.map((d) => ({
    date: format(toDate(d.date), "MMM dd"),
    pnl: d.pnl,
    cumulativePnl: d.cumulativePnl,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 
          className="text-2xl font-medium tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent"
          style={{ fontFamily: 'var(--font-instrument)' }}
        >
          Portfolio Overview
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Track your overall portfolio performance and allocation
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Show empty state if no trades */}
      {trades.length === 0 ? (
        <EmptyState 
          title="No Portfolio Data"
          description="Connect your wallet to view your portfolio overview"
        />
      ) : (
        <>
          {/* Portfolio Value Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Portfolio Value"
              value={formatCurrency(totalValue)}
              icon={<Wallet className="w-6 h-6" />}
              className="md:col-span-1"
            />
            <StatCard
              title="Realized PnL"
              value={formatCurrency(metrics.totalPnl)}
              trend={metrics.totalPnlPercentage}
              valueClassName={metrics.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}
              icon={metrics.totalPnl >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            />
            <StatCard
              title="Unrealized PnL"
              value={formatCurrency(totalUnrealizedPnl)}
              subtitle={`${positions.length} open positions`}
              valueClassName={totalUnrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}
          icon={totalUnrealizedPnl >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
        />
        <StatCard
          title="Position Value"
          value={formatCurrency(totalPositionValue)}
          icon={<BarChart3 className="w-6 h-6" />}
        />
      </div>

      {/* Portfolio Allocation & PnL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocation Horizontal Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Allocation by Volume</CardTitle>
          </CardHeader>
          <CardContent>
            {allocationData.length > 0 ? (
              <div className="space-y-4">
                {allocationData.map((item) => {
                  const percentage = totalAllocationVolume > 0 ? (item.value / totalAllocationVolume) * 100 : 0;
                  const barWidth = (item.value / maxAllocationValue) * 100;
                  return (
                    <div key={item.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-zinc-300 font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-400">{percentage.toFixed(1)}%</span>
                          <span className="font-medium text-white w-28 text-right">
                            {formatCurrency(item.value)}
                          </span>
                        </div>
                      </div>
                      <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${barWidth}%`,
                            backgroundColor: item.color 
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Total Summary */}
                <div className="mt-6 pt-4 border-t border-zinc-700">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300 font-medium">Total Volume</span>
                    <span className="text-xl font-bold text-white">
                      {formatCurrency(totalAllocationVolume)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-zinc-500">
                No trading data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* PnL Chart */}
        <PnLChart data={pnlChartData} showCumulative={true} title="Portfolio PnL" />
      </div>

      {/* Open Positions */}
      <OpenPositions positions={positions} />

      {/* Portfolio Summary by Symbol */}
      <Card>
        <CardHeader>
          <CardTitle>Symbol Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Symbol</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Trades</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Volume</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Win Rate</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Avg PnL</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Total PnL</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Fees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {symbolMetrics.map((symbol) => (
                  <tr key={symbol.symbol} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-sm font-medium text-white">{symbol.symbol}</td>
                    <td className="px-4 py-3 text-sm text-right text-zinc-300">{symbol.tradeCount}</td>
                    <td className="px-4 py-3 text-sm text-right text-zinc-300">{formatCurrency(symbol.volume)}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={cn(
                        "font-medium",
                        symbol.winRate >= 50 ? "text-emerald-400" : "text-red-400"
                      )}>
                        {symbol.winRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={cn(
                        "font-medium",
                        symbol.averagePnl >= 0 ? "text-emerald-400" : "text-red-400"
                      )}>
                        {formatCurrency(symbol.averagePnl)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={cn(
                        "font-medium",
                        symbol.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                      )}>
                        {formatCurrency(symbol.pnl)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-amber-400">
                      {formatCurrency(symbol.fees)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}
