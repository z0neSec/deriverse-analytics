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
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="hour"
                stroke="#6B7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={2}
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181B",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value, name) => {
                  const numValue = Number(value);
                  if (name === "pnl") return [formatCurrency(numValue), "PnL"];
                  if (name === "winRate") return [`${numValue.toFixed(1)}%`, "Win Rate"];
                  return [numValue, String(name)];
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="pnl" fill="#10B981" radius={[2, 2, 0, 0]} name="PnL" />
              <Bar yAxisId="right" dataKey="winRate" fill="#60A5FA" radius={[2, 2, 0, 0]} name="Win Rate" opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
