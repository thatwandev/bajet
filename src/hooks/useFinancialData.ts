import { useState, useCallback } from 'react';
import type {
  FinancialData,
  PortfolioHolding,
  MonthlyBudget,
  SavingsGoal,
  DebtAccount,
  NetWorthSnapshot,
} from '../types/finance';
import { SAMPLE_DATA } from '../data/sampleData';

const STORAGE_KEY = 'financial-dashboard-data';

function loadFromStorage(): FinancialData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as FinancialData;
    }
  } catch {
    // corrupted data — fall through to sample data
  }
  return SAMPLE_DATA;
}

function persist(data: FinancialData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export interface UseFinancialDataReturn {
  data: FinancialData;
  // Convenience flat accessors (same reference as data.*)
  portfolio: PortfolioHolding[];
  budget: MonthlyBudget[];
  savingsGoals: SavingsGoal[];
  debt: DebtAccount[];
  netWorth: NetWorthSnapshot[];
  setPortfolio: (holdings: PortfolioHolding[]) => void;
  setBudget: (budget: MonthlyBudget[]) => void;
  setSavingsGoals: (goals: SavingsGoal[]) => void;
  setDebt: (debt: DebtAccount[]) => void;
  setNetWorth: (snapshots: NetWorthSnapshot[]) => void;
  resetToSampleData: () => void;
}

export function useFinancialData(): UseFinancialDataReturn {
  const [data, setData] = useState<FinancialData>(loadFromStorage);

  const update = useCallback((next: FinancialData) => {
    persist(next);
    setData(next);
  }, []);

  const setPortfolio = useCallback(
    (portfolio: PortfolioHolding[]) => update({ ...data, portfolio }),
    [data, update],
  );

  const setBudget = useCallback(
    (budget: MonthlyBudget[]) => update({ ...data, budget }),
    [data, update],
  );

  const setSavingsGoals = useCallback(
    (savingsGoals: SavingsGoal[]) => update({ ...data, savingsGoals }),
    [data, update],
  );

  const setDebt = useCallback(
    (debt: DebtAccount[]) => update({ ...data, debt }),
    [data, update],
  );

  const setNetWorth = useCallback(
    (netWorth: NetWorthSnapshot[]) => update({ ...data, netWorth }),
    [data, update],
  );

  const resetToSampleData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData(SAMPLE_DATA);
  }, []);

  return {
    data,
    portfolio: data.portfolio,
    budget: data.budget,
    savingsGoals: data.savingsGoals,
    debt: data.debt,
    netWorth: data.netWorth,
    setPortfolio,
    setBudget,
    setSavingsGoals,
    setDebt,
    setNetWorth,
    resetToSampleData,
  };
}
