"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm p-6",
        "shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)]",
        "hover:border-slate-700/60 hover:bg-slate-900/50",
        className
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface CardSubProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardSubProps) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { children: React.ReactNode }) {
  return (
    <h3
      className={cn(
        "text-base font-medium text-slate-200 tracking-tight",
        className
      )}
      style={{ fontFamily: 'var(--font-inter)' }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: CardSubProps) {
  return (
    <p className={cn("text-sm text-slate-500", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: CardSubProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}
