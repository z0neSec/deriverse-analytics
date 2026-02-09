# Deriverse Analytics

**Professional Trading Analytics Dashboard for Deriverse DEX**

Built for the Deriverse Hackathon - A comprehensive trading analytics solution including a professional trading journal and portfolio analysis for active traders on Solana.

![Deriverse Analytics](https://img.shields.io/badge/Solana-Devnet-9945FF?style=flat-square&logo=solana)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)

---

## 🎯 Overview

Deriverse Analytics is a professional-grade trading analytics dashboard that connects directly to your Solana wallet and fetches real trading data from the Deriverse DEX. It provides comprehensive analytics, portfolio tracking, and journaling capabilities for active traders.

### Key Highlights

- **Real Blockchain Data** - Fetches actual transaction history from Solana
- **Live Price Updates** - Real-time price feeds with CoinGecko fallback
- **Position Tracking** - Monitor open positions with unrealized PnL
- **Professional Analytics** - Win rate, drawdown, session analysis, and more
- **Trading Journal** - Document and learn from your trades

---

## 📸 Screenshots

### Dashboard
The main dashboard provides an at-a-glance view of your trading performance with key metrics, PnL charts, and open positions.

![Dashboard Screenshot](./screenshots/dashboard.png)

*Dashboard showing total PnL, win rate, volume metrics, cumulative PnL chart, and performance by symbol*

---

### Portfolio Overview
Track your portfolio allocation, total trading volume, and position distribution across different assets.

![Portfolio Screenshot](./screenshots/portfolio.png)

*Portfolio page with trading volume stats, open positions, allocation breakdown, and cumulative PnL*

---

### Trade History
Complete history of all trades with filtering, sorting, and the ability to export data.

![Trade History Screenshot](./screenshots/history.png)

*Trade history table with date, symbol, side, entry/exit prices, PnL, and export options*

---

### Analytics
Deep dive into your trading patterns with time-based analysis, weekday performance, and advanced metrics.

![Analytics Screenshot](./screenshots/analytics.png)

*Analytics page showing hourly performance heatmap, weekday analysis, long/short ratio, and radar charts*

---

### Performance Analysis
Detailed performance metrics including session-based analysis (Asian/European/American markets) and order type breakdown.

![Performance Screenshot](./screenshots/performance.png)

*Performance page with cumulative PnL, drawdown chart, hourly performance, and session metrics*

---

### Fee Analysis
Track your trading fees over time with detailed breakdown by type (maker, taker, funding).

![Fees Screenshot](./screenshots/fees.png)

*Fee analysis with total fees, cumulative fee chart, and fee composition breakdown*

---

### Trading Journal
Document your trades with notes, mood tracking, tags, and lessons learned.

![Journal Screenshot](./screenshots/journal.png)

*Trading journal with trade annotations, mood indicators, custom tags, and lesson tracking*

---

### Settings
Configure your dashboard preferences and wallet settings.

![Settings Screenshot](./screenshots/settings.png)

*Settings page with wallet info, display preferences, and data management options*

---

## ✨ Features

### Dashboard Overview
- **Real-time PnL Tracking** - Cumulative and daily profit/loss visualization
- **Volume & Fee Analysis** - Track trading volume and fee breakdown by symbol
- **Win Rate Statistics** - Win/loss ratio with detailed trade outcome analysis
- **Trade Duration Metrics** - Average holding time and trade efficiency analysis
- **Open Positions** - Live position monitoring with unrealized PnL

### Advanced Analytics
- **Long/Short Ratio Analysis** - Directional bias visualization
- **Largest Gain/Loss Tracking** - Risk management insights
- **Drawdown Visualization** - Maximum drawdown percentage over time
- **Time-Based Performance** - Hourly and session-based analytics
- **Weekday Analysis** - Performance patterns by day of week

### Portfolio Management
- **Open Positions Monitoring** - Live position tracking with unrealized PnL
- **Symbol Performance** - Per-asset performance breakdown
- **Portfolio Allocation** - Visual allocation across trading pairs
- **Position Derivation** - Automatic position tracking from open trades

### Trading Journal
- **Trade Annotations** - Add notes, moods, and lessons to trades
- **Tag System** - Categorize trades with custom tags
- **Lessons Learned** - Track and learn from past trading decisions
- **Mood Tracking** - Record emotional state during trades

### Data Export
- **CSV Export** - Export trade history to CSV format
- **PDF Reports** - Generate professional PDF reports with charts
- **Filtered Exports** - Export only filtered/selected data

### Timeframe Filtering
- **Quick Filters** - 1D, 1W, 1M, 3M, 1Y, ALL
- **Symbol Filtering** - Filter by specific trading pairs
- **Side Filtering** - Long/Short position filtering
- **Status Filtering** - Open/Closed trade filtering

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16](https://nextjs.org) with App Router |
| **Language** | [TypeScript 5](https://www.typescriptlang.org) |
| **UI Framework** | [React 19](https://react.dev) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) with dark theme |
| **Charts** | [Recharts](https://recharts.org) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs) with persistence |
| **Tables** | [TanStack Table](https://tanstack.com/table) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Wallet Adapter** | [@solana/wallet-adapter-react](https://github.com/solana-labs/wallet-adapter) |
| **Blockchain** | [Solana Web3.js](https://github.com/solana-labs/solana-web3.js) |
| **DEX SDK** | [@deriverse/kit](https://www.npmjs.com/package/@deriverse/kit) |
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/) |

---

## 🏗 Architecture

### Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Solana Wallet  │────▶│  Wallet Adapter  │────▶│  Trading Store  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Solana RPC     │◀────│   API Routes     │◀────│ Deriverse Svc   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                ▼
                   ┌───────────────────────┐
                   │  Transaction Parsing  │
                   │  - Balance Changes    │
                   │  - Log Messages       │
                   │  - Trade Derivation   │
                   └───────────────────────┘
```

### SDK Fallback System

The app implements a robust fallback system when the Deriverse SDK encounters issues:

1. **Primary**: Deriverse SDK (@deriverse/kit)
2. **Fallback**: Direct Solana RPC calls
3. **Price Fallback**: CoinGecko API for live prices

```typescript
// Example: Position derivation when SDK fails
if (sdkFailed && positions.length === 0 && cachedTrades.length > 0) {
  const openTrades = cachedTrades.filter(t => t.status === 'open');
  // Derive positions from open trades...
}
```

---

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx               # Main dashboard
│   ├── analytics/             # Advanced analytics page
│   ├── api/deriverse/         # API route for SDK/RPC calls
│   ├── fees/                  # Fee analysis page
│   ├── history/               # Trade history page
│   ├── journal/               # Trading journal page
│   ├── performance/           # Performance metrics page
│   ├── portfolio/             # Portfolio overview page
│   └── settings/              # Settings page
├── components/
│   ├── charts/                # Recharts visualizations
│   │   ├── pnl-chart.tsx
│   │   ├── drawdown-chart.tsx
│   │   ├── hourly-performance-chart.tsx
│   │   ├── long-short-chart.tsx
│   │   ├── win-loss-chart.tsx
│   │   └── fee-chart.tsx
│   ├── dashboard/             # Dashboard feature components
│   │   ├── metrics-grid.tsx
│   │   ├── open-positions.tsx
│   │   ├── symbol-performance.tsx
│   │   ├── trade-history-table.tsx
│   │   └── filter-bar.tsx
│   ├── layout/                # Sidebar and Header
│   ├── providers/             # Context providers
│   │   └── wallet-provider.tsx
│   └── ui/                    # Reusable UI primitives
├── lib/
│   ├── analytics.ts           # Metrics calculation functions
│   ├── deriverse-service.ts   # Deriverse SDK/RPC integration
│   ├── export.ts              # CSV/PDF export utilities
│   └── utils.ts               # Utility functions
├── store/
│   ├── trading-store.ts       # Zustand global state
│   └── ui-store.ts            # UI state management
└── types/
    ├── index.ts               # Core TypeScript types
    └── deriverse.ts           # Deriverse-specific types
```

---

## 🔧 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Solana wallet (Phantom, Solflare, etc.)

### Setup

```bash
# Clone the repository
git clone https://github.com/z0neSec/deriverse-analytics.git
cd deriverse-analytics

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

---

## 📊 Analytics Calculations

The dashboard includes comprehensive analytics calculations:

### Portfolio Metrics
- **Total PnL** - Sum of all realized profits and losses
- **Win Rate** - Percentage of profitable trades
- **Profit Factor** - Gross profit / Gross loss ratio
- **Average Win/Loss** - Mean profit per winning/losing trade
- **Max Drawdown** - Largest peak-to-trough decline

### Time-Based Metrics
- **Hourly Performance** - PnL aggregated by hour of day
- **Session Performance** - Asian (00:00-08:00), European (08:00-16:00), American (16:00-00:00)
- **Weekday Analysis** - Performance patterns by day of week

### Trade Metrics
- **Trade Duration** - Average time from entry to exit
- **Long/Short Ratio** - Directional bias analysis
- **Order Type Performance** - Market vs limit order comparison

---

## 🔗 Deriverse Integration

This dashboard is built for [Deriverse](https://deriverse.gitbook.io/deriverse-v1), a Solana-based DEX supporting:

| Feature | Details |
|---------|---------|
| **Spot Trading** | Direct token swaps |
| **Perpetual Futures** | Leveraged perpetual contracts |
| **Program ID** | `Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu` |
| **Network** | Solana Devnet |
| **Exchange** | [alpha.deriverse.io](https://alpha.deriverse.io) |

### Supported Features
- ✅ Wallet connection via Solana Wallet Adapter
- ✅ Real transaction history fetching
- ✅ Position tracking and PnL calculation
- ✅ Live price feeds (SDK + CoinGecko fallback)
- ✅ Trade parsing from on-chain data

---

## 🚀 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/z0neSec/deriverse-analytics)

```bash
npm run build
vercel
```

### Docker

```bash
docker build -t deriverse-analytics .
docker run -p 3000:3000 deriverse-analytics
```

### Environment Variables

No environment variables are required for basic functionality. The app uses public Solana RPC endpoints.

Optional:
```env
# Custom Solana RPC (faster/more reliable)
NEXT_PUBLIC_SOLANA_RPC_URL=https://your-rpc-endpoint.com
```

---

## 🏆 Hackathon Submission

This project was built for the **Deriverse Hackathon** with the goal of creating:

> "A comprehensive trading analytics solution for Deriverse, including a professional trading journal and portfolio analysis for active traders"

### Features Implemented

- [x] Real-time wallet connection
- [x] Live transaction history from Solana
- [x] Total PnL tracking with cumulative charts
- [x] Volume and fee analysis
- [x] Win rate statistics
- [x] Trade duration calculations
- [x] Long/short ratio analysis
- [x] Largest gain/loss tracking
- [x] Open position monitoring
- [x] Position derivation from trades
- [x] Symbol filtering
- [x] Timeframe selection (1D/1W/1M/3M/1Y/ALL)
- [x] Historical PnL charts
- [x] Drawdown visualization
- [x] Hourly performance heatmap
- [x] Session-based analytics
- [x] Trade history with sorting/filtering
- [x] Trading journal with notes
- [x] Fee breakdown analysis
- [x] CSV/PDF export
- [x] Real-time price updates
- [x] SDK fallback to direct RPC

### Technical Achievements

- **Robust SDK Fallback** - Graceful degradation when SDK fails
- **Direct RPC Integration** - Parse transactions directly from Solana
- **Position Derivation** - Infer positions from open trades
- **Real-time Updates** - 30-second PnL refresh cycle
- **Type-Safe** - Full TypeScript coverage

---

## 📚 Resources

- [Deriverse Documentation](https://deriverse.gitbook.io/deriverse-v1)
- [Deriverse SDK Example](https://github.com/deriverse/kit-example)
- [@deriverse/kit on NPM](https://www.npmjs.com/package/@deriverse/kit)
- [Deriverse Discord](https://discord.gg/gSGV5wr8)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this project as a starting point for your own trading analytics solutions.

---

## 👨‍💻 Author

Built with ❤️ for the **Deriverse Hackathon**

---

<p align="center">
  <img src="https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana" alt="Solana" />
  <img src="https://img.shields.io/badge/Deriverse-DEX-00D1B2?style=for-the-badge" alt="Deriverse" />
  <img src="https://img.shields.io/badge/Built_for-Hackathon-FF6B6B?style=for-the-badge" alt="Hackathon" />
</p>
