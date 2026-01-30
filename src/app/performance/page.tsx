"use client";

import React, { useEffect, useMemo } from "react";
import { useTradingStore } from "@/store";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import {
  PnLChart,
  DrawdownChart,
  HourlyPerformanceChart,
  LongShortRatioChart,
} from "@/components/charts";
import { FilterBar, MetricsGrid } from "@/components/dashboard";
import {
  generateMockTrades,
  generateDailyPerformance,
} from "@/lib/mock-data";
import {
  calculatePortfolioMetrics,
  calculateTimeBasedMetrics,
  calculateSessionMetrics,
  filterTrades,
  getOrderTypePerformance,
} from "@/lib/analytics";
import { format } from "date-fns";
import { formatCurrency, formatDuration, toDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function PerformancePage() {
  const { trades, setTrades, filters } = useTradingStore();

  // Initialize mock data if needed
  useEffect(() => {
    if (trades.length === 0) {
      const mockTrades = generateMockTrades(150);
      setTrades(mockTrades);
    }
  }, [trades.length, setTrades]);

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
    asian: { name: "Asian", hours: "00:00 - 08:00 UTC", color: "text-blue-400" },
    european: { name: "European", hours: "08:00 - 16:00 UTC", color: "text-amber-400" },
    american: { name: "American", hours: "16:00 - 00:00 UTC", color: "text-emerald-400" },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Performance Analysis</h1>
        <p className="text-zinc-400 mt-1">
          Deep dive into your trading performance with time-based analytics
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar />

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
                  className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className={cn("font-semibold", label.color)}>{label.name}</h4>
                      <p className="text-xs text-zinc-500">{label.hours}</p>
                    </div>
                    <Badge variant={session.pnl >= 0 ? "success" : "danger"}>
                      {session.tradeCount} trades
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">PnL</span>
                      <span className={cn("font-medium", session.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {formatCurrency(session.pnl)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Win Rate</span>
                      <span className={cn("font-medium", session.winRate >= 50 ? "text-emerald-400" : "text-amber-400")}>
                        {session.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Avg Duration</span>
                      <span className="text-white">{formatDuration(session.averageDuration)}</span>
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
                className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white capitalize">{order.orderType}</h4>
                  <Badge>{order.tradeCount} trades</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">PnL</span>
                    <span className={cn("font-medium", order.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {formatCurrency(order.pnl)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Win Rate</span>
                    <span className={cn("font-medium", order.winRate >= 50 ? "text-emerald-400" : "text-amber-400")}>
                      {order.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Avg Duration</span>
                    <span className="text-white">{formatDuration(order.averageDuration)}</span>
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
              <div className="p-4 rounded-lg bg-emerald-900/20 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-400 font-medium">Long Trades</span>
                  <Badge variant="success">{longTrades.length}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">Total PnL</span>
                    <p className={cn("font-medium", longPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {formatCurrency(longPnl)}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Win Rate</span>
                    <p className="font-medium text-white">
                      {longTrades.length > 0
                        ? ((longTrades.filter(t => (t.pnl || 0) > 0).length / longTrades.length) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-400 font-medium">Short Trades</span>
                  <Badge variant="danger">{shortTrades.length}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">Total PnL</span>
                    <p className={cn("font-medium", shortPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {formatCurrency(shortPnl)}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Win Rate</span>
                    <p className="font-medium text-white">
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
    </div>
  );
}
