import React, { useState } from 'react';
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { useFinancialDataContext } from '../context/FinancialDataContext';
import DataEditorPanel from '../components/common/DataEditorPanel';
import { netWorthToCSV, csvToNetWorth } from '../utils/csvUtils';
import { formatCurrency } from '../utils/formatters';
import type { NetWorthSnapshot } from '../types/finance';

const newSnap = (): NetWorthSnapshot => ({ id: Math.random().toString(36).slice(2), month: '', totalAssets: 0, totalLiabilities: 0 });

const NetWorthView: React.FC = () => {
  const { netWorth, setNetWorth } = useFinancialDataContext();
  const [edit, setEdit] = useState<{ id: string; field: keyof NetWorthSnapshot } | null>(null);
  const [val, setVal] = useState('');

  const latest = netWorth[netWorth.length - 1];
  const prev    = netWorth[netWorth.length - 2];
  const currentNW = latest ? latest.totalAssets - latest.totalLiabilities : 0;
  const prevNW    = prev   ? prev.totalAssets   - prev.totalLiabilities   : 0;
  const delta     = currentNW - prevNW;

  const chartData = netWorth.map(s => ({
    month: s.month.slice(0,7),
    Assets: s.totalAssets,
    Liabilities: s.totalLiabilities,
    'Net Worth': s.totalAssets - s.totalLiabilities,
  }));

  const commit = () => {
    if (!edit) return;
    setNetWorth(netWorth.map(s => s.id !== edit.id ? s : edit.field === 'month' ? { ...s, month: val } : { ...s, [edit.field]: parseFloat(val) || 0 }));
    setEdit(null);
  };
  const cell = (s: NetWorthSnapshot, field: keyof NetWorthSnapshot, display: string) =>
    edit?.id === s.id && edit?.field === field
      ? <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={commit} onKeyDown={e => e.key === 'Enter' && commit()} className="luxury-input" />
      : <span className="editable-cell" onClick={() => { setEdit({ id: s.id, field }); setVal(field === 'month' ? s.month : String(s[field])); }}>{display}</span>;

  return (
    <div className="animate-rise">
      <div className="mb-8">
        <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 300, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.9)' }}>Net Worth</h1>
        <p className="section-label mt-1">Assets & liabilities over time</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { l: 'Net Worth',       v: formatCurrency(currentNW), g: currentNW >= 0 ? 'linear-gradient(135deg,#4fffb0,#38bdf8)' : 'linear-gradient(135deg,#ff6b6b,#ffa94d)' },
          { l: 'Total Assets',    v: formatCurrency(latest?.totalAssets ?? 0), g: 'linear-gradient(135deg,#4fffb0,#a78bfa)' },
          { l: 'MoM Change',      v: (delta >= 0 ? '+' : '') + formatCurrency(delta), g: delta >= 0 ? 'linear-gradient(135deg,#4fffb0,#38bdf8)' : 'linear-gradient(135deg,#ff6b6b,#ffa94d)' },
        ].map(k => (
          <div key={k.l} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="section-label mb-2">{k.l}</p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 300, background: k.g, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{k.v}</p>
          </div>
        ))}
      </div>

      {/* Area Chart */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="section-label mb-4">Wealth Trajectory</p>
        <div className="overflow-x-auto"><div style={{ minWidth: 400 }}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAssets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4fffb0" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4fffb0" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradNW" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradLiab" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ background: 'rgba(0,0,0,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="Assets" stroke="#4fffb0" strokeWidth={2} fill="url(#gradAssets)" dot={false} />
              <Area type="monotone" dataKey="Liabilities" stroke="#ff6b6b" strokeWidth={1.5} fill="url(#gradLiab)" dot={false} />
              <Area type="monotone" dataKey="Net Worth" stroke="#a78bfa" strokeWidth={2.5} fill="url(#gradNW)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div></div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <p className="section-label">Monthly Snapshots</p>
          <button onClick={() => setNetWorth([...netWorth, newSnap()])} className="btn-aurora">+ Add month</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full luxury-table">
            <thead><tr>
              {['Month','Total Assets','Total Liabilities','Net Worth',''].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {netWorth.map(s => {
                const nw = s.totalAssets - s.totalLiabilities;
                return (
                  <tr key={s.id}>
                    <td style={{ color: '#fff' }}>{cell(s, 'month', s.month)}</td>
                    <td style={{ color: '#4fffb0' }}>{cell(s, 'totalAssets', formatCurrency(s.totalAssets))}</td>
                    <td style={{ color: '#ff6b6b' }}>{cell(s, 'totalLiabilities', formatCurrency(s.totalLiabilities))}</td>
                    <td style={{ color: nw >= 0 ? '#a78bfa' : '#ff6b6b', fontWeight: 500 }}>{formatCurrency(nw)}</td>
                    <td><button onClick={() => setNetWorth(netWorth.filter(x => x.id !== s.id))} style={{ color: 'rgba(255,255,255,0.2)' }} className="hover:text-red-400 transition-colors">✕</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <DataEditorPanel section="networth" data={netWorth} onSave={p => setNetWorth(p as NetWorthSnapshot[])} toCSV={netWorthToCSV as (d: unknown[]) => string} fromCSV={csvToNetWorth as (s: string) => unknown[]} />
      </div>
    </div>
  );
};
export default NetWorthView;
