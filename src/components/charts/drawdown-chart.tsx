"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { formatPercentage } from "@/lib/utils";

interface DrawdownChartProps {
  data: Array<{
    date: string;
    drawdown: number;
    drawdownPercentage: number;
  }>;
}

export function DrawdownChart({ data }: DrawdownChartProps) {
  const maxDrawdown = Math.max(...data.map((d) => d.drawdownPercentage));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Drawdown</CardTitle>
          <span 
            className="text-sm font-medium text-rose-500/90 tabular-nums"
            style={{ fontFamily: 'var(--font-jetbrains)' }}
          >
            Max: {formatPercentage(-maxDrawdown)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#be123c" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#be123c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                domain={[0, "auto"]}
                reversed
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "12px",
                }}
                formatter={(value) => [formatPercentage(-Number(value)), "Drawdown"]}
              />
              <Area
                type="monotone"
                dataKey="drawdownPercentage"
                stroke="#be123c"
                strokeWidth={1.5}
                fill="url(#drawdownGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
