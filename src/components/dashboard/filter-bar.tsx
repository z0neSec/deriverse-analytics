"use client";

import React, { useState } from "react";
import { Button, Select } from "@/components/ui";
import { useTradingStore } from "@/store";
import { Filter, RotateCcw } from "lucide-react";
import type { MarketType, TradeSide, TradeStatus } from "@/types";

const SYMBOLS = ["SOL/USDC", "BTC/USDC", "ETH/USDC", "RAY/USDC", "BONK/USDC"];
const MARKET_TYPES: MarketType[] = ["spot", "perpetual"];
const SIDES: TradeSide[] = ["long", "short"];
const STATUSES: TradeStatus[] = ["open", "closed", "liquidated"];

const TIMEFRAME_OPTIONS = [
  { value: "1D", label: "Today" },
  { value: "1W", label: "This Week" },
  { value: "1M", label: "This Month" },
  { value: "3M", label: "3 Months" },
  { value: "1Y", label: "1 Year" },
  { value: "ALL", label: "All Time" },
];

export function FilterBar() {
  const { filters, setFilters, resetFilters, selectedTimeframe, setTimeframe } = useTradingStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    filters.symbols.length > 0 ||
    filters.marketTypes.length > 0 ||
    filters.sides.length > 0 ||
    filters.status.length > 0;

  const toggleArrayFilter = <T extends string>(
    array: T[],
    item: T,
    setter: (newArray: T[]) => void
  ) => {
    if (array.includes(item)) {
      setter(array.filter((i) => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
      {/* Main Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-1">
          {TIMEFRAME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeframe(option.value as typeof selectedTimeframe)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedTimeframe === option.value
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Symbol Filter */}
        <Select
          options={SYMBOLS.map((s) => ({ value: s, label: s }))}
          placeholder="All Symbols"
          value={filters.symbols[0] || ""}
          onChange={(value) => setFilters({ symbols: value ? [value] : [] })}
          className="w-36"
        />

        {/* Advanced Filter Toggle */}
        <Button
          variant={showAdvanced ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center">
              {filters.symbols.length +
                filters.marketTypes.length +
                filters.sides.length +
                filters.status.length}
            </span>
          )}
        </Button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Market Type */}
            <div>
              <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wider">Market Type</p>
              <div className="flex flex-wrap gap-2">
                {MARKET_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      toggleArrayFilter(filters.marketTypes, type, (arr) =>
                        setFilters({ marketTypes: arr })
                      )
                    }
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filters.marketTypes.includes(type)
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Side */}
            <div>
              <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wider">Side</p>
              <div className="flex flex-wrap gap-2">
                {SIDES.map((side) => (
                  <button
                    key={side}
                    onClick={() =>
                      toggleArrayFilter(filters.sides, side, (arr) =>
                        setFilters({ sides: arr })
                      )
                    }
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filters.sides.includes(side)
                        ? side === "long"
                          ? "bg-emerald-600 text-white"
                          : "bg-red-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {side.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wider">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      toggleArrayFilter(filters.status, status, (arr) =>
                        setFilters({ status: arr })
                      )
                    }
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filters.status.includes(status)
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wider">Custom Date Range</p>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="flex-1 px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-white"
                  onChange={(e) =>
                    setFilters({
                      dateRange: {
                        ...filters.dateRange,
                        start: e.target.value ? new Date(e.target.value) : null,
                      },
                    })
                  }
                />
                <span className="text-zinc-500">to</span>
                <input
                  type="date"
                  className="flex-1 px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-white"
                  onChange={(e) =>
                    setFilters({
                      dateRange: {
                        ...filters.dateRange,
                        end: e.target.value ? new Date(e.target.value) : null,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
