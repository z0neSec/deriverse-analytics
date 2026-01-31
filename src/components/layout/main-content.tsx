"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { useSyncExternalStore } from "react";
import { useUIStore } from "@/store";

interface MainContentProps {
  children: React.ReactNode;
}

function useIsMobile() {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
  }, []);
  
  const getSnapshot = useCallback(() => {
    return window.innerWidth < 768;
  }, []);
  
  const getServerSnapshot = useCallback(() => false, []);
  
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function MainContent({ children }: MainContentProps) {
  const { sidebarCollapsed } = useUIStore();
  const isMobile = useIsMobile();

  // On mobile, no margin. On desktop, margin based on sidebar state
  const marginLeft = isMobile ? 0 : sidebarCollapsed ? "4rem" : "16rem";

  return (
    <motion.main
      className="pt-16 min-h-screen relative z-10"
      initial={false}
      animate={{
        marginLeft,
      }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <div className="p-4 md:p-6 max-w-7xl mx-auto">{children}</div>
    </motion.main>
  );
}
