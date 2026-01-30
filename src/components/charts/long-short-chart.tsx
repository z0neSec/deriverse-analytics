"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
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
  const data = [
    { name: "Long", value: longCount, pnl: longPnl, percentage: total > 0 ? (longCount / total) * 100 : 0 },
    { name: "Short", value: shortCount, pnl: shortPnl, percentage: total > 0 ? (shortCount / total) * 100 : 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Long/Short Ratio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181B",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value, name, props) => [
                  `${value} trades (${(props.payload as { percentage: number }).percentage.toFixed(1)}%)`,
                  String(name),
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <p className="text-xs text-zinc-400 mb-1">Long PnL</p>
            <p className={`text-lg font-bold ${longPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {formatCurrency(longPnl)}
            </p>
          </div>
          <div className="text-center">
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
