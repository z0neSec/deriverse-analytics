"use client";

import React, { useMemo } from "react";
import { useTradingStore } from "@/store";
import { Card, CardHeader, CardTitle, CardContent, StatCard, EmptyState } from "@/components/ui";
import { FeeChart } from "@/components/charts";
import { FilterBar } from "@/components/dashboard";
import { calculateFeeBreakdown, filterTradesWithTimeframe } from "@/lib/analytics";
import { formatCurrency, toDate } from "@/lib/utils";
import { format } from "date-fns";
import { Activity, TrendingDown, Percent, DollarSign } from "lucide-react";

export default function FeesPage() {
  const { trades, filters, selectedTimeframe } = useTradingStore();

  const filteredTrades = useMemo(() => filterTradesWithTimeframe(trades, filters, selectedTimeframe), [trades, filters, selectedTimeframe]);
  const feeBreakdown = useMemo(() => calculateFeeBreakdown(filteredTrades), [filteredTrades]);

  // Calculate total volume for fee percentage
  const totalVolume = filteredTrades.reduce(
    (sum, t) => sum + t.entryPrice * t.quantity,
    0
  );
  const feePercentage = totalVolume > 0 ? (feeBreakdown.totalFees / totalVolume) * 100 : 0;

  // Prepare bar chart data for fee composition
  const feeData = [
    { name: "Maker Fees", value: feeBreakdown.makerFees, color: "#10B981" },
    { name: "Taker Fees", value: feeBreakdown.takerFees, color: "#F59E0B" },
    { name: "Funding Fees", value: feeBreakdown.fundingFees, color: "#6366F1" },
  ].filter((d) => d.value > 0);

  const maxFee = Math.max(...feeData.map(d => d.value), 1);

  // Prepare line chart data
  const feeChartData = feeBreakdown.feesOverTime.map((d) => ({
    date: format(toDate(d.date), "MMM dd"),
    fees: d.fees,
    cumulativeFees: d.cumulativeFees,
  }));

  // Calculate average daily fees
  const avgDailyFees =
    feeBreakdown.feesOverTime.length > 0
      ? feeBreakdown.totalFees / feeBreakdown.feesOverTime.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 
          className="text-2xl font-medium tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent"
          style={{ fontFamily: 'var(--font-instrument)' }}
        >
          Fee Analysis
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Track and analyze your trading fees across all markets
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Show empty state if no trades */}
      {trades.length === 0 ? (
        <EmptyState 
          title="No Fee Data"
          description="Connect your wallet to view your fee analysis"
        />
      ) : (
        <>
          {/* Key Fee Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Fees Paid"
              value={formatCurrency(feeBreakdown.totalFees)}
              icon={<Activity className="w-6 h-6" />}
              valueClassName="text-amber-400"
            />
            <StatCard
              title="Fee Rate"
              value={`${feePercentage.toFixed(3)}%`}
              subtitle="of total volume"
              icon={<Percent className="w-6 h-6" />}
            />
            <StatCard
              title="Avg Daily Fees"
              value={formatCurrency(avgDailyFees)}
              icon={<DollarSign className="w-6 h-6" />}
            />
            <StatCard
          title="Maker Rebates Earned"
          value={formatCurrency(feeBreakdown.makerFees * 0.3)}
          subtitle="~30% rebate estimate"
          icon={<TrendingDown className="w-6 h-6" />}
          valueClassName="text-emerald-400"
        />
      </div>

      {/* Fee Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horizontal Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feeData.map((fee) => {
                const percentage = (fee.value / feeBreakdown.totalFees) * 100;
                const barWidth = (fee.value / maxFee) * 100;
                return (
                  <div key={fee.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: fee.color }}
                        />
                        <span className="text-zinc-300">{fee.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400">{percentage.toFixed(1)}%</span>
                        <span className="font-medium text-white w-24 text-right">
                          {formatCurrency(fee.value)}
                        </span>
                      </div>
                    </div>
                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${barWidth}%`,
                          backgroundColor: fee.color 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Summary */}
            <div className="mt-6 pt-4 border-t border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300 font-medium">Total Fees</span>
                <span className="text-xl font-bold text-white">
                  {formatCurrency(feeBreakdown.totalFees)}
                </span>
              </div>
            </div>

            {/* Fee Details */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-zinc-300">Maker Fees</span>
                </div>
                <span className="font-medium text-white">
                  {formatCurrency(feeBreakdown.makerFees)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-zinc-300">Taker Fees</span>
                </div>
                <span className="font-medium text-white">
                  {formatCurrency(feeBreakdown.takerFees)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-zinc-300">Funding Fees</span>
                </div>
                <span className="font-medium text-white">
                  {formatCurrency(feeBreakdown.fundingFees)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cumulative Fee Chart */}
        <FeeChart data={feeChartData} />
      </div>

      {/* Fee Optimization Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-emerald-900/20 border border-emerald-500/30">
              <h4 className="font-medium text-emerald-400 mb-2">Use Limit Orders</h4>
              <p className="text-sm text-zinc-400">
                Place limit orders instead of market orders to receive maker rebates rather than paying taker fees.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
              <h4 className="font-medium text-blue-400 mb-2">Prepay Fees</h4>
              <p className="text-sm text-zinc-400">
                Deriverse offers fee discounts through prepayment programs. Check governance for current rates.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-500/30">
              <h4 className="font-medium text-amber-400 mb-2">Monitor Funding Rates</h4>
              <p className="text-sm text-zinc-400">
                For perpetual positions, be aware of funding rates. Close positions before funding if rates are unfavorable.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
              <h4 className="font-medium text-purple-400 mb-2">Batch Transactions</h4>
              <p className="text-sm text-zinc-400">
                When possible, combine operations to reduce the number of transactions and associated network fees.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Table by Symbol */}
      <Card>
        <CardHeader>
          <CardTitle>Fees by Trading Pair</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Symbol</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Trades</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Volume</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Maker Fees</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Taker Fees</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Total Fees</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Fee Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {Object.entries(
                  filteredTrades.reduce((acc, trade) => {
                    if (!acc[trade.symbol]) {
                      acc[trade.symbol] = {
                        trades: 0,
                        volume: 0,
                        makerFees: 0,
                        takerFees: 0,
                        totalFees: 0,
                      };
                    }
                    acc[trade.symbol].trades += 1;
                    acc[trade.symbol].volume += trade.entryPrice * trade.quantity;
                    acc[trade.symbol].makerFees += trade.fees.makerFee;
                    acc[trade.symbol].takerFees += trade.fees.takerFee;
                    acc[trade.symbol].totalFees += trade.fees.totalFee;
                    return acc;
                  }, {} as Record<string, { trades: number; volume: number; makerFees: number; takerFees: number; totalFees: number }>)
                ).map(([symbol, data]) => (
                  <tr key={symbol} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-sm font-medium text-white">{symbol}</td>
                    <td className="px-4 py-3 text-sm text-right text-zinc-300">{data.trades}</td>
                    <td className="px-4 py-3 text-sm text-right text-zinc-300">{formatCurrency(data.volume)}</td>
                    <td className="px-4 py-3 text-sm text-right text-emerald-400">{formatCurrency(data.makerFees)}</td>
                    <td className="px-4 py-3 text-sm text-right text-amber-400">{formatCurrency(data.takerFees)}</td>
                    <td className="px-4 py-3 text-sm text-right text-white font-medium">{formatCurrency(data.totalFees)}</td>
                    <td className="px-4 py-3 text-sm text-right text-zinc-400">
                      {((data.totalFees / data.volume) * 100).toFixed(3)}%
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
