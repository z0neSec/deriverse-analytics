"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { toDate } from "@/lib/utils";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  StickyNote,
  Tag,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@/components/ui";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import type { Trade } from "@/types";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<Trade>();

interface TradeHistoryTableProps {
  trades: Trade[];
  onAddNote?: (tradeId: string) => void;
}

export function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "entryTime", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () => [
      columnHelper.accessor("entryTime", {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: (info) => (
          <div className="text-sm">
            <p className="text-slate-200">{format(toDate(info.getValue()), "MMM dd, yyyy")}</p>
            <p className="text-slate-500 text-xs">{format(toDate(info.getValue()), "HH:mm:ss")}</p>
          </div>
        ),
      }),
      columnHelper.accessor("symbol", {
        header: "Symbol",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-200">{info.getValue()}</span>
            <Badge variant={info.row.original.marketType === "spot" ? "info" : "warning"} size="sm">
              {info.row.original.marketType}
            </Badge>
          </div>
        ),
      }),
      columnHelper.accessor("side", {
        header: "Side",
        cell: (info) => (
          <Badge variant={info.getValue() === "long" ? "success" : "danger"}>
            {info.getValue().toUpperCase()}
          </Badge>
        ),
      }),
      columnHelper.accessor("entryPrice", {
        header: "Entry",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("exitPrice", {
        header: "Exit",
        cell: (info) => {
          const value = info.getValue();
          return value ? formatCurrency(value) : "-";
        },
      }),
      columnHelper.accessor("quantity", {
        header: "Size",
        cell: (info) => info.getValue().toFixed(4),
      }),
      columnHelper.accessor("leverage", {
        header: "Leverage",
        cell: (info) => {
          const value = info.getValue();
          return value ? `${value}x` : "-";
        },
      }),
      columnHelper.accessor("pnl", {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PnL
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: (info) => {
          const pnl = info.getValue();
          const pnlPercentage = info.row.original.pnlPercentage;
          if (pnl === undefined) return <span className="text-slate-500">Open</span>;
          return (
            <div>
              <p className={cn("font-medium tabular-nums", pnl >= 0 ? "text-emerald-500/90" : "text-rose-500/90")} style={{ fontFamily: 'var(--font-jetbrains)' }}>
                {formatCurrency(pnl)}
              </p>
              {pnlPercentage !== undefined && (
                <p className="text-xs text-slate-500 tabular-nums">{formatPercentage(pnlPercentage)}</p>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("fees", {
        header: "Fees",
        cell: (info) => (
          <span className="text-amber-500/90 tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>{formatCurrency(info.getValue().totalFee)}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const variant = status === "closed" ? "default" : status === "open" ? "success" : "danger";
          return <Badge variant={variant}>{status}</Badge>;
        },
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) => (
          <div className="flex items-center gap-2">
            {info.row.original.notes && (
              <StickyNote className="w-4 h-4 text-amber-400" />
            )}
            {info.row.original.tags && info.row.original.tags.length > 0 && (
              <Tag className="w-4 h-4 text-blue-400" />
            )}
            <a
              href={`https://explorer.solana.com/tx/${info.row.original.txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: trades,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle>Trade History</CardTitle>
          <input
            type="text"
            placeholder="Search trades..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-800/60">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-800/20 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-slate-400">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800/60">
          <div className="text-sm text-slate-500 text-center sm:text-left">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} trades
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <span className="text-sm text-slate-500">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
