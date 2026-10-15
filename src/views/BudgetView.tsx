import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useFinancialDataContext } from '../context/FinancialDataContext';
import DataEditorPanel from '../components/common/DataEditorPanel';
import { budgetToCSV, csvToBudget } from '../utils/csvUtils';
import { formatCurrency, formatPercent } from '../utils/formatters';
import type { MonthlyBudget } from '../types/finance';

const EXP = ['rent','food','transport','entertainment','savings'] as const;
const newM = (): MonthlyBudget => ({ id: Math.random().toString(36).slice(2), month: '', income: 0, expenses: { rent:0, food:0, transport:0, entertainment:0, savings:0 } });

const BudgetView: React.FC = () => {
  const { budget, setBudget } = useFinancialDataContext();
  const [edit, setEdit] = useState<{ id: string; field: string } | null>(null);
  const [val, setVal] = useState('');

  const lb = budget[budget.length - 1];
  const lbExp = lb ? EXP.reduce((s, k) => s + lb.expenses[k], 0) : 0;
  const savingsRate = lb && lb.income > 0 ? ((lb.income - lbExp) / lb.income) * 100 : 0;
  const chartData = budget.map(b => ({ month: b.month.slice(0,7), income: b.income, expenses: EXP.reduce((s,k) => s + b.expenses[k], 0) }));

  const commit = () => {
    if (!edit) return;
    setBudget(budget.map(b => {
      if (b.id !== edit.id) return b;
      if (edit.field === 'month') return { ...b, month: val };
      if (edit.field === 'income') return { ...b, income: parseFloat(val) || 0 };
      if (EXP.includes(edit.field as typeof EXP[number])) return { ...b, expenses: { ...b.expenses, [edit.field]: parseFloat(val) || 0 } };
      return b;
    }));
    setEdit(null);
  };
  const cell = (id: string, field: string, display: string) =>
    edit?.id === id && edit?.field === field
      ? <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={commit} onKeyDown={e => e.key === 'Enter' && commit()} className="luxury-input" />
      : <span className="editable-cell" onClick={() => { setEdit({ id, field }); setVal(display.replace(/[^0-9.-]/g, '')); }}>{display}</span>;

  return (
    <div className="animate-rise">
      <div className="mb-8">
        <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 300, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.9)' }}>Budget</h1>
        <p className="section-label mt-1">Income & expenses</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { l: 'Monthly Income',   v: formatCurrency(lb?.income ?? 0), g: 'linear-gradient(135deg,#4fffb0,#38bdf8)' },
          { l: 'Monthly Expenses', v: formatCurrency(lbExp),           g: 'linear-gradient(135deg,#ff6b6b,#ffa94d)' },
          { l: 'Savings Rate',     v: formatPercent(savingsRate),       g: savingsRate >= 20 ? 'linear-gradient(135deg,#4fffb0,#a78bfa)' : 'linear-gradient(135deg,#ffa94d,#ff6b6b)' },
        ].map(k => (
          <div key={k.l} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="section-label mb-2">{k.l}</p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.3rem', fontWeight: 300, background: k.g, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{k.v}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="section-label mb-4">Income vs. Expenses</p>
        <div className="overflow-x-auto"><div style={{ minWidth: 380 }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="income" name="Income" fill="#4fffb0" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#ff6b6b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div></div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <p className="section-label">Monthly Data</p>
          <button onClick={() => setBudget([...budget, newM()])} className="btn-aurora">+ Add month</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full luxury-table">
            <thead><tr>
              <th>Month</th><th>Income</th>
              {EXP.map(k => <th key={k} style={{ textTransform: 'capitalize' }}>{k}</th>)}
              <th>Net Savings</th><th></th>
            </tr></thead>
            <tbody>
              {budget.map(b => {
                const tot = EXP.reduce((s,k) => s + b.expenses[k], 0);
                const net = b.income - tot;
                return (
                  <tr key={b.id}>
                    <td style={{ color: '#fff' }}>{cell(b.id,'month',b.month)}</td>
                    <td>{cell(b.id,'income',formatCurrency(b.income))}</td>
                    {EXP.map(k => <td key={k}>{cell(b.id,k,formatCurrency(b.expenses[k]))}</td>)}
                    <td style={{ color: net >= 0 ? '#4fffb0' : '#ff6b6b', fontWeight: 500 }}>{formatCurrency(net)}</td>
                    <td><button onClick={() => setBudget(budget.filter(x => x.id !== b.id))} style={{ color: 'rgba(255,255,255,0.2)' }} className="hover:text-red-400 transition-colors">✕</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <DataEditorPanel section="budget" data={budget} onSave={p => setBudget(p as MonthlyBudget[])} toCSV={budgetToCSV as (d: unknown[]) => string} fromCSV={csvToBudget as (s: string) => unknown[]} />
      </div>
    </div>
  );
};
export default BudgetView;
