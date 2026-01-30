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
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm p-3 md:p-4">
      {/* Main Filter Row */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {/* Timeframe Selector - Scrollable on mobile */}
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 -mx-1 px-1">
          <div className="flex items-center gap-1 md:gap-2 bg-slate-800/60 rounded-lg p-1 min-w-max">
            {TIMEFRAME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeframe(option.value as typeof selectedTimeframe)}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedTimeframe === option.value
                    ? "bg-slate-200 text-slate-900"
                    : "text-slate-500 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
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
            <span className="ml-1 w-5 h-5 rounded-full bg-slate-200 text-slate-900 text-xs flex items-center justify-center">
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
        <div className="mt-4 pt-4 border-t border-slate-800/60">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Market Type */}
            <div>
              <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">Market Type</p>
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
                        ? "bg-slate-200 text-slate-900"
                        : "bg-slate-800/60 text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Side */}
            <div>
              <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">Side</p>
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
                          ? "bg-emerald-600/80 text-white"
                          : "bg-rose-600/80 text-white"
                        : "bg-slate-800/60 text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {side.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">Status</p>
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
                        ? "bg-blue-600/80 text-white"
                        : "bg-slate-800/60 text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">Custom Date Range</p>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="flex-1 px-2 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-sm text-slate-200"
                  onChange={(e) =>
                    setFilters({
                      dateRange: {
                        ...filters.dateRange,
                        start: e.target.value ? new Date(e.target.value) : null,
                      },
                    })
                  }
                />
                <span className="text-slate-500">to</span>
                <input
                  type="date"
                  className="flex-1 px-2 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-sm text-slate-200"
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
