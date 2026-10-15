import React from 'react';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onImport: () => void;
  onExport: (format: 'json' | 'csv') => void;
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, onImport, onExport, onReset }) => {
  const [exportOpen, setExportOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-5 border-b border-white/[0.06]"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(20px) saturate(160%)' }}>
      {/* Brand */}
      <div className="flex flex-col leading-none">
        <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.15rem', letterSpacing: '0.06em', textShadow: '0 0 24px rgba(255,255,255,0.2)' }}>
          Finfolio
        </span>
        <span className="section-label mt-0.5">Personal Finance</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button onClick={onImport} className="btn-ghost">
          <span className="hidden sm:inline">Import</span>
          <span className="sm:hidden">↑</span>
        </button>

        <div className="relative">
          <button onClick={() => setExportOpen(v => !v)} className="btn-ghost">
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">↓</span>
            <span className="opacity-40 hidden sm:inline">▾</span>
          </button>
          {exportOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden z-50"
              style={{ background: 'rgba(10,10,10,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
              {[['Export as JSON', 'json'], ['Export as CSV', 'csv']].map(([label, fmt]) => (
                <button key={fmt} onClick={() => { onExport(fmt as 'json' | 'csv'); setExportOpen(false); }}
                  className="w-full text-left px-4 py-3 text-xs tracking-widest uppercase text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors">
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={onReset} className="btn-ghost hover:!text-red-400 hover:!border-red-500/30">
          <span className="hidden sm:inline">Reset</span>
          <span className="sm:hidden">↺</span>
        </button>

        <button onClick={toggleTheme} className="btn-ghost w-8 h-8 p-0 justify-center text-sm">
          ◑
        </button>
      </div>
    </header>
  );
};

export default Header;
