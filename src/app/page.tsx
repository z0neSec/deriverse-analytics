"use client";

import React, { useMemo } from "react";
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
  calculatePortfolioMetrics,
  calculateSymbolMetrics,
  filterTrades,
  generateDailyPerformance,
} from "@/lib/analytics";
import { EmptyState } from "@/components/ui";
import { toDate } from "@/lib/utils";
import { exportTradesToCSV, exportToPDF } from "@/lib/export";
import { Button } from "@/components/ui";
import { format } from "date-fns";
import { Download, FileText } from "lucide-react";

export default function DashboardPage() {
  const {
    trades,
    positions,
    filters,
  } = useTradingStore();

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
    date: format(toDate(d.date), "MMM dd"),
    pnl: d.pnl,
    cumulativePnl: d.cumulativePnl,
  }));

  const drawdownChartData = dailyPerformance.map((d) => ({
    date: format(toDate(d.date), "MMM dd"),
    drawdown: d.drawdown,
    drawdownPercentage: d.drawdownPercentage,
  }));

  const winLossData = dailyPerformance.map((d) => ({
    date: format(toDate(d.date), "MMM dd"),
    pnl: d.pnl,
  }));

  // Calculate long/short data
  const longTrades = filteredTrades.filter((t) => t.side === "long" && t.status === "closed");
  const shortTrades = filteredTrades.filter((t) => t.side === "short" && t.status === "closed");
  const longPnl = longTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const shortPnl = shortTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  const handleExportCSV = () => {
    exportTradesToCSV(filteredTrades, `dashboard-trades-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportPDF = () => {
    exportToPDF(filteredTrades, metrics, symbolMetrics);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Trading Dashboard</h1>
          <p className="text-zinc-400 mt-1">
            Comprehensive analytics for your Deriverse trading activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-sm mr-4">
            <span className="text-zinc-500">Last updated:</span>
            <span className="text-zinc-300">{format(new Date(), "MMM dd, yyyy HH:mm")}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Show empty state if no trades */}
      {trades.length === 0 ? (
        <EmptyState />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
