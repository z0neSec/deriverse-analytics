"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function Select({
  className,
  options,
  placeholder,
  onChange,
  value,
  ...props
}: SelectProps) {
  return (
    <select
      className={cn(
        "appearance-none rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200",
        "focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-600",
        "cursor-pointer transition-colors backdrop-blur-sm",
        className
      )}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500",
        "focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-600",
        "transition-colors backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500",
        "focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-600",
        "transition-colors resize-none backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}
