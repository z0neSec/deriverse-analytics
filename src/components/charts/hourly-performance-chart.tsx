"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { TimeBasedMetrics } from "@/types";

interface HourlyPerformanceChartProps {
  data: TimeBasedMetrics[];
}

export function HourlyPerformanceChart({ data }: HourlyPerformanceChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    hour: `${d.hour.toString().padStart(2, "0")}:00`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Hour</CardTitle>
        <CardDescription>
          Analyze your trading performance across different hours of the day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
            <BarChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
              <XAxis
                dataKey="hour"
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                yAxisId="left"
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
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
                  const numValue = Number(value);
                  if (name === "pnl") return [formatCurrency(numValue), "PnL"];
                  if (name === "winRate") return [`${numValue.toFixed(1)}%`, "Win Rate"];
                  return [numValue, String(name)];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              <Bar yAxisId="left" dataKey="pnl" fill="#059669" radius={[2, 2, 0, 0]} name="PnL" opacity={0.85} />
              <Bar yAxisId="right" dataKey="winRate" fill="#3b82f6" radius={[2, 2, 0, 0]} name="Win Rate" opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
