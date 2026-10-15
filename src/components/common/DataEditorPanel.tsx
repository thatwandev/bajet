import React, { useState, useEffect } from 'react';

export type EditorSection = 'portfolio' | 'budget' | 'goals' | 'debt' | 'networth';

interface Props {
  section: EditorSection;
  data: unknown[];
  onSave: (p: unknown[]) => void;
  toCSV: (d: unknown[]) => string;
  fromCSV: (s: string) => unknown[];
}

const DataEditorPanel: React.FC<Props> = ({ data, onSave, toCSV, fromCSV }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'json' | 'csv'>('json');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setText(tab === 'json' ? JSON.stringify(data, null, 2) : toCSV(data));
    setError(null); setSuccess(false);
  }, [open, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = () => {
    setError(null); setSuccess(false);
    try {
      const parsed = tab === 'json' ? (() => { const p = JSON.parse(text); if (!Array.isArray(p)) throw new Error('Must be an array'); return p; })() : fromCSV(text);
      onSave(parsed); setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } catch (e) { setError(e instanceof Error ? e.message : 'Parse error'); }
  };

  return (
    <div className="mt-6 border-t border-white/[0.06]">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-white/30 hover:text-white/60 transition-colors"
        style={{ fontFamily: 'var(--sans)', fontSize: '0.6rem', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
        <span>Edit as JSON / CSV</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="flex gap-2 mb-3">
            {(['json', 'csv'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-full text-[10px] tracking-widest uppercase transition-all ${tab === t ? 'text-black' : 'text-white/40 border border-white/10 hover:text-white/60'}`}
                style={tab === t ? { background: 'linear-gradient(135deg,#4fffb0,#a78bfa)' } : {}}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={10} spellCheck={false}
            className="w-full font-mono text-xs p-4 rounded-xl resize-y outline-none"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }} />
          {error && <p className="mt-2 text-xs text-red-400 px-1">⚠ {error}</p>}
          {success && <p className="mt-2 text-xs px-1" style={{ color: '#4fffb0' }}>✓ Applied</p>}
          <div className="mt-3 flex justify-end">
            <button onClick={apply} className="btn-aurora">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataEditorPanel;
