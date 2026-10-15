import type { FinancialData } from '../types/finance';
import {
  portfolioToCSV,
  budgetToCSV,
  goalsToCSV,
  debtToCSV,
  netWorthToCSV,
} from './csvUtils';

// ── Helpers ──────────────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const BOM = '\uFEFF'; // UTF-8 BOM — makes Excel on Windows/macOS open CSVs correctly

// ── JSON Export ───────────────────────────────────────────────────────────────

export function exportAllAsJSON(data: FinancialData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, 'financial-data.json');
}

// ── CSV Export ────────────────────────────────────────────────────────────────

function exportCSV(csv: string, filename: string, delay: number): void {
  setTimeout(() => {
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, filename);
  }, delay);
}

export function exportAllAsCSV(data: FinancialData): void {
  exportCSV(portfolioToCSV(data.portfolio), 'portfolio.csv', 0);
  exportCSV(budgetToCSV(data.budget), 'budget.csv', 200);
  exportCSV(goalsToCSV(data.savingsGoals), 'goals.csv', 400);
  exportCSV(debtToCSV(data.debt), 'debt.csv', 600);
  exportCSV(netWorthToCSV(data.netWorth), 'networth.csv', 800);
}
