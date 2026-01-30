/**
 * Export utilities for trading data
 * Supports CSV and PDF export formats
 */

import type { Trade, PortfolioMetrics, SymbolMetrics } from "@/types";
import { formatCurrency, formatPercentage, formatDuration, toDate } from "@/lib/utils";
import { format } from "date-fns";

/**
 * Convert trades to CSV format
 */
export function tradesToCSV(trades: Trade[]): string {
  const headers = [
    "Date",
    "Time",
    "Symbol",
    "Side",
    "Market Type",
    "Order Type",
    "Entry Price",
    "Exit Price",
    "Quantity",
    "Leverage",
    "PnL",
    "PnL %",
    "Fees",
    "Status",
    "Duration",
    "Notes",
    "Tags",
    "TX Signature",
  ];

  const rows = trades.map((trade) => {
    const entryDate = toDate(trade.entryTime);
    const exitDate = trade.exitTime ? toDate(trade.exitTime) : null;
    const duration = exitDate ? exitDate.getTime() - entryDate.getTime() : 0;

    return [
      format(entryDate, "yyyy-MM-dd"),
      format(entryDate, "HH:mm:ss"),
      trade.symbol,
      trade.side.toUpperCase(),
      trade.marketType,
      trade.orderType,
      trade.entryPrice.toFixed(4),
      trade.exitPrice?.toFixed(4) || "",
      trade.quantity.toFixed(4),
      trade.leverage || "",
      trade.pnl?.toFixed(2) || "",
      trade.pnlPercentage?.toFixed(2) || "",
      trade.fees.totalFee.toFixed(4),
      trade.status,
      duration > 0 ? formatDuration(duration) : "",
      trade.notes || "",
      trade.tags?.join(", ") || "",
      trade.txSignature,
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Convert portfolio metrics to CSV format
 */
export function metricsToCSV(metrics: PortfolioMetrics, symbolMetrics: SymbolMetrics[]): string {
  const sections: string[] = [];

  // Portfolio Overview
  sections.push("PORTFOLIO OVERVIEW");
  sections.push("Metric,Value");
  sections.push(`Total PnL,${formatCurrency(metrics.totalPnl)}`);
  sections.push(`Total PnL %,${formatPercentage(metrics.totalPnlPercentage)}`);
  sections.push(`Total Volume,${formatCurrency(metrics.totalVolume)}`);
  sections.push(`Total Fees,${formatCurrency(metrics.totalFees)}`);
  sections.push(`Win Rate,${metrics.winRate.toFixed(2)}%`);
  sections.push(`Total Trades,${metrics.totalTrades}`);
  sections.push(`Winning Trades,${metrics.winningTrades}`);
  sections.push(`Losing Trades,${metrics.losingTrades}`);
  sections.push(`Average Win,${formatCurrency(metrics.averageWin)}`);
  sections.push(`Average Loss,${formatCurrency(metrics.averageLoss)}`);
  sections.push(`Largest Win,${formatCurrency(metrics.largestWin)}`);
  sections.push(`Largest Loss,${formatCurrency(metrics.largestLoss)}`);
  sections.push(`Profit Factor,${metrics.profitFactor.toFixed(2)}`);
  sections.push(`Avg Trade Duration,${formatDuration(metrics.averageTradeDuration)}`);
  sections.push(`Long/Short Ratio,${metrics.longShortRatio.toFixed(2)}`);
  sections.push(`Max Drawdown,${formatCurrency(metrics.maxDrawdown)}`);
  sections.push(`Max Drawdown %,${metrics.maxDrawdownPercentage.toFixed(2)}%`);

  sections.push("");
  sections.push("SYMBOL PERFORMANCE");
  sections.push("Symbol,PnL,Volume,Trades,Win Rate,Avg PnL,Fees");
  
  symbolMetrics.forEach((s) => {
    sections.push(
      `${s.symbol},${formatCurrency(s.pnl)},${formatCurrency(s.volume)},${s.tradeCount},${s.winRate.toFixed(2)}%,${formatCurrency(s.averagePnl)},${formatCurrency(s.fees)}`
    );
  });

  return sections.join("\n");
}

/**
 * Download a file with the given content
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export trades to CSV file
 */
export function exportTradesToCSV(trades: Trade[], filename?: string): void {
  const csv = tradesToCSV(trades);
  const date = format(new Date(), "yyyy-MM-dd");
  downloadFile(csv, filename || `deriverse-trades-${date}.csv`, "text/csv;charset=utf-8");
}

/**
 * Export analytics to CSV file
 */
export function exportAnalyticsToCSV(
  metrics: PortfolioMetrics,
  symbolMetrics: SymbolMetrics[],
  filename?: string
): void {
  const csv = metricsToCSV(metrics, symbolMetrics);
  const date = format(new Date(), "yyyy-MM-dd");
  downloadFile(csv, filename || `deriverse-analytics-${date}.csv`, "text/csv;charset=utf-8");
}

/**
 * Generate PDF content as HTML for printing
 */
export function generatePDFContent(
  trades: Trade[],
  metrics: PortfolioMetrics,
  symbolMetrics: SymbolMetrics[]
): string {
  const date = format(new Date(), "MMMM dd, yyyy");
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Deriverse Trading Report - ${date}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 40px;
      color: #1a1a1a;
      line-height: 1.5;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #10b981;
    }
    .header h1 { margin: 0; color: #10b981; }
    .header p { color: #666; margin: 5px 0 0; }
    .section { margin-bottom: 30px; }
    .section h2 {
      color: #333;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .metric-card {
      background: #f8f8f8;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .metric-card .value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    .metric-card .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th, td {
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f0f0f0;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
    }
    tr:hover { background: #fafafa; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .metrics-grid { grid-template-columns: repeat(4, 1fr); }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Deriverse Trading Report</h1>
    <p>Generated on ${date}</p>
  </div>

  <div class="section">
    <h2>Portfolio Overview</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="value ${metrics.totalPnl >= 0 ? 'positive' : 'negative'}">${formatCurrency(metrics.totalPnl)}</div>
        <div class="label">Total PnL</div>
      </div>
      <div class="metric-card">
        <div class="value">${metrics.winRate.toFixed(1)}%</div>
        <div class="label">Win Rate</div>
      </div>
      <div class="metric-card">
        <div class="value">${metrics.totalTrades}</div>
        <div class="label">Total Trades</div>
      </div>
      <div class="metric-card">
        <div class="value">${formatCurrency(metrics.totalVolume)}</div>
        <div class="label">Total Volume</div>
      </div>
      <div class="metric-card">
        <div class="value positive">${formatCurrency(metrics.largestWin)}</div>
        <div class="label">Largest Win</div>
      </div>
      <div class="metric-card">
        <div class="value negative">${formatCurrency(metrics.largestLoss)}</div>
        <div class="label">Largest Loss</div>
      </div>
      <div class="metric-card">
        <div class="value">${metrics.profitFactor.toFixed(2)}</div>
        <div class="label">Profit Factor</div>
      </div>
      <div class="metric-card">
        <div class="value negative">${metrics.maxDrawdownPercentage.toFixed(1)}%</div>
        <div class="label">Max Drawdown</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Symbol Performance</h2>
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>PnL</th>
          <th>Volume</th>
          <th>Trades</th>
          <th>Win Rate</th>
          <th>Fees</th>
        </tr>
      </thead>
      <tbody>
        ${symbolMetrics.map((s) => `
          <tr>
            <td>${s.symbol}</td>
            <td class="${s.pnl >= 0 ? 'positive' : 'negative'}">${formatCurrency(s.pnl)}</td>
            <td>${formatCurrency(s.volume)}</td>
            <td>${s.tradeCount}</td>
            <td>${s.winRate.toFixed(1)}%</td>
            <td>${formatCurrency(s.fees)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Recent Trades (Last 20)</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Symbol</th>
          <th>Side</th>
          <th>Entry</th>
          <th>Exit</th>
          <th>Size</th>
          <th>PnL</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${trades.slice(0, 20).map((t) => `
          <tr>
            <td>${format(toDate(t.entryTime), 'MMM dd, HH:mm')}</td>
            <td>${t.symbol}</td>
            <td class="${t.side === 'long' ? 'positive' : 'negative'}">${t.side.toUpperCase()}</td>
            <td>${formatCurrency(t.entryPrice)}</td>
            <td>${t.exitPrice ? formatCurrency(t.exitPrice) : '-'}</td>
            <td>${t.quantity.toFixed(4)}</td>
            <td class="${(t.pnl || 0) >= 0 ? 'positive' : 'negative'}">${t.pnl ? formatCurrency(t.pnl) : '-'}</td>
            <td>${t.status}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Generated by Deriverse Analytics • Powered by Solana</p>
  </div>
</body>
</html>
  `;
}

/**
 * Export report as PDF (opens print dialog)
 */
export function exportToPDF(
  trades: Trade[],
  metrics: PortfolioMetrics,
  symbolMetrics: SymbolMetrics[]
): void {
  const htmlContent = generatePDFContent(trades, metrics, symbolMetrics);
  const printWindow = window.open("", "_blank");
  
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
