import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useFinancialDataContext } from '../context/FinancialDataContext';
// ── Malaysia city cost-of-living data (RM/month) ──────────────────────────────
const CITIES = [
  {
    id: 'kl', name: 'Kuala Lumpur', emoji: '🌆',
    desc: 'Cosmopolitan living, world-class amenities',
    costs: { frugal: 3200, comfortable: 5500, luxury: 9500 },
    rentBase: 1800,
  },
  {
    id: 'pg', name: 'Penang', emoji: '🌊',
    desc: 'Heritage, food paradise, vibrant culture',
    costs: { frugal: 2600, comfortable: 4200, luxury: 7000 },
    rentBase: 1300,
  },
  {
    id: 'jb', name: 'Johor Bahru', emoji: '🏙️',
    desc: 'Southern gateway, Singapore proximity',
    costs: { frugal: 2400, comfortable: 3800, luxury: 6500 },
    rentBase: 1200,
  },
  {
    id: 'kk', name: 'Kota Kinabalu', emoji: '🏔️',
    desc: 'Nature, beaches, relaxed island lifestyle',
    costs: { frugal: 2200, comfortable: 3500, luxury: 5800 },
    rentBase: 1100,
  },
  {
    id: 'mlk', name: 'Melaka', emoji: '🏮',
    desc: 'Historic charm, affordable, peaceful',
    costs: { frugal: 1900, comfortable: 3000, luxury: 4800 },
    rentBase: 900,
  },
  {
    id: 'ipoh', name: 'Ipoh', emoji: '🍜',
    desc: 'Relaxed pace, famous cuisine, low cost',
    costs: { frugal: 1700, comfortable: 2700, luxury: 4200 },
    rentBase: 800,
  },
  {
    id: 'kch', name: 'Kuching', emoji: '🦧',
    desc: "Sarawak's cultural capital, greenery, affordable",
    costs: { frugal: 2000, comfortable: 3200, luxury: 5200 },
    rentBase: 1000,
  },
  {
    id: 'seremban', name: 'Seremban', emoji: '🌿',
    desc: 'Quiet, near KL, Negeri Sembilan charm',
    costs: { frugal: 1800, comfortable: 2800, luxury: 4500 },
    rentBase: 850,
  },
];

const LIFESTYLES: { id: 'frugal' | 'comfortable' | 'luxury'; label: string; desc: string; color: string }[] = [
  { id: 'frugal',      label: 'Frugal',      desc: 'Basic needs, public transport, hawker food',      color: '#38bdf8' },
  { id: 'comfortable', label: 'Comfortable', desc: 'Own car, dining out occasionally, private healthcare', color: '#4fffb0' },
  { id: 'luxury',      label: 'Luxury',      desc: 'Premium condo, travel 2x/year, full private healthcare', color: '#a78bfa' },
];

// ── Aurora background (reused) ─────────────────────────────────────────────────
const AuroraCanvas: React.FC<{ hues?: number[] }> = ({ hues = [160, 270, 200] }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const anim = useRef<number>(0);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    let W = c.offsetWidth, H = c.offsetHeight;
    c.width = W; c.height = H;
    const resize = () => { W = c.offsetWidth; H = c.offsetHeight; c.width = W; c.height = H; };
    window.addEventListener('resize', resize);
    const orbs = hues.map(hue => ({ x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3, r:80+Math.random()*120, hue, a:0.04+Math.random()*.06 }));
    let t = 0;
    const draw = () => {
      ctx.clearRect(0,0,W,H); t+=.003;
      orbs.forEach(o => {
        o.x+=o.vx+Math.sin(t+o.hue)*.2; o.y+=o.vy+Math.cos(t+o.hue*.5)*.15;
        if(o.x<-o.r)o.x=W+o.r; if(o.x>W+o.r)o.x=-o.r;
        if(o.y<-o.r)o.y=H+o.r; if(o.y>H+o.r)o.y=-o.r;
        const g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
        g.addColorStop(0,`hsla(${o.hue},100%,65%,${o.a})`);
        g.addColorStop(1,`hsla(${o.hue},100%,65%,0)`);
        ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      });
      anim.current=requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize',resize); cancelAnimationFrame(anim.current); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{opacity:.6}} />;
};

// ── Slider ────────────────────────────────────────────────────────────────────
const Slider: React.FC<{ label: string; value: number; min: number; max: number; step?: number; format?: (v:number)=>string; onChange: (v:number)=>void; color?: string }> =
  ({ label, value, min, max, step=1, format, onChange, color='#4fffb0' }) => (
  <div className="mb-5">
    <div className="flex items-center justify-between mb-2">
      <p className="section-label">{label}</p>
      <span style={{ fontFamily:'var(--serif)', fontSize:'1rem', color, fontWeight:300 }}>{format ? format(value) : value.toLocaleString()}</span>
    </div>
    <div className="relative h-1 rounded-full" style={{ background:'rgba(255,255,255,0.08)' }}>
      <div className="absolute left-0 top-0 h-1 rounded-full transition-all duration-200"
        style={{ width:`${((value-min)/(max-min))*100}%`, background:`linear-gradient(90deg,${color},${color}88)` }} />
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}
        className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" style={{ zIndex:1 }} />
    </div>
    <div className="flex justify-between mt-1">
      <span className="section-label" style={{ fontSize:'0.55rem' }}>{format?format(min):min.toLocaleString()}</span>
      <span className="section-label" style={{ fontSize:'0.55rem' }}>{format?format(max):max.toLocaleString()}</span>
    </div>
  </div>
);

// ── Retirement Calculator ─────────────────────────────────────────────────────
const RetirementView: React.FC = () => {
  const { netWorth, portfolio, budget } = useFinancialDataContext();

  // Derived current financials
  const currentNW = netWorth[netWorth.length-1] ? netWorth[netWorth.length-1].totalAssets - netWorth[netWorth.length-1].totalLiabilities : 0;
  const portfolioValue = portfolio.reduce((s,h)=>s+h.quantity*h.currentPrice,0);
  const lb = budget[budget.length-1];
  const lbExp = lb ? ['rent','food','transport','entertainment','savings'].reduce((s,k)=>s+(lb.expenses as unknown as Record<string,number>)[k],0) : 0;
  const monthlySavings = lb ? Math.max(0, lb.income - lbExp) : 0;

  // Inputs
  const [currentAge, setCurrentAge]       = useState(30);
  const [retireAge,  setRetireAge]         = useState(55);
  const [city,       setCity]              = useState(CITIES[0]);
  const [lifestyle,  setLifestyle]         = useState<'frugal'|'comfortable'|'luxury'>('comfortable');
  const [inflation,  setInflation]         = useState(3.5);
  const [returnRate, setReturnRate]        = useState(7);
  const [extraMonthly, setExtraMonthly]    = useState(monthlySavings);
  const [lifeExpect, setLifeExpect]        = useState(85);
  const [haveProperty, setHaveProperty]   = useState(false);
  const [propertyVal, setPropertyVal]      = useState(500000);
  const [pensionMonthly, setPensionMonthly]= useState(0);
  const [epfBalance, setEpfBalance]        = useState(0);

  // ── Calculations ─────────────────────────────────────────────────────────────
  const yearsToRetire   = Math.max(0, retireAge - currentAge);
  const yearsInRetire   = Math.max(1, lifeExpect - retireAge);
  const monthlyTarget   = city.costs[lifestyle];
  const monthlyTargetFV = monthlyTarget * Math.pow(1 + inflation/100, yearsToRetire); // inflation-adjusted
  const annualSpend     = monthlyTargetFV * 12;

  // 4% safe withdrawal rule
  const nestedEgg       = annualSpend / 0.04;

  // Pension & EPF reduce required nest egg
  const pensionAnnual   = pensionMonthly * 12;
  const epfProjected    = epfBalance * Math.pow(1 + returnRate/100, yearsToRetire);
  const adjustedNestEgg = Math.max(0, nestedEgg - (pensionAnnual / 0.04) - epfProjected);

  // Current investable assets
  const currentAssets   = portfolioValue + Math.max(0, currentNW - portfolioValue) + (haveProperty ? propertyVal * 0.6 : 0);

  // FV of current assets at return rate
  const currentFV       = currentAssets * Math.pow(1 + returnRate/100, yearsToRetire);

  // FV of monthly contributions
  const monthlyRate     = returnRate / 100 / 12;
  const months          = yearsToRetire * 12;
  const contributionFV  = monthlyRate > 0
    ? extraMonthly * ((Math.pow(1+monthlyRate,months)-1)/monthlyRate)
    : extraMonthly * months;

  const projectedTotal  = currentFV + contributionFV;
  const gap             = adjustedNestEgg - projectedTotal;
  const onTrack         = gap <= 0;

  // Additional monthly needed to close gap
  const additionalNeeded = gap > 0 && monthlyRate > 0
    ? gap / ((Math.pow(1+monthlyRate,months)-1)/monthlyRate)
    : 0;

  // Chart: wealth over time
  const chartData = Array.from({ length: yearsToRetire + yearsInRetire + 1 }, (_, i) => {
    const yr = currentAge + i;
    if (i <= yearsToRetire) {
      const assetGrowth = currentAssets * Math.pow(1+returnRate/100,i);
      const savingsGrowth = monthlyRate > 0
        ? extraMonthly * ((Math.pow(1+monthlyRate,i*12)-1)/monthlyRate)
        : extraMonthly * i * 12;
      return { year: yr, wealth: Math.round(assetGrowth+savingsGrowth), phase:'accumulation' };
    } else {
      const drawdownYrs = i - yearsToRetire;
      const startWealth = projectedTotal;
      const annual = annualSpend - pensionAnnual;
      const r = returnRate/100;
      const remaining = r > 0
        ? startWealth * Math.pow(1+r,drawdownYrs) - annual*((Math.pow(1+r,drawdownYrs)-1)/r)
        : startWealth - annual * drawdownYrs;
      return { year: yr, wealth: Math.round(Math.max(0, remaining)), phase:'drawdown' };
    }
  });

  const retireYearData  = chartData[yearsToRetire];
  const runsOut         = chartData.find(d => d.phase==='drawdown' && d.wealth===0);

  const fmtRM = (v: number) => `RM ${v >= 1000000 ? (v/1000000).toFixed(2)+'M' : v >= 1000 ? (v/1000).toFixed(0)+'k' : v.toFixed(0)}`;

  return (
    <div className="animate-rise">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-8 mb-8" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', minHeight:140 }}>
        <AuroraCanvas hues={[160,270,45]} />
        <div className="relative z-10">
          <p className="section-label mb-2">Malaysia Retirement Planner</p>
          <h1 style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:300, letterSpacing:'0.06em', color:'rgba(255,255,255,0.9)', lineHeight:1.1 }}>
            When can you retire<br/>
            <span style={{ background:'linear-gradient(135deg,#4fffb0,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              comfortably?
            </span>
          </h1>
          <p className="section-label mt-3">Based on your real assets, Malaysian cost of living, EPF & inflation projections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── LEFT: Inputs ── */}
        <div className="space-y-5">

          {/* Age */}
          <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <p className="section-label mb-5">Your Timeline</p>
            <Slider label="Current Age" value={currentAge} min={18} max={70} onChange={setCurrentAge} color="#38bdf8" />
            <Slider label="Target Retirement Age" value={retireAge} min={currentAge+1} max={80} onChange={v=>setRetireAge(Math.max(v,currentAge+1))} color="#4fffb0" />
            <Slider label="Life Expectancy" value={lifeExpect} min={retireAge+1} max={100} onChange={v=>setLifeExpect(Math.max(v,retireAge+1))} color="#a78bfa" />
          </div>

          {/* City picker */}
          <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <p className="section-label mb-4">Where in Malaysia?</p>
            <div className="grid grid-cols-2 gap-2">
              {CITIES.map(c => (
                <button key={c.id} onClick={()=>setCity(c)}
                  className="text-left p-3 rounded-xl transition-all duration-200"
                  style={{ background: city.id===c.id ? 'rgba(79,255,176,0.08)' : 'rgba(255,255,255,0.02)', border:`1px solid ${city.id===c.id ? 'rgba(79,255,176,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                  <span className="text-base">{c.emoji}</span>
                  <p style={{ fontFamily:'var(--serif)', fontSize:'0.9rem', color: city.id===c.id ? '#4fffb0' : 'rgba(255,255,255,0.75)', marginTop:2 }}>{c.name}</p>
                  <p className="section-label mt-0.5" style={{ fontSize:'0.55rem' }}>{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Lifestyle */}
          <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <p className="section-label mb-4">Lifestyle</p>
            <div className="space-y-2">
              {LIFESTYLES.map(ls => (
                <button key={ls.id} onClick={()=>setLifestyle(ls.id)}
                  className="w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center justify-between"
                  style={{ background:lifestyle===ls.id?`${ls.color}10`:'rgba(255,255,255,0.02)', border:`1px solid ${lifestyle===ls.id?ls.color+'44':'rgba(255,255,255,0.06)'}` }}>
                  <div>
                    <p style={{ fontFamily:'var(--serif)', fontSize:'0.95rem', color: lifestyle===ls.id?ls.color:'rgba(255,255,255,0.7)' }}>{ls.label}</p>
                    <p className="section-label mt-0.5" style={{ fontSize:'0.58rem' }}>{ls.desc}</p>
                  </div>
                  <p style={{ fontFamily:'var(--serif)', fontSize:'1rem', color:ls.color }}>
                    RM{city.costs[ls.id].toLocaleString()}<span className="section-label">/mo</span>
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Financial inputs */}
          <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <p className="section-label mb-5">Your Financials</p>

            <Slider label="Monthly Savings / Investment (RM)" value={extraMonthly} min={0} max={20000} step={100}
              format={v=>`RM ${v.toLocaleString()}`} onChange={setExtraMonthly} color="#4fffb0" />

            <Slider label="EPF Balance (RM)" value={epfBalance} min={0} max={2000000} step={5000}
              format={v=>`RM ${(v/1000).toFixed(0)}k`} onChange={setEpfBalance} color="#38bdf8" />

            <Slider label="Expected Pension / Annuity (RM/month)" value={pensionMonthly} min={0} max={10000} step={100}
              format={v=>`RM ${v.toLocaleString()}`} onChange={setPensionMonthly} color="#a78bfa" />

            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="section-label">Own Property?</p>
                <p className="section-label mt-0.5" style={{ fontSize:'0.58rem' }}>60% of value counts toward retirement</p>
              </div>
              <button onClick={()=>setHaveProperty(v=>!v)}
                className="relative rounded-full transition-all duration-300"
                style={{ width:40, height:22, background: haveProperty ? 'linear-gradient(135deg,#4fffb0,#a78bfa)' : 'rgba(255,255,255,0.1)' }}>
                <span className="absolute top-1 rounded-full transition-all duration-300"
                  style={{ width:14, height:14, background:'#fff', left: haveProperty?22:4 }} />
              </button>
            </div>

            {haveProperty && (
              <Slider label="Property Value (RM)" value={propertyVal} min={100000} max={5000000} step={50000}
                format={v=>`RM ${(v/1000).toFixed(0)}k`} onChange={setPropertyVal} color="#ffa94d" />
            )}
          </div>

          {/* Assumptions */}
          <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <p className="section-label mb-5">Assumptions</p>
            <Slider label="Expected Annual Return (%)" value={returnRate} min={2} max={15} step={0.5}
              format={v=>`${v}%`} onChange={setReturnRate} color="#4fffb0" />
            <Slider label="Annual Inflation (%)" value={inflation} min={1} max={8} step={0.5}
              format={v=>`${v}%`} onChange={setInflation} color="#ffa94d" />
          </div>
        </div>

        {/* ── RIGHT: Results ── */}
        <div className="space-y-5">

          {/* Verdict card */}
          <div className="relative overflow-hidden rounded-2xl p-6" style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${onTrack?'rgba(79,255,176,0.25)':'rgba(255,107,107,0.25)'}`, minHeight:160 }}>
            <AuroraCanvas hues={onTrack?[160,180,200]:[0,15,330]} />
            <div className="relative z-10">
              <p className="section-label mb-2">{onTrack ? '✦ On Track' : '⚠ Gap Detected'}</p>
              <h2 style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:'clamp(1.4rem,3vw,2.2rem)', fontWeight:300, color:'rgba(255,255,255,0.95)', lineHeight:1.2 }}>
                {onTrack
                  ? `Retire at ${retireAge} in ${city.name}`
                  : `Need RM ${(additionalNeeded).toFixed(0)}/mo more`
                }
              </h2>
              <p className="section-label mt-2">
                {onTrack
                  ? `Projected surplus: ${fmtRM(Math.abs(gap))} · ${runsOut ? `Funds last until age ${lifeExpect}` : `Funds outlast life expectancy`}`
                  : `Shortfall: ${fmtRM(gap)} · Current path retires at ${city.name} at ${retireAge}`
                }
              </p>
            </div>
          </div>

          {/* Key numbers */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { l:'Monthly Need (today)',    v:`RM ${monthlyTarget.toLocaleString()}`,       g:'linear-gradient(135deg,#38bdf8,#6366f1)' },
              { l:'Monthly Need (at retire)',v:`RM ${Math.round(monthlyTargetFV).toLocaleString()}`, g:'linear-gradient(135deg,#4fffb0,#38bdf8)' },
              { l:'Target Nest Egg',         v:fmtRM(adjustedNestEgg),                       g:'linear-gradient(135deg,#a78bfa,#6366f1)' },
              { l:'Projected at Retire',     v:fmtRM(projectedTotal),                        g: onTrack?'linear-gradient(135deg,#4fffb0,#a78bfa)':'linear-gradient(135deg,#ff6b6b,#ffa94d)' },
              { l:'Years to Retire',         v:`${yearsToRetire} years`,                     g:'linear-gradient(135deg,#4fffb0,#38bdf8)' },
              { l:'Retirement Duration',     v:`${yearsInRetire} years`,                     g:'linear-gradient(135deg,#a78bfa,#ff6b6b)' },
            ].map(k=>(
              <div key={k.l} className="rounded-xl p-4" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <p className="section-label mb-1">{k.l}</p>
                <p style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:300, background:k.g, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{k.v}</p>
              </div>
            ))}
          </div>

          {/* Wealth trajectory chart */}
          <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <p className="section-label mb-1">Wealth Trajectory</p>
            <p className="section-label mb-4" style={{ fontSize:'0.58rem' }}>Accumulation → Retirement drawdown</p>
            <div className="overflow-x-auto"><div style={{ minWidth:380 }}>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top:4, right:8, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4fffb0" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#4fffb0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tick={{ fontSize:10, fill:'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:10, fill:'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false}
                    tickFormatter={v=>v>=1000000?`${(v/1000000).toFixed(1)}M`:v>=1000?`${(v/1000).toFixed(0)}k`:`${v}`} />
                  <Tooltip formatter={(v)=>`RM ${Number(v).toLocaleString()}`}
                    contentStyle={{ background:'rgba(0,0,0,0.92)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10 }} />
                  <ReferenceLine x={retireAge} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4"
                    label={{ value:`Retire ${retireAge}`, fill:'rgba(255,255,255,0.35)', fontSize:10 }} />
                  {retireYearData && (
                    <ReferenceLine y={retireYearData.wealth} stroke="rgba(79,255,176,0.2)" strokeDasharray="4 4" />
                  )}
                  <Area type="monotone" dataKey="wealth" stroke="#4fffb0" strokeWidth={2} fill="url(#wealthGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div></div>
          </div>

          {/* Monthly breakdown for chosen city */}
          <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <p className="section-label mb-4">{city.emoji} {city.name} — {lifestyle.charAt(0).toUpperCase()+lifestyle.slice(1)} Budget Breakdown</p>
            {[
              { item:'Rent / Housing',     pct:0.33 },
              { item:'Food & Groceries',   pct:0.22 },
              { item:'Transport',          pct:0.12 },
              { item:'Healthcare',         pct:0.10 },
              { item:'Entertainment',      pct:0.08 },
              { item:'Utilities & Comms',  pct:0.07 },
              { item:'Misc / Buffer',      pct:0.08 },
            ].map((row, i) => {
              const amt = Math.round(monthlyTarget * row.pct);
              const colors = ['#4fffb0','#38bdf8','#a78bfa','#ffa94d','#ff6b6b','#6366f1','rgba(255,255,255,0.3)'];
              return (
                <div key={row.item} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.6)' }}>{row.item}</span>
                    <span style={{ fontFamily:'var(--serif)', fontSize:'0.85rem', color: colors[i] }}>RM {amt.toLocaleString()}</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background:'rgba(255,255,255,0.06)' }}>
                    <div className="h-1 rounded-full transition-all duration-700" style={{ width:`${row.pct*100}%`, background: colors[i], boxShadow:`0 0 6px ${colors[i]}44` }} />
                  </div>
                </div>
              );
            })}
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex justify-between">
              <span className="section-label">Total (today's RM)</span>
              <span style={{ fontFamily:'var(--serif)', fontSize:'1rem', background:'linear-gradient(135deg,#4fffb0,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                RM {monthlyTarget.toLocaleString()} / month
              </span>
            </div>
          </div>

          {/* EPF note */}
          <div className="rounded-xl p-4" style={{ background:'rgba(79,255,176,0.04)', border:'1px solid rgba(79,255,176,0.12)' }}>
            <p className="section-label mb-2" style={{ color:'rgba(79,255,176,0.6)' }}>💡 Malaysia-specific notes</p>
            <ul className="space-y-1" style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.45)', lineHeight:1.7 }}>
              <li>· EPF Account 1 (75%) grows at ~5.5–6.5% p.a. historically</li>
              <li>· EPF withdrawal allowed at age 55 (full) or 50 (partial)</li>
              <li>· SOCSO pension if eligible — supplement to EPF</li>
              <li>· Healthcare: Malaysia has excellent affordable public hospitals; private is RM300–1,200/month for insurance</li>
              <li>· Consider Amanah Saham Bumiputera (ASB) / ASN if eligible — consistent 4–6% p.a.</li>
              <li>· Property cooling measures: factor in RPGT, stamp duty on future sales</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetirementView;
