import { createContext, useContext, type ReactNode } from 'react';
import { useFinancialData, type UseFinancialDataReturn } from '../hooks/useFinancialData';

const FinancialDataContext = createContext<UseFinancialDataReturn | null>(null);

interface FinancialDataProviderProps {
  children: ReactNode;
}

export function FinancialDataProvider({ children }: FinancialDataProviderProps) {
  const value = useFinancialData();
  return (
    <FinancialDataContext.Provider value={value}>
      {children}
    </FinancialDataContext.Provider>
  );
}

export function useFinancialDataContext(): UseFinancialDataReturn {
  const ctx = useContext(FinancialDataContext);
  if (!ctx) {
    throw new Error('useFinancialDataContext must be used inside <FinancialDataProvider>');
  }
  return ctx;
}
