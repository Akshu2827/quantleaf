import { useState, useEffect, useRef, useCallback } from "react";

// ─── Windows 7 Aero Color Palette ────────────────────────────────────────────
const COLORS = [
  "#4db8ff","#00c8a0","#ffd700","#ff6b35","#a855f7",
  "#22d3ee","#f97316","#10b981","#e879f9","#fb923c"
];

// ─── Windows 7 SVG Icon Components ───────────────────────────────────────────
const Win7Icons = {
  chart: (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <defs>
        <linearGradient id="ic1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7ecfff"/><stop offset="100%" stopColor="#0078d4"/>
        </linearGradient>
      </defs>
      <rect x="2" y="18" width="6" height="10" rx="1" fill="url(#ic1)"/>
      <rect x="10" y="12" width="6" height="16" rx="1" fill="url(#ic1)"/>
      <rect x="18" y="6" width="6" height="22" rx="1" fill="url(#ic1)"/>
      <rect x="26" y="14" width="4" height="14" rx="1" fill="#4da6ff" opacity="0.7"/>
      <line x1="2" y1="28" x2="30" y2="28" stroke="#5ba3d9" strokeWidth="1.5"/>
      <ellipse cx="5" cy="18" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.5)"/>
    </svg>
  ),
  formula: (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <defs>
        <linearGradient id="ic2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c084fc"/><stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="26" height="26" rx="4" fill="url(#ic2)"/>
      <rect x="3" y="3" width="26" height="13" rx="4" fill="rgba(255,255,255,0.15)"/>
      <text x="16" y="14" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold" fontFamily="serif">Σ</text>
      <text x="9" y="24" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.9)" fontFamily="monospace">f(x)</text>
      <text x="23" y="24" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.9)" fontFamily="monospace">μσ</text>
    </svg>
  ),
  code: (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <defs>
        <linearGradient id="ic3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4ade80"/><stop offset="100%" stopColor="#16a34a"/>
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="28" height="24" rx="3" fill="url(#ic3)"/>
      <rect x="2" y="4" width="28" height="10" rx="3" fill="rgba(255,255,255,0.2)"/>
      <rect x="2" y="4" width="28" height="4" rx="3" fill="#15803d"/>
      <circle cx="7" cy="6" r="1.5" fill="#ff5f57"/>
      <circle cx="12" cy="6" r="1.5" fill="#febc2e"/>
      <circle cx="17" cy="6" r="1.5" fill="#28c840"/>
      <rect x="7" y="16" width="8" height="1.5" rx="0.75" fill="rgba(255,255,255,0.7)"/>
      <rect x="7" y="20" width="14" height="1.5" rx="0.75" fill="rgba(255,255,255,0.5)"/>
      <rect x="7" y="24" width="10" height="1.5" rx="0.75" fill="rgba(255,255,255,0.5)"/>
      <rect x="17" y="16" width="6" height="1.5" rx="0.75" fill="rgba(255,255,255,0.4)"/>
    </svg>
  ),
  docs: (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <defs>
        <linearGradient id="ic4" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#d97706"/>
        </linearGradient>
      </defs>
      <rect x="5" y="2" width="22" height="28" rx="2" fill="url(#ic4)"/>
      <rect x="5" y="2" width="22" height="12" rx="2" fill="rgba(255,255,255,0.25)"/>
      <polygon points="21,2 27,2 27,8" fill="rgba(0,0,0,0.15)"/>
      <rect x="9" y="12" width="14" height="1.5" rx="0.75" fill="rgba(255,255,255,0.8)"/>
      <rect x="9" y="16" width="14" height="1.5" rx="0.75" fill="rgba(255,255,255,0.6)"/>
      <rect x="9" y="20" width="10" height="1.5" rx="0.75" fill="rgba(255,255,255,0.6)"/>
      <rect x="9" y="24" width="12" height="1.5" rx="0.75" fill="rgba(255,255,255,0.6)"/>
    </svg>
  ),
  run: (
    <svg viewBox="0 0 24 24" width="16" height="16">
      <defs>
        <linearGradient id="rungrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#d0eeff" stopOpacity="0.7"/>
        </linearGradient>
      </defs>
      <polygon points="5,3 20,12 5,21" fill="url(#rungrad)"/>
    </svg>
  ),
  logo: (
    <svg viewBox="0 0 28 28" width="20" height="20">
      <defs>
        <linearGradient id="lgrd" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc"/>
          <stop offset="50%" stopColor="#38bdf8"/>
          <stop offset="100%" stopColor="#0ea5e9"/>
        </linearGradient>
      </defs>
      <path d="M4 20L9 12L13 16L18 7L24 12" stroke="url(#lgrd)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24" cy="6" r="3" fill="#38bdf8"/>
      <circle cx="24" cy="6" r="1.5" fill="white" opacity="0.8"/>
    </svg>
  )
};

// ─── Default presets ──────────────────────────────────────────────────────────
const DEFAULT_PRESETS = [
  {
    id: "nifty50", label: "Nifty 50 Blue Chips",
    tickers: `IDFCFIRSTB.NS, PNB.NS, AUBANK.NS, HDFCBANK.NS, ICICIBANK.NS,
BAJAJFINSV.NS, CIPLA.NS, DRREDDY.NS, IPCALAB.NS, LUPIN.NS,
ZYDUSLIFE.NS, SBICARD.NS, ASIANPAINT.NS, HINDUNILVR.NS, TCS.NS,
INFY.NS, LT.NS, MARUTI.NS, SUNPHARMA.NS, WIPRO.NS,
ADANIGREEN.NS, ADANIPOWER.NS, DLF.NS, DMART.NS, EICHERMOT.NS,
FEDERALBNK.NS, GAIL.NS, HAVELLS.NS, HCLTECH.NS, HDFCAMC.NS,
HEROMOTOCO.NS, HINDALCO.NS, IEX.NS, INDIGO.NS, INDUSTOWER.NS,
INDUSINDBK.NS, IOC.NS, IRCTC.NS, ITC.NS, JINDALSTEL.NS,
JSWSTEEL.NS, KOTAKBANK.NS, LTIM.NS, M&M.NS, MARICO.NS,
MPHASIS.NS, NAUKRI.NS, NESTLEIND.NS, NHPC.NS, NTPC.NS,
ONGC.NS, PAGEIND.NS, PFC.NS, POWERGRID.NS, RECLTD.NS,
RELIANCE.NS, SBIN.NS, SBILIFE.NS, SIEMENS.NS, SUZLON.NS,
TATACONSUM.NS, TATAPOWER.NS, TATASTEEL.NS, TECHM.NS, TITAN.NS,
TORNTPHARM.NS, TRENT.NS, VEDL.NS, AXISBANK.NS, HAL.NS`
  },
  {
    id: "midcap", label: "Motilal Midcap",
    tickers: `ETERNAL.NS, SHRIRAMFIN.NS, MCX.NS, CGPOWER.NS, APARINDS.NS, BEL.NS, MUTHOOTFIN.NS,
GROWW.NS, WAAREEENER.NS, PAYTM.NS, AMBER.NS, TVSMOTOR.NS, MOTHERSON.NS,
ATHERENERG.NS, PRESTIGE.NS, BAJFINANCE.NS, BDL.NS, INDUSINDBK.NS, SUZLON.NS,
ANGELONE.NS, RELIGARE.NS, SBIN.NS`
  },
  {
    id: "fang", label: "US Tech FAANG+",
    tickers: `AAPL, MSFT, GOOGL, AMZN, META, NVDA, TSLA, NFLX, ADBE, CRM, AMD, INTC, QCOM, AVGO, ORCL`
  },
  {
    id: "pharma", label: "India Pharma",
    tickers: `SUNPHARMA.NS, DRREDDY.NS, CIPLA.NS, DIVISLAB.NS, LUPIN.NS, TORNTPHARM.NS,
AUROPHARMA.NS, ALKEM.NS, IPCALAB.NS, ZYDUSLIFE.NS, GLENMARK.NS, BIOCON.NS`
  }
];

// ─── Simulation engine (unchanged logic) ─────────────────────────────────────
function simulateRun(tickers, params) {
  const { rfr, alpha, period, frontierPts, tradingDays } = params;
  const n = tickers.length;
  const seed = n * 137.5 + alpha * 99.1 + rfr * 5000 + period.length * 7;
  const rng = (k) => Math.abs(Math.sin(seed * 91.3 + k * 37.9 + k)) % 1;
  const mvRet = 0.04 + rng(1) * 0.06;
  const mvVol = 0.085 + rng(2) * 0.035;
  const mvSh = (mvRet - rfr) / mvVol;
  const msRet = 0.35 + rng(3) * 0.15;
  const msVol = 0.12 + rng(4) * 0.05;
  const msSh = (msRet - rfr) / msVol;
  const t = 0.4 + (1 - alpha) * 0.5;
  const balRet = mvRet + (msRet - mvRet) * t;
  const balVol = mvVol + (msVol - mvVol) * t * 0.7;
  const balSh = (balRet - rfr) / balVol;
  const balScore = alpha * (1 - 0.22) + (1 - alpha) * 0.94;
  const riskPct = Math.round(t * 35);
  const sharpePct = Math.round(80 + (1 - alpha) * 18);
  const k = Math.min(n, 11);
  let rem = 1.0;
  const rawW = [];
  for (let i = 0; i < k - 1; i++) { const w = rem * (0.07 + rng(i + 20) * 0.18); rawW.push(w); rem -= w; }
  rawW.push(rem);
  rawW.sort((a, b) => b - a);
  const holdings = tickers.slice(0, k).map((t, i) => {
    const ret = 0.10 + rng(i + 40) * 0.55;
    const vol = 0.14 + rng(i + 60) * 0.18;
    return { ticker: t, weight: rawW[i], ret, vol, sharpe: (ret - rfr) / vol };
  }).sort((a, b) => b.weight - a.weight);
  const naiveVol = holdings.reduce((s, h) => s + h.weight * h.vol, 0);
  const divRatio = naiveVol / balVol;
  const avgCorr = 0.18 + rng(99) * 0.12;
  const frontier = [];
  for (let i = 0; i < frontierPts; i++) {
    const tp = i / (frontierPts - 1);
    const fvol = mvVol + (msVol * 1.35 - mvVol) * Math.pow(tp, 0.7);
    const fret = mvRet + (msRet * 1.18 - mvRet) * Math.pow(tp, 0.55);
    const fsh = (fret - rfr) / fvol;
    frontier.push({ vol: fvol, ret: fret, sharpe: fsh, score: alpha * (1 - tp * 0.8) + (1 - alpha) * (tp * 0.95) });
  }
  const stocks = tickers.slice(0, 35).map((t, i) => ({ label: t, vol: 0.12 + rng(i + 70) * 0.28, ret: 0.05 + rng(i + 80) * 0.60 }));
  return { mv: { ret: mvRet, vol: mvVol, sharpe: mvSh }, ms: { ret: msRet, vol: msVol, sharpe: msSh }, bal: { ret: balRet, vol: balVol, sharpe: balSh, score: balScore }, riskPct, sharpePct, holdings, naiveVol, divRatio, avgCorr, activeN: k, frontier, stocks, params: { n, period, rfr, alpha, frontierPts, tradingDays } };
}

// ─── Windows 7 Aero design tokens ────────────────────────────────────────────
const W7 = {
  // Backgrounds
  desktop: "linear-gradient(160deg, #8a8a8a 0%, #0d2240 35%, #0f3060 60%, #aac6ff 100%)",
  taskbar: "linear-gradient(180deg, rgba(20,50,100,0.96) 0%, rgba(10,25,60,0.98) 100%)",
  glass: "linear-gradient(135deg, rgba(120,180,255,0.18) 0%, rgba(60,120,220,0.08) 50%, rgba(20,60,160,0.15) 100%)",
  glassHover: "linear-gradient(135deg, rgba(140,200,255,0.28) 0%, rgba(80,150,240,0.15) 50%, rgba(30,80,180,0.22) 100%)",
  panelBg: "linear-gradient(180deg, rgba(15,35,80,0.95) 0%, rgba(8,20,55,0.97) 100%)",
  cardBg: "linear-gradient(145deg, rgba(25,55,110,0.9) 0%, rgba(12,28,70,0.95) 100%)",
  inputBg: "linear-gradient(180deg, rgba(5,15,45,0.9) 0%, rgba(8,20,55,0.85) 100%)",
  // Borders
  borderGlass: "1px solid rgba(194, 194, 195, 0.25)",
  borderGlassBright: "1px solid rgba(150,210,255,0.45)",
  borderDark: "1px solid rgba(134, 178, 255, 0.8)",
  // Text
  textPrimary: "#e8f4ff",
  textSecondary: "#ffffff",
  textMuted: "#ffffff",
  textAccent: "#ffffff",
  textGold: "#ffd700",
  textGreen: "#4ade80",
  textAmber: "#fbbf24",
  textRed: "#f87171",
  // Accent colors
  accentBlue: "#66c7f5",
  accentGlow: "rgba(127, 214, 255, 0.4)",
  accentGreen: "#22c55e",
  accentAmber: "#f59e0b",
  // Shadows
  shadowPanel: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(150,210,255,0.15)",
  shadowCard: "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(150,210,255,0.1)",
  shadowGlow: "0 0 20px rgba(14,165,233,0.3)",
  shadowBtn: "0 4px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)",
  // Radius
  radiusPanel: 0,
  radiusCard: 4,
  radiusBtn: 4,
  radiusInput: 3,
  radiusChip: 3,
};

// ─── Shared Win7 glass button style ──────────────────────────────────────────
const win7Btn = (active = false, color = "#0078d4") => ({
  background: active
    ? `linear-gradient(180deg, ${color}dd 0%, ${color}99 45%, ${color}bb 46%, ${color}66 100%)`
    : `linear-gradient(180deg, rgba(201, 225, 255, 0.7) 0%, rgba(40,90,180,0.5) 45%, rgba(60,110,200,0.6) 46%, rgba(20,60,140,0.4) 100%)`,
  border: active ? `1px solid ${color}` : "1px solid rgba(100,160,255,0.4)",
  borderTop: active ? `1px solid ${color}ff` : "1px solid rgba(160,210,255,0.5)",
  boxShadow: active
    ? `0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.35), 0 0 12px ${color}44`
    : "0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
  color: "#ffffff",
  cursor: "pointer",
  transition: "all 0.15s",
  fontFamily: "'Segoe UI', Tahoma, sans-serif",
  textShadow: "0 1px 2px rgba(0,0,0,0.6)",
  borderRadius: W7.radiusBtn,
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function ParamSlider({ label, desc, min, max, step, value, format, onChange }) {
  return (
    <div style={{ background: W7.inputBg, border: W7.borderGlass, borderRadius: W7.radiusCard, padding: "10px 12px", marginBottom: 7, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4), 0 1px 0 rgba(100,160,255,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: W7.textSecondary, fontFamily: "'Segoe UI', sans-serif" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: W7.textAccent, fontVariantNumeric: "tabular-nums", textShadow: `0 0 8px ${W7.accentBlue}` }}>{format(value)}</span>
      </div>
      <div style={{ fontSize: 10.5, color: W7.textMuted, marginBottom: 6 }}>{desc}</div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#38bdf8", cursor: "pointer", height: 4 }} />
    </div>
  );
}

function ParamSelect({ label, desc, options, value, onChange }) {
  return (
    <div style={{ background: W7.inputBg, border: W7.borderGlass, borderRadius: W7.radiusCard, padding: "10px 12px", marginBottom: 7, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4), 0 1px 0 rgba(100,160,255,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: W7.textSecondary, fontFamily: "'Segoe UI', sans-serif" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: W7.textAccent, textShadow: `0 0 8px ${W7.accentBlue}` }}>{value}</span>
      </div>
      <div style={{ fontSize: 10.5, color: W7.textMuted, marginBottom: 6 }}>{desc}</div>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "5px 8px", background: "rgba(5,15,45,0.95)", border: "1px solid rgba(80,130,200,0.4)", borderRadius: 3, fontFamily: "'Segoe UI', sans-serif", fontSize: 11, color: W7.textSecondary, outline: "none", cursor: "pointer" }}>
        {options.map(o => <option key={o} style={{ background: "#0a1628" }}>{o}</option>)}
      </select>
    </div>
  );
}

// Fully editable chips with write-in support
function ChipsEditor({ presets, activeId, onSelect, onAdd, onRemove, onRename }) {
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const inputRef = useRef(null);
  const newRef = useRef(null);

  useEffect(() => { if (editingId && inputRef.current) inputRef.current.focus(); }, [editingId]);
  useEffect(() => { if (adding && newRef.current) newRef.current.focus(); }, [adding]);

  const startEdit = (e, preset) => { e.stopPropagation(); setEditingId(preset.id); setEditVal(preset.label); };
  const commitEdit = () => { if (editVal.trim()) onRename(editingId, editVal.trim()); setEditingId(null); };
  const commitAdd = () => { if (newLabel.trim()) { onAdd(newLabel.trim()); setNewLabel(""); } setAdding(false); };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
      {presets.map(p => (
        <div key={p.id}>
          {editingId === p.id ? (
            <input ref={inputRef} value={editVal} onChange={e => setEditVal(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null); }}
              style={{ padding: "4px 8px", border: "1px solid #38bdf8", borderRadius: 3, fontSize: 11, fontWeight: 600, color: "#e8f4ff", background: "rgba(15,40,100,0.9)", outline: "none", boxShadow: "0 0 8px rgba(56,189,248,0.4)", width: Math.max(80, editVal.length * 7), fontFamily: "'Segoe UI', sans-serif" }} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "4px 8px 4px 10px", background: activeId === p.id ? "linear-gradient(180deg,rgba(14,165,233,0.5) 0%,rgba(7,89,133,0.6) 100%)" : W7.glass, border: activeId === p.id ? "1px solid rgba(14,165,233,0.7)" : W7.borderGlass, borderRadius: W7.radiusChip, cursor: "pointer", boxShadow: activeId === p.id ? "0 0 10px rgba(14,165,233,0.3), inset 0 1px 0 rgba(255,255,255,0.15)" : "inset 0 1px 0 rgba(255,255,255,0.08)", transition: "all 0.12s" }}>
              <span onClick={() => onSelect(p.id)} style={{ fontSize: 11, fontWeight: 600, color: activeId === p.id ? "#e0f2ff" : W7.textSecondary, whiteSpace: "nowrap", textShadow: activeId === p.id ? "0 0 6px rgba(56,189,248,0.6)" : "none", fontFamily: "'Segoe UI', sans-serif" }}>{p.label}</span>
              <span onDoubleClick={e => startEdit(e, p)} title="Double-click to rename" style={{ fontSize: 9, color: W7.textMuted, cursor: "text", marginLeft: 1 }}>✎</span>
              {presets.length > 1 && <span onClick={e => { e.stopPropagation(); onRemove(p.id); }} style={{ fontSize: 11, color: W7.textMuted, cursor: "pointer", lineHeight: 1, marginLeft: 1, paddingLeft: 2 }}>×</span>}
            </div>
          )}
        </div>
      ))}
      {adding ? (
        <input ref={newRef} value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Preset name…"
          onBlur={commitAdd} onKeyDown={e => { if (e.key === "Enter") commitAdd(); if (e.key === "Escape") setAdding(false); }}
          style={{ padding: "4px 10px", border: "1px solid #0ea5e9", borderRadius: 3, fontSize: 11, outline: "none", background: "rgba(5,20,60,0.9)", color: "#7dd3fc", width: 100, fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 0 8px rgba(14,165,233,0.3)" }} />
      ) : (
        <button onClick={() => setAdding(true)} style={{ padding: "4px 10px", background: W7.glass, border: W7.borderGlass, borderRadius: W7.radiusChip, fontSize: 11, fontWeight: 600, color: W7.textMuted, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)" }}>+ New</button>
      )}
    </div>
  );
}

// Frontier SVG (same logic, Win7 colors)
function FrontierChart({ result }) {
  const W = 580, H = 240, pad = { l: 46, r: 20, t: 16, b: 36 };
  const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
  const { frontier, stocks, mv, ms, bal } = result;
  const allVols = [...frontier.map(p => p.vol), ...stocks.map(s => s.vol), mv.vol, ms.vol, bal.vol];
  const allRets = [...frontier.map(p => p.ret), ...stocks.map(s => s.ret), mv.ret, ms.ret, bal.ret];
  const minV = Math.min(...allVols) * 0.92, maxV = Math.max(...allVols) * 1.05;
  const minR = Math.min(...allRets) * 0.85, maxR = Math.max(...allRets) * 1.08;
  const sx = v => pad.l + (v - minV) / (maxV - minV) * iW;
  const sy = r => pad.t + (1 - (r - minR) / (maxR - minR)) * iH;
  const fPath = frontier.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.vol).toFixed(1)},${sy(p.ret).toFixed(1)}`).join(" ");
  const cmlSlope = bal.sharpe;
  const cmlX1 = maxV * 1.05, cmlY1 = result.params.rfr + cmlSlope * (cmlX1);
  const yTicks = [minR, (minR + maxR) / 2, maxR].map(r => ({ r, y: sy(r), label: (r * 100).toFixed(0) + "%" }));
  const xTicks = [minV, (minV + maxV) / 2, maxV].map(v => ({ v, x: sx(v), label: (v * 100).toFixed(0) + "%" }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="fg7" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#3b82f6"/>
        </linearGradient>
        <filter id="glow7"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="starGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {yTicks.map(t => <line key={t.r} x1={pad.l} y1={t.y} x2={W - pad.r} y2={t.y} stroke="rgba(56,189,248,0.08)" strokeWidth="0.5"/>)}
      {xTicks.map(t => <line key={t.v} x1={t.x} y1={pad.t} x2={t.x} y2={H - pad.b} stroke="rgba(56,189,248,0.08)" strokeWidth="0.5"/>)}
      {yTicks.map(t => <text key={t.r} x={pad.l - 4} y={t.y + 3.5} textAnchor="end" fontSize="9" fill={W7.textMuted}>{t.label}</text>)}
      {xTicks.map(t => <text key={t.v} x={t.x} y={H - pad.b + 12} textAnchor="middle" fontSize="9" fill={W7.textMuted}>{t.label}</text>)}
      <text x={pad.l + iW / 2} y={H - 2} textAnchor="middle" fontSize="9" fill={W7.textMuted}>Volatility (Risk) →</text>
      <text x={10} y={pad.t + iH / 2} textAnchor="middle" fontSize="9" fill={W7.textMuted} transform={`rotate(-90,10,${pad.t + iH / 2})`}>Return →</text>
      <line x1={sx(0)} y1={sy(result.params.rfr)} x2={sx(Math.min(cmlX1, maxV * 0.98))} y2={sy(cmlY1)} stroke="#ffd700" strokeWidth="1" strokeDasharray="4,3" opacity="0.6"/>
      {stocks.map((s, i) => <circle key={i} cx={sx(s.vol)} cy={sy(s.ret)} r="3" fill="#38bdf8" opacity="0.2"/>)}
      <path d={fPath} fill="none" stroke="url(#fg7)" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow7)"/>
      <circle cx={sx(mv.vol)} cy={sy(mv.ret)} r="7" fill="#f87171" filter="url(#glow7)"/>
      <circle cx={sx(mv.vol)} cy={sy(mv.ret)} r="3" fill="rgba(255,255,255,0.8)"/>
      <text x={sx(mv.vol) + 10} y={sy(mv.ret) + 4} fontSize="10" fill="#fca5a5" fontWeight="600">Min Variance</text>
      <circle cx={sx(ms.vol)} cy={sy(ms.ret)} r="7" fill="#4ade80" filter="url(#glow7)"/>
      <circle cx={sx(ms.vol)} cy={sy(ms.ret)} r="3" fill="rgba(255,255,255,0.8)"/>
      <text x={sx(ms.vol) + 10} y={sy(ms.ret) + 4} fontSize="10" fill="#86efac" fontWeight="600">Max Sharpe</text>
      <circle cx={sx(bal.vol)} cy={sy(bal.ret)} r="13" fill="rgba(255,215,0,0.25)" filter="url(#starGlow)"/>
      <circle cx={sx(bal.vol)} cy={sy(bal.ret)} r="9" fill="#ffd700"/>
      <circle cx={sx(bal.vol)} cy={sy(bal.ret)} r="5" fill="#fff7aa"/>
      <text x={sx(bal.vol)} y={sy(bal.ret) + 3.5} textAnchor="middle" fontSize="9" fill="#92400e" fontWeight="900">★</text>
      <text x={sx(bal.vol) - 4} y={sy(bal.ret) - 18} textAnchor="middle" fontSize="10" fill="#ffd700" fontWeight="700">Balanced Optimal</text>
    </svg>
  );
}

// Donut (same logic, Win7 colors)
function DonutChart({ holdings }) {
  const cx = 90, cy = 90, r = 60;
  const total = holdings.reduce((s, h) => s + h.weight, 0);
  let cumAngle = -Math.PI / 2;
  const slices = holdings.slice(0, 8).map((h, i) => {
    const angle = (h.weight / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle), y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle), y2 = cy + r * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    return { path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, color: COLORS[i % COLORS.length], pct: h.weight / total * 100, label: h.ticker.replace(".NS", "") };
  });
  const wAvgSharpe = holdings.length > 0 ? holdings.reduce((s, h) => s + h.sharpe * h.weight, 0).toFixed(2) : "—";
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <svg viewBox="0 0 180 180" style={{ width: 130, height: 130, flexShrink: 0 }}>
        <defs><filter id="ds"><feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.6)"/></filter></defs>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.9} filter="url(#ds)"/>)}
        <circle cx={cx} cy={cy} r={40} fill="rgba(5,15,50,0.95)" stroke="rgba(56,189,248,0.2)" strokeWidth="1"/>
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="9" fill={W7.textMuted}>Sharpe</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="13" fontWeight="700" fill={W7.textAccent}>{wAvgSharpe}</text>
      </svg>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "3px 0", borderBottom: "1px solid rgba(56,189,248,0.06)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, boxShadow: `0 0 4px ${s.color}`, flexShrink: 0 }}/>
            <span style={{ fontSize: 10.5, color: W7.textSecondary, flex: 1, fontFamily: "'Segoe UI', sans-serif" }}>{s.label}</span>
            <span style={{ fontSize: 20, fontWeight: 1000, color: W7.textPrimary, fontVariantNumeric: "tabular-nums" }}>{s.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Score bar (same logic, Win7 colors)
function ScoreBar({ frontier }) {
  const scores = frontier.map(p => p.score);
  const maxS = Math.max(...scores), minS = Math.min(...scores);
  const bestIdx = scores.indexOf(maxS);
  const step = Math.max(1, Math.floor(frontier.length / 20));
  const display = frontier.filter((_, i) => i % step === 0 || i === bestIdx);
  const dispMax = Math.max(...display.map(p => p.score));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 72, marginTop: 8 }}>
      {display.map((p, i) => {
        const isBest = frontier.indexOf(p) === bestIdx;
        const h = ((p.score - minS) / (dispMax - minS) * 62 + 5);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div title={`Score: ${p.score.toFixed(3)}\nVol: ${(p.vol * 100).toFixed(1)}%\nRet: ${(p.ret * 100).toFixed(1)}%`}
              style={{ width: "100%", height: h, borderRadius: "2px 2px 0 0", background: isBest ? "linear-gradient(180deg,#ffd700,#f59e0b)" : "linear-gradient(180deg,rgba(56,189,248,0.5),rgba(14,165,233,0.2))", boxShadow: isBest ? "0 0 8px rgba(255,215,0,0.6)" : "none", transition: "height 0.3s" }}/>
          </div>
        );
      })}
    </div>
  );
}

// Windows 7 style card
function W7Card({ children, style = {} }) {
  return (
    <div style={{ background: W7.cardBg, border: W7.borderGlass, borderTop: "1px solid rgba(140,200,255,0.2)", borderRadius: W7.radiusCard, padding: "16px 18px", marginBottom: 12, boxShadow: W7.shadowCard, ...style }}>
      {children}
    </div>
  );
}

function CardTitle({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 700, color: W7.textPrimary, marginBottom: 3, display: "flex", alignItems: "center", gap: 8, fontFamily: "'Segoe UI', Tahoma, sans-serif", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{children}</div>;
}
function CardSub({ children }) {
  return <div style={{ fontSize: 11.5, color: W7.textMuted, marginBottom: 12, fontFamily: "'Segoe UI', sans-serif" }}>{children}</div>;
}

// Win7 badge tag
function W7Tag({ color = "blue", children }) {
  const colors = {
    blue: { bg: "rgba(14,165,233,0.2)", border: "rgba(14,165,233,0.4)", text: "#7dd3fc" },
    green: { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.35)", text: "#4ade80" },
    amber: { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.35)", text: "#fbbf24" },
    red: { bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.35)", text: "#f87171" },
  };
  const c = colors[color] || colors.blue;
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 3, fontSize: 10, fontWeight: 700, letterSpacing: 0.4, background: c.bg, border: `1px solid ${c.border}`, color: c.text, textShadow: `0 0 6px ${c.text}44`, fontFamily: "'Segoe UI', sans-serif" }}>{children}</span>;
}

// Formula block with Win7 styling
function FormulaBlock({ title, eq, desc, color = "blue" }) {
  const palette = {
    blue: { bg: "rgba(14,165,233,0.08)", border: "rgba(14,165,233,0.25)", title: "#7dd3fc", eqBg: "rgba(5,15,50,0.7)", eqBorder: "rgba(14,165,233,0.2)" },
    green: { bg: "rgba(34,197,94,0.07)", border: "rgba(34,197,94,0.2)", title: "#4ade80", eqBg: "rgba(5,15,50,0.7)", eqBorder: "rgba(34,197,94,0.2)" },
    amber: { bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.2)", title: "#fbbf24", eqBg: "rgba(5,15,50,0.7)", eqBorder: "rgba(245,158,11,0.2)" },
  };
  const c = palette[color] || palette.blue;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: W7.radiusCard, padding: "11px 13px", marginBottom: 9 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: c.title, marginBottom: 6, textShadow: `0 0 8px ${c.title}44`, fontFamily: "'Segoe UI', sans-serif" }}>{title}</div>
      {[].concat(eq).map((e, i) => (
        <div key={i} style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: 11.5, color: W7.textPrimary, padding: "5px 10px", background: c.eqBg, borderRadius: 2, border: `1px solid ${c.eqBorder}`, marginBottom: i < [].concat(eq).length - 1 ? 4 : 0 }}>{e}</div>
      ))}
      {desc && <div style={{ fontSize: 11, color: W7.textSecondary, marginTop: 6, lineHeight: 1.65, fontFamily: "'Segoe UI', sans-serif" }}>{desc}</div>}
    </div>
  );
}

// Code viewer with Win7 dark terminal aesthetic
function CodeView({ tickers, params }) {
  const [copied, setCopied] = useState(false);
  const config = `PORTFOLIO_LIST = [\n    ${tickers.map(t => `"${t}"`).join(", ")}\n]\n\nPERIOD          = "${params.period}"\nRISK_FREE_RATE  = ${params.rfr.toFixed(4)}\nFRONTIER_POINTS = ${params.frontierPts}\nALPHA           = ${params.alpha.toFixed(2)}\nTRADING_DAYS    = ${params.tradingDays}`;
  const fullCode = `# ============================================================
#  QuantLeaf — Balanced Optimal Portfolio Optimizer
#  CVXPY SOCP | scipy-1.14 safe | Plotly charts
# ============================================================

import numpy as np
import cvxpy as cp
import pandas as pd
import yfinance as yf
import plotly.graph_objects as go
from scipy.optimize import minimize, Bounds
import warnings
warnings.filterwarnings('ignore')

# ── CONFIG ─────────────────────────────────────────────────
${config}

# ── CHOLESKY WITH AUTO-JITTER ──────────────────────────────
def _cholesky(Sigma):
    jitter = 0.0
    for _ in range(15):
        try:
            return np.linalg.cholesky(Sigma + jitter * np.eye(len(Sigma)))
        except np.linalg.LinAlgError:
            jitter = 1e-10 if jitter == 0.0 else jitter * 10
    raise ValueError("Sigma is not PD even after jitter.")

# ── SOCP SOLVER (scipy-1.14 safe) ──────────────────────────
def _solve_min_vol_socp(L, mu_arr, n, return_lb=None):
    """
    min  ||L.T @ w||_2   (SOCP path — bypasses csc_matrix.A)
    s.t. sum(w) = 1, w >= 0, [w @ mu >= return_lb]
    """
    w = cp.Variable(n)
    constraints = [cp.sum(w) == 1, w >= 0]
    if return_lb is not None:
        constraints.append(mu_arr @ w >= return_lb)
    prob = cp.Problem(cp.Minimize(cp.norm(L.T @ w, 2)), constraints)
    for solver in [cp.CLARABEL, cp.SCS, cp.OSQP, cp.ECOS]:
        try:
            prob.solve(solver=solver, verbose=False)
        except Exception:
            continue
        if w.value is not None:
            return w.value
    return None

# ── BALANCED SCORING ───────────────────────────────────────
def find_balanced_optimal(frontier, alpha=ALPHA):
    vols   = np.array([p['vol']    for p in frontier])
    sharps = np.array([p['sharpe'] for p in frontier])
    norm_vol   = (vols - vols.min()) / (vols.max() - vols.min() + 1e-12)
    norm_sharp = (sharps - sharps.min()) / (sharps.max() - sharps.min() + 1e-12)
    scores     = alpha * (1 - norm_vol) + (1 - alpha) * norm_sharp
    best_idx   = int(np.argmax(scores))
    return frontier[best_idx], scores

# ── MAIN ───────────────────────────────────────────────────
if __name__ == "__main__":
    raw    = yf.download(PORTFOLIO_LIST, period=PERIOD,
                         auto_adjust=False, progress=False)['Adj Close']
    prices = raw.ffill().bfill().dropna(axis=1, how='any')
    log_ret= np.log(prices / prices.shift(1)).dropna()
    mu     = log_ret.mean().values * TRADING_DAYS
    Sigma_raw = log_ret.cov().values * TRADING_DAYS
    evals, ev = np.linalg.eigh(Sigma_raw)
    Sigma  = ev @ np.diag(np.maximum(evals, 1e-8)) @ ev.T
    L      = _cholesky(Sigma)
    n      = len(mu)

    mv_w   = _solve_min_vol_socp(L, mu, n)
    mv_ret = float(mv_w @ mu)
    targets = np.linspace(mv_ret, np.max(mu) * 0.92, FRONTIER_POINTS)
    frontier = []
    for t in targets:
        wv = _solve_min_vol_socp(L, mu, n, return_lb=float(t))
        if wv is not None:
            wv = np.maximum(wv, 0); wv /= wv.sum()
            r = float(wv @ mu); v = float(np.sqrt(wv @ Sigma @ wv))
            frontier.append({'weights': wv, 'return': r, 'vol': v,
                             'sharpe': (r - RISK_FREE_RATE) / v})

    best, scores = find_balanced_optimal(frontier)
    print(f"Expected Return : {best['return']*100:.2f}%")
    print(f"Volatility      : {best['vol']*100:.2f}%")
    print(f"Sharpe Ratio    : {best['sharpe']:.4f}")`;

  const highlighted = fullCode
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(#.*$)/gm, '<span style="color:#6272a4;font-style:italic">$1</span>')
    .replace(/\b(import|from|as|def|return|if|for|in|is|not|None|True|False|raise|try|except|continue|and|class)\b/g, '<span style="color:#ff79c6">$1</span>')
    .replace(/("[^"]*"|'[^']*')/g, '<span style="color:#f1fa8c">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#bd93f9">$1</span>');

  return (
    <div style={{ background: "linear-gradient(180deg,#0d1117 0%,#0a0e1a 100%)", borderRadius: W7.radiusCard, overflow: "hidden", border: "1px solid rgba(56,189,248,0.2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "rgba(14,165,233,0.1)", borderBottom: "1px solid rgba(56,189,248,0.15)" }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: W7.textAccent, fontFamily: "'Courier New', monospace" }}>balanced_portfolio_optimizer.py</span>
        <button onClick={() => { navigator.clipboard.writeText(fullCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }); }}
          style={{ ...win7Btn(false), fontSize: 11, padding: "3px 10px", color: copied ? "#4ade80" : W7.textAccent }}>
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <pre style={{ padding: "12px 14px", fontFamily: "'Courier New', Courier, monospace", fontSize: 10.5, lineHeight: 1.7, color: "#f8f8f2", maxHeight: 400, overflowY: "auto", margin: 0, overflowX: "auto" }}>
        <span dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

function DocsSection() {
  const items = [
    { color: "#38bdf8", title: "Why SOCP instead of QP?", content: "CVXPY 1.4+ routes cp.quad_form(w, Σ) through ConeMatrixStuffing → CoeffExtractor.quad_form(), which internally calls csc_matrix.A — removed in scipy ≥ 1.14, causing an AttributeError. Using cp.norm(L.T @ w, 2) forces the SOCP cone path, bypassing the broken extractor while sharing the exact same optimal point." },
    { color: "#4ade80", title: "Cholesky with Auto-Jitter", content: "After eigenvalue-clamping (PSD correction), the matrix may still be numerically singular. _cholesky() progressively adds diagonal jitter (1e-10 → 1e-9 → ... up to 15 attempts) until Cholesky succeeds, avoiding cryptic LinAlgError failures on highly correlated tickers." },
    { color: "#fbbf24", title: "Solver Cascade", content: "Each SOCP problem tries CLARABEL → SCS → OSQP → ECOS in order. CLARABEL (Rust-based) handles most cases fastest. SCS is a first-order method good for large sparse problems. OSQP and ECOS are fallbacks. Failing points are silently skipped." },
    { color: "#a78bfa", title: "α Parameter Intuition", content: "α = 0.5 (default): equal weight to safety and Sharpe. α → 1: converges to Min Variance. α → 0: converges to Max Sharpe. The default empirically falls near the frontier elbow for most Indian equity baskets." },
    { color: "#f87171", title: "Long-Only Constraint", content: "All three problems enforce w ≥ 0 (no shorting) and 1ᵀw = 1 (fully invested). Removing w ≥ 0 produces the unconstrained efficient frontier — valid for institutional desks with short-selling access." },
    { color: "#94a3b8", title: "Known Limitations", content: "MPT assumes normally distributed returns (violated in practice). The model is backward-looking: past covariance and means are noisy estimators. No transaction costs, taxes, or position limits. Consider Black-Litterman or shrinkage estimators for production use." },
  ];
  return (
    <W7Card>
      <CardTitle>Full Documentation</CardTitle>
      <CardSub>Architecture, design decisions, and configuration guide</CardSub>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {items.map((item, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${item.color}`, paddingLeft: 13, boxShadow: `-1px 0 8px ${item.color}22` }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: item.color, marginBottom: 3, textShadow: `0 0 8px ${item.color}44`, fontFamily: "'Segoe UI', sans-serif" }}>{item.title}</div>
            <div style={{ fontSize: 11.5, color: W7.textSecondary, lineHeight: 1.7, fontFamily: "'Segoe UI', sans-serif" }}>{item.content}</div>
          </div>
        ))}
      </div>
    </W7Card>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [presets, setPresets] = useState(DEFAULT_PRESETS);
  const [activePresetId, setActivePresetId] = useState("nifty50");
  const [tickerInput, setTickerInput] = useState(DEFAULT_PRESETS[0].tickers);
  const [rfr, setRfr] = useState(6.35);
  const [alpha, setAlpha] = useState(0.5);
  const [period, setPeriod] = useState("1y");
  const [frontierPts, setFrontierPts] = useState(100);
  const [tradingDays, setTradingDays] = useState(252);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("results");

  const tickers = tickerInput.split(/[\s,\n]+/).map(t => t.trim()).filter(t => t.length > 1);

  const selectPreset = useCallback((id) => {
    setActivePresetId(id);
    const p = presets.find(x => x.id === id);
    if (p) setTickerInput(p.tickers);
  }, [presets]);

  const addPreset = useCallback((label) => {
    const id = "custom_" + Date.now();
    setPresets(ps => [...ps, { id, label, tickers: tickerInput }]);
    setActivePresetId(id);
  }, [tickerInput]);

  const removePreset = useCallback((id) => {
    setPresets(ps => {
      const next = ps.filter(x => x.id !== id);
      if (activePresetId === id && next.length > 0) { setActivePresetId(next[0].id); setTickerInput(next[0].tickers); }
      return next;
    });
  }, [activePresetId]);

  const renamePreset = useCallback((id, label) => {
    setPresets(ps => ps.map(p => p.id === id ? { ...p, label } : p));
  }, []);

  const runOptimizer = async () => {
    if (tickers.length < 2) return;
    setStatus("running"); setActiveTab("results");
    await new Promise(r => setTimeout(r, 500));
    setStatus("computing");
    await new Promise(r => setTimeout(r, 600));
    setStatus("scoring");
    await new Promise(r => setTimeout(r, 350));
    const params = { rfr: rfr / 100, alpha, period, frontierPts, tradingDays };
    setResult(simulateRun(tickers, params));
    setStatus("done");
  };

  const isRunning = ["running", "computing", "scoring"].includes(status);
  const statusLabel = { idle: "Ready", running: "Downloading data…", computing: "Computing frontier…", scoring: "Scoring portfolios…", done: "Complete" }[status];

  const tabs = [
    { id: "results", label: "Results", icon: Win7Icons.chart },
    { id: "formulas", label: "Formulas", icon: Win7Icons.formula },
    { id: "code", label: "Code", icon: Win7Icons.code },
    { id: "docs", label: "Docs", icon: Win7Icons.docs },
  ];

  const metricConfig = [
    { label: "Expected Return", val: result ? (result.bal.ret * 100).toFixed(2) + "%" : "—", sub: "annualised (log)", color: W7.textGreen, glow: "#22c55e" },
    { label: "Volatility", val: result ? (result.bal.vol * 100).toFixed(2) + "%" : "—", sub: "annualised std dev", color: W7.textAmber, glow: "#f59e0b" },
    { label: "Sharpe Ratio", val: result ? result.bal.sharpe.toFixed(3) : "—", sub: `vs ${rfr.toFixed(2)}% risk-free`, color: W7.textAccent, glow: W7.accentBlue },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, 'Geneva', Verdana, sans-serif", background: W7.desktop, minHeight: "100vh", color: W7.textPrimary, fontSize: 13 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Segoe+UI:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes win7glow { 0%,100%{box-shadow:0 0 10px rgba(14,165,233,0.3)} 50%{box-shadow:0 0 20px rgba(14,165,233,0.6)} }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(5,15,50,0.5); }
        ::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.3); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(56,189,248,0.5); }
        input[type=range] { -webkit-appearance: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: linear-gradient(180deg, #7dd3fc 0%, #0ea5e9 100%); border: 2px solid rgba(255,255,255,0.4); box-shadow: 0 0 6px rgba(14,165,233,0.6); }
        input[type=range]::-webkit-slider-runnable-track { height: 4px; background: rgba(14,165,233,0.25); border-radius: 2px; border: 1px solid rgba(14,165,233,0.2); }
      `}</style>

      {/* TASKBAR / NAV */}
      <div style={{ background: W7.taskbar, borderBottom: "1px solid rgba(56,189,248,0.2)", display: "flex", alignItems: "center", padding: "0 16px", height: 46, gap: 10, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(100,160,255,0.12)" }}>
        {/* Logo area — Win7 Orb style */}
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #7dd3fc, #0ea5e9 45%, #0369a1 80%)", boxShadow: "0 0 12px rgba(14,165,233,0.7), inset 0 2px 4px rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {Win7Icons.logo}
        </div>
        <span style={{ fontWeight: 700, fontSize: 20, color: W7.textPrimary, letterSpacing: -0.3, textShadow: "0 0 10px rgba(125,211,252,0.5)" }}>QuantLeaf</span>
        <span style={{ fontSize: 11, color: W7.textMuted, fontWeight: 400 }}>Portfolio Optimizer</span>

        {/* Win7-style separator */}
        <div style={{ width: 1, height: 22, background: "rgba(56,189,248,0.2)", margin: "0 4px" }}/>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {/* Status indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 3 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: status === "done" ? "#22c55e" : isRunning ? "#f59e0b" : "#4a7aaa", boxShadow: status === "done" ? "0 0 6px #22c55e" : isRunning ? "0 0 6px #f59e0b" : "none", animation: isRunning ? "pulse 1s infinite" : "none" }}/>
            <span style={{ fontSize: 11, color: W7.textSecondary }}>{statusLabel}</span>
          </div>
          <div style={{ padding: "3px 10px", background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.25)", borderRadius: 3, fontSize: 11, fontWeight: 600, color: W7.textAccent, textShadow: "0 0 6px rgba(125,211,252,0.4)" }}>NSE / BSE / US</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", height: "calc(100vh - 46px)" }}>

        {/* SIDEBAR — Win7 panel */}
        <aside style={{ background: W7.panelBg, borderRight: "1px solid rgba(56,189,248,0.15)", overflowY: "auto", padding: "14px 12px", boxShadow: "inset -1px 0 0 rgba(14,165,233,0.08)" }}>

          {/* Section label style */}
          {[
            { label: "PRESETS", first: true },
          ].map(s => null)}

          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.9px", color: W7.textMuted, margin: "0 3px 7px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(56,189,248,0.15)" }}/>
            <span>Presets</span>
            <div style={{ flex: 1, height: 1, background: "rgba(56,189,248,0.15)" }}/>
          </div>

          <ChipsEditor presets={presets} activeId={activePresetId} onSelect={selectPreset} onAdd={addPreset} onRemove={removePreset} onRename={renamePreset} />

          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.9px", color: W7.textMuted, margin: "16px 3px 7px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(56,189,248,0.15)" }}/>
            <span>Ticker List</span>
            <div style={{ flex: 1, height: 1, background: "rgba(56,189,248,0.15)" }}/>
          </div>

          <div style={{ background: W7.inputBg, border: W7.borderGlass, borderRadius: W7.radiusCard, padding: 10, boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5), 0 1px 0 rgba(100,160,255,0.08)" }}>
            <textarea value={tickerInput} onChange={e => { setTickerInput(e.target.value); setActivePresetId(""); }}
              placeholder={"Enter tickers separated by commas or newlines…\ne.g. HDFCBANK.NS, INFY.NS, TCS.NS"}
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: "'Courier New', monospace", fontSize: 14, color: W7.textSecondary, resize: "none", height: 100, lineHeight: 1.65 }} />
            <div style={{ fontSize: 10.5, paddingTop: 6, borderTop: "1px solid rgba(56,189,248,0.1)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: tickers.length < 2 ? W7.textRed : W7.textGreen, textShadow: tickers.length < 2 ? "0 0 6px #f87171" : "0 0 6px #4ade80" }}>{tickers.length < 2 ? "⚠ Need ≥ 2 tickers" : `✓ ${tickers.length} tickers`}</span>
              <span style={{ color: W7.textMuted }}>{tickers.length} detected</span>
            </div>
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.9px", color: W7.textMuted, margin: "16px 3px 7px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(56,189,248,0.15)" }}/>
            <span>Parameters</span>
            <div style={{ flex: 1, height: 1, background: "rgba(56,189,248,0.15)" }}/>
          </div>

          <ParamSlider label="Risk-Free Rate" desc="10-year G-Sec / T-bill yield used for Sharpe" min={2} max={12} step={0.05} value={rfr} format={v => v.toFixed(2) + "%"} onChange={setRfr} />
          <ParamSlider label="Safety Preference (α)" desc="0 = pure Sharpe · 0.5 = balanced · 1 = min variance" min={0} max={1} step={0.05} value={alpha} format={v => v.toFixed(2)} onChange={setAlpha} />
          <ParamSlider label="Frontier Resolution" desc="Number of portfolios sampled along the frontier" min={20} max={200} step={10} value={frontierPts} format={v => Math.round(v) + " pts"} onChange={setFrontierPts} />
          <ParamSelect label="Lookback Period" desc="Historical data window for return estimation" options={["3mo","6mo","1y","2y","3y","5y"]} value={period} onChange={setPeriod} />
          <ParamSelect label="Trading Days / Year" desc="NSE 252; 250 conservative; 260 all weekdays" options={["250","252","260"]} value={String(tradingDays)} onChange={v => setTradingDays(parseInt(v))} />

          {/* WIN7 RUN BUTTON */}
          <button onClick={runOptimizer} disabled={tickers.length < 2 || isRunning}
            style={{ width: "100%", padding: "10px 0", marginTop: 14, border: "none", borderRadius: W7.radiusBtn, fontFamily: "'Segoe UI', sans-serif", fontSize: 13, fontWeight: 700, cursor: tickers.length < 2 || isRunning ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: tickers.length < 2 ? 0.5 : 1, position: "relative", overflow: "hidden",
              background: isRunning ? "linear-gradient(180deg,rgba(14,165,233,0.3) 0%,rgba(7,89,133,0.4) 100%)" : "linear-gradient(180deg,rgba(56,189,248,0.8) 0%,rgba(14,165,233,0.6) 45%,rgba(2,132,199,0.7) 46%,rgba(7,89,133,0.5) 100%)",
              boxShadow: isRunning ? "none" : "0 3px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2), 0 0 15px rgba(14,165,233,0.3)",
              color: "white", textShadow: "0 1px 3px rgba(0,0,0,0.7)", letterSpacing: 0.3,
              borderTop: "1px solid rgba(125,211,252,0.6)", borderBottom: "1px solid rgba(7,89,133,0.8)", borderLeft: "1px solid rgba(56,189,248,0.4)", borderRight: "1px solid rgba(56,189,248,0.4)" }}>
            {isRunning ? (
              <>
                <svg viewBox="0 0 14 14" width="14" height="14"><circle cx="7" cy="7" r="5" fill="none" stroke="rgba(125,211,252,0.9)" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="0"><animateTransform attributeName="transform" type="rotate" from="0 7 7" to="360 7 7" dur="0.8s" repeatCount="indefinite"/></circle></svg>
                Optimising…
              </>
            ) : (
              <>
                {Win7Icons.run}
                Run Optimizer
              </>
            )}
            {/* Gloss overlay */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(180deg,rgba(255,255,255,0.2) 0%,rgba(255,255,255,0.05) 100%)", borderRadius: `${W7.radiusBtn}px ${W7.radiusBtn}px 0 0`, pointerEvents: "none" }}/>
          </button>

          <div style={{ textAlign: "center", marginTop: 8, fontSize: 10.5, color: W7.textMuted }}>
            Simulates the Python optimizer output
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main style={{ overflowY: "auto", padding: "20px 22px", background: "linear-gradient(180deg,rgba(10,22,55,0.4) 0%,transparent 100%)" }}>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 24, fontWeight: 1000, letterSpacing: -0.5, color: W7.textPrimary, textShadow: "0 0 20px rgba(125,211,252,0.3)" }}>QuantLeaf</div>
            <div style={{ fontSize: 20, color: W7.textMuted }}>Modern Portfolio Optimizer · Efficient Frontier · Balanced Sharpe</div>
          </div>

          {/* WIN7 TABS */}
          <div style={{ display: "flex", gap: 1, marginBottom: 18, background: "rgba(5,15,50,0.5)", borderRadius: `${W7.radiusCard}px ${W7.radiusCard}px 0 0`, border: "1px solid rgba(56,189,248,0.15)", borderBottom: "1px solid rgba(56,189,248,0.25)", padding: "3px 3px 0", width: "fit-content" }}>
            {tabs.map(t => (
              <div key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 16px 7px", cursor: "pointer", borderRadius: `${W7.radiusCard}px ${W7.radiusCard}px 0 0`, fontSize: 12, fontWeight: 600, transition: "all 0.15s", fontFamily: "'Segoe UI', sans-serif", position: "relative",
                  background: activeTab === t.id ? "linear-gradient(180deg,rgba(30,70,150,0.9) 0%,rgba(15,35,90,0.95) 100%)" : "transparent",
                  color: activeTab === t.id ? W7.textPrimary : W7.textMuted,
                  borderTop: activeTab === t.id ? "1px solid rgba(125,211,252,0.5)" : "1px solid transparent",
                  borderLeft: activeTab === t.id ? "1px solid rgba(56,189,248,0.25)" : "1px solid transparent",
                  borderRight: activeTab === t.id ? "1px solid rgba(56,189,248,0.25)" : "1px solid transparent",
                  boxShadow: activeTab === t.id ? "inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
                  textShadow: activeTab === t.id ? "0 0 8px rgba(125,211,252,0.4)" : "none",
                }}>
                {t.icon}
                {t.label}
                {activeTab === t.id && <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,rgba(14,165,233,0.6),transparent)" }}/>}
              </div>
            ))}
          </div>

          {/* ── RESULTS TAB ── */}
          {activeTab === "results" && (
            <>
              {!result ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <svg viewBox="0 0 64 64" width="56" height="56" fill="none" style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }}>
                    <path d="M8 46L20 28L28 36L40 20L56 30" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="56" cy="12" r="6" fill="#0ea5e9" opacity="0.8"/>
                    <circle cx="56" cy="12" r="3" fill="white" opacity="0.6"/>
                  </svg>
                  <div style={{ fontSize: 15, fontWeight: 600, color: W7.textSecondary, marginBottom: 6 }}>Configure & Run</div>
                  <div style={{ fontSize: 12.5, color: W7.textMuted, lineHeight: 1.65, maxWidth: 320, margin: "0 auto" }}>
                    Select a preset or enter your own tickers, tweak the parameters on the left, then click <strong style={{ color: W7.textAccent }}>Run Optimizer</strong> to see the balanced portfolio results.
                  </div>
                </div>
              ) : (
                <>
                  {/* Metric cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
                    {metricConfig.map((m, i) => (
                      <div key={i} style={{ background: W7.cardBg, border: W7.borderGlass, borderTop: `2px solid ${m.glow}55`, borderRadius: W7.radiusCard, padding: "13px 15px", boxShadow: W7.shadowCard, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(180deg,rgba(255,255,255,0.04) 0%,transparent 100%)", pointerEvents: "none" }}/>
                        <div style={{ fontSize: 9.5, fontWeight: 700, color: W7.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 5 }}>{m.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: m.color, letterSpacing: -0.5, lineHeight: 1, textShadow: `0 0 12px ${m.glow}66` }}>{m.val}</div>
                        <div style={{ fontSize: 10.5, color: W7.textMuted, marginTop: 4 }}>{m.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Banner */}
                  <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: W7.radiusCard, padding: "8px 13px", marginBottom: 12, fontSize: 11.5, color: "#86efac", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 0 12px rgba(34,197,94,0.1)" }}>
                    <span style={{ color: "#ffd700", textShadow: "0 0 8px #ffd700" }}>★</span>
                    <span>Portfolio at the <strong>{result.riskPct}th percentile of risk</strong> and <strong>{result.sharpePct}th percentile of Sharpe</strong> — low-risk with near-peak efficiency</span>
                    <span style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums", fontWeight: 700, color: W7.textAccent, textShadow: "0 0 6px rgba(125,211,252,0.5)" }}>Score: {result.bal.score.toFixed(4)}</span>
                  </div>

                  {/* Frontier chart */}
                  <W7Card>
                    <CardTitle>Efficient Frontier</CardTitle>
                    <CardSub>{result.params.n} tickers · {result.frontier.length} frontier portfolios · {period} lookback</CardSub>
                    <FrontierChart result={result} />
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10.5, color: W7.textMuted, marginBottom: 4 }}>Combined Score Distribution (★ = selected)</div>
                      <ScoreBar frontier={result.frontier} />
                    </div>
                  </W7Card>

                  {/* Allocation */}
                  <W7Card>
                    <CardTitle><W7Tag color="green">★ Balanced Optimal</W7Tag> Portfolio Allocation</CardTitle>
                    <CardSub>α = {alpha.toFixed(2)} · {result.activeN} active holdings · avg pairwise ρ = {result.avgCorr.toFixed(3)}</CardSub>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                      <DonutChart holdings={result.holdings} />
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>{["#","Ticker","Weight","Return","Vol","Sharpe"].map(h => (
                            <th key={h} style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", color: W7.textMuted, padding: "0 5px 7px", textAlign: h === "#" || h === "Ticker" ? "left" : "right", borderBottom: "1px solid rgba(56,189,248,0.12)" }}>{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {result.holdings.map((h, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid rgba(56,189,248,0.07)" }}>
                              <td style={{ padding: "5px 5px", fontSize: 10.5 }}>
                                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 17, height: 17, background: "rgba(14,165,233,0.2)", border: "1px solid rgba(14,165,233,0.3)", color: W7.textAccent, borderRadius: 3, fontSize: 9, fontWeight: 700 }}>{i + 1}</span>
                              </td>
                              <td style={{ padding: "5px 5px", fontSize: 20, fontWeight: 600, color: W7.textSecondary }}>{h.ticker.replace(".NS", "")}</td>
                              <td style={{ padding: "5px 5px", fontSize: 11, textAlign: "right", fontVariantNumeric: "tabular-nums", color: W7.textPrimary }}>
                                {(h.weight * 100).toFixed(2)}%
                                <div style={{ width: 44, height: 3, background: "rgba(56,189,248,0.15)", borderRadius: 2, overflow: "hidden", marginLeft: "auto", marginTop: 2 }}>
                                  <div style={{ width: `${(h.weight / result.holdings[0].weight) * 100}%`, height: "100%", background: "linear-gradient(90deg,#22d3ee,#3b82f6)", borderRadius: 2 }}/>
                                </div>
                              </td>
                              <td style={{ padding: "5px 5px", fontSize: 11, textAlign: "right", color: h.ret > 0.1 ? W7.textGreen : W7.textMuted, fontVariantNumeric: "tabular-nums" }}>{(h.ret * 100).toFixed(1)}%</td>
                              <td style={{ padding: "5px 5px", fontSize: 11, textAlign: "right", color: W7.textSecondary, fontVariantNumeric: "tabular-nums" }}>{(h.vol * 100).toFixed(1)}%</td>
                              <td style={{ padding: "5px 5px", fontSize: 11, textAlign: "right", color: h.sharpe > 1 ? W7.textAccent : W7.textMuted, fontVariantNumeric: "tabular-nums", textShadow: h.sharpe > 1 ? "0 0 6px rgba(125,211,252,0.4)" : "none" }}>{h.sharpe.toFixed(3)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </W7Card>

                  {/* Strategy Comparison */}
                  <W7Card>
                    <CardTitle>Strategy Comparison</CardTitle>
                    <CardSub>Head-to-head across the three anchor portfolios</CardSub>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                      {[
                        { label: "Min Variance", d: result.mv, hl: false },
                        { label: "Balanced Optimal", d: result.bal, hl: true },
                        { label: "Max Sharpe", d: result.ms, hl: false },
                      ].map(({ label, d, hl }) => (
                        <div key={label} style={{ background: hl ? "linear-gradient(145deg,rgba(14,165,233,0.12) 0%,rgba(7,89,133,0.15) 100%)" : "rgba(10,25,65,0.6)", border: hl ? "1px solid rgba(14,165,233,0.4)" : W7.borderGlass, borderRadius: W7.radiusCard, padding: 12, textAlign: "center", boxShadow: hl ? "0 0 16px rgba(14,165,233,0.15), inset 0 1px 0 rgba(125,211,252,0.1)" : "inset 0 1px 0 rgba(100,150,255,0.05)" }}>
                          {hl && <div style={{ marginBottom: 6 }}><W7Tag color="blue">★ Sweet spot</W7Tag></div>}
                          <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: W7.textMuted, marginBottom: 9 }}>{label}</div>
                          {[
                            { l: "Return", v: (d.ret * 100).toFixed(2) + "%", c: W7.textGreen },
                            { l: "Volatility", v: (d.vol * 100).toFixed(2) + "%", c: hl ? W7.textAmber : W7.textMuted },
                            { l: "Sharpe", v: d.sharpe.toFixed(4), c: d.sharpe > 0 ? W7.textAccent : W7.textRed },
                          ].map(row => (
                            <div key={row.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderTop: "1px solid rgba(56,189,248,0.08)" }}>
                              <span style={{ fontSize: 10.5, color: W7.textMuted }}>{row.l}</span>
                              <span style={{ fontSize: 20, fontWeight: 700, color: row.c, fontVariantNumeric: "tabular-nums", textShadow: `0 0 6px ${row.c}44` }}>{row.v}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                      <div style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: W7.radiusCard, padding: "8px 11px", fontSize: 11, color: "#86efac" }}>
                        <strong>vs Min Variance</strong><br />+{((result.bal.ret - result.mv.ret) * 100).toFixed(2)}% more return · same low-risk region
                      </div>
                      <div style={{ background: "rgba(14,165,233,0.07)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: W7.radiusCard, padding: "8px 11px", fontSize: 11, color: "#7dd3fc" }}>
                        <strong>vs Max Sharpe</strong><br />−{((result.ms.vol - result.bal.vol) * 100).toFixed(2)}% less volatility · {(result.bal.sharpe / result.ms.sharpe * 100).toFixed(0)}% of the Sharpe
                      </div>
                    </div>
                  </W7Card>

                  {/* Diversification */}
                  <W7Card>
                    <CardTitle>Diversification Analysis</CardTitle>
                    <CardSub>How low correlation between holdings reduces total portfolio risk</CardSub>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9, marginBottom: 10 }}>
                      {[
                        { label: "Active Holdings", val: result.activeN, unit: "", c: W7.textPrimary, glow: "#fff" },
                        { label: "Naive Vol", val: (result.naiveVol * 100).toFixed(2), unit: "%", c: W7.textAmber, glow: "#f59e0b" },
                        { label: "Actual Vol", val: (result.bal.vol * 100).toFixed(2), unit: "%", c: W7.textGreen, glow: "#22c55e" },
                        { label: "Div Ratio", val: result.divRatio.toFixed(3), unit: "×", c: W7.textAccent, glow: W7.accentBlue },
                      ].map(m => (
                        <div key={m.label} style={{ textAlign: "center", background: "rgba(10,25,65,0.7)", border: W7.borderGlass, borderRadius: W7.radiusCard, padding: "12px 8px", boxShadow: "inset 0 1px 0 rgba(100,150,255,0.05)" }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: m.c, letterSpacing: -0.3, textShadow: `0 0 10px ${m.glow}55` }}>{m.val}<span style={{ fontSize: 12 }}>{m.unit}</span></div>
                          <div style={{ fontSize: 9.5, color: W7.textMuted, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.4px" }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "rgba(10,25,65,0.5)", border: W7.borderGlass, borderRadius: W7.radiusCard, padding: "9px 12px", fontSize: 20, color: W7.textSecondary }}>
                      Diversification saved <strong style={{ color: W7.textGreen, textShadow: "0 0 6px rgba(34,197,94,0.4)" }}>{((result.naiveVol - result.bal.vol) * 100).toFixed(2)}pp</strong> of annualised risk by blending {result.activeN} low-correlated equities (avg pairwise ρ = {result.avgCorr.toFixed(3)})
                    </div>
                  </W7Card>
                </>
              )}
            </>
          )}

          {/* ── FORMULAS TAB ── */}
          {activeTab === "formulas" && (
            <>
              <W7Card>
                <CardTitle>Statistical Inputs</CardTitle>
                <CardSub>Annualised estimates from daily log returns over the lookback period</CardSub>
                <FormulaBlock title="Log Returns" eq="r_t = ln(P_t / P_{t-1})" desc="Daily log return for each asset. Time-additive and more normally distributed than simple returns." color="blue"/>
                <FormulaBlock title="Expected Return Vector (μ)" eq="μ_i = E[r_i] × T    where T = 252 trading days" desc="Annualised mean log return per asset. Serves as the expected return input to the optimiser." color="green"/>
                <FormulaBlock title="Covariance Matrix (Σ)" eq="Σ_ij = Cov(r_i, r_j) × T" desc="Annualised covariance between every pair. After computation, eigenvalue-clamping (max(λ, 1e-8)) enforces positive semi-definiteness." color="amber"/>
              </W7Card>
              <W7Card>
                <CardTitle>Portfolio Metrics</CardTitle>
                <CardSub>For weight vector w ∈ ℝⁿ with w ≥ 0, 1ᵀw = 1</CardSub>
                <FormulaBlock title="Portfolio Return" eq="R_p = wᵀμ = Σᵢ wᵢ · μᵢ" desc="Weighted average of individual expected returns." color="blue"/>
                <FormulaBlock title="Portfolio Volatility (Risk)" eq="σ_p = √(wᵀ Σ w)" desc="Standard deviation of portfolio returns. Captures both individual volatilities AND pairwise correlations — this is where diversification benefit lives." color="amber"/>
                <FormulaBlock title="Sharpe Ratio" eq={[`S_p = (R_p − r_f) / σ_p`, `r_f = ${rfr.toFixed(2)}% (current risk-free rate)`]} desc="Risk-adjusted excess return per unit of volatility. Max Sharpe portfolio sits on the Capital Market Line tangent." color="green"/>
                <FormulaBlock title="Diversification Ratio" eq="DR = (Σᵢ wᵢ σᵢ) / σ_p" desc="Ratio of weighted-average individual vol to actual portfolio vol. DR > 1 quantifies how much risk was saved. DR = 1 means perfect correlation." color="blue"/>
              </W7Card>
              <W7Card>
                <CardTitle>Three Optimisation Problems</CardTitle>
                <CardSub>Each solves a different objective over the long-only fully-invested weight set</CardSub>
                <FormulaBlock title="1. Minimum Variance (SOCP)" eq={["min  ‖Lᵀw‖₂", "s.t.  1ᵀw = 1,  w ≥ 0"]} desc="L is the Cholesky factor of Σ. Using the 2-norm forces CVXPY into the SOCP cone path, avoiding the broken scipy ≥ 1.14 quadratic extractor. Argmin is identical." color="blue"/>
                <FormulaBlock title="2. Maximum Sharpe (SLSQP)" eq={["max  (wᵀμ − r_f) / √(wᵀΣw)", "s.t.  1ᵀw = 1,  w ≥ 0"]} desc="Non-convex fractional program solved via scipy SLSQP. Tangency point of the Capital Market Line." color="amber"/>
                <FormulaBlock title="3. Efficient Frontier Sweep" eq={["min  ‖Lᵀw‖₂", `s.t.  1ᵀw = 1,  w ≥ 0,  wᵀμ ≥ τ`, `τ ∈ [R_minvar, 0.92·max(μ)]  (${frontierPts} points)`]} desc="Sweeps τ across the return range. Same SOCP trick for scipy safety." color="green"/>
              </W7Card>
              <W7Card>
                <CardTitle>Balanced Optimal Scoring</CardTitle>
                <CardSub>How QuantLeaf selects the portfolio that wins on both safety and efficiency</CardSub>
                <FormulaBlock title="Normalisation" eq={["σ̃_p = (σ_p − min σ) / (max σ − min σ)", "S̃_p = (S_p − min S) / (max S − min S)"]} desc="Both metrics are min-max normalised to [0, 1] across all frontier portfolios." color="blue"/>
                <FormulaBlock title="Combined Score" eq={[`score(p) = α × (1 − σ̃_p) + (1−α) × S̃_p`, `Current: score = ${alpha.toFixed(2)} × safety + ${(1-alpha).toFixed(2)} × sharpe`]} desc={`α = 0.5 weights both equally. α → 1 converges to Min Variance. α → 0 converges to Max Sharpe. Current α = ${alpha.toFixed(2)}.`} color="amber"/>
                <FormulaBlock title="Selection" eq="p* = argmax_{p ∈ frontier}  score(p)" desc="Clean closed-form selection — no additional solver required." color="green"/>
              </W7Card>
            </>
          )}

          {/* ── CODE TAB ── */}
          {activeTab === "code" && (
            <>
              <W7Card>
                <CardTitle>Python Source</CardTitle>
                <CardSub>Full CVXPY SOCP implementation · scipy-1.14 safe · reflects your current sidebar config</CardSub>
                <CodeView tickers={tickers.length > 0 ? tickers : ["HDFCBANK.NS","INFY.NS","TCS.NS"]} params={{ rfr: rfr / 100, alpha, period, frontierPts, tradingDays }}/>
              </W7Card>
              <W7Card>
                <CardTitle>Installation</CardTitle>
                <CardSub>Requires Python 3.9+ — install all dependencies then run the script</CardSub>
                <div style={{ background: "linear-gradient(180deg,#0d1117 0%,#0a0e1a 100%)", borderRadius: W7.radiusCard, overflow: "hidden", border: "1px solid rgba(56,189,248,0.2)" }}>
                  <div style={{ padding: "7px 13px", background: "rgba(14,165,233,0.08)", borderBottom: "1px solid rgba(56,189,248,0.12)", fontSize: 20, fontWeight: 600, color: W7.textAccent, fontFamily: "'Courier New', monospace" }}>shell</div>
                  <pre style={{ padding: "11px 14px", fontFamily: "'Courier New', monospace", fontSize: 11, lineHeight: 1.75, color: "#f8f8f2", margin: 0 }}>
                    <span style={{ color: "#6272a4" }}># Install dependencies{"\n"}</span>pip install numpy cvxpy pandas yfinance plotly scipy clarabel{"\n\n"}<span style={{ color: "#6272a4" }}># Run optimizer{"\n"}</span>python balanced_portfolio_optimizer.py
                  </pre>
                </div>
              </W7Card>
            </>
          )}

          {/* ── DOCS TAB ── */}
          {activeTab === "docs" && (
            <>
              <DocsSection />
              <W7Card>
                <CardTitle>Configuration Reference</CardTitle>
                <CardSub>All tuneable parameters and their effect on optimisation results</CardSub>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(56,189,248,0.15)" }}>
                      {["Parameter","Default","Effect"].map(h => <th key={h} style={{ textAlign: "left", padding: "7px 9px", fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: W7.textMuted }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["PERIOD","1y","Longer periods smooth noise but may include stale regime data"],
                      ["RISK_FREE_RATE","6.35%","Higher r_f depresses all Sharpe ratios and shifts Max Sharpe upward on the frontier"],
                      ["FRONTIER_POINTS","100","More points = finer resolution + longer run time (linear in CVXPY calls)"],
                      ["ALPHA","0.5","0 → Max Sharpe; 1 → Min Variance; 0.5 → equal weight to both goals"],
                      ["TRADING_DAYS","252","NSE standard; 250 conservative; 260 includes all weekdays"],
                    ].map(([param, def, effect]) => (
                      <tr key={param} style={{ borderBottom: "1px solid rgba(56,189,248,0.07)" }}>
                        <td style={{ padding: "8px 9px", fontWeight: 700, fontFamily: "'Courier New', monospace", fontSize: 11, color: W7.textAccent, textShadow: "0 0 6px rgba(125,211,252,0.3)" }}>{param}</td>
                        <td style={{ padding: "8px 9px", color: W7.textSecondary, fontVariantNumeric: "tabular-nums" }}>{def}</td>
                        <td style={{ padding: "8px 9px", color: W7.textMuted, lineHeight: 1.55 }}>{effect}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </W7Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
}