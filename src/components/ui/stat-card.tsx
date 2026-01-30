"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
  className?: string;
  valueClassName?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className,
  valueClassName,
  delay = 0,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <motion.div
      className={cn(
        "relative rounded-xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm p-5",
        "shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)]",
        "hover:border-slate-700/60 hover:bg-slate-900/50 group",
        className
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1],
        delay: delay * 0.05
      }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
            {title}
          </p>
          <p
            className={cn(
              "text-2xl font-semibold text-slate-100 tracking-tight tabular-nums",
              valueClassName
            )}
            style={{ fontFamily: 'var(--font-jetbrains)' }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-600 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <motion.div
              className={cn(
                "inline-flex items-center gap-1.5 mt-2.5 text-xs font-medium px-2 py-0.5 rounded-md",
                isPositive 
                  ? "text-emerald-400/90 bg-emerald-500/10" 
                  : "text-rose-400/90 bg-rose-500/10"
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <span className="text-[10px]">{isPositive ? "▲" : "▼"}</span>
              <span className="tabular-nums">
                {Math.abs(trend).toFixed(2)}%
              </span>
            </motion.div>
          )}
        </div>
        {icon && (
          <motion.div 
            className="p-2 rounded-lg bg-slate-800/40 text-slate-500 group-hover:text-slate-400 transition-colors"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
