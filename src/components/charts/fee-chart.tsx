"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

interface FeeChartProps {
  data: Array<{
    date: string;
    fees: number;
    cumulativeFees: number;
  }>;
}

export function FeeChart({ data }: FeeChartProps) {
  const totalFees = data.length > 0 ? data[data.length - 1].cumulativeFees : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Cumulative Fees</CardTitle>
          <span 
            className="text-sm font-medium text-amber-500/90 tabular-nums"
            style={{ fontFamily: 'var(--font-jetbrains)' }}
          >
            {formatCurrency(totalFees)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
            <LineChart
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
                formatter={(value) => [formatCurrency(Number(value)), "Cumulative Fees"]}
              />
              <Line
                type="monotone"
                dataKey="cumulativeFees"
                stroke="#d97706"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
