"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
  const [collapsed, setCollapsed] = useState(false);
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
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white md:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-zinc-950 border-r border-white/5 transition-all duration-300",
          // Desktop styles
          "hidden md:block",
          collapsed ? "md:w-16" : "md:w-64",
          // Mobile styles - slide from left
          mobileOpen && "block w-64 md:hidden"
        )}
      >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
          {(!collapsed || mobileOpen) && (
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/deriverse-logo.svg"
                alt="Deriverse"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-white text-lg">Deriverse</span>
            </Link>
          )}
          {collapsed && !mobileOpen && (
            <Link href="/" className="mx-auto">
              <Image
                src="/deriverse-logo.svg"
                alt="Deriverse"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </Link>
          )}
          {!collapsed && !mobileOpen && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors hidden md:block"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
        {collapsed && !mobileOpen && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-2 p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors hidden md:block"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {(!collapsed || mobileOpen) && (
                  <span className="font-medium text-sm">{item.title}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-2 border-t border-white/5">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
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
