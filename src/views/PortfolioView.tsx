import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFinancialDataContext } from '../context/FinancialDataContext';
import DataEditorPanel from '../components/common/DataEditorPanel';
import { portfolioToCSV, csvToPortfolio } from '../utils/csvUtils';
import { formatCurrency, formatPercent } from '../utils/formatters';
import type { PortfolioHolding } from '../types/finance';

// ── Finance quotes ────────────────────────────────────────────────────────────
const QUOTES = [
  { text: "The stock market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The individual investor should act consistently as an investor and not as a speculator.", author: "Benjamin Graham" },
  { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett" },
  { text: "The four most dangerous words in investing are: 'This time it's different.'", author: "Sir John Templeton" },
  { text: "Do not save what is left after spending; instead spend what is left after saving.", author: "Warren Buffett" },
  { text: "In investing, what is comfortable is rarely profitable.", author: "Robert Arnott" },
  { text: "The market is filled with individuals who know the price of everything, but the value of nothing.", author: "Philip Fisher" },
  { text: "It's not how much money you make, but how much money you keep.", author: "Robert Kiyosaki" },
  { text: "Financial freedom is available to those who learn about it and work for it.", author: "Robert Kiyosaki" },
  { text: "Compound interest is the eighth wonder of the world.", author: "Albert Einstein" },
  { text: "The goal isn't more money. The goal is living life on your own terms.", author: "Chris Brogan" },
];

// ── Aurora canvas background ──────────────────────────────────────────────────
const AuroraCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;

    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', resize);

    // Orbs
    const orbs = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: 120 + Math.random() * 180,
      hue: [160, 270, 200, 300, 180, 250][i],
      alpha: 0.06 + Math.random() * 0.08,
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.003;
      orbs.forEach(o => {
        o.x += o.vx + Math.sin(t + o.hue) * 0.3;
        o.y += o.vy + Math.cos(t + o.hue * 0.5) * 0.2;
        if (o.x < -o.r) o.x = W + o.r;
        if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r;
        if (o.y > H + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},100%,65%,${o.alpha})`);
        g.addColorStop(1, `hsla(${o.hue},100%,65%,0)`);
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animRef.current); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }} />;
};

// ── Floating particle field ───────────────────────────────────────────────────
const Particles: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const anim = useRef<number>(0);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    let W = c.offsetWidth, H = c.offsetHeight;
    c.width = W; c.height = H;
    const resize = () => { W = c.offsetWidth; H = c.offsetHeight; c.width = W; c.height = H; };
    window.addEventListener('resize', resize);
    const pts = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vy: -0.15 - Math.random() * 0.25,
      r: 0.5 + Math.random() * 1.2,
      a: Math.random(),
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.y += p.vy; p.a -= 0.001;
        if (p.y < 0 || p.a <= 0) { p.y = H; p.a = 0.3 + Math.random() * 0.5; p.x = Math.random() * W; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a * 0.4})`;
        ctx.fill();
      });
      anim.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(anim.current); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

// ── Quote rotator ─────────────────────────────────────────────────────────────
const QuoteRotator: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % QUOTES.length); setVisible(true); }, 700);
    }, 7000);
    return () => clearInterval(interval);
  }, []);
  const q = QUOTES[idx];
  return (
    <div className="relative overflow-hidden rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', minHeight: 160 }}>
      <AuroraCanvas />
      <Particles />
      <div className="relative z-10" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease', transform: visible ? 'none' : 'translateY(8px)', transitionProperty: 'opacity, transform' }}>
        <div className="mb-4" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(1rem,2.5vw,1.6rem)', fontWeight: 300, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, letterSpacing: '0.02em' }}>
          "{q.text}"
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: '0.65rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
          — {q.author}
        </div>
      </div>
      {/* Pagination dots */}
      <div className="relative z-10 flex gap-1.5 mt-6">
        {QUOTES.map((_, i) => (
          <button key={i} onClick={() => { setVisible(false); setTimeout(() => { setIdx(i); setVisible(true); }, 300); }}
            className="rounded-full transition-all duration-300"
            style={{ width: i === idx ? 16 : 4, height: 4, background: i === idx ? 'linear-gradient(90deg,#4fffb0,#a78bfa)' : 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>
    </div>
  );
};

// ── Ticker strip ──────────────────────────────────────────────────────────────
const TickerStrip: React.FC<{ holdings: PortfolioHolding[] }> = ({ holdings }) => {
  if (holdings.length === 0) return null;
  const items = [...holdings, ...holdings]; // duplicate for seamless loop
  return (
    <div className="overflow-hidden rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', height: 40 }}>
      <div className="flex items-center h-full" style={{ animation: 'ticker 30s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
        {items.map((h, i) => {
          const gain = h.avgCost > 0 ? ((h.currentPrice - h.avgCost) / h.avgCost) * 100 : 0;
          return (
            <span key={i} className="inline-flex items-center gap-2 px-6" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
              <span style={{ color: '#fff', fontWeight: 500 }}>{h.ticker || '—'}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{formatCurrency(h.currentPrice)}</span>
              <span style={{ color: gain >= 0 ? '#4fffb0' : '#ff6b6b' }}>{gain >= 0 ? '▲' : '▼'} {Math.abs(gain).toFixed(2)}%</span>
              <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ── Main colors ───────────────────────────────────────────────────────────────
const COLORS = ['#4fffb0','#a78bfa','#38bdf8','#ffa94d','#ff6b6b','#6366f1'];
const newH = (): PortfolioHolding => ({ id: Math.random().toString(36).slice(2), ticker: '', quantity: 0, avgCost: 0, currentPrice: 0 });

// ── PortfolioView ─────────────────────────────────────────────────────────────
const PortfolioView: React.FC = () => {
  const { portfolio, setPortfolio } = useFinancialDataContext();
  const [edit, setEdit] = useState<{ id: string; field: keyof PortfolioHolding } | null>(null);
  const [val, setVal] = useState('');
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  const totalValue = portfolio.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
  const totalCost  = portfolio.reduce((s, h) => s + h.quantity * h.avgCost, 0);
  const totalGain  = totalValue - totalCost;
  const gainPct    = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const pieData    = portfolio.map(h => ({ name: h.ticker || '—', value: +(h.quantity * h.currentPrice).toFixed(2) }));

  const startEdit = useCallback((id: string, field: keyof PortfolioHolding, v: string | number) => { setEdit({ id, field }); setVal(String(v)); }, []);
  const commit = useCallback(() => {
    if (!edit) return;
    setPortfolio(portfolio.map(h => h.id !== edit.id ? h : edit.field === 'ticker' ? { ...h, ticker: val.toUpperCase() } : { ...h, [edit.field]: parseFloat(val) || 0 }));
    setEdit(null);
  }, [edit, val, portfolio, setPortfolio]);

  const cell = (h: PortfolioHolding, field: keyof PortfolioHolding, display: string) =>
    edit?.id === h.id && edit?.field === field
      ? <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={commit} onKeyDown={e => e.key === 'Enter' && commit()} className="luxury-input" />
      : <span className="editable-cell" onClick={() => startEdit(h.id, field, field === 'ticker' ? h.ticker : h[field] as number)}>{display}</span>;

  return (
    <div className="animate-rise">
      {/* Hero header */}
      <div className="mb-8">
        <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 300, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.9)' }}>
          Portfolio
        </h1>
        <p className="section-label mt-1">Holdings, allocation & performance</p>
      </div>

      {/* Quote rotator with aurora */}
      <div className="mb-8">
        <QuoteRotator />
      </div>

      {/* Ticker */}
      <TickerStrip holdings={portfolio} />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { l: 'Total Value',     v: formatCurrency(totalValue), g: 'linear-gradient(135deg,#4fffb0,#38bdf8)' },
          { l: 'Total Gain/Loss', v: formatCurrency(totalGain),  g: totalGain >= 0 ? 'linear-gradient(135deg,#4fffb0,#a78bfa)' : 'linear-gradient(135deg,#ff6b6b,#ffa94d)' },
          { l: 'Return',          v: formatPercent(gainPct),     g: gainPct >= 0 ? 'linear-gradient(135deg,#4fffb0,#a78bfa)' : 'linear-gradient(135deg,#ff6b6b,#ffa94d)' },
        ].map(k => (
          <div key={k.l} className="relative rounded-2xl p-5 overflow-hidden group" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.3s ease' }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ background: 'radial-gradient(circle at center, rgba(79,255,176,0.07), transparent)' }} />
            <p className="section-label mb-2">{k.l}</p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.4rem', fontWeight: 300, background: k.g, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{k.v}</p>
          </div>
        ))}
      </div>

      {/* Chart + Table */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Pie */}
        <div className="relative rounded-2xl p-5 lg:w-72 shrink-0 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <AuroraCanvas />
          <div className="relative z-10">
            <p className="section-label mb-4">Allocation</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35} label={false} strokeWidth={0}
                  onMouseEnter={(_, i) => setHoveredSlice(i)} onMouseLeave={() => setHoveredSlice(null)}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]}
                      opacity={hoveredSlice === null || hoveredSlice === i ? 1 : 0.4}
                      style={{ transition: 'opacity 0.2s ease, transform 0.2s ease', transformOrigin: 'center', transform: hoveredSlice === i ? 'scale(1.06)' : 'scale(1)' }} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ background: 'rgba(0,0,0,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: 32 }}>
              <div className="text-center">
                <p style={{ fontFamily: 'var(--serif)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Total</p>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '1rem', fontWeight: 300, color: '#fff' }}>{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings table */}
        <div className="flex-1 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
            <p className="section-label">Holdings</p>
            <button onClick={() => setPortfolio([...portfolio, newH()])} className="btn-aurora">+ Add</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full luxury-table">
              <thead><tr>
                {['Ticker','Qty','Avg Cost','Price','Value','Gain/Loss',''].map(h => <th key={h}>{h}</th>)}
              </tr></thead>
              <tbody>
                {portfolio.map((h, i) => {
                  const v  = h.quantity * h.currentPrice;
                  const g  = (h.currentPrice - h.avgCost) * h.quantity;
                  const gp = h.avgCost > 0 ? ((h.currentPrice - h.avgCost) / h.avgCost) * 100 : 0;
                  const dot = COLORS[i % COLORS.length];
                  return (
                    <tr key={h.id} style={{ borderLeft: `2px solid ${dot}22` }}>
                      <td>
                        <span className="inline-flex items-center gap-2">
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block', boxShadow: `0 0 6px ${dot}` }} />
                          <span style={{ color: '#fff', fontWeight: 500 }}>{cell(h, 'ticker', h.ticker || '—')}</span>
                        </span>
                      </td>
                      <td>{cell(h, 'quantity', h.quantity.toString())}</td>
                      <td>{cell(h, 'avgCost', formatCurrency(h.avgCost))}</td>
                      <td>{cell(h, 'currentPrice', formatCurrency(h.currentPrice))}</td>
                      <td style={{ color: 'rgba(255,255,255,0.8)' }}>{formatCurrency(v)}</td>
                      <td>
                        <span style={{ color: g >= 0 ? '#4fffb0' : '#ff6b6b' }}>
                          {g >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(g))} ({formatPercent(Math.abs(gp))})
                        </span>
                      </td>
                      <td><button onClick={() => setPortfolio(portfolio.filter(x => x.id !== h.id))} style={{ color: 'rgba(255,255,255,0.2)' }} className="hover:text-red-400 transition-colors">✕</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <DataEditorPanel section="portfolio" data={portfolio} onSave={p => setPortfolio(p as PortfolioHolding[])} toCSV={portfolioToCSV as (d: unknown[]) => string} fromCSV={csvToPortfolio as (s: string) => unknown[]} />
        </div>
      </div>
    </div>
  );
};
export default PortfolioView;
