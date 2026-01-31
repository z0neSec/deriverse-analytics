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
    { id: 1, x: 10, y: 10, size: 800, opacity: 0.25, color: "rgba(59, 130, 246, 1)" },
    { id: 2, x: 90, y: 20, size: 700, opacity: 0.2, color: "rgba(139, 92, 246, 1)" },
    { id: 3, x: 50, y: 85, size: 900, opacity: 0.18, color: "rgba(6, 182, 212, 1)" },
    { id: 4, x: 15, y: 75, size: 600, opacity: 0.15, color: "rgba(99, 102, 241, 1)" },
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
      <div className="absolute inset-0 bg-[#050a12]" />
      
      {/* Layered gradient mesh */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.2), transparent),
            radial-gradient(ellipse 60% 40% at 100% 0%, rgba(139, 92, 246, 0.15), transparent),
            radial-gradient(ellipse 50% 30% at 0% 100%, rgba(6, 182, 212, 0.12), transparent)
          `,
        }}
      />
      
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
              filter: "blur(60px)",
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

      {/* Grid pattern - visible */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)",
        }}
      />
      
      {/* Dot pattern accent */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(rgba(148, 163, 184, 0.25) 1.5px, transparent 1.5px)`,
          backgroundSize: "30px 30px",
          maskImage: "radial-gradient(ellipse 40% 35% at 85% 15%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 40% 35% at 85% 15%, black, transparent)",
        }}
      />

      {/* Mouse-following glow - visible */}
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%)",
          left: `${mousePosition.x * 100}%`,
          top: `${mousePosition.y * 100}%`,
          transform: "translate(-50%, -50%)",
          filter: "blur(30px)",
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Horizontal accent lines */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          top: "20%",
          background: "linear-gradient(90deg, transparent 5%, rgba(148, 163, 184, 0.3) 30%, rgba(148, 163, 184, 0.3) 70%, transparent 95%)",
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          top: "80%",
          background: "linear-gradient(90deg, transparent 10%, rgba(148, 163, 184, 0.25) 35%, rgba(148, 163, 184, 0.25) 65%, transparent 90%)",
        }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
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
