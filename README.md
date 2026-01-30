# Deriverse Analytics 📊

**Professional Trading Analytics Dashboard for Deriverse DEX**

Built for the Deriverse Hackathon - A comprehensive trading analytics solution including a professional trading journal and portfolio analysis for active traders on Solana.

![Deriverse Analytics](https://img.shields.io/badge/Solana-Devnet-9945FF?style=flat-square&logo=solana)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)

## 🚀 Features

### Dashboard Overview
- **Real-time PnL Tracking** - Cumulative and daily profit/loss visualization
- **Volume & Fee Analysis** - Track trading volume and fee breakdown by symbol
- **Win Rate Statistics** - Win/loss ratio with detailed trade outcome analysis
- **Trade Duration Metrics** - Average holding time and trade efficiency analysis

### Advanced Analytics
- **Long/Short Ratio Analysis** - Directional bias visualization
- **Largest Gain/Loss Tracking** - Risk management insights
- **Drawdown Visualization** - Maximum drawdown percentage over time
- **Time-Based Performance** - Hourly and session-based analytics (Asian/European/American markets)

### Portfolio Management
- **Open Positions Monitoring** - Live position tracking with unrealized PnL
- **Symbol Performance** - Per-asset performance breakdown
- **Portfolio Allocation** - Visual allocation across trading pairs

### Trading Journal
- **Trade Annotations** - Add notes, moods, and lessons to trades
- **Tag System** - Categorize trades with custom tags
- **Lessons Learned** - Track and learn from past trading decisions

### Data Filtering
- **Symbol Filtering** - Filter by specific trading pairs
- **Date Range Selection** - Customizable time periods
- **Order Type Analysis** - Market vs limit order performance

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with dark theme
- **Charts**: [Recharts](https://recharts.org)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs) with persistence
- **Tables**: [TanStack Table](https://tanstack.com/table)
- **Icons**: [Lucide React](https://lucide.dev)
- **Blockchain**: [Solana Web3.js v2](https://github.com/solana-labs/solana-web3.js)
- **DEX SDK**: [@deriverse/kit](https://www.npmjs.com/package/@deriverse/kit)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/deriverse-analytics.git
cd deriverse-analytics

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main dashboard
│   ├── analytics/         # Advanced analytics page
│   ├── fees/              # Fee analysis page
│   ├── history/           # Trade history page
│   ├── journal/           # Trading journal page
│   ├── performance/       # Performance metrics page
│   ├── portfolio/         # Portfolio overview page
│   └── settings/          # Settings page
├── components/
│   ├── charts/            # Recharts visualizations
│   ├── dashboard/         # Dashboard feature components
│   ├── layout/            # Sidebar and Header
│   └── ui/                # Reusable UI primitives
├── lib/
│   ├── analytics.ts       # Metrics calculation functions
│   ├── mock-data.ts       # Demo data generators
│   └── utils.ts           # Utility functions
├── store/
│   └── trading-store.ts   # Zustand global state
└── types/
    ├── index.ts           # Core TypeScript types
    └── deriverse.ts       # Deriverse-specific types
```

## 📊 Analytics Calculations

The dashboard includes comprehensive analytics calculations:

- **Portfolio Metrics**: Total PnL, win rate, profit factor, Sharpe ratio
- **Time-Based Metrics**: Hourly, daily, and session performance
- **Fee Breakdown**: Fees by symbol and cumulative fee tracking
- **Drawdown Analysis**: Maximum drawdown percentage and recovery time
- **Risk Metrics**: Risk-reward ratio, average win/loss sizing

## 🔗 Deriverse Integration

This dashboard is built for [Deriverse](https://deriverse.gitbook.io/deriverse-v1), a Solana-based DEX supporting:

- **Spot Trading**: Direct token swaps
- **Perpetual Futures**: Leveraged perpetual contracts
- **Program ID**: `Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu`
- **Network**: Solana Devnet

## 🎨 Screenshots

The dashboard features a modern dark theme optimized for trading:

- Clean, professional interface
- High-contrast color scheme for readability
- Responsive design for desktop use
- Intuitive navigation sidebar

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel
vercel
```

### Docker

```bash
docker build -t deriverse-analytics .
docker run -p 3000:3000 deriverse-analytics
```

## 📝 Hackathon Submission

This project was built for the **Deriverse Hackathon** with the goal of creating:

> "A comprehensive trading analytics solution for Deriverse, including a professional trading journal and portfolio analysis for active traders."

### Features Implemented

- ✅ Total PnL tracking
- ✅ Volume and fee analysis
- ✅ Win rate statistics
- ✅ Trade duration calculations
- ✅ Long/short ratio analysis
- ✅ Largest gain/loss tracking
- ✅ Symbol filtering
- ✅ Date range selection
- ✅ Historical PnL charts
- ✅ Drawdown visualization
- ✅ Time-based performance metrics
- ✅ Trade history with annotations
- ✅ Fee breakdown analysis
- ✅ Order type analysis

## 📚 Resources

- [Deriverse Documentation](https://deriverse.gitbook.io/deriverse-v1)
- [Deriverse SDK Example](https://github.com/deriverse/kit-example)
- [@deriverse/kit on NPM](https://www.npmjs.com/package/@deriverse/kit)
- [Deriverse Discord](https://discord.gg/gSGV5wr8)

## 📄 License

MIT License - feel free to use this project as a starting point for your own trading analytics solutions.

---

**Built with ❤️ for the Deriverse Hackathon**
