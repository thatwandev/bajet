import React from 'react';
import type { View } from './Sidebar';

interface BottomNavProps { activeView: View; onNavigate: (v: View) => void; }

const nav: { id: View; label: string }[] = [
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'budget',    label: 'Budget'    },
  { id: 'goals',     label: 'Goals'     },
  { id: 'networth',  label: 'Net Worth' },
  { id: 'retire',    label: 'Retire'    },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => (
  <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08]"
    style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}>
    {nav.map((item) => (
      <button key={item.id} onClick={() => onNavigate(item.id)}
        className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
        style={{ color: activeView === item.id ? '#4fffb0' : 'rgba(255,255,255,0.35)' }}>
        <span className="text-[10px] tracking-widest uppercase">{item.label}</span>
        {activeView === item.id && <div className="w-4 h-px" style={{ background: 'linear-gradient(90deg, #4fffb0, #a78bfa)' }} />}
      </button>
    ))}
  </nav>
);

export default BottomNav;
