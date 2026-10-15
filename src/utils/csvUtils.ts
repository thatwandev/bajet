import type {
  PortfolioHolding,
  MonthlyBudget,
  SavingsGoal,
  DebtAccount,
  NetWorthSnapshot,
} from '../types/finance';

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseLine(line: string): string[] {
  // Simple CSV parser — handles quoted fields with commas
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function toNum(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ── Portfolio ────────────────────────────────────────────────────────────────

export function portfolioToCSV(data: PortfolioHolding[]): string {
  const header = 'ticker,quantity,avgCost,currentPrice';
  const rows = data.map(
    (h) => `${h.ticker},${h.quantity},${h.avgCost},${h.currentPrice}`
  );
  return [header, ...rows].join('\r\n');
}

export function csvToPortfolio(csv: string): PortfolioHolding[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');
  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
  const required = ['ticker', 'quantity', 'avgcost', 'currentprice'];
  for (const r of required) {
    if (!headers.includes(r)) throw new Error(`Missing required column: ${r}`);
  }
  return lines.slice(1).map((line) => {
    const cols = parseLine(line);
    const get = (name: string) => cols[headers.indexOf(name)] ?? '';
    return {
      id: generateId(),
      ticker: get('ticker').toUpperCase(),
      quantity: toNum(get('quantity')),
      avgCost: toNum(get('avgcost')),
      currentPrice: toNum(get('currentprice')),
    };
  });
}

// ── Budget ───────────────────────────────────────────────────────────────────

export function budgetToCSV(data: MonthlyBudget[]): string {
  const header = 'month,income,rent,food,transport,entertainment,savings';
  const rows = data.map(
    (b) =>
      `${b.month},${b.income},${b.expenses.rent},${b.expenses.food},${b.expenses.transport},${b.expenses.entertainment},${b.expenses.savings}`
  );
  return [header, ...rows].join('\r\n');
}

export function csvToBudget(csv: string): MonthlyBudget[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');
  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
  const required = ['month', 'income', 'rent', 'food', 'transport', 'entertainment', 'savings'];
  for (const r of required) {
    if (!headers.includes(r)) throw new Error(`Missing required column: ${r}`);
  }
  return lines.slice(1).map((line) => {
    const cols = parseLine(line);
    const get = (name: string) => cols[headers.indexOf(name)] ?? '0';
    return {
      id: generateId(),
      month: get('month'),
      income: toNum(get('income')),
      expenses: {
        rent: toNum(get('rent')),
        food: toNum(get('food')),
        transport: toNum(get('transport')),
        entertainment: toNum(get('entertainment')),
        savings: toNum(get('savings')),
      },
    };
  });
}

// ── Savings Goals ────────────────────────────────────────────────────────────

export function goalsToCSV(data: SavingsGoal[]): string {
  const header = 'name,targetAmount,currentAmount';
  const rows = data.map((g) => `${g.name},${g.targetAmount},${g.currentAmount}`);
  return [header, ...rows].join('\r\n');
}

export function csvToGoals(csv: string): SavingsGoal[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');
  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
  const required = ['name', 'targetamount', 'currentamount'];
  for (const r of required) {
    if (!headers.includes(r)) throw new Error(`Missing required column: ${r}`);
  }
  return lines.slice(1).map((line) => {
    const cols = parseLine(line);
    const get = (name: string) => cols[headers.indexOf(name)] ?? '0';
    return {
      id: generateId(),
      name: get('name'),
      targetAmount: toNum(get('targetamount')),
      currentAmount: toNum(get('currentamount')),
    };
  });
}

// ── Debt ─────────────────────────────────────────────────────────────────────

export function debtToCSV(data: DebtAccount[]): string {
  const header = 'name,balance,interestRate,minimumPayment';
  const rows = data.map((d) => `${d.name},${d.balance},${d.interestRate},${d.minimumPayment}`);
  return [header, ...rows].join('\r\n');
}

export function csvToDebt(csv: string): DebtAccount[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');
  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
  const required = ['name', 'balance', 'interestrate', 'minimumpayment'];
  for (const r of required) {
    if (!headers.includes(r)) throw new Error(`Missing required column: ${r}`);
  }
  return lines.slice(1).map((line) => {
    const cols = parseLine(line);
    const get = (name: string) => cols[headers.indexOf(name)] ?? '0';
    return {
      id: generateId(),
      name: get('name'),
      balance: toNum(get('balance')),
      interestRate: toNum(get('interestrate')),
      minimumPayment: toNum(get('minimumpayment')),
    };
  });
}

// ── Net Worth ────────────────────────────────────────────────────────────────

export function netWorthToCSV(data: NetWorthSnapshot[]): string {
  const header = 'month,totalAssets,totalLiabilities';
  const rows = data.map((n) => `${n.month},${n.totalAssets},${n.totalLiabilities}`);
  return [header, ...rows].join('\r\n');
}

export function csvToNetWorth(csv: string): NetWorthSnapshot[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');
  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
  const required = ['month', 'totalassets', 'totalliabilities'];
  for (const r of required) {
    if (!headers.includes(r)) throw new Error(`Missing required column: ${r}`);
  }
  return lines.slice(1).map((line) => {
    const cols = parseLine(line);
    const get = (name: string) => cols[headers.indexOf(name)] ?? '0';
    return {
      id: generateId(),
      month: get('month'),
      totalAssets: toNum(get('totalassets')),
      totalLiabilities: toNum(get('totalliabilities')),
    };
  });
}
