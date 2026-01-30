"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
      "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/20",
    secondary:
      "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700",
    ghost:
      "bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white border-transparent",
    danger:
      "bg-red-600 hover:bg-red-700 text-white border-red-500/20",
    outline:
      "bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-600 hover:border-zinc-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
