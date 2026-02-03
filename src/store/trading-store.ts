import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Trade,
  Position,
  PortfolioMetrics,
  FilterOptions,
  JournalEntry,
  DailyPerformance,
  Instrument,
} from "@/types";

interface TradingState {
  // Wallet & Connection
  isConnected: boolean;
  walletAddress: string | null;
  clientId: number | null;

  // Trading Data
  trades: Trade[];
  positions: Position[];
  instruments: Map<number, Instrument>;

  // Computed Metrics
  metrics: PortfolioMetrics | null;
  dailyPerformance: DailyPerformance[];

  // Filters
  filters: FilterOptions;

  // Journal
  journalEntries: JournalEntry[];

  // UI State
  isLoading: boolean;
  error: string | null;
  selectedTimeframe: "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

  // Actions
  setConnected: (connected: boolean, address?: string) => void;
  setClientId: (clientId: number | null) => void;
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  setPositions: (positions: Position[]) => void;
  setMetrics: (metrics: PortfolioMetrics) => void;
  setDailyPerformance: (performance: DailyPerformance[]) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTimeframe: (timeframe: "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL") => void;
  clearData: () => void;
}

const defaultFilters: FilterOptions = {
  dateRange: {
    start: null,
    end: null,
  },
  symbols: [],
  marketTypes: [],
  sides: [],
  status: [],
};

const defaultMetrics: PortfolioMetrics = {
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

export const useTradingStore = create<TradingState>()(
  persist(
    (set) => ({
      // Initial State
      isConnected: false,
      walletAddress: null,
      clientId: null,
      trades: [],
      positions: [],
      instruments: new Map(),
      metrics: null,
      dailyPerformance: [],
      filters: defaultFilters,
      journalEntries: [],
      isLoading: false,
      error: null,
      selectedTimeframe: "1M",

      // Actions
      setConnected: (connected, address) =>
        set({
          isConnected: connected,
          walletAddress: address || null,
          // Clear trading data when disconnecting to ensure fresh state
          ...(connected ? {} : { trades: [], positions: [], metrics: null, dailyPerformance: [] }),
        }),

      setClientId: (clientId) => set({ clientId }),

      setTrades: (trades) => set({ trades }),

      addTrade: (trade) =>
        set((state) => ({
          trades: [trade, ...state.trades],
        })),

      updateTrade: (id, updates) =>
        set((state) => ({
          trades: state.trades.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      setPositions: (positions) => set({ positions }),

      setMetrics: (metrics) => set({ metrics }),

      setDailyPerformance: (performance) =>
        set({ dailyPerformance: performance }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      addJournalEntry: (entry) =>
        set((state) => ({
          journalEntries: [entry, ...state.journalEntries],
        })),

      updateJournalEntry: (id, updates) =>
        set((state) => ({
          journalEntries: state.journalEntries.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
          ),
        })),

      deleteJournalEntry: (id) =>
        set((state) => ({
          journalEntries: state.journalEntries.filter((e) => e.id !== id),
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      setTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),

      clearData: () =>
        set({
          trades: [],
          positions: [],
          metrics: null,
          dailyPerformance: [],
          isConnected: false,
          walletAddress: null,
        }),
    }),
    {
      name: "deriverse-trading-store",
      // Only persist journal entries, filters, and timeframe - NOT trades/positions
      // Trades and positions should be fetched fresh on each wallet connection
      partialize: (state) => ({
        journalEntries: state.journalEntries,
        filters: state.filters,
        selectedTimeframe: state.selectedTimeframe,
      }),
      // Skip hydration to avoid SSR mismatch issues
      skipHydration: true,
    }
  )
);

// Hydrate on client side only
if (typeof window !== 'undefined') {
  useTradingStore.persist.rehydrate();
}
