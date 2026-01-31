"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store";
import {
  LayoutDashboard,
  TrendingUp,
  History,
  BarChart3,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Wallet,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Performance",
    href: "/performance",
    icon: TrendingUp,
  },
  {
    title: "Trade History",
    href: "/history",
    icon: History,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Portfolio",
    href: "/portfolio",
    icon: Wallet,
  },
  {
    title: "Fees",
    href: "/fees",
    icon: Activity,
  },
  {
    title: "Journal",
    href: "/journal",
    icon: BookOpen,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed: collapsed, toggleSidebar } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-slate-400 hover:text-slate-200 md:hidden"
        aria-label="Open menu"
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="w-5 h-5" />
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen transition-all duration-300",
          "bg-slate-950/90 backdrop-blur-xl border-r border-slate-800/50",
          // Desktop styles
          "hidden md:block",
          collapsed ? "md:w-16" : "md:w-64",
          // Mobile styles - slide from left
          mobileOpen && "block w-64 md:hidden"
        )}
      >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/50">
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
          {(!collapsed || mobileOpen) && (
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/deriverse-logo.svg"
                alt="Deriverse"
                width={28}
                height={28}
                className="rounded-md"
              />
              <div className="flex flex-col">
                <span 
                  className="font-semibold text-slate-100 text-base tracking-tight"
                  style={{ fontFamily: 'var(--font-instrument)' }}
                >
                  Deriverse
                </span>
                <span className="text-[10px] text-slate-500 -mt-0.5 tracking-wide">
                  ANALYTICS
                </span>
              </div>
            </Link>
          )}
          {collapsed && !mobileOpen && (
            <Link href="/" className="mx-auto">
              <Image
                src="/deriverse-logo.svg"
                alt="Deriverse"
                width={28}
                height={28}
                className="rounded-md"
              />
            </Link>
          )}
          {!collapsed && !mobileOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-slate-800/50 text-slate-500 hover:text-slate-300 transition-colors hidden md:block"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
        {collapsed && !mobileOpen && (
          <button
            onClick={toggleSidebar}
            className="mx-auto mt-3 p-1.5 rounded-md hover:bg-slate-800/50 text-slate-500 hover:text-slate-300 transition-colors hidden md:block"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative group",
                    isActive
                      ? "text-slate-100 bg-slate-800/60"
                      : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-slate-400 rounded-full"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn(
                    "w-[18px] h-[18px] flex-shrink-0",
                    isActive ? "text-slate-300" : "text-slate-500 group-hover:text-slate-400"
                  )} />
                  {(!collapsed || mobileOpen) && (
                    <span className="font-medium text-sm">{item.title}</span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-2 border-t border-slate-800/50">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
              "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30"
            )}
          >
            <Settings className="w-[18px] h-[18px] flex-shrink-0" />
            {(!collapsed || mobileOpen) && (
              <span className="font-medium text-sm">Settings</span>
            )}
          </Link>
        </div>
      </div>
    </aside>
    </>
  );
}
