"use client";

import React, { useMemo } from "react";
import { useTradingStore } from "@/store";
import { Card, CardHeader, CardTitle, CardContent, Badge, EmptyState } from "@/components/ui";
import {
  PnLChart,
  DrawdownChart,
  HourlyPerformanceChart,
  LongShortRatioChart,
} from "@/components/charts";
import { FilterBar, MetricsGrid } from "@/components/dashboard";
import {
  calculatePortfolioMetrics,
  calculateTimeBasedMetrics,
  calculateSessionMetrics,
  filterTrades,
  getOrderTypePerformance,
  generateDailyPerformance,
} from "@/lib/analytics";
import { format } from "date-fns";
import { formatCurrency, formatDuration, toDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function PerformancePage() {
  const { trades, filters } = useTradingStore();

  const filteredTrades = useMemo(() => filterTrades(trades, filters), [trades, filters]);
  const metrics = useMemo(() => calculatePortfolioMetrics(filteredTrades), [filteredTrades]);
  const hourlyMetrics = useMemo(() => calculateTimeBasedMetrics(filteredTrades), [filteredTrades]);
  const sessionMetrics = useMemo(() => calculateSessionMetrics(filteredTrades), [filteredTrades]);
  const orderTypeMetrics = useMemo(() => getOrderTypePerformance(filteredTrades), [filteredTrades]);
  const dailyPerformance = useMemo(() => generateDailyPerformance(filteredTrades), [filteredTrades]);

  // Prepare chart data
  const pnlChartData = dailyPerformance.map((d) => ({
    date: format(toDate(d.date), "MMM dd"),
    pnl: d.pnl,
    cumulativePnl: d.cumulativePnl,
  }));

  const drawdownChartData = dailyPerformance.map((d) => ({
    date: format(toDate(d.date), "MMM dd"),
    drawdown: d.drawdown,
    drawdownPercentage: d.drawdownPercentage,
  }));

  // Calculate long/short data
  const longTrades = filteredTrades.filter((t) => t.side === "long" && t.status === "closed");
  const shortTrades = filteredTrades.filter((t) => t.side === "short" && t.status === "closed");
  const longPnl = longTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const shortPnl = shortTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  const sessionLabels = {
    asian: { name: "Asian", hours: "00:00 - 08:00 UTC", color: "text-blue-500/80" },
    european: { name: "European", hours: "08:00 - 16:00 UTC", color: "text-amber-500/80" },
    american: { name: "American", hours: "16:00 - 00:00 UTC", color: "text-emerald-500/80" },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 
          className="text-xl font-medium text-slate-100 tracking-tight"
          style={{ fontFamily: 'var(--font-instrument)' }}
        >
          Performance Analysis
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Deep dive into your trading performance with time-based analytics
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Show empty state if no trades */}
      {trades.length === 0 ? (
        <EmptyState 
          title="No Performance Data"
          description="Connect your wallet to view your trading performance analysis"
        />
      ) : (
        <>
          {/* Key Metrics */}
          <MetricsGrid metrics={metrics} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PnLChart data={pnlChartData} showCumulative={true} title="Cumulative PnL" />
            <DrawdownChart data={drawdownChartData} />
          </div>

          {/* Hourly Performance */}
          <HourlyPerformanceChart data={hourlyMetrics} />

          {/* Session Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Trading Session</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sessionMetrics.map((session) => {
              const label = sessionLabels[session.session];
              return (
                <div
                  key={session.session}
                  className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/40"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className={cn("font-semibold", label.color)}>{label.name}</h4>
                      <p className="text-xs text-slate-500">{label.hours}</p>
                    </div>
                    <Badge variant={session.pnl >= 0 ? "success" : "danger"}>
                      {session.tradeCount} trades
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">PnL</span>
                      <span className={cn("font-medium tabular-nums", session.pnl >= 0 ? "text-emerald-500/90" : "text-rose-500/90")} style={{ fontFamily: 'var(--font-jetbrains)' }}>
                        {formatCurrency(session.pnl)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Win Rate</span>
                      <span className={cn("font-medium tabular-nums", session.winRate >= 50 ? "text-emerald-500/90" : "text-amber-500/90")} style={{ fontFamily: 'var(--font-jetbrains)' }}>
                        {session.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Avg Duration</span>
                      <span className="text-slate-300">{formatDuration(session.averageDuration)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Type Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Order Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {orderTypeMetrics.map((order) => (
              <div
                key={order.orderType}
                className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/40"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-200 capitalize">{order.orderType}</h4>
                  <Badge>{order.tradeCount} trades</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">PnL</span>
                    <span className={cn("font-medium tabular-nums", order.pnl >= 0 ? "text-emerald-500/90" : "text-rose-500/90")} style={{ fontFamily: 'var(--font-jetbrains)' }}>
                      {formatCurrency(order.pnl)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Win Rate</span>
                    <span className={cn("font-medium tabular-nums", order.winRate >= 50 ? "text-emerald-500/90" : "text-amber-500/90")} style={{ fontFamily: 'var(--font-jetbrains)' }}>
                      {order.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Avg Duration</span>
                    <span className="text-slate-300">{formatDuration(order.averageDuration)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Long/Short Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LongShortRatioChart
          longCount={longTrades.length}
          shortCount={shortTrades.length}
          longPnl={longPnl}
          shortPnl={shortPnl}
        />

        <Card>
          <CardHeader>
            <CardTitle>Directional Bias Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-500/90 font-medium">Long Trades</span>
                  <Badge variant="success">{longTrades.length}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Total PnL</span>
                    <p className={cn("font-medium tabular-nums", longPnl >= 0 ? "text-emerald-500/90" : "text-rose-500/90")} style={{ fontFamily: 'var(--font-jetbrains)' }}>
                      {formatCurrency(longPnl)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Win Rate</span>
                    <p className="font-medium text-slate-200 tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>
                      {longTrades.length > 0
                        ? ((longTrades.filter(t => (t.pnl || 0) > 0).length / longTrades.length) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-800/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-rose-500/90 font-medium">Short Trades</span>
                  <Badge variant="danger">{shortTrades.length}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Total PnL</span>
                    <p className={cn("font-medium tabular-nums", shortPnl >= 0 ? "text-emerald-500/90" : "text-rose-500/90")} style={{ fontFamily: 'var(--font-jetbrains)' }}>
                      {formatCurrency(shortPnl)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Win Rate</span>
                    <p className="font-medium text-slate-200 tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>
                      {shortTrades.length > 0
                        ? ((shortTrades.filter(t => (t.pnl || 0) > 0).length / shortTrades.length) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </div>
  );
}
