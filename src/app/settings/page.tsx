"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from "@/components/ui";
import { useTradingStore } from "@/store";
import {
  Wallet,
  Bell,
  Database,
  Shield,
  ExternalLink,
  Trash2,
  RefreshCw,
} from "lucide-react";

export default function SettingsPage() {
  const { isConnected, walletAddress, clearData, trades, journalEntries } = useTradingStore();

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to clear all trading data? This action cannot be undone."
      )
    ) {
      clearData();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 
          className="text-2xl font-medium tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent"
          style={{ fontFamily: 'var(--font-instrument)' }}
        >
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your dashboard preferences and connections</p>
      </div>

      {/* Wallet Connection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-500/80\" />
            <CardTitle>Wallet Connection</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-emerald-500" : "bg-slate-500"
                }`}
              />
              <div>
                <p className="font-medium text-slate-200">
                  {isConnected ? "Connected" : "Not Connected"}
                </p>
                {walletAddress && (
                  <p className="text-sm text-slate-500 font-mono">
                    {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                  </p>
                )}
              </div>
            </div>
            <Badge variant={isConnected ? "success" : "default"}>
              {isConnected ? "Devnet" : "Disconnected"}
            </Badge>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-amber-950/30 border border-amber-800/30">
            <p className="text-sm text-amber-500/90">
              <strong>Note:</strong> This dashboard is currently configured for Solana Devnet.
              Connect a devnet wallet to sync live trading data from Deriverse.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Network Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500/80" />
            <CardTitle>Network Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Network</label>
                <p className="text-slate-200 font-medium">Solana Devnet</p>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Program ID</label>
                <p className="text-slate-200 font-mono text-sm">
                  Drvrseg8...27Gu
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">RPC Endpoint</label>
                <p className="text-slate-200 text-sm">https://api.devnet.solana.com</p>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">SDK Version</label>
                <p className="text-slate-200 font-medium">@deriverse/kit v1.0.39</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-500/80" />
            <CardTitle>Data Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/40">
              <div>
                <p className="font-medium text-slate-200">Local Storage</p>
                <p className="text-sm text-slate-500">
                  {trades.length} trades • {journalEntries.length} journal entries
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-rose-950/30 border border-rose-800/30">
              <div>
                <p className="font-medium text-slate-200">Clear All Data</p>
                <p className="text-sm text-slate-500">
                  Remove all trades, positions, and journal entries
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={handleClearData}>
                <Trash2 className="w-4 h-4" />
                Clear Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500/80" />
            <CardTitle>Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 cursor-pointer">
              <div>
                <p className="font-medium text-slate-200">Trade Alerts</p>
                <p className="text-sm text-slate-500">Get notified when trades are executed</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 cursor-pointer">
              <div>
                <p className="font-medium text-slate-200">PnL Alerts</p>
                <p className="text-sm text-slate-500">Daily PnL summary notifications</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 cursor-pointer">
              <div>
                <p className="font-medium text-slate-200">Liquidation Warnings</p>
                <p className="text-sm text-slate-500">Alert when positions approach liquidation</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              href="https://deriverse.gitbook.io/deriverse-v1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
            >
              <span className="text-white">Deriverse Documentation</span>
              <ExternalLink className="w-4 h-4 text-zinc-400" />
            </a>
            <a
              href="https://github.com/deriverse/kit-example"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
            >
              <span className="text-white">SDK Example</span>
              <ExternalLink className="w-4 h-4 text-zinc-400" />
            </a>
            <a
              href="https://npmjs.com/@deriverse/kit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
            >
              <span className="text-white">@deriverse/kit on NPM</span>
              <ExternalLink className="w-4 h-4 text-zinc-400" />
            </a>
            <a
              href="https://discord.gg/gSGV5wr8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
            >
              <span className="text-white">Deriverse Discord</span>
              <ExternalLink className="w-4 h-4 text-zinc-400" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-zinc-400 space-y-2">
            <p>
              <strong className="text-white">Deriverse Analytics</strong> - Professional Trading Dashboard
            </p>
            <p>
              Built for the Deriverse Hackathon • Comprehensive trading analytics and portfolio analysis for active traders.
            </p>
            <p>
              Version 1.0.0 • Built with Next.js, TypeScript, Tailwind CSS, and Recharts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
