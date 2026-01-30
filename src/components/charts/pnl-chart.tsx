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
  ReferenceLine,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

interface PnLChartProps {
  data: Array<{
    date: string;
    pnl: number;
    cumulativePnl: number;
  }>;
  showCumulative?: boolean;
  title?: string;
}

export function PnLChart({ data, showCumulative = true, title = "PnL History" }: PnLChartProps) {
  const dataKey = showCumulative ? "cumulativePnl" : "pnl";
  const latestValue = data.length > 0 ? data[data.length - 1][dataKey] : 0;
  const isPositive = latestValue >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <span
            className={`text-base font-semibold tabular-nums ${
              isPositive ? "text-emerald-500/90" : "text-rose-500/90"
            }`}
            style={{ fontFamily: 'var(--font-jetbrains)' }}
          >
            {formatCurrency(latestValue)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="pnlGradientPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pnlGradientNeg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#be123c" stopOpacity={0.2} />
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
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "12px",
                }}
                formatter={(value) => [formatCurrency(Number(value)), showCumulative ? "Cumulative PnL" : "Daily PnL"]}
              />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={isPositive ? "#059669" : "#be123c"}
                strokeWidth={1.5}
                fill={isPositive ? "url(#pnlGradientPos)" : "url(#pnlGradientNeg)"}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
