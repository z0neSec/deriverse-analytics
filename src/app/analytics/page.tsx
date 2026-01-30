"use client";

import React, { useMemo } from "react";
import { useTradingStore } from "@/store";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, StatCard, Button, EmptyState } from "@/components/ui";
import {
  PnLChart,
  DrawdownChart,
  HourlyPerformanceChart,
  LongShortRatioChart,
} from "@/components/charts";
import { FilterBar, SymbolPerformance } from "@/components/dashboard";
import {
  calculatePortfolioMetrics,
  calculateTimeBasedMetrics,
  calculateSymbolMetrics,
  filterTrades,
  generateDailyPerformance,
} from "@/lib/analytics";
import { formatCurrency, formatPercentage, toDate } from "@/lib/utils";
import { exportAnalyticsToCSV, exportToPDF } from "@/lib/export";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { Download, FileText } from "lucide-react";

export default function AnalyticsPage() {
  const { trades, filters } = useTradingStore();

  const filteredTrades = useMemo(() => filterTrades(trades, filters), [trades, filters]);
  const metrics = useMemo(() => calculatePortfolioMetrics(filteredTrades), [filteredTrades]);
  const hourlyMetrics = useMemo(() => calculateTimeBasedMetrics(filteredTrades), [filteredTrades]);
  const symbolMetrics = useMemo(() => calculateSymbolMetrics(filteredTrades), [filteredTrades]);
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

  // Calculate weekday performance
  const weekdayData = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weekdayStats = days.map((day) => ({
      day,
      pnl: 0,
      trades: 0,
      wins: 0,
    }));

    filteredTrades
      .filter((t) => t.status === "closed" && t.pnl !== undefined)
      .forEach((trade) => {
        const dayIndex = toDate(trade.entryTime).getDay();
        weekdayStats[dayIndex].pnl += trade.pnl || 0;
        weekdayStats[dayIndex].trades += 1;
        if ((trade.pnl || 0) > 0) {
          weekdayStats[dayIndex].wins += 1;
        }
      });

    return weekdayStats.map((d) => ({
      ...d,
      winRate: d.trades > 0 ? (d.wins / d.trades) * 100 : 0,
    }));
  }, [filteredTrades]);

  // Calculate long/short data
  const longTrades = filteredTrades.filter((t) => t.side === "long" && t.status === "closed");
  const shortTrades = filteredTrades.filter((t) => t.side === "short" && t.status === "closed");
  const longPnl = longTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const shortPnl = shortTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  // Radar chart data for overall performance
  const radarData = [
    {
      metric: "Win Rate",
      value: metrics.winRate,
      fullMark: 100,
    },
    {
      metric: "Profit Factor",
      value: Math.min(metrics.profitFactor * 20, 100),
      fullMark: 100,
    },
    {
      metric: "Risk Management",
      value: 100 - Math.min(metrics.maxDrawdownPercentage, 100),
      fullMark: 100,
    },
    {
      metric: "Consistency",
      value: metrics.totalTrades > 0 ? Math.min((metrics.winningTrades / metrics.totalTrades) * 100, 100) : 0,
      fullMark: 100,
    },
    {
      metric: "Volume",
      value: Math.min((metrics.totalVolume / 100000) * 100, 100),
      fullMark: 100,
    },
  ];

  const handleExportCSV = () => {
    exportAnalyticsToCSV(metrics, symbolMetrics, `analytics-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportPDF = () => {
    exportToPDF(filteredTrades, metrics, symbolMetrics);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Analytics</h1>
          <p className="text-zinc-400 mt-1">
            Deep insights and advanced metrics for your trading performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Show empty state if no trades */}
      {trades.length === 0 ? (
        <EmptyState 
          title="No Analytics Data"
          description="Connect your wallet to view your advanced trading analytics"
        />
      ) : (
        <>
          {/* Performance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total PnL"
              value={formatCurrency(metrics.totalPnl)}
              trend={metrics.totalPnlPercentage}
              valueClassName={metrics.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}
            />
            <StatCard
              title="Win Rate"
              value={`${metrics.winRate.toFixed(1)}%`}
              subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
              valueClassName={metrics.winRate >= 50 ? "text-emerald-400" : "text-amber-400"}
            />
            <StatCard
              title="Profit Factor"
              value={metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2)}
              subtitle="Risk-adjusted returns"
              valueClassName={metrics.profitFactor >= 1.5 ? "text-emerald-400" : metrics.profitFactor >= 1 ? "text-amber-400" : "text-red-400"}
            />
            <StatCard
              title="Max Drawdown"
              value={formatPercentage(-metrics.maxDrawdownPercentage)}
              subtitle={formatCurrency(metrics.maxDrawdown)}
              valueClassName="text-red-400"
            />
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PnLChart data={pnlChartData} showCumulative={true} title="Cumulative PnL" />
            <DrawdownChart data={drawdownChartData} />
          </div>

      {/* Performance Radar & Long/Short */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Multi-dimensional analysis of your trading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#6B7280" }} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <LongShortRatioChart
          longCount={longTrades.length}
          shortCount={shortTrades.length}
          longPnl={longPnl}
          shortPnl={shortPnl}
        />
      </div>

      {/* Weekday Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Day of Week</CardTitle>
          <CardDescription>Identify your best and worst trading days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
              <BarChart
                data={weekdayData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="day"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181B",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="pnl" name="PnL" radius={[4, 4, 0, 0]}>
                  {weekdayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "#10B981" : "#EF4444"} />
                  ))}
                </Bar>
                <Bar yAxisId="right" dataKey="winRate" fill="#60A5FA" name="Win Rate" radius={[4, 4, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Performance */}
      <HourlyPerformanceChart data={hourlyMetrics} />

      {/* Symbol Performance */}
      <SymbolPerformance data={symbolMetrics} />

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Insights</CardTitle>
          <CardDescription>AI-generated insights based on your trading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Best Performing Day */}
            {weekdayData.filter(d => d.trades > 0).length > 0 && (
              <div className="p-4 rounded-lg bg-emerald-900/20 border border-emerald-500/30">
                <h4 className="font-medium text-emerald-400 mb-2">Best Trading Day</h4>
                <p className="text-sm text-zinc-300">
                  Your best performing day is{" "}
                  <span className="font-medium text-white">
                    {weekdayData.reduce((best, day) => (day.pnl > best.pnl ? day : best), weekdayData[0]).day}
                  </span>{" "}
                  with{" "}
                  <span className="font-medium text-emerald-400">
                    {formatCurrency(Math.max(...weekdayData.map((d) => d.pnl)))}
                  </span>{" "}
                  total profit.
                </p>
              </div>
            )}

            {/* Best Hour */}
            {hourlyMetrics.filter(h => h.tradeCount > 0).length > 0 && (
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                <h4 className="font-medium text-blue-400 mb-2">⏰ Optimal Trading Hour</h4>
                <p className="text-sm text-zinc-300">
                  You perform best at{" "}
                  <span className="font-medium text-white">
                    {hourlyMetrics.reduce((best, h) => (h.pnl > best.pnl ? h : best), hourlyMetrics[0]).hour}:00
                  </span>{" "}
                  with a{" "}
                  <span className="font-medium text-blue-400">
                    {Math.max(...hourlyMetrics.filter(h => h.tradeCount > 0).map((h) => h.winRate)).toFixed(0)}%
                  </span>{" "}
                  win rate.
                </p>
              </div>
            )}

            {/* Risk Warning */}
            {metrics.maxDrawdownPercentage > 20 && (
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                <h4 className="font-medium text-red-400 mb-2">Risk Warning</h4>
                <p className="text-sm text-zinc-300">
                  Your max drawdown of{" "}
                  <span className="font-medium text-red-400">
                    {formatPercentage(-metrics.maxDrawdownPercentage)}
                  </span>{" "}
                  is above recommended levels. Consider reducing position sizes.
                </p>
              </div>
            )}

            {/* Directional Bias */}
            <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-500/30">
              <h4 className="font-medium text-amber-400 mb-2">Directional Bias</h4>
              <p className="text-sm text-zinc-300">
                You have a{" "}
                <span className="font-medium text-white">
                  {metrics.longShortRatio > 1.2 ? "long" : metrics.longShortRatio < 0.8 ? "short" : "balanced"}
                </span>{" "}
                bias with a{" "}
                <span className="font-medium text-amber-400">{metrics.longShortRatio.toFixed(2)}</span> L/S ratio.
                {metrics.longShortRatio > 1.5 && " Consider diversifying with more short positions."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}
