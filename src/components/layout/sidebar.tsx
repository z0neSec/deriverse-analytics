"use client";

import React, { useState } from "react";
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

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-zinc-950 border-r border-white/5 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
          {!collapsed && (
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
          {collapsed && (
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
          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-2 p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
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
                {!collapsed && (
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
            {!collapsed && (
              <span className="font-medium text-sm">Settings</span>
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
}
