"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className,
  valueClassName,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-5 shadow-lg",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-400 mb-1">{title}</p>
          <p
            className={cn(
              "text-2xl font-bold text-white tracking-tight",
              valueClassName
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 mt-2 text-sm font-medium",
                isPositive ? "text-emerald-400" : "text-red-400"
              )}
            >
              <span>{isPositive ? "↑" : "↓"}</span>
              <span>
                {Math.abs(trend).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-zinc-500 opacity-50">{icon}</div>
        )}
      </div>
    </div>
  );
}
