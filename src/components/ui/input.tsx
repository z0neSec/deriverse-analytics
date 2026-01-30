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
        "appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500",
        "cursor-pointer transition-colors",
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

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500",
        "transition-colors",
        className
      )}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500",
        "transition-colors resize-none",
        className
      )}
      {...props}
    />
  );
}
