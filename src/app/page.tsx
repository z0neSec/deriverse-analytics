"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

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
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 
            className="text-2xl font-medium tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent"
            style={{ fontFamily: 'var(--font-instrument)' }}
          >
            Trading Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive analytics for your Deriverse trading activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-xs mr-4">
            <span className="text-slate-600">Last updated:</span>
            <span className="text-slate-400 tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>
              {format(new Date(), "MMM dd, yyyy HH:mm")}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={itemVariants}>
        <FilterBar />
      </motion.div>

      {/* Show empty state if no trades */}
      {trades.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState />
        </motion.div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <motion.div variants={itemVariants}>
            <MetricsGrid metrics={metrics} />
          </motion.div>

          {/* Charts Row 1 */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            variants={itemVariants}
          >
            <PnLChart data={pnlChartData} showCumulative={true} title="Cumulative PnL" />
            <LongShortRatioChart
              longCount={longTrades.length}
              shortCount={shortTrades.length}
              longPnl={longPnl}
              shortPnl={shortPnl}
            />
          </motion.div>

          {/* Charts Row 2 */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            variants={itemVariants}
          >
            <WinLossChart data={winLossData} />
            <DrawdownChart data={drawdownChartData} />
          </motion.div>

          {/* Open Positions */}
          <motion.div variants={itemVariants}>
            <OpenPositions positions={positions} />
          </motion.div>

          {/* Symbol Performance */}
          <motion.div variants={itemVariants}>
            <SymbolPerformance data={symbolMetrics} />
          </motion.div>

          {/* Trade History */}
          <motion.div variants={itemVariants}>
            <TradeHistoryTable trades={filteredTrades} />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
