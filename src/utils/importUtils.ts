import type {
  FinancialData,
  PortfolioHolding,
  MonthlyBudget,
  SavingsGoal,
  DebtAccount,
  NetWorthSnapshot,
} from '../types/finance';
import {
  csvToPortfolio,
  csvToBudget,
  csvToGoals,
  csvToDebt,
  csvToNetWorth,
} from './csvUtils';

// Strip a leading UTF-8 BOM if present
function stripBOM(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(stripBOM((e.target?.result as string) ?? ''));
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file, 'utf-8');
  });
}

// ── Section auto-detection from CSV headers ───────────────────────────────────

type CSVSection = 'portfolio' | 'budget' | 'goals' | 'debt' | 'networth';

function detectCSVSection(csv: string): CSVSection | null {
  const firstLine = csv.split(/\r?\n/)[0].toLowerCase();
  if (firstLine.includes('ticker')) return 'portfolio';
  if (firstLine.includes('totalassets')) return 'networth';
  if (firstLine.includes('targetamount')) return 'goals';
  if (firstLine.includes('minimumpayment')) return 'debt';
  if (firstLine.includes('income') && firstLine.includes('month')) return 'budget';
  return null;
}

// ── Import result types ───────────────────────────────────────────────────────

export type ImportResult =
  | { ok: true; type: 'json'; data: FinancialData }
  | { ok: true; type: 'csv'; section: CSVSection; data: PortfolioHolding[] | MonthlyBudget[] | SavingsGoal[] | DebtAccount[] | NetWorthSnapshot[] }
  | { ok: false; error: string };

// ── JSON Import ───────────────────────────────────────────────────────────────

export async function importJSON(file: File): Promise<ImportResult> {
  try {
    const text = await readFileAsText(file);
    const parsed = JSON.parse(text) as FinancialData;
    // Basic shape check
    if (
      !Array.isArray(parsed.portfolio) ||
      !Array.isArray(parsed.budget) ||
      !Array.isArray(parsed.savingsGoals) ||
      !Array.isArray(parsed.debt) ||
      !Array.isArray(parsed.netWorth)
    ) {
      return { ok: false, error: 'JSON structure is invalid. Expected keys: portfolio, budget, savingsGoals, debt, netWorth.' };
    }
    return { ok: true, type: 'json', data: parsed };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to parse JSON file.' };
  }
}

// ── CSV Import ────────────────────────────────────────────────────────────────

export async function importCSV(file: File): Promise<ImportResult> {
  try {
    const text = await readFileAsText(file);
    const section = detectCSVSection(text);
    if (!section) {
      return { ok: false, error: 'Could not detect section from CSV headers. Make sure column names match the expected format.' };
    }
    let data: PortfolioHolding[] | MonthlyBudget[] | SavingsGoal[] | DebtAccount[] | NetWorthSnapshot[];
    switch (section) {
      case 'portfolio': data = csvToPortfolio(text); break;
      case 'budget':    data = csvToBudget(text); break;
      case 'goals':     data = csvToGoals(text); break;
      case 'debt':      data = csvToDebt(text); break;
      case 'networth':  data = csvToNetWorth(text); break;
    }
    return { ok: true, type: 'csv', section, data };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to parse CSV file.' };
  }
}
