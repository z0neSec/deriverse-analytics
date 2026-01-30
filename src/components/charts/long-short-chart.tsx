"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

interface LongShortRatioChartProps {
  longCount: number;
  shortCount: number;
  longPnl: number;
  shortPnl: number;
}

const COLORS = ["#059669", "#be123c"];

export function LongShortRatioChart({
  longCount,
  shortCount,
  longPnl,
  shortPnl,
}: LongShortRatioChartProps) {
  const total = longCount + shortCount;
  const longPercentage = total > 0 ? (longCount / total) * 100 : 0;
  const shortPercentage = total > 0 ? (shortCount / total) * 100 : 0;

  const data = [
    { name: "Long", count: longCount, percentage: longPercentage, pnl: longPnl },
    { name: "Short", count: shortCount, percentage: shortPercentage, pnl: shortPnl },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Long/Short Ratio</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Horizontal stacked bar */}
        <div className="mb-4">
          <div className="flex h-6 rounded-md overflow-hidden bg-slate-800/30">
            <div
              className="bg-emerald-600/80 flex items-center justify-center text-[10px] font-medium text-white/90 transition-all"
              style={{ width: `${longPercentage}%` }}
            >
              {longPercentage > 15 && `${longPercentage.toFixed(0)}%`}
            </div>
            <div
              className="bg-rose-600/80 flex items-center justify-center text-[10px] font-medium text-white/90 transition-all"
              style={{ width: `${shortPercentage}%` }}
            >
              {shortPercentage > 15 && `${shortPercentage.toFixed(0)}%`}
            </div>
          </div>
          <div className="flex justify-between mt-2 text-[11px] text-slate-500">
            <span>Long: {longCount} trades</span>
            <span>Short: {shortCount} trades</span>
          </div>
        </div>

        {/* PnL Comparison Bar Chart */}
        <div className="h-[120px] w-full min-h-[100px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={80}>
            <BarChart data={data} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "12px",
                }}
                formatter={(value, name) => {
                  if (name === "pnl") return [formatCurrency(Number(value)), "PnL"];
                  return [value, String(name)];
                }}
              />
              <Bar dataKey="pnl" radius={[0, 3, 3, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="text-center p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/20">
            <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Long PnL</p>
            <p 
              className={`text-base font-semibold tabular-nums ${longPnl >= 0 ? "text-emerald-500/90" : "text-rose-500/90"}`}
              style={{ fontFamily: 'var(--font-jetbrains)' }}
            >
              {formatCurrency(longPnl)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-rose-950/30 border border-rose-800/20">
            <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Short PnL</p>
            <p 
              className={`text-base font-semibold tabular-nums ${shortPnl >= 0 ? "text-emerald-500/90" : "text-rose-500/90"}`}
              style={{ fontFamily: 'var(--font-jetbrains)' }}
            >
              {formatCurrency(shortPnl)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
