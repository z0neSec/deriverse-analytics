"use client";

import React from "react";
import { FlowingLines } from "./flowing-lines";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-[#050a12]" />
      
      {/* Subtle ambient glow */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139, 92, 246, 0.08), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, rgba(99, 102, 241, 0.06), transparent),
            radial-gradient(ellipse 50% 30% at 0% 80%, rgba(34, 211, 238, 0.05), transparent)
          `,
        }}
      />
      
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Flowing wave lines like Deriverse branding */}
      <FlowingLines />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(2, 6, 23, 0.5) 100%)",
        }}
      />
    </div>
  );
}
