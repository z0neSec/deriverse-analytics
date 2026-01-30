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

const COLORS = ["#10B981", "#EF4444"];

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
          <div className="flex h-8 rounded-lg overflow-hidden">
            <div
              className="bg-emerald-500 flex items-center justify-center text-xs font-medium text-white transition-all"
              style={{ width: `${longPercentage}%` }}
            >
              {longPercentage > 15 && `${longPercentage.toFixed(0)}%`}
            </div>
            <div
              className="bg-red-500 flex items-center justify-center text-xs font-medium text-white transition-all"
              style={{ width: `${shortPercentage}%` }}
            >
              {shortPercentage > 15 && `${shortPercentage.toFixed(0)}%`}
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-zinc-400">
            <span>Long: {longCount} trades</span>
            <span>Short: {shortCount} trades</span>
          </div>
        </div>

        {/* PnL Comparison Bar Chart */}
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#A1A1AA", fontSize: 12 }}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181B",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value, name) => {
                  if (name === "pnl") return [formatCurrency(Number(value)), "PnL"];
                  return [value, String(name)];
                }}
              />
              <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-zinc-400 mb-1">Long PnL</p>
            <p className={`text-lg font-bold ${longPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {formatCurrency(longPnl)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-zinc-400 mb-1">Short PnL</p>
            <p className={`text-lg font-bold ${shortPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {formatCurrency(shortPnl)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
