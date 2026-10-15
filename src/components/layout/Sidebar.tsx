import React from 'react';

export type View = 'portfolio' | 'budget' | 'goals' | 'networth' | 'retire';

interface SidebarProps { activeView: View; onNavigate: (v: View) => void; }

const nav: { id: View; label: string; sub: string }[] = [
  { id: 'portfolio', label: 'Portfolio',   sub: 'Holdings & allocation' },
  { id: 'budget',    label: 'Budget',      sub: 'Income & expenses'     },
  { id: 'goals',     label: 'Goals & Debt',sub: 'Progress & payoff'     },
  { id: 'networth',  label: 'Net Worth',   sub: 'Assets & liabilities'  },
  { id: 'retire',    label: 'Retire',      sub: 'Malaysia retirement planner' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => (
  <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-white/[0.06] py-8 px-4 gap-1" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }}>
    <p className="section-label px-3 mb-6">Navigation</p>
    {nav.map((item) => (
      <button key={item.id} onClick={() => onNavigate(item.id)}
        className={`text-left px-3 py-3 rounded-lg transition-all duration-200 group w-full ${activeView === item.id ? 'bg-white/[0.06] border border-white/[0.1]' : 'hover:bg-white/[0.03]'}`}>
        <p className={`text-sm font-light transition-colors ${activeView === item.id ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}
          style={{ fontFamily: 'var(--serif)', letterSpacing: '0.04em' }}>
          {item.label}
        </p>
        <p className="text-[10px] mt-0.5 text-white/25 tracking-wide">{item.sub}</p>
        {activeView === item.id && (
          <div className="mt-2 h-px w-full" style={{ background: 'linear-gradient(90deg, #4fffb0, transparent)' }} />
        )}
      </button>
    ))}
  </aside>
);

export default Sidebar;
