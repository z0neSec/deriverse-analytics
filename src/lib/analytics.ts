/**
 * Analytics calculation utilities
 * Computes trading metrics from trade data
 */

import type {
  Trade,
  PortfolioMetrics,
  TimeBasedMetrics,
  SessionMetrics,
  SymbolMetrics,
  FeeBreakdown,
  FilterOptions,
} from "@/types";
import { toDate, getTime } from "@/lib/utils";

export function calculatePortfolioMetrics(trades: Trade[]): PortfolioMetrics {
  const closedTrades = trades.filter(
    (t) => t.status === "closed" && t.pnl !== undefined
  );

  if (closedTrades.length === 0) {
    return {
      totalPnl: 0,
      totalPnlPercentage: 0,
      totalVolume: 0,
      totalFees: 0,
      winRate: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      profitFactor: 0,
      averageTradeDuration: 0,
      longShortRatio: 0,
      maxDrawdown: 0,
      maxDrawdownPercentage: 0,
    };
  }

  const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0);
  const losingTrades = closedTrades.filter((t) => (t.pnl || 0) < 0);
  const longTrades = closedTrades.filter((t) => t.side === "long");
  const shortTrades = closedTrades.filter((t) => t.side === "short");

  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalVolume = trades.reduce(
    (sum, t) => sum + t.entryPrice * t.quantity,
    0
  );
  const totalFees = trades.reduce((sum, t) => sum + t.fees.totalFee, 0);

  const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalLosses = Math.abs(
    losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  );

  // Calculate trade durations
  const durations = closedTrades
    .filter((t) => t.exitTime)
    .map((t) => getTime(t.exitTime!) - getTime(t.entryTime));

  const averageTradeDuration =
    durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

  // Calculate drawdown
  let peak = 0;
  let maxDrawdown = 0;
  let cumulative = 0;

  const sortedTrades = [...closedTrades].sort(
    (a, b) => getTime(a.exitTime!) - getTime(b.exitTime!)
  );

  for (const trade of sortedTrades) {
    cumulative += trade.pnl || 0;
    if (cumulative > peak) {
      peak = cumulative;
    }
    const drawdown = peak - cumulative;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return {
    totalPnl,
    totalPnlPercentage: totalVolume > 0 ? (totalPnl / totalVolume) * 100 : 0,
    totalVolume,
    totalFees,
    winRate:
      closedTrades.length > 0
        ? (winningTrades.length / closedTrades.length) * 100
        : 0,
    totalTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    averageWin:
      winningTrades.length > 0 ? totalWins / winningTrades.length : 0,
    averageLoss:
      losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
    largestWin: Math.max(...winningTrades.map((t) => t.pnl || 0), 0),
    largestLoss: Math.max(...losingTrades.map((t) => Math.abs(t.pnl || 0)), 0),
    profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
    averageTradeDuration,
    longShortRatio:
      shortTrades.length > 0
        ? longTrades.length / shortTrades.length
        : longTrades.length,
    maxDrawdown,
    maxDrawdownPercentage: peak > 0 ? (maxDrawdown / peak) * 100 : 0,
  };
}

export function calculateTimeBasedMetrics(trades: Trade[]): TimeBasedMetrics[] {
  const hourlyData = new Map<number, { pnl: number; wins: number; total: number }>();

  // Initialize all hours
  for (let i = 0; i < 24; i++) {
    hourlyData.set(i, { pnl: 0, wins: 0, total: 0 });
  }

  const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== undefined);

  for (const trade of closedTrades) {
    const hour = toDate(trade.entryTime).getHours();
    const data = hourlyData.get(hour)!;
    data.pnl += trade.pnl || 0;
    data.total += 1;
    if ((trade.pnl || 0) > 0) {
      data.wins += 1;
    }
  }

  return Array.from(hourlyData.entries()).map(([hour, data]) => ({
    hour,
    pnl: data.pnl,
    tradeCount: data.total,
    winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
  }));
}

export function calculateSessionMetrics(trades: Trade[]): SessionMetrics[] {
  const sessions: { [key: string]: SessionMetrics } = {
    asian: { session: "asian", pnl: 0, tradeCount: 0, winRate: 0, averageDuration: 0 },
    european: { session: "european", pnl: 0, tradeCount: 0, winRate: 0, averageDuration: 0 },
    american: { session: "american", pnl: 0, tradeCount: 0, winRate: 0, averageDuration: 0 },
  };

  const sessionWins = { asian: 0, european: 0, american: 0 };
  const sessionDurations: { asian: number[]; european: number[]; american: number[] } = {
    asian: [],
    european: [],
    american: [],
  };

  const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== undefined);

  for (const trade of closedTrades) {
    const hour = toDate(trade.entryTime).getUTCHours();
    let session: "asian" | "european" | "american";

    if (hour >= 0 && hour < 8) {
      session = "asian";
    } else if (hour >= 8 && hour < 16) {
      session = "european";
    } else {
      session = "american";
    }

    sessions[session].pnl += trade.pnl || 0;
    sessions[session].tradeCount += 1;
    if ((trade.pnl || 0) > 0) {
      sessionWins[session] += 1;
    }
    if (trade.exitTime) {
      sessionDurations[session].push(
        getTime(trade.exitTime) - getTime(trade.entryTime)
      );
    }
  }

  return Object.values(sessions).map((s) => ({
    ...s,
    winRate: s.tradeCount > 0 ? (sessionWins[s.session] / s.tradeCount) * 100 : 0,
    averageDuration:
      sessionDurations[s.session].length > 0
        ? sessionDurations[s.session].reduce((a, b) => a + b, 0) /
          sessionDurations[s.session].length
        : 0,
  }));
}

export function calculateSymbolMetrics(trades: Trade[]): SymbolMetrics[] {
  const symbolData = new Map<
    string,
    { pnl: number; volume: number; fees: number; wins: number; total: number }
  >();

  for (const trade of trades) {
    const existing = symbolData.get(trade.symbol);
    const volume = trade.entryPrice * trade.quantity;
    const pnl = trade.status === "closed" ? trade.pnl || 0 : 0;
    const isWin = pnl > 0;

    if (existing) {
      existing.pnl += pnl;
      existing.volume += volume;
      existing.fees += trade.fees.totalFee;
      existing.total += trade.status === "closed" ? 1 : 0;
      if (isWin) existing.wins += 1;
    } else {
      symbolData.set(trade.symbol, {
        pnl,
        volume,
        fees: trade.fees.totalFee,
        wins: isWin ? 1 : 0,
        total: trade.status === "closed" ? 1 : 0,
      });
    }
  }

  return Array.from(symbolData.entries())
    .map(([symbol, data]) => ({
      symbol,
      pnl: data.pnl,
      volume: data.volume,
      tradeCount: data.total,
      winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
      averagePnl: data.total > 0 ? data.pnl / data.total : 0,
      fees: data.fees,
    }))
    .sort((a, b) => b.volume - a.volume);
}

export function calculateFeeBreakdown(trades: Trade[]): FeeBreakdown {
  let makerFees = 0;
  let takerFees = 0;
  let fundingFees = 0;

  const feesByDate = new Map<string, number>();

  for (const trade of trades) {
    makerFees += trade.fees.makerFee;
    takerFees += trade.fees.takerFee;
    fundingFees += trade.fees.fundingFee || 0;

    const dateKey = toDate(trade.entryTime).toISOString().split("T")[0];
    const existing = feesByDate.get(dateKey) || 0;
    feesByDate.set(dateKey, existing + trade.fees.totalFee);
  }

  // Sort and calculate cumulative
  const sortedDates = Array.from(feesByDate.entries()).sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );

  let cumulative = 0;
  const feesOverTime = sortedDates.map(([date, fees]) => {
    cumulative += fees;
    return {
      date: new Date(date),
      fees,
      cumulativeFees: cumulative,
    };
  });

  return {
    makerFees,
    takerFees,
    fundingFees,
    totalFees: makerFees + takerFees + fundingFees,
    feesOverTime,
  };
}

export function filterTrades(trades: Trade[], filters: FilterOptions): Trade[] {
  return trades.filter((trade) => {
    // Date range filter
    const entryTime = getTime(trade.entryTime);
    if (filters.dateRange.start && entryTime < getTime(filters.dateRange.start)) {
      return false;
    }
    if (filters.dateRange.end && entryTime > getTime(filters.dateRange.end)) {
      return false;
    }

    // Symbol filter
    if (filters.symbols.length > 0 && !filters.symbols.includes(trade.symbol)) {
      return false;
    }

    // Market type filter
    if (
      filters.marketTypes.length > 0 &&
      !filters.marketTypes.includes(trade.marketType)
    ) {
      return false;
    }

    // Side filter
    if (filters.sides.length > 0 && !filters.sides.includes(trade.side)) {
      return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(trade.status)) {
      return false;
    }

    // PnL range filter
    if (filters.minPnl !== undefined && (trade.pnl || 0) < filters.minPnl) {
      return false;
    }
    if (filters.maxPnl !== undefined && (trade.pnl || 0) > filters.maxPnl) {
      return false;
    }

    return true;
  });
}

export function getOrderTypePerformance(trades: Trade[]) {
  const orderTypeData = new Map<
    string,
    { pnl: number; wins: number; total: number; avgDuration: number; durations: number[] }
  >();

  const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== undefined);

  for (const trade of closedTrades) {
    const existing = orderTypeData.get(trade.orderType);
    const duration = trade.exitTime
      ? getTime(trade.exitTime) - getTime(trade.entryTime)
      : 0;

    if (existing) {
      existing.pnl += trade.pnl || 0;
      existing.total += 1;
      if ((trade.pnl || 0) > 0) existing.wins += 1;
      if (duration > 0) existing.durations.push(duration);
    } else {
      orderTypeData.set(trade.orderType, {
        pnl: trade.pnl || 0,
        wins: (trade.pnl || 0) > 0 ? 1 : 0,
        total: 1,
        avgDuration: 0,
        durations: duration > 0 ? [duration] : [],
      });
    }
  }

  return Array.from(orderTypeData.entries()).map(([orderType, data]) => ({
    orderType,
    pnl: data.pnl,
    tradeCount: data.total,
    winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
    averageDuration:
      data.durations.length > 0
        ? data.durations.reduce((a, b) => a + b, 0) / data.durations.length
        : 0,
  }));
}
