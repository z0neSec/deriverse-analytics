"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-slate-200 hover:bg-white text-slate-900 border-slate-300",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700",
    ghost:
      "bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border-transparent",
    danger:
      "bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 border-rose-800/50",
    outline:
      "bg-transparent hover:bg-slate-800/30 text-slate-400 hover:text-slate-200 border-slate-700 hover:border-slate-600",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };

  return (
    <motion.button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50",
        variants[variant],
        sizes[size],
        className
      )}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
