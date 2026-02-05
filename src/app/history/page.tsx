"use client";

import React, { useMemo, useCallback } from "react";
import { useTradingStore } from "@/store";
import { TradeHistoryTable, FilterBar } from "@/components/dashboard";
import { Card, CardHeader, CardTitle, CardContent, StatCard, Button, EmptyState } from "@/components/ui";
import { filterTradesWithTimeframe, calculatePortfolioMetrics, calculateSymbolMetrics } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import { exportTradesToCSV, exportToPDF } from "@/lib/export";
import { History, TrendingUp, TrendingDown, Activity, Download, FileText } from "lucide-react";
import type { Trade } from "@/types";

export default function HistoryPage() {
  const { trades, filters, selectedTimeframe, updateTrade } = useTradingStore();

  const filteredTrades = useMemo(() => filterTradesWithTimeframe(trades, filters, selectedTimeframe), [trades, filters, selectedTimeframe]);
  const metrics = useMemo(() => calculatePortfolioMetrics(filteredTrades), [filteredTrades]);
  const symbolMetrics = useMemo(() => calculateSymbolMetrics(filteredTrades), [filteredTrades]);

  const closedTrades = filteredTrades.filter((t) => t.status === "closed");
  const openTrades = filteredTrades.filter((t) => t.status === "open");

  const handleExportCSV = () => {
    exportTradesToCSV(filteredTrades, `trade-history-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportPDF = () => {
    exportToPDF(filteredTrades, metrics, symbolMetrics);
  };

  // Handle closing a trade - marks it as closed and calculates final PnL
  const handleCloseTrade = useCallback((trade: Trade) => {
    const currentPrice = trade.currentPrice || trade.entryPrice;
    const direction = trade.side === "long" ? 1 : -1;
    const priceDiff = currentPrice - trade.entryPrice;
    const pnl = priceDiff * trade.quantity * direction;
    const pnlPercentage = (priceDiff / trade.entryPrice) * 100 * direction;

    // Note: This simulates closing in the dashboard UI
    // Actual closing requires a Deriverse transaction
    if (confirm(`Close this ${trade.side.toUpperCase()} position?\n\nSymbol: ${trade.symbol}\nEntry: $${trade.entryPrice.toFixed(2)}\nCurrent: $${currentPrice.toFixed(2)}\nPnL: $${pnl.toFixed(2)} (${pnlPercentage >= 0 ? '+' : ''}${pnlPercentage.toFixed(2)}%)\n\nNote: To actually close on Deriverse, go to the exchange and place an opposite order.`)) {
      updateTrade(trade.id, {
        status: "closed",
        exitPrice: currentPrice,
        exitTime: new Date(),
        pnl,
        pnlPercentage,
      });
    }
  }, [updateTrade]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 
            className="text-2xl font-medium tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent"
            style={{ fontFamily: 'var(--font-instrument)' }}
          >
            Trade History
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Complete history of all your trades with detailed information
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
          title="No Trade History"
          description="Connect your wallet to view your Deriverse trading history"
        />
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Trades"
              value={filteredTrades.length}
              subtitle={`${openTrades.length} open, ${closedTrades.length} closed`}
              icon={<History className="w-6 h-6" />}
            />
            <StatCard
              title="Total PnL"
              value={formatCurrency(metrics.totalPnl)}
              valueClassName={metrics.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}
              icon={metrics.totalPnl >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            />
            <StatCard
              title="Win Rate"
              value={`${metrics.winRate.toFixed(1)}%`}
              subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
              valueClassName={metrics.winRate >= 50 ? "text-emerald-400" : "text-amber-400"}
            />
            <StatCard
              title="Total Volume"
              value={formatCurrency(metrics.totalVolume)}
              icon={<Activity className="w-6 h-6" />}
            />
          </div>

          {/* Trade Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Trade Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-3 rounded-lg bg-slate-800/40">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Spot Trades</p>
                  <p className="text-lg font-semibold text-slate-200 tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>
                    {filteredTrades.filter((t) => t.marketType === "spot").length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Perp Trades</p>
                  <p className="text-lg font-semibold text-slate-200 tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>
                    {filteredTrades.filter((t) => t.marketType === "perpetual").length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Long Trades</p>
                  <p className="text-lg font-semibold text-emerald-500/90 tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>
                    {filteredTrades.filter((t) => t.side === "long").length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Short Trades</p>
                  <p className="text-lg font-semibold text-rose-500/90 tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>
                    {filteredTrades.filter((t) => t.side === "short").length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Avg Trade Size</p>
                  <p className="text-lg font-semibold text-slate-200 tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>
                    {formatCurrency(
                      filteredTrades.length > 0
                        ? filteredTrades.reduce((sum, t) => sum + t.entryPrice * t.quantity, 0) / filteredTrades.length
                        : 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trade History Table */}
          <TradeHistoryTable trades={filteredTrades} onCloseTrade={handleCloseTrade} />
        </>
      )}
    </div>
  );
}
