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
            <p className="text-white">{format(info.getValue(), "MMM dd, yyyy")}</p>
            <p className="text-zinc-500 text-xs">{format(info.getValue(), "HH:mm:ss")}</p>
          </div>
        ),
      }),
      columnHelper.accessor("symbol", {
        header: "Symbol",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{info.getValue()}</span>
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
          if (pnl === undefined) return <span className="text-zinc-500">Open</span>;
          return (
            <div>
              <p className={cn("font-medium", pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                {formatCurrency(pnl)}
              </p>
              {pnlPercentage !== undefined && (
                <p className="text-xs text-zinc-500">{formatPercentage(pnlPercentage)}</p>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("fees", {
        header: "Fees",
        cell: (info) => (
          <span className="text-amber-400">{formatCurrency(info.getValue().totalFee)}</span>
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
              className="text-zinc-400 hover:text-white transition-colors"
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
        <div className="flex items-center justify-between">
          <CardTitle>Trade History</CardTitle>
          <input
            type="text"
            placeholder="Search trades..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-zinc-800">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-zinc-800/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-zinc-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
          <div className="text-sm text-zinc-400">
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
              Previous
            </Button>
            <span className="text-sm text-zinc-400">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
