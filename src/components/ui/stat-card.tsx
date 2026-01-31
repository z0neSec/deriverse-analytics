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
        "relative rounded-xl overflow-hidden",
        "border border-slate-700/50",
        "bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-800/50",
        "backdrop-blur-xl backdrop-saturate-150",
        "shadow-[0_8px_32px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.05)_inset]",
        "hover:border-slate-600/60 hover:shadow-[0_12px_40px_rgba(59,130,246,0.08)]",
        "transition-all duration-300",
        "p-5 group",
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
        y: -3,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
    >
      {/* Glass highlight */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%, rgba(0,0,0,0.05) 100%)",
        }}
      />
      
      {/* Accent glow on hover */}
      <motion.div 
        className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.1), transparent 50%)",
        }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
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
            <p className="text-xs text-slate-600 mt-1.5">{subtitle}</p>
          )}
          {trend !== undefined && (
            <motion.div
              className={cn(
                "inline-flex items-center gap-1.5 mt-3 text-xs font-medium px-2.5 py-1 rounded-lg",
                isPositive 
                  ? "text-emerald-400/90 bg-emerald-500/15 border border-emerald-500/20" 
                  : "text-rose-400/90 bg-rose-500/15 border border-rose-500/20"
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <span className="text-[10px]">{isPositive ? "▲" : "▼"}</span>
              <span className="tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>
                {Math.abs(trend).toFixed(2)}%
              </span>
            </motion.div>
          )}
        </div>
        {icon && (
          <motion.div 
            className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/30 text-slate-500 group-hover:text-slate-400 group-hover:border-slate-600/40 transition-all"
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
