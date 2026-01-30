"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "danger" | "warning" | "info";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  className,
  variant = "default",
  size = "sm",
  children,
}: BadgeProps) {
  const variants = {
    default: "bg-slate-800/60 text-slate-400 border-slate-700/50",
    success: "bg-emerald-950/40 text-emerald-500/90 border-emerald-800/30",
    danger: "bg-rose-950/40 text-rose-500/90 border-rose-800/30",
    warning: "bg-amber-950/40 text-amber-500/90 border-amber-800/30",
    info: "bg-sky-950/40 text-sky-500/90 border-sky-800/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] tracking-wide",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <motion.span
      className={cn(
        "inline-flex items-center rounded border font-medium uppercase",
        variants[variant],
        sizes[size],
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.span>
  );
}
