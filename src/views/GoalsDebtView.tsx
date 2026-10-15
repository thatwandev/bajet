import React, { useState } from 'react';
import { useFinancialDataContext } from '../context/FinancialDataContext';
import DataEditorPanel from '../components/common/DataEditorPanel';
import { goalsToCSV, csvToGoals, debtToCSV, csvToDebt } from '../utils/csvUtils';
import { formatCurrency, formatPercent } from '../utils/formatters';
import type { SavingsGoal, DebtAccount } from '../types/finance';

const newGoal = (): SavingsGoal => ({ id: Math.random().toString(36).slice(2), name: 'New Goal', targetAmount: 1000, currentAmount: 0 });
const newDebt = (): DebtAccount => ({ id: Math.random().toString(36).slice(2), name: 'New Account', balance: 0, interestRate: 0.05, minimumPayment: 0 });

const GoalsDebtView: React.FC = () => {
  const { savingsGoals, setSavingsGoals, debt, setDebt } = useFinancialDataContext();
  const [editGoal, setEditGoal] = useState<{ id: string; field: keyof SavingsGoal } | null>(null);
  const [editDebt, setEditDebt] = useState<{ id: string; field: keyof DebtAccount } | null>(null);
  const [val, setVal] = useState('');
  const totalDebt = debt.reduce((s, d) => s + d.balance, 0);

  const commitGoal = () => {
    if (!editGoal) return;
    setSavingsGoals(savingsGoals.map(g => g.id !== editGoal.id ? g : editGoal.field === 'name' ? { ...g, name: val } : { ...g, [editGoal.field]: parseFloat(val) || 0 }));
    setEditGoal(null);
  };
  const commitDebt = () => {
    if (!editDebt) return;
    setDebt(debt.map(d => d.id !== editDebt.id ? d : editDebt.field === 'name' ? { ...d, name: val } : { ...d, [editDebt.field]: parseFloat(val) || 0 }));
    setEditDebt(null);
  };
  const gcell = (g: SavingsGoal, field: keyof SavingsGoal, display: string) =>
    editGoal?.id === g.id && editGoal?.field === field
      ? <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={commitGoal} onKeyDown={e => e.key === 'Enter' && commitGoal()} className="luxury-input" />
      : <span className="editable-cell" onClick={() => { setEditDebt(null); setEditGoal({ id: g.id, field }); setVal(field === 'name' ? g.name : String(g[field])); }}>{display}</span>;
  const dcell = (d: DebtAccount, field: keyof DebtAccount, display: string) =>
    editDebt?.id === d.id && editDebt?.field === field
      ? <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={commitDebt} onKeyDown={e => e.key === 'Enter' && commitDebt()} className="luxury-input" />
      : <span className="editable-cell" onClick={() => { setEditGoal(null); setEditDebt({ id: d.id, field }); setVal(field === 'name' ? d.name : String(d[field])); }}>{display}</span>;

  return (
    <div className="animate-rise space-y-6">
      <div className="mb-8">
        <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 300, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.9)' }}>Goals & Debt</h1>
        <p className="section-label mt-1">Progress & payoff</p>
      </div>

      {/* Savings Goals */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <p className="section-label">Savings Goals</p>
          <button onClick={() => setSavingsGoals([...savingsGoals, newGoal()])} className="btn-aurora">+ Add goal</button>
        </div>
        <div className="p-5 grid gap-5">
          {savingsGoals.map(g => {
            const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
            return (
              <div key={g.id}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'rgba(255,255,255,0.85)' }}>{gcell(g, 'name', g.name)}</span>
                  <div className="flex items-center gap-3">
                    <span style={{ fontFamily: 'var(--serif)', fontSize: '0.9rem', background: 'linear-gradient(135deg,#4fffb0,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{formatPercent(pct, 0)}</span>
                    <button onClick={() => setSavingsGoals(savingsGoals.filter(x => x.id !== g.id))} style={{ color: 'rgba(255,255,255,0.2)' }} className="hover:text-red-400 transition-colors text-xs">✕</button>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#4fffb0,#a78bfa)' }} />
                </div>
                <div className="flex justify-between mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <span>{gcell(g, 'currentAmount', formatCurrency(g.currentAmount))}</span>
                  <span>{gcell(g, 'targetAmount', formatCurrency(g.targetAmount))}</span>
                </div>
              </div>
            );
          })}
          {savingsGoals.length === 0 && <p className="section-label text-center py-4">No goals yet</p>}
        </div>
        <DataEditorPanel section="goals" data={savingsGoals} onSave={p => setSavingsGoals(p as SavingsGoal[])} toCSV={goalsToCSV as (d: unknown[]) => string} fromCSV={csvToGoals as (s: string) => unknown[]} />
      </div>

      {/* Debt */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <p className="section-label">Debt Accounts</p>
          <button onClick={() => setDebt([...debt, newDebt()])} className="btn-aurora">+ Add debt</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full luxury-table">
            <thead><tr>
              {['Account','Balance','Rate','Min. Payment',''].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {debt.map(d => (
                <tr key={d.id}>
                  <td style={{ color: '#fff' }}>{dcell(d, 'name', d.name)}</td>
                  <td style={{ color: '#ff6b6b' }}>{dcell(d, 'balance', formatCurrency(d.balance))}</td>
                  <td>{dcell(d, 'interestRate', formatPercent(d.interestRate * 100))}</td>
                  <td>{dcell(d, 'minimumPayment', formatCurrency(d.minimumPayment))}</td>
                  <td><button onClick={() => setDebt(debt.filter(x => x.id !== d.id))} style={{ color: 'rgba(255,255,255,0.2)' }} className="hover:text-red-400 transition-colors">✕</button></td>
                </tr>
              ))}
              {debt.length > 0 && (
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Total</td>
                  <td style={{ color: '#ff6b6b', fontWeight: 500 }}>{formatCurrency(totalDebt)}</td>
                  <td colSpan={3} />
                </tr>
              )}
              {debt.length === 0 && <tr><td colSpan={5} className="section-label text-center py-6">No accounts yet</td></tr>}
            </tbody>
          </table>
        </div>
        <DataEditorPanel section="debt" data={debt} onSave={p => setDebt(p as DebtAccount[])} toCSV={debtToCSV as (d: unknown[]) => string} fromCSV={csvToDebt as (s: string) => unknown[]} />
      </div>
    </div>
  );
};
export default GoalsDebtView;
