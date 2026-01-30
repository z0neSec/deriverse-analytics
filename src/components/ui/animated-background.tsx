"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface GradientOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [orbs] = useState<GradientOrb[]>([
    { id: 1, x: 15, y: 20, size: 400, opacity: 0.03, color: "rgba(100, 100, 120, 1)" },
    { id: 2, x: 85, y: 15, size: 350, opacity: 0.025, color: "rgba(80, 90, 110, 1)" },
    { id: 3, x: 50, y: 80, size: 500, opacity: 0.02, color: "rgba(70, 80, 100, 1)" },
    { id: 4, x: 20, y: 70, size: 300, opacity: 0.015, color: "rgba(90, 95, 115, 1)" },
  ]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      setMousePosition({
        x: clientX / innerWidth,
        y: clientY / innerHeight,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient orbs with subtle mouse parallax */}
      {orbs.map((orb) => {
        const parallaxX = (mousePosition.x - 0.5) * 30;
        const parallaxY = (mousePosition.y - 0.5) * 30;
        
        return (
          <motion.div
            key={orb.id}
            className="absolute rounded-full"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              opacity: orb.opacity,
              transform: `translate(-50%, -50%)`,
            }}
            animate={{
              x: parallaxX * (orb.id * 0.3),
              y: parallaxY * (orb.id * 0.3),
            }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 30,
              mass: 1,
            }}
          />
        );
      })}

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Mouse-following subtle gradient */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(100, 110, 130, 0.04) 0%, transparent 60%)",
          left: `${mousePosition.x * 100}%`,
          top: `${mousePosition.y * 100}%`,
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(2, 6, 23, 0.4) 100%)",
        }}
      />
    </div>
  );
}
