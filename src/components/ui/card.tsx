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
        "relative rounded-xl overflow-hidden",
        "border border-slate-700/50",
        "bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/40",
        "backdrop-blur-xl backdrop-saturate-150",
        "shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset]",
        "hover:border-slate-600/50 hover:shadow-[0_8px_40px_rgba(59,130,246,0.1),0_0_0_1px_rgba(255,255,255,0.08)_inset]",
        "transition-shadow duration-300",
        "p-6",
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
      {/* Subtle gradient overlay for glass effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)",
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
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
