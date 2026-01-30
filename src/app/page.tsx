"use client";

import React, { useEffect, useMemo } from "react";
import { useTradingStore } from "@/store";
import {
  MetricsGrid,
  TradeHistoryTable,
  OpenPositions,
  FilterBar,
  SymbolPerformance,
} from "@/components/dashboard";
import {
  PnLChart,
  DrawdownChart,
  WinLossChart,
  LongShortRatioChart,
} from "@/components/charts";
import {
  generateMockTrades,
  generateMockPositions,
  generateDailyPerformance,
} from "@/lib/mock-data";
import {
  calculatePortfolioMetrics,
  calculateSymbolMetrics,
  filterTrades,
} from "@/lib/analytics";
import { format } from "date-fns";

export default function DashboardPage() {
  const {
    trades,
    positions,
    setTrades,
    setPositions,
    setMetrics,
    setDailyPerformance,
    filters,
  } = useTradingStore();

  // Initialize mock data on first load
  useEffect(() => {
    if (trades.length === 0) {
      const mockTrades = generateMockTrades(150);
      const mockPositions = generateMockPositions();
      const performance = generateDailyPerformance(mockTrades);
      const metrics = calculatePortfolioMetrics(mockTrades);

      setTrades(mockTrades);
      setPositions(mockPositions);
      setDailyPerformance(performance);
      setMetrics(metrics);
    }
  }, [trades.length, setTrades, setPositions, setDailyPerformance, setMetrics]);

  // Apply filters and recalculate metrics
  const filteredTrades = useMemo(() => filterTrades(trades, filters), [trades, filters]);

  const metrics = useMemo(
    () => calculatePortfolioMetrics(filteredTrades),
    [filteredTrades]
  );

  const symbolMetrics = useMemo(
    () => calculateSymbolMetrics(filteredTrades),
    [filteredTrades]
  );

  const dailyPerformance = useMemo(
    () => generateDailyPerformance(filteredTrades),
    [filteredTrades]
  );

  // Prepare chart data
  const pnlChartData = dailyPerformance.map((d) => ({
    date: format(d.date, "MMM dd"),
    pnl: d.pnl,
    cumulativePnl: d.cumulativePnl,
  }));

  const drawdownChartData = dailyPerformance.map((d) => ({
    date: format(d.date, "MMM dd"),
    drawdown: d.drawdown,
    drawdownPercentage: d.drawdownPercentage,
  }));

  const winLossData = dailyPerformance.map((d) => ({
    date: format(d.date, "MMM dd"),
    pnl: d.pnl,
  }));

  // Calculate long/short data
  const longTrades = filteredTrades.filter((t) => t.side === "long" && t.status === "closed");
  const shortTrades = filteredTrades.filter((t) => t.side === "short" && t.status === "closed");
  const longPnl = longTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const shortPnl = shortTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trading Dashboard</h1>
          <p className="text-zinc-400 mt-1">
            Comprehensive analytics for your Deriverse trading activity
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Last updated:</span>
          <span className="text-zinc-300">{format(new Date(), "MMM dd, yyyy HH:mm")}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Key Metrics Grid */}
      <MetricsGrid metrics={metrics} />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PnLChart data={pnlChartData} showCumulative={true} title="Cumulative PnL" />
        <LongShortRatioChart
          longCount={longTrades.length}
          shortCount={shortTrades.length}
          longPnl={longPnl}
          shortPnl={shortPnl}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WinLossChart data={winLossData} />
        <DrawdownChart data={drawdownChartData} />
      </div>

      {/* Open Positions */}
      <OpenPositions positions={positions} />

      {/* Symbol Performance */}
      <SymbolPerformance data={symbolMetrics} />

      {/* Trade History */}
      <TradeHistoryTable trades={filteredTrades} />
    </div>
  );
}
