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
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

interface WinLossChartProps {
  data: Array<{
    date: string;
    pnl: number;
  }>;
}

export function WinLossChart({ data }: WinLossChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Win/Loss</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
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
                formatter={(value) => [formatCurrency(Number(value)), "PnL"]}
              />
              <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnl >= 0 ? "#059669" : "#be123c"}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
