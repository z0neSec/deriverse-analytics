"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function FlowingLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const drawFlowingLines = (time: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      ctx.clearRect(0, 0, width, height);

      // Configuration for the flowing wave mesh
      const lineCount = 35;
      const amplitude = height * 0.2;
      const frequency = 0.003;
      const phaseSpeed = 0.0003;
      
      // Draw top flowing lines
      const topLineCount = 20;
      const topBaseY = height * 0.15;
      
      for (let i = 0; i < topLineCount; i++) {
        const progress = i / topLineCount;
        const yOffset = progress * amplitude * 0.8;
        const alpha = 0.12 + (1 - progress) * 0.18;
        
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, `rgba(34, 211, 238, ${alpha * 0.5})`);
        gradient.addColorStop(0.3, `rgba(99, 102, 241, ${alpha})`);
        gradient.addColorStop(0.6, `rgba(139, 92, 246, ${alpha * 0.7})`);
        gradient.addColorStop(1, `rgba(139, 92, 246, 0)`);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;

        for (let x = 0; x <= width; x += 2) {
          const normalizedX = x / width;
          
          const wave1 = Math.sin(x * frequency + time * phaseSpeed * 0.8 + i * 0.12) * amplitude * 0.4;
          const wave2 = Math.sin(x * frequency * 1.3 + time * phaseSpeed * 0.5 + i * 0.08) * amplitude * 0.25;
          
          const envelope = Math.pow(1 - normalizedX, 1.2) * Math.pow(1 - Math.abs(progress - 0.5) * 2, 0.5);
          const y = topBaseY + yOffset + (wave1 + wave2) * envelope;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      }
      
      // Draw bottom flowing lines
      const bottomBaseY = height * 0.65;
      
      for (let i = 0; i < lineCount; i++) {
        const progress = i / lineCount;
        
        // Calculate line properties
        const yOffset = progress * amplitude * 1.5;
        const alpha = 0.15 + (1 - progress) * 0.25;
        
        // Create gradient for each line
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        
        // Purple to cyan gradient like Deriverse branding
        gradient.addColorStop(0, `rgba(139, 92, 246, 0)`);
        gradient.addColorStop(0.3, `rgba(139, 92, 246, ${alpha * 0.6})`);
        gradient.addColorStop(0.5, `rgba(99, 102, 241, ${alpha})`);
        gradient.addColorStop(0.7, `rgba(34, 211, 238, ${alpha})`);
        gradient.addColorStop(1, `rgba(34, 211, 238, ${alpha * 0.4})`);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;

        // Draw the flowing curve
        for (let x = 0; x <= width; x += 2) {
          const normalizedX = x / width;
          
          // Multiple wave frequencies for organic feel
          const wave1 = Math.sin(x * frequency + time * phaseSpeed + i * 0.15) * amplitude * 0.5;
          const wave2 = Math.sin(x * frequency * 1.5 + time * phaseSpeed * 0.7 + i * 0.1) * amplitude * 0.3;
          const wave3 = Math.sin(x * frequency * 0.5 + time * phaseSpeed * 1.2 + i * 0.2) * amplitude * 0.2;
          
          // Combine waves with envelope that concentrates effect in bottom-right
          const envelope = Math.pow(normalizedX, 1.5) * Math.pow(1 - Math.abs(progress - 0.5) * 2, 0.5);
          const y = bottomBaseY + yOffset + (wave1 + wave2 + wave3) * envelope;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      }
    };

    const animate = () => {
      timeRef.current += 16; // Approximate 60fps
      drawFlowingLines(timeRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    />
  );
}
