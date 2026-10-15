import React from 'react';
import { useFinancialDataContext } from '../../context/FinancialDataContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const EXPENSE_KEYS = ['rent', 'food', 'transport', 'entertainment', 'savings'] as const;

const KPISummaryBar: React.FC = () => {
  const { portfolio, budget, debt, netWorth } = useFinancialDataContext();
  const totalPortfolio = portfolio.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
  const lb = budget[budget.length - 1];
  const lbExp = lb ? EXPENSE_KEYS.reduce((s, k) => s + lb.expenses[k], 0) : 0;
  const savingsRate = lb && lb.income > 0 ? ((lb.income - lbExp) / lb.income) * 100 : 0;
  const totalDebt = debt.reduce((s, d) => s + d.balance, 0);
  const lnw = netWorth[netWorth.length - 1];
  const nw = lnw ? lnw.totalAssets - lnw.totalLiabilities : 0;

  const kpis = [
    { label: 'Portfolio',    value: formatCurrency(totalPortfolio), gradient: 'linear-gradient(135deg,#4fffb0,#38bdf8)', glow: 'rgba(79,255,176,0.15)' },
    { label: 'Savings Rate', value: formatPercent(savingsRate),     gradient: 'linear-gradient(135deg,#a78bfa,#6366f1)', glow: 'rgba(167,139,250,0.15)' },
    { label: 'Total Debt',   value: formatCurrency(totalDebt),      gradient: 'linear-gradient(135deg,#ff6b6b,#ffa94d)', glow: 'rgba(255,107,107,0.15)' },
    { label: 'Net Worth',    value: formatCurrency(nw),             gradient: 'linear-gradient(135deg,#4fffb0,#a78bfa)', glow: 'rgba(79,255,176,0.15)' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 animate-rise">
      {kpis.map((k, i) => (
        <div key={k.label} className="relative rounded-2xl p-5 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', animationDelay: `${i * 0.07}s` }}>
          {/* Glow blob */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
            style={{ background: k.glow }} />
          <p className="section-label mb-3">{k.label}</p>
          <p className="text-xl sm:text-2xl font-light" style={{ fontFamily: 'var(--serif)', background: k.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {k.value}
          </p>
          <div className="mt-3 h-px w-full opacity-30" style={{ background: k.gradient }} />
        </div>
      ))}
    </div>
  );
};

export default KPISummaryBar;
