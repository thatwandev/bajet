export interface PortfolioHolding {
  id: string;
  ticker: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
}

export interface ExpenseCategories {
  rent: number;
  food: number;
  transport: number;
  entertainment: number;
  savings: number;
}

export interface MonthlyBudget {
  id: string;
  month: string; // e.g. "2024-07"
  income: number;
  expenses: ExpenseCategories;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface DebtAccount {
  id: string;
  name: string;
  balance: number;
  interestRate: number;  // decimal, e.g. 0.19 = 19%
  minimumPayment: number;
}

export interface NetWorthSnapshot {
  id: string;
  month: string; // e.g. "2024-07"
  totalAssets: number;
  totalLiabilities: number;
}

export interface FinancialData {
  portfolio: PortfolioHolding[];
  budget: MonthlyBudget[];
  savingsGoals: SavingsGoal[];
  debt: DebtAccount[];
  netWorth: NetWorthSnapshot[];
}
