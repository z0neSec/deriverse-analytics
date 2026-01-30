/**
 * Mock data generator for development and demo purposes
 * In production, this would be replaced by actual Deriverse SDK data
 */

import type {
  Trade,
  Position,
  DailyPerformance,
  JournalEntry,
  TradeSide,
  OrderType,
  MarketType,
} from "@/types";

const SYMBOLS = ["SOL/USDC", "BTC/USDC", "ETH/USDC", "RAY/USDC", "BONK/USDC"];
const MARKET_TYPES: MarketType[] = ["spot", "perpetual"];
const SIDES: TradeSide[] = ["long", "short"];
const ORDER_TYPES: OrderType[] = ["market", "limit"];

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomFloat(min, max));
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generateTxSignature(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 88; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateMockTrades(count: number = 100): Trade[] {
  const trades: Trade[] = [];
  const now = Date.now();
  const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const side = randomChoice(SIDES);
    const marketType = randomChoice(MARKET_TYPES);
    const symbol = randomChoice(SYMBOLS);
    const status = i < count * 0.1 ? "open" : "closed";
    const entryPrice = randomFloat(10, 200);
    const exitPrice =
      status === "closed"
        ? entryPrice * (1 + randomFloat(-0.15, 0.2) * (side === "long" ? 1 : -1))
        : undefined;
    const quantity = randomFloat(0.1, 10);
    const leverage = marketType === "perpetual" ? randomInt(1, 10) : undefined;
    const entryTime = new Date(randomInt(threeMonthsAgo, now));
    const exitTime =
      status === "closed"
        ? new Date(entryTime.getTime() + randomInt(60000, 86400000 * 3))
        : undefined;

    let pnl: number | undefined;
    let pnlPercentage: number | undefined;

    if (status === "closed" && exitPrice) {
      const priceChange = exitPrice - entryPrice;
      pnl =
        side === "long"
          ? priceChange * quantity * (leverage || 1)
          : -priceChange * quantity * (leverage || 1);
      pnlPercentage = (pnl / (entryPrice * quantity)) * 100;
    }

    const makerFee = quantity * entryPrice * 0.0002;
    const takerFee = quantity * entryPrice * 0.0005;
    const fundingFee = marketType === "perpetual" ? randomFloat(-5, 5) : undefined;

    trades.push({
      id: generateId(),
      txSignature: generateTxSignature(),
      symbol,
      marketType,
      side,
      orderType: randomChoice(ORDER_TYPES),
      status,
      entryPrice,
      exitPrice,
      quantity,
      leverage,
      entryTime,
      exitTime,
      pnl,
      pnlPercentage,
      fees: {
        makerFee,
        takerFee,
        fundingFee,
        totalFee: makerFee + takerFee + (fundingFee || 0),
      },
      notes: Math.random() > 0.7 ? "Sample trade note" : undefined,
      tags: Math.random() > 0.6 ? ["swing", "breakout"] : undefined,
    });
  }

  return trades.sort(
    (a, b) => b.entryTime.getTime() - a.entryTime.getTime()
  );
}

export function generateMockPositions(): Position[] {
  const positions: Position[] = [];
  const symbols = ["SOL/USDC", "ETH/USDC"];

  for (const symbol of symbols) {
    const side = randomChoice(SIDES);
    const marketType = randomChoice(MARKET_TYPES);
    const entryPrice = randomFloat(50, 150);
    const currentPrice = entryPrice * (1 + randomFloat(-0.1, 0.15));
    const quantity = randomFloat(0.5, 5);
    const leverage = marketType === "perpetual" ? randomInt(2, 5) : undefined;

    const priceChange = currentPrice - entryPrice;
    const unrealizedPnl =
      side === "long"
        ? priceChange * quantity * (leverage || 1)
        : -priceChange * quantity * (leverage || 1);

    positions.push({
      id: generateId(),
      symbol,
      marketType,
      side,
      entryPrice,
      currentPrice,
      quantity,
      leverage,
      unrealizedPnl,
      unrealizedPnlPercentage: (unrealizedPnl / (entryPrice * quantity)) * 100,
      margin:
        marketType === "perpetual" ? (entryPrice * quantity) / (leverage || 1) : undefined,
      liquidationPrice:
        marketType === "perpetual"
          ? side === "long"
            ? entryPrice * 0.8
            : entryPrice * 1.2
          : undefined,
      openTime: new Date(Date.now() - randomInt(3600000, 86400000 * 5)),
    });
  }

  return positions;
}

export function generateDailyPerformance(
  trades: Trade[]
): DailyPerformance[] {
  const dailyMap = new Map<string, DailyPerformance>();
  const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== undefined);

  for (const trade of closedTrades) {
    const dateKey = trade.exitTime!.toISOString().split("T")[0];
    const existing = dailyMap.get(dateKey);

    if (existing) {
      existing.pnl += trade.pnl || 0;
      existing.volume += trade.entryPrice * trade.quantity;
      existing.fees += trade.fees.totalFee;
      existing.tradeCount += 1;
      if ((trade.pnl || 0) > 0) {
        existing.winCount += 1;
      } else {
        existing.lossCount += 1;
      }
    } else {
      dailyMap.set(dateKey, {
        date: new Date(dateKey),
        pnl: trade.pnl || 0,
        cumulativePnl: 0, // Will be calculated after
        volume: trade.entryPrice * trade.quantity,
        fees: trade.fees.totalFee,
        tradeCount: 1,
        winCount: (trade.pnl || 0) > 0 ? 1 : 0,
        lossCount: (trade.pnl || 0) <= 0 ? 1 : 0,
        drawdown: 0,
        drawdownPercentage: 0,
      });
    }
  }

  // Sort by date and calculate cumulative values
  const sorted = Array.from(dailyMap.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  let cumulative = 0;
  let peak = 0;

  for (const day of sorted) {
    cumulative += day.pnl;
    day.cumulativePnl = cumulative;

    if (cumulative > peak) {
      peak = cumulative;
    }

    day.drawdown = peak - cumulative;
    day.drawdownPercentage = peak > 0 ? (day.drawdown / peak) * 100 : 0;
  }

  return sorted;
}

export function generateMockJournalEntries(): JournalEntry[] {
  const entries: JournalEntry[] = [
    {
      id: generateId(),
      date: new Date(),
      title: "Market Analysis - Bullish SOL Setup",
      content:
        "Identified a strong bullish pattern on SOL/USDC. The 4H chart shows a clear ascending triangle formation with increasing volume. Entry planned at breakout above resistance.",
      tags: ["analysis", "SOL", "bullish"],
      mood: "positive",
      lessonLearned: "Patience in waiting for confirmation pays off",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      date: new Date(Date.now() - 86400000),
      title: "Weekly Review - Risk Management",
      content:
        "This week I noticed I was over-leveraging on perp trades. Need to stick to max 3x leverage for my risk tolerance. Lost 2% of portfolio on one bad trade.",
      tags: ["review", "risk-management"],
      mood: "neutral",
      lessonLearned: "Lower leverage = longer survival in volatile markets",
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
    },
  ];

  return entries;
}
