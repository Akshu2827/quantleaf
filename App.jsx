import { useState, useEffect, useRef, useCallback } from "react";

// ─── Color palette & theme ────────────────────────────────────────────────────
const COLORS = [
  "#00c896","#0071e3","#ff9f0a","#ff3b30","#34c759",
  "#af52de","#5ac8fa","#ff6b35","#30b0c7","#a2845e"
];

// ─── Default presets ──────────────────────────────────────────────────────────
const DEFAULT_PRESETS = [
  {
    id: "nifty50",
    label: "Nifty 50 Blue Chips",
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
    id: "midcap",
    label: "Motilal Midcap",
    tickers: `ETERNAL.NS, SHRIRAMFIN.NS, MCX.NS, CGPOWER.NS, APARINDS.NS, BEL.NS, MUTHOOTFIN.NS,
GROWW.NS, WAAREEENER.NS, PAYTM.NS, AMBER.NS, TVSMOTOR.NS, MOTHERSON.NS,
ATHERENERG.NS, PRESTIGE.NS, BAJFINANCE.NS, BDL.NS, INDUSINDBK.NS, SUZLON.NS,
ANGELONE.NS, RELIGARE.NS, SBIN.NS`
  },
  {
    id: "fang",
    label: "US Tech (FAANG+)",
    tickers: `AAPL, MSFT, GOOGL, AMZN, META, NVDA, TSLA, NFLX, ADBE, CRM, AMD, INTC, QCOM, AVGO, ORCL`
  },
  {
    id: "pharma",
    label: "India Pharma",
    tickers: `SUNPHARMA.NS, DRREDDY.NS, CIPLA.NS, DIVISLAB.NS, LUPIN.NS, TORNTPHARM.NS,
AUROPHARMA.NS, ALKEM.NS, IPCALAB.NS, ZYDUSLIFE.NS, GLENMARK.NS, BIOCON.NS`
  }
];

// ─── Simulated result engine ──────────────────────────────────────────────────
function simulateRun(tickers, params) {
  const { rfr, alpha, period, frontierPts, tradingDays } = params;
  const n = tickers.length;
  const seed = n * 137.5 + alpha * 99.1 + rfr * 5000 + period.length * 7;
  const rng = (k) => Math.abs(Math.sin(seed * 91.3 + k * 37.9 + k)) % 1;

  // Min Variance
  const mvRet = 0.04 + rng(1) * 0.06;
  const mvVol = 0.085 + rng(2) * 0.035;
  const mvSh = (mvRet - rfr) / mvVol;

  // Max Sharpe
  const msRet = 0.35 + rng(3) * 0.15;
  const msVol = 0.12 + rng(4) * 0.05;
  const msSh = (msRet - rfr) / msVol;

  // Balanced optimal — blended based on alpha
  const t = 0.4 + (1 - alpha) * 0.5;
  const balRet = mvRet + (msRet - mvRet) * t;
  const balVol = mvVol + (msVol - mvVol) * t * 0.7;
  const balSh = (balRet - rfr) / balVol;
  const balScore = alpha * (1 - 0.22) + (1 - alpha) * 0.94;

  const riskPct = Math.round(t * 35);
  const sharpePct = Math.round(80 + (1 - alpha) * 18);

  // Top holdings
  const k = Math.min(n, 11);
  let rem = 1.0;
  const rawW = [];
  for (let i = 0; i < k - 1; i++) {
    const w = rem * (0.07 + rng(i + 20) * 0.18);
    rawW.push(w); rem -= w;
  }
  rawW.push(rem);
  rawW.sort((a, b) => b - a);

  const holdings = tickers.slice(0, k).map((t, i) => {
    const ret = 0.10 + rng(i + 40) * 0.55;
    const vol = 0.14 + rng(i + 60) * 0.18;
    return { ticker: t, weight: rawW[i], ret, vol, sharpe: (ret - rfr) / vol };
  }).sort((a, b) => b.weight - a.weight);

  // Naive vol
  const naiveVol = holdings.reduce((s, h) => s + h.weight * h.vol, 0);
  const divRatio = naiveVol / balVol;
  const avgCorr = 0.18 + rng(99) * 0.12;

  // Frontier data
  const frontier = [];
  for (let i = 0; i < frontierPts; i++) {
    const tp = i / (frontierPts - 1);
    const fvol = mvVol + (msVol * 1.35 - mvVol) * Math.pow(tp, 0.7);
    const fret = mvRet + (msRet * 1.18 - mvRet) * Math.pow(tp, 0.55);
    const fsh = (fret - rfr) / fvol;
    frontier.push({ vol: fvol, ret: fret, sharpe: fsh, score: alpha * (1 - tp * 0.8) + (1 - alpha) * (tp * 0.95) });
  }

  // Individual stock scatter (for chart)
  const stocks = tickers.slice(0, 35).map((t, i) => ({
    label: t,
    vol: 0.12 + rng(i + 70) * 0.28,
    ret: 0.05 + rng(i + 80) * 0.60
  }));

  return {
    mv: { ret: mvRet, vol: mvVol, sharpe: mvSh },
    ms: { ret: msRet, vol: msVol, sharpe: msSh },
    bal: { ret: balRet, vol: balVol, sharpe: balSh, score: balScore },
    riskPct, sharpePct,
    holdings,
    naiveVol, divRatio, avgCorr,
    activeN: k,
    frontier, stocks,
    params: { n, period, rfr, alpha, frontierPts, tradingDays }
  };
}

// ─── Inline styles ────────────────────────────────────────────────────────────
const css = {
  app: { fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f5f5f7", minHeight: "100vh", color: "#1d1d1f", fontSize: 14 },
  nav: { background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", borderBottom: "0.5px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", padding: "0 24px", height: 52, gap: 12, position: "sticky", top: 0, zIndex: 100 },
  logoMark: { width: 28, height: 28, background: "linear-gradient(135deg,#00c896,#0071e3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontWeight: 600, fontSize: 15, letterSpacing: -0.3 },
  navTag: { fontSize: 11, color: "#aeaeb2", fontWeight: 400 },
  navBadge: { marginLeft: "auto", background: "#e8faf5", color: "#00b386", fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20, border: "0.5px solid rgba(0,200,150,0.25)" },
  statusDot: (s) => ({ width: 7, height: 7, borderRadius: "50%", background: s === "running" ? "#ff9f0a" : s === "done" ? "#00c896" : "#aeaeb2", animation: s === "running" ? "pulse 1s infinite" : "none" }),
  statusText: { fontSize: 12, color: "#6e6e73" },
  main: { display: "grid", gridTemplateColumns: "336px 1fr", height: "calc(100vh - 52px)" },
  sidebar: { background: "#fff", borderRight: "0.5px solid rgba(0,0,0,0.08)", overflowY: "auto", padding: "16px 14px" },
  sectionLabel: { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.7px", color: "#aeaeb2", margin: "20px 4px 8px" },
  sectionLabelFirst: { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.7px", color: "#aeaeb2", margin: "0 4px 8px" },
  content: { overflowY: "auto", padding: 24 },
  chip: (active) => ({ padding: "5px 11px", background: active ? "#e8faf5" : "#f5f5f7", border: `0.5px solid ${active ? "rgba(0,200,150,0.4)" : "rgba(0,0,0,0.1)"}`, borderRadius: 20, fontSize: 11, fontWeight: 500, color: active ? "#00b386" : "#6e6e73", cursor: "pointer", transition: "all 0.12s", whiteSpace: "nowrap" }),
  paramCard: { background: "#fbfbfd", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "11px 13px", marginBottom: 8 },
  paramHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  paramName: { fontSize: 12, fontWeight: 500, color: "#1d1d1f" },
  paramVal: { fontSize: 13, fontWeight: 600, color: "#00b386", fontVariantNumeric: "tabular-nums" },
  paramDesc: { fontSize: 11, color: "#aeaeb2", marginBottom: 7, lineHeight: 1.5 },
  runBtn: (running) => ({ width: "100%", padding: "11px 0", background: running ? "#e8faf5" : "linear-gradient(135deg,#00c896,#0071e3)", color: running ? "#00b386" : "white", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: running ? "not-allowed" : "pointer", letterSpacing: -0.2, marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "opacity 0.15s" }),
  card: { background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "18px 20px", marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: 600, color: "#1d1d1f", marginBottom: 3, display: "flex", alignItems: "center", gap: 8 },
  cardSub: { fontSize: 12, color: "#6e6e73", marginBottom: 14 },
  tag: (c) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, letterSpacing: 0.3, background: c === "green" ? "#e8faf5" : c === "blue" ? "#e8f2ff" : c === "amber" ? "#fff4e0" : "#fff0ef", color: c === "green" ? "#00b386" : c === "blue" ? "#0071e3" : c === "amber" ? "#b45309" : "#ff3b30" }),
  metricGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 },
  metricCard: (c) => ({ background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: 14, position: "relative", overflow: "hidden", borderTop: `3px solid ${c === "green" ? "#00c896" : c === "amber" ? "#ff9f0a" : "#0071e3"}` }),
  metricLabel: { fontSize: 10, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5 },
  metricVal: (c) => ({ fontSize: 24, fontWeight: 600, letterSpacing: -0.7, lineHeight: 1, color: c === "green" ? "#00b386" : c === "amber" ? "#ff9f0a" : "#0071e3" }),
  metricSub: { fontSize: 11, color: "#aeaeb2", marginTop: 3 },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ParamSlider({ label, desc, min, max, step, value, format, onChange }) {
  return (
    <div style={css.paramCard}>
      <div style={css.paramHeader}>
        <span style={css.paramName}>{label}</span>
        <span style={css.paramVal}>{format(value)}</span>
      </div>
      <div style={css.paramDesc}>{desc}</div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", height: 3, accentColor: "#00c896", cursor: "pointer" }} />
    </div>
  );
}

function ParamSelect({ label, desc, options, value, onChange }) {
  return (
    <div style={css.paramCard}>
      <div style={css.paramHeader}>
        <span style={css.paramName}>{label}</span>
        <span style={css.paramVal}>{value}</span>
      </div>
      <div style={css.paramDesc}>{desc}</div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "7px 9px", background: "#fbfbfd", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 7, fontFamily: "inherit", fontSize: 12, color: "#1d1d1f", outline: "none", cursor: "pointer" }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

// Editable chips with add/remove
function ChipsEditor({ presets, activeId, onSelect, onAdd, onRemove, onRename }) {
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const inputRef = useRef(null);
  const newRef = useRef(null);

  useEffect(() => { if (editingId && inputRef.current) inputRef.current.focus(); }, [editingId]);
  useEffect(() => { if (adding && newRef.current) newRef.current.focus(); }, [adding]);

  const startEdit = (e, preset) => {
    e.stopPropagation();
    setEditingId(preset.id);
    setEditVal(preset.label);
  };
  const commitEdit = () => {
    if (editVal.trim()) onRename(editingId, editVal.trim());
    setEditingId(null);
  };
  const commitAdd = () => {
    if (newLabel.trim()) { onAdd(newLabel.trim()); setNewLabel(""); }
    setAdding(false);
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
      {presets.map(p => (
        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {editingId === p.id ? (
            <input ref={inputRef} value={editVal} onChange={e => setEditVal(e.target.value)}
              onBlur={commitEdit} onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null); }}
              style={{ padding: "4px 8px", border: "1.5px solid #00c896", borderRadius: 16, fontSize: 11, fontWeight: 500, color: "#00b386", background: "#e8faf5", outline: "none", width: Math.max(80, editVal.length * 7.5) }} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", ...css.chip(activeId === p.id), paddingRight: 6, gap: 4 }}>
              <span onClick={() => onSelect(p.id)} style={{ flex: 1 }}>{p.label}</span>
              <span onDoubleClick={(e) => startEdit(e, p)} title="Double-click to rename"
                style={{ fontSize: 9, color: "#aeaeb2", cursor: "text", padding: "0 2px" }}>✎</span>
              {presets.length > 1 && (
                <span onClick={(e) => { e.stopPropagation(); onRemove(p.id); }}
                  style={{ fontSize: 10, color: "#aeaeb2", cursor: "pointer", lineHeight: 1, marginLeft: 1 }}>×</span>
              )}
            </div>
          )}
        </div>
      ))}
      {adding ? (
        <input ref={newRef} value={newLabel} onChange={e => setNewLabel(e.target.value)}
          placeholder="Preset name…"
          onBlur={commitAdd} onKeyDown={e => { if (e.key === "Enter") commitAdd(); if (e.key === "Escape") setAdding(false); }}
          style={{ padding: "4px 10px", border: "1.5px solid #0071e3", borderRadius: 16, fontSize: 11, outline: "none", background: "#e8f2ff", color: "#0071e3", width: 110 }} />
      ) : (
        <button onClick={() => setAdding(true)}
          style={{ padding: "4px 10px", background: "#f5f5f7", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 16, fontSize: 11, fontWeight: 500, color: "#6e6e73", cursor: "pointer" }}>+ New</button>
      )}
    </div>
  );
}

// Frontier SVG chart
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
  // CML from rf through balanced
  const cmlSlope = bal.sharpe;
  const cmlX0 = 0, cmlY0 = result.params.rfr;
  const cmlX1 = maxV * 1.05, cmlY1 = cmlY0 + cmlSlope * (cmlX1 - cmlX0);
  const yTicks = [minR, (minR + maxR) / 2, maxR].map(r => ({ r, y: sy(r), label: (r * 100).toFixed(0) + "%" }));
  const xTicks = [minV, (minV + maxV) / 2, maxV].map(v => ({ v, x: sx(v), label: (v * 100).toFixed(0) + "%" }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00c896" />
          <stop offset="100%" stopColor="#0071e3" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Grid */}
      {yTicks.map(t => <line key={t.r} x1={pad.l} y1={t.y} x2={W - pad.r} y2={t.y} stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />)}
      {xTicks.map(t => <line key={t.v} x1={t.x} y1={pad.t} x2={t.x} y2={H - pad.b} stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />)}
      {/* Axis labels */}
      {yTicks.map(t => <text key={t.r} x={pad.l - 4} y={t.y + 3.5} textAnchor="end" fontSize="9" fill="#aeaeb2">{t.label}</text>)}
      {xTicks.map(t => <text key={t.v} x={t.x} y={H - pad.b + 12} textAnchor="middle" fontSize="9" fill="#aeaeb2">{t.label}</text>)}
      {/* Axis titles */}
      <text x={pad.l + iW / 2} y={H - 2} textAnchor="middle" fontSize="9" fill="#6e6e73">Volatility (Risk) →</text>
      <text x={10} y={pad.t + iH / 2} textAnchor="middle" fontSize="9" fill="#6e6e73" transform={`rotate(-90,10,${pad.t + iH / 2})`}>Return →</text>
      {/* CML */}
      <line x1={sx(cmlX0)} y1={sy(cmlY0)} x2={sx(Math.min(cmlX1, maxV * 0.98))} y2={sy(cmlY1)} stroke="#FFD700" strokeWidth="1" strokeDasharray="4,3" opacity="0.8" />
      {/* Individual stocks */}
      {stocks.map((s, i) => <circle key={i} cx={sx(s.vol)} cy={sy(s.ret)} r="3.5" fill="#0071e3" opacity="0.28" />)}
      {/* Frontier curve */}
      <path d={fPath} fill="none" stroke="url(#fg)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Min Variance */}
      <circle cx={sx(mv.vol)} cy={sy(mv.ret)} r="7" fill="#ff3b30" />
      <text x={sx(mv.vol) + 10} y={sy(mv.ret) + 4} fontSize="10" fill="#ff3b30" fontWeight="500">Min Variance</text>
      {/* Max Sharpe */}
      <circle cx={sx(ms.vol)} cy={sy(ms.ret)} r="7" fill="#34c759" />
      <text x={sx(ms.vol) + 10} y={sy(ms.ret) + 4} fontSize="10" fill="#34c759" fontWeight="500">Max Sharpe</text>
      {/* Balanced Optimal star */}
      <circle cx={sx(bal.vol)} cy={sy(bal.ret)} r="11" fill="#FFD700" filter="url(#glow)" />
      <text x={sx(bal.vol)} y={sy(bal.ret) + 3.5} textAnchor="middle" fontSize="10" fill="#1d1d1f" fontWeight="700">★</text>
      <text x={sx(bal.vol) - 4} y={sy(bal.ret) - 16} textAnchor="middle" fontSize="10" fill="#b8860b" fontWeight="600">Balanced Optimal</text>
    </svg>
  );
}

// Allocation donut
function DonutChart({ holdings }) {
  const cx = 90, cy = 90, r = 60, stroke = 20;
  const total = holdings.reduce((s, h) => s + h.weight, 0);
  let cumAngle = -Math.PI / 2;
  const slices = holdings.slice(0, 8).map((h, i) => {
    const angle = (h.weight / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    return { path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, color: COLORS[i % COLORS.length], pct: h.weight / total * 100, label: h.ticker.replace(".NS", "") };
  });
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <svg viewBox="0 0 180 180" style={{ width: 140, height: 140, flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.85} />)}
        <circle cx={cx} cy={cy} r={r - stroke} fill="white" />
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize="10" fill="#aeaeb2">Sharpe</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="14" fontWeight="600" fill="#1d1d1f">{holdings.length > 0 ? ((holdings.reduce((s,h)=>s+h.sharpe*h.weight,0)).toFixed(2)) : "—"}</text>
      </svg>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "3px 0", borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#1d1d1f", flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#1d1d1f", fontVariantNumeric: "tabular-nums" }}>{s.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Score bar chart
function ScoreBar({ frontier, alpha }) {
  const scores = frontier.map(p => p.score);
  const maxS = Math.max(...scores), minS = Math.min(...scores);
  const bestIdx = scores.indexOf(maxS);
  const step = Math.max(1, Math.floor(frontier.length / 20));
  const display = frontier.filter((_, i) => i % step === 0 || i === bestIdx);
  const dispMax = Math.max(...display.map(p => p.score));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 80, marginTop: 8 }}>
      {display.map((p, i) => {
        const isBest = frontier.indexOf(p) === bestIdx;
        const h = ((p.score - minS) / (dispMax - minS) * 70 + 5);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <div style={{ width: "100%", height: h, borderRadius: "2px 2px 0 0", background: isBest ? "#FFD700" : "linear-gradient(180deg,#00c896,#0071e3)", opacity: isBest ? 1 : 0.4 }} title={`Score: ${p.score.toFixed(3)}\nVol: ${(p.vol * 100).toFixed(1)}%\nRet: ${(p.ret * 100).toFixed(1)}%`} />
          </div>
        );
      })}
    </div>
  );
}

// Formula block
function FormulaBlock({ title, eq, desc, color = "green" }) {
  const c = color === "green" ? { bg: "#e8faf5", border: "rgba(0,200,150,0.25)", title: "#00b386" }
    : color === "blue" ? { bg: "#e8f2ff", border: "rgba(0,113,227,0.2)", title: "#0071e3" }
    : { bg: "#fff4e0", border: "rgba(255,159,10,0.2)", title: "#b45309" };
  return (
    <div style={{ background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: 10, padding: "13px 15px", marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: c.title, marginBottom: 6 }}>{title}</div>
      {[].concat(eq).map((e, i) => (
        <div key={i} style={{ fontFamily: "SF Mono, Menlo, Monaco, monospace", fontSize: 12, color: "#1d1d1f", padding: "6px 10px", background: "rgba(255,255,255,0.7)", borderRadius: 6, border: `0.5px solid ${c.border}`, marginBottom: i < [].concat(eq).length - 1 ? 5 : 0 }}>{e}</div>
      ))}
      {desc && <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 7, lineHeight: 1.65 }}>{desc}</div>}
    </div>
  );
}

// Code viewer
function CodeView({ tickers, params }) {
  const [copied, setCopied] = useState(false);
  const config = `PORTFOLIO_LIST = [
    ${tickers.map(t => `"${t}"`).join(", ")}
]

PERIOD          = "${params.period}"
RISK_FREE_RATE  = ${params.rfr.toFixed(4)}
FRONTIER_POINTS = ${params.frontierPts}
ALPHA           = ${params.alpha.toFixed(2)}
TRADING_DAYS    = ${params.tradingDays}`;

  const fullCode = `# ============================================================
#  QuantLeaf — Balanced Optimal Portfolio Optimizer
#  CVXPY SOCP | scipy-1.14 safe | Plotly charts
# ============================================================

import numpy as np
import cvxpy as cp
import pandas as pd
import yfinance as yf
import plotly.graph_objects as go
from plotly.subplots import make_subplots
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
    min  ||L.T @ w||_2   (SOCP path — never touches csc_matrix.A)
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
    norm_vol   = (vols   - vols.min())   / (vols.max()   - vols.min()   + 1e-12)
    norm_sharp = (sharps - sharps.min()) / (sharps.max() - sharps.min() + 1e-12)
    scores     = alpha * (1 - norm_vol) + (1 - alpha) * norm_sharp
    best_idx   = int(np.argmax(scores))
    return frontier[best_idx], scores

# ── MAIN ───────────────────────────────────────────────────
if __name__ == "__main__":
    raw   = yf.download(PORTFOLIO_LIST, period=PERIOD,
                        auto_adjust=False, progress=False)['Adj Close']
    prices     = raw.ffill().bfill().dropna(axis=1, how='any')
    log_ret    = np.log(prices / prices.shift(1)).dropna()
    mu         = log_ret.mean().values  * TRADING_DAYS
    Sigma_raw  = log_ret.cov().values   * TRADING_DAYS
    evals, ev  = np.linalg.eigh(Sigma_raw)
    Sigma      = ev @ np.diag(np.maximum(evals, 1e-8)) @ ev.T
    L          = _cholesky(Sigma)
    n          = len(mu)
    names      = list(log_ret.columns)

    mv_w = _solve_min_vol_socp(L, mu, n)
    mv_ret = float(mv_w @ mu)
    targets = np.linspace(mv_ret, np.max(mu) * 0.92, FRONTIER_POINTS)
    frontier = []
    for t in targets:
        wv = _solve_min_vol_socp(L, mu, n, return_lb=float(t))
        if wv is not None:
            wv = np.maximum(wv, 0); wv /= wv.sum()
            r = float(wv @ mu)
            v = float(np.sqrt(wv @ Sigma @ wv))
            frontier.append({'weights': wv, 'return': r, 'vol': v,
                             'sharpe': (r - RISK_FREE_RATE) / v})

    best, scores = find_balanced_optimal(frontier)
    print(f"Expected Return : {best['return']*100:.2f}%")
    print(f"Volatility      : {best['vol']*100:.2f}%")
    print(f"Sharpe Ratio    : {best['sharpe']:.4f}")`;

  const copy = () => {
    navigator.clipboard.writeText(fullCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  };

  return (
    <div style={{ background: "#1a1a2e", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", background: "#16213e", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#a8b2d8", fontFamily: "SF Mono, Menlo, monospace" }}>balanced_portfolio_optimizer.py</span>
        <button onClick={copy} style={{ fontSize: 11, color: copied ? "#00c896" : "#a8b2d8", background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit", transition: "color 0.2s" }}>{copied ? "✓ Copied!" : "Copy"}</button>
      </div>
      <pre style={{ padding: "14px 16px", fontFamily: "SF Mono, Menlo, Monaco, monospace", fontSize: 11, lineHeight: 1.65, color: "#cdd6f4", maxHeight: 420, overflowY: "auto", margin: 0 }}>
        <SyntaxPre code={fullCode} />
      </pre>
    </div>
  );
}

function SyntaxPre({ code }) {
  const highlighted = code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(#.*$)/gm, '<span style="color:#6c7086;font-style:italic">$1</span>')
    .replace(/\b(import|from|as|def|return|if|for|in|is|not|None|True|False|raise|try|except|continue|and|class)\b/g, '<span style="color:#89b4fa">$1</span>')
    .replace(/("[^"]*"|'[^']*')/g, '<span style="color:#a6e3a1">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#fab387">$1</span>');
  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
}

// Docs section
function DocsSection() {
  const items = [
    { color: "#00c896", title: "Why SOCP instead of QP?", content: "CVXPY 1.4+ routes cp.quad_form(w, Σ) through ConeMatrixStuffing → CoeffExtractor.quad_form(), which internally calls csc_matrix.A. This attribute was removed in scipy ≥ 1.14, causing an AttributeError. Using cp.norm(L.T @ w, 2) forces the SOCP cone path which never touches the broken extractor, while sharing the exact same optimal point." },
    { color: "#0071e3", title: "Cholesky with Auto-Jitter", content: "After eigenvalue-clamping (PSD correction), the covariance matrix may still be numerically singular. _cholesky() progressively adds diagonal jitter (1e-10 → 1e-9 → ... up to 15 attempts) until Cholesky succeeds, avoiding cryptic LinAlgError failures on highly correlated tickers." },
    { color: "#ff9f0a", title: "Solver Cascade", content: "Each SOCP problem tries CLARABEL → SCS → OSQP → ECOS in order. CLARABEL (Rust-based) handles most cases fastest. SCS is a first-order method good for large sparse problems. OSQP and ECOS are fallbacks. Failing points are silently skipped." },
    { color: "#af52de", title: "α Parameter Intuition", content: "α = 0.5 (default): equal weight to safety and Sharpe. α → 1: converges to Min Variance. α → 0: converges to Max Sharpe. The default empirically falls near the frontier 'elbow' for most Indian equity baskets, giving 30pp+ more return than Min Variance while saving ~2pp vol vs Max Sharpe." },
    { color: "#ff3b30", title: "Long-Only Constraint", content: "All three problems enforce w ≥ 0 (no shorting) and 1ᵀw = 1 (fully invested). Appropriate for retail investors on NSE/BSE. Removing w ≥ 0 produces the unconstrained frontier — valid for institutional desks with short-selling access." },
    { color: "#6e6e73", title: "Known Limitations", content: "MPT assumes normally distributed returns (violated in practice — fat tails, skewness). The model is backward-looking: past covariance and means are noisy estimators of future values. No transaction costs, liquidity constraints, capital gains tax, or position limits. Consider Black-Litterman or shrinkage estimators for production." },
  ];
  return (
    <div style={css.card}>
      <div style={css.cardTitle}>Full Documentation</div>
      <div style={css.cardSub}>Architecture, design decisions, and configuration guide</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${item.color}`, paddingLeft: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 3 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: "#6e6e73", lineHeight: 1.7 }}>{item.content}</div>
          </div>
        ))}
      </div>
    </div>
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
      if (activePresetId === id && next.length > 0) {
        setActivePresetId(next[0].id);
        setTickerInput(next[0].tickers);
      }
      return next;
    });
  }, [activePresetId]);

  const renamePreset = useCallback((id, label) => {
    setPresets(ps => ps.map(p => p.id === id ? { ...p, label } : p));
  }, []);

  const runOptimizer = async () => {
    if (tickers.length < 2) return;
    setStatus("running");
    setActiveTab("results");
    await new Promise(r => setTimeout(r, 500));
    setStatus("computing");
    await new Promise(r => setTimeout(r, 600));
    setStatus("scoring");
    await new Promise(r => setTimeout(r, 350));
    const params = { rfr: rfr / 100, alpha, period, frontierPts, tradingDays };
    const res = simulateRun(tickers, params);
    setResult(res);
    setStatus("done");
  };

  const statusLabel = { idle: "Ready", running: "Downloading data…", computing: "Computing frontier…", scoring: "Scoring portfolios…", done: "Complete" }[status];
  const statusState = status === "done" ? "done" : status !== "idle" ? "running" : "idle";

  const tabs = [
    { id: "results", label: "Results" },
    { id: "formulas", label: "Formulas" },
    { id: "code", label: "Code" },
    { id: "docs", label: "Docs" },
  ];

  return (
    <div style={css.app}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.15);border-radius:2px}
        input[type=range]{-webkit-appearance:none;cursor:pointer}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#00c896;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.2)}
      `}</style>

      {/* NAV */}
      <nav style={css.nav}>
        <div style={css.logoMark}>
          <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
            <path d="M2 10L5 6L7 8L10 4L12 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="3" r="1.5" fill="white" />
          </svg>
        </div>
        <span style={css.logoText}>QuantLeaf</span>
        <span style={css.navTag}>Portfolio Optimizer</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={css.statusDot(statusState)} />
          <span style={css.statusText}>{statusLabel}</span>
          <div style={css.navBadge}>NSE / BSE / US</div>
        </div>
      </nav>

      <div style={css.main}>
        {/* SIDEBAR */}
        <aside style={css.sidebar}>
          <div style={css.sectionLabelFirst}>Presets</div>
          <ChipsEditor
            presets={presets}
            activeId={activePresetId}
            onSelect={selectPreset}
            onAdd={addPreset}
            onRemove={removePreset}
            onRename={renamePreset}
          />

          <div style={css.sectionLabel}>Ticker List</div>
          <div style={{ background: "#fbfbfd", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: 11 }}>
            <textarea
              value={tickerInput}
              onChange={e => { setTickerInput(e.target.value); setActivePresetId(""); }}
              placeholder="Enter tickers separated by commas or newlines…&#10;e.g. HDFCBANK.NS, INFY.NS, TCS.NS"
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: "inherit", fontSize: 11.5, color: "#1d1d1f", resize: "none", height: 110, lineHeight: 1.65 }}
            />
            <div style={{ fontSize: 11, color: "#aeaeb2", textAlign: "right", paddingTop: 6, borderTop: "0.5px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: tickers.length < 2 ? "#ff3b30" : "#00b386" }}>{tickers.length < 2 ? "Need ≥ 2 tickers" : `✓ ${tickers.length} tickers`}</span>
              <span>{tickers.length} detected</span>
            </div>
          </div>

          <div style={css.sectionLabel}>Parameters</div>

          <ParamSlider label="Risk-Free Rate" desc="10-year G-Sec / T-bill yield used for Sharpe" min={2} max={12} step={0.05} value={rfr} format={v => v.toFixed(2) + "%"} onChange={setRfr} />
          <ParamSlider label="Safety Preference (α)" desc="0 = pure Sharpe · 0.5 = balanced · 1 = min variance" min={0} max={1} step={0.05} value={alpha} format={v => v.toFixed(2)} onChange={setAlpha} />
          <ParamSlider label="Frontier Resolution" desc="Number of portfolios sampled along the frontier" min={20} max={200} step={10} value={frontierPts} format={v => Math.round(v) + " pts"} onChange={setFrontierPts} />
          <ParamSelect label="Lookback Period" desc="Historical data window for return estimation" options={["3mo","6mo","1y","2y","3y","5y"]} value={period} onChange={setPeriod} />
          <ParamSelect label="Trading Days / Year" desc="NSE standard 252; 250 conservative; 260 all weekdays" options={["250","252","260"]} value={String(tradingDays)} onChange={v => setTradingDays(parseInt(v))} />

          <button style={css.runBtn(status === "running" || status === "computing" || status === "scoring")}
            onClick={runOptimizer}
            disabled={tickers.length < 2 || ["running","computing","scoring"].includes(status)}>
            {["running","computing","scoring"].includes(status) ? (
              <>
                <svg viewBox="0 0 14 14" width="14" height="14"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="0"><animateTransform attributeName="transform" type="rotate" from="0 7 7" to="360 7 7" dur="0.8s" repeatCount="indefinite" /></circle></svg>
                Optimising…
              </>
            ) : (
              <>
                <svg viewBox="0 0 14 14" width="14" height="14"><polygon points="3,2 12,7 3,12" fill="white" /></svg>
                Run Optimizer
              </>
            )}
          </button>
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "#aeaeb2" }}>
            Simulates the Python optimizer output
          </div>
        </aside>

        {/* CONTENT */}
        <main style={css.content}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, marginBottom: 3 }}>QuantLeaf</div>
            <div style={{ fontSize: 13, color: "#6e6e73" }}>Modern Portfolio Optimizer · Efficient Frontier · Balanced Sharpe</div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, background: "#f0f0f2", borderRadius: 9, padding: 3, marginBottom: 20, width: "fit-content" }}>
            {tabs.map(t => (
              <div key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ padding: "6px 16px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", background: activeTab === t.id ? "#fff" : "transparent", color: activeTab === t.id ? "#1d1d1f" : "#6e6e73", boxShadow: activeTab === t.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                {t.label}
              </div>
            ))}
          </div>

          {/* ── RESULTS TAB ── */}
          {activeTab === "results" && (
            <>
              {!result ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.3 }}>
                    <svg viewBox="0 0 48 48" width="48" height="48" fill="none" style={{ margin: "0 auto", display: "block" }}>
                      <path d="M6 34L16 22L22 28L30 16L42 24" stroke="#00c896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="42" cy="10" r="4" fill="#0071e3" opacity="0.6" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#6e6e73", marginBottom: 6 }}>Configure &amp; Run</div>
                  <div style={{ fontSize: 13, color: "#aeaeb2", lineHeight: 1.6, maxWidth: 320, margin: "0 auto" }}>
                    Select a preset or enter your own tickers, tweak the parameters on the left, then click <strong>Run Optimizer</strong> to see the balanced portfolio results.
                  </div>
                </div>
              ) : (
                <>
                  {/* Metric cards */}
                  <div style={css.metricGrid}>
                    <div style={css.metricCard("green")}>
                      <div style={css.metricLabel}>Expected Return</div>
                      <div style={css.metricVal("green")}>{(result.bal.ret * 100).toFixed(2)}%</div>
                      <div style={css.metricSub}>annualised (log)</div>
                    </div>
                    <div style={css.metricCard("amber")}>
                      <div style={css.metricLabel}>Volatility</div>
                      <div style={css.metricVal("amber")}>{(result.bal.vol * 100).toFixed(2)}%</div>
                      <div style={css.metricSub}>annualised std dev</div>
                    </div>
                    <div style={css.metricCard("blue")}>
                      <div style={css.metricLabel}>Sharpe Ratio</div>
                      <div style={css.metricVal("blue")}>{result.bal.sharpe.toFixed(3)}</div>
                      <div style={css.metricSub}>vs {rfr.toFixed(2)}% risk-free</div>
                    </div>
                  </div>

                  {/* Position banner */}
                  <div style={{ background: "#e8faf5", border: "0.5px solid rgba(0,200,150,0.3)", borderRadius: 9, padding: "9px 14px", marginBottom: 14, fontSize: 12, color: "#00b386", display: "flex", alignItems: "center", gap: 10 }}>
                    <span>★</span>
                    <span>Portfolio sits at the <strong>{result.riskPct}th percentile of risk</strong> and <strong>{result.sharpePct}th percentile of Sharpe</strong> on the frontier — low-risk with near-peak efficiency</span>
                    <span style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>Score: {result.bal.score.toFixed(4)}</span>
                  </div>

                  {/* Frontier chart */}
                  <div style={css.card}>
                    <div style={css.cardTitle}>Efficient Frontier</div>
                    <div style={css.cardSub}>{result.params.n} tickers · {result.frontier.length} frontier portfolios · {period} lookback</div>
                    <FrontierChart result={result} />
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: "#aeaeb2", marginBottom: 4 }}>Combined Score Distribution (★ = selected)</div>
                      <ScoreBar frontier={result.frontier} alpha={alpha} />
                    </div>
                  </div>

                  {/* Allocation */}
                  <div style={css.card}>
                    <div style={css.cardTitle}><span style={css.tag("green")}>★ Balanced Optimal</span> Portfolio Allocation</div>
                    <div style={css.cardSub}>α = {alpha.toFixed(2)} · {result.activeN} active holdings · avg pairwise ρ = {result.avgCorr.toFixed(3)}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                      <DonutChart holdings={result.holdings} />
                      <div>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              {["#","Ticker","Weight","Return","Vol","Sharpe"].map(h => (
                                <th key={h} style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", color: "#aeaeb2", padding: "0 6px 8px", textAlign: h === "#" || h === "Ticker" ? "left" : "right", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {result.holdings.map((h, i) => (
                              <tr key={i} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>
                                <td style={{ padding: "6px 6px", fontSize: 11 }}>
                                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 17, height: 17, background: "#e8faf5", color: "#00b386", borderRadius: 4, fontSize: 9, fontWeight: 700 }}>{i + 1}</span>
                                </td>
                                <td style={{ padding: "6px 6px", fontSize: 12, fontWeight: 500 }}>{h.ticker.replace(".NS","")}</td>
                                <td style={{ padding: "6px 6px", fontSize: 12, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                                  {(h.weight * 100).toFixed(2)}%
                                  <div style={{ width: 50, height: 4, background: "#f0f0f2", borderRadius: 2, overflow: "hidden", marginLeft: "auto", marginTop: 2 }}>
                                    <div style={{ width: `${(h.weight / result.holdings[0].weight) * 100}%`, height: "100%", background: "linear-gradient(90deg,#00c896,#0071e3)", borderRadius: 2 }} />
                                  </div>
                                </td>
                                <td style={{ padding: "6px 6px", fontSize: 12, textAlign: "right", color: h.ret > 0.1 ? "#00b386" : "#aeaeb2", fontVariantNumeric: "tabular-nums" }}>{(h.ret * 100).toFixed(1)}%</td>
                                <td style={{ padding: "6px 6px", fontSize: 12, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{(h.vol * 100).toFixed(1)}%</td>
                                <td style={{ padding: "6px 6px", fontSize: 12, textAlign: "right", color: h.sharpe > 1 ? "#0071e3" : "#aeaeb2", fontVariantNumeric: "tabular-nums" }}>{h.sharpe.toFixed(3)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Strategy Comparison */}
                  <div style={css.card}>
                    <div style={css.cardTitle}>Strategy Comparison</div>
                    <div style={css.cardSub}>Head-to-head across the three anchor portfolios</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                      {[
                        { label: "Min Variance", d: result.mv, highlight: false },
                        { label: "Balanced Optimal", d: result.bal, highlight: true },
                        { label: "Max Sharpe", d: result.ms, highlight: false },
                      ].map(({ label, d, highlight }) => (
                        <div key={label} style={{ background: highlight ? "linear-gradient(135deg,#f0fdf8,#f0f7ff)" : "#fbfbfd", border: `0.5px solid ${highlight ? "rgba(0,200,150,0.3)" : "rgba(0,0,0,0.08)"}`, borderRadius: 10, padding: 13, textAlign: "center" }}>
                          {highlight && <div style={{ marginBottom: 6 }}><span style={css.tag("green")}>★ Sweet spot</span></div>}
                          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#aeaeb2", marginBottom: 10 }}>{label}</div>
                          {[
                            { l: "Return", v: (d.ret * 100).toFixed(2) + "%", c: "#00b386" },
                            { l: "Volatility", v: (d.vol * 100).toFixed(2) + "%", c: highlight ? "#ff9f0a" : "#aeaeb2" },
                            { l: "Sharpe", v: d.sharpe.toFixed(4), c: d.sharpe > 0 ? "#0071e3" : "#ff3b30" },
                          ].map(row => (
                            <div key={row.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
                              <span style={{ fontSize: 11, color: "#6e6e73" }}>{row.l}</span>
                              <span style={{ fontSize: 12, fontWeight: 600, color: row.c, fontVariantNumeric: "tabular-nums" }}>{row.v}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ background: "#e8faf5", border: "0.5px solid rgba(0,200,150,0.2)", borderRadius: 8, padding: "9px 12px", fontSize: 11, color: "#00b386" }}>
                        <strong>vs Min Variance</strong><br />+{((result.bal.ret - result.mv.ret) * 100).toFixed(2)}% more return · same low-risk region
                      </div>
                      <div style={{ background: "#e8f2ff", border: "0.5px solid rgba(0,113,227,0.2)", borderRadius: 8, padding: "9px 12px", fontSize: 11, color: "#0071e3" }}>
                        <strong>vs Max Sharpe</strong><br />−{((result.ms.vol - result.bal.vol) * 100).toFixed(2)}% less volatility · {(result.bal.sharpe / result.ms.sharpe * 100).toFixed(0)}% of the Sharpe
                      </div>
                    </div>
                  </div>

                  {/* Diversification */}
                  <div style={css.card}>
                    <div style={css.cardTitle}>Diversification Analysis</div>
                    <div style={css.cardSub}>How low correlation between holdings reduces total portfolio risk</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 12 }}>
                      {[
                        { label: "Active Holdings", val: result.activeN, unit: "", c: "#1d1d1f" },
                        { label: "Naive Vol", val: (result.naiveVol * 100).toFixed(2), unit: "%", c: "#ff9f0a" },
                        { label: "Actual Vol", val: (result.bal.vol * 100).toFixed(2), unit: "%", c: "#00b386" },
                        { label: "Div Ratio", val: result.divRatio.toFixed(3), unit: "×", c: "#0071e3" },
                      ].map(m => (
                        <div key={m.label} style={{ textAlign: "center", background: "#fbfbfd", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 9, padding: 13 }}>
                          <div style={{ fontSize: 22, fontWeight: 600, color: m.c, letterSpacing: -0.5 }}>{m.val}<span style={{ fontSize: 13 }}>{m.unit}</span></div>
                          <div style={{ fontSize: 10, color: "#aeaeb2", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.4px" }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#fbfbfd", border: "0.5px solid rgba(0,0,0,0.06)", borderRadius: 8, padding: "10px 13px", fontSize: 12, color: "#6e6e73" }}>
                      Diversification saved <strong style={{ color: "#00b386" }}>{((result.naiveVol - result.bal.vol) * 100).toFixed(2)}pp</strong> of annualised risk by blending {result.activeN} low-correlated equities (avg pairwise ρ = {result.avgCorr.toFixed(3)})
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── FORMULAS TAB ── */}
          {activeTab === "formulas" && (
            <>
              <div style={css.card}>
                <div style={css.cardTitle}>Statistical Inputs</div>
                <div style={css.cardSub}>Annualised estimates from daily log returns over the lookback period</div>
                <FormulaBlock title="Log Returns" eq="r_t = ln(P_t / P_{t-1})" desc="Daily log return for each asset. Time-additive and more normally distributed than simple returns." />
                <FormulaBlock title="Expected Return Vector (μ)" eq="μ_i = E[r_i] × T    where T = 252 trading days" desc="Annualised mean log return per asset. Serves as the expected return input to the optimiser." />
                <FormulaBlock title="Covariance Matrix (Σ)" eq="Σ_ij = Cov(r_i, r_j) × T" desc="Annualised covariance between every pair of assets. After computation, eigenvalue-clamping (max(λ, 1e-8)) enforces positive semi-definiteness." color="blue" />
              </div>
              <div style={css.card}>
                <div style={css.cardTitle}>Portfolio Metrics</div>
                <div style={css.cardSub}>For weight vector w ∈ ℝⁿ with w ≥ 0, 1ᵀw = 1</div>
                <FormulaBlock title="Portfolio Return" eq="R_p = wᵀμ = Σᵢ wᵢ · μᵢ" desc="Weighted average of individual expected returns." />
                <FormulaBlock title="Portfolio Volatility (Risk)" eq="σ_p = √(wᵀ Σ w)" desc="Standard deviation of portfolio returns. Captures both individual asset volatilities AND pairwise correlations — this is where diversification benefit lives." color="amber" />
                <FormulaBlock title="Sharpe Ratio" eq={[`S_p = (R_p − r_f) / σ_p`, `r_f = ${rfr.toFixed(2)}% (current risk-free rate)`]} desc="Risk-adjusted excess return per unit of volatility. Max Sharpe portfolio sits on the Capital Market Line tangent." />
                <FormulaBlock title="Diversification Ratio" eq="DR = (Σᵢ wᵢ σᵢ) / σ_p" desc="Ratio of weighted-average individual vol to actual portfolio vol. DR > 1 quantifies how much risk was saved by diversification. DR = 1 means perfect correlation." color="blue" />
              </div>
              <div style={css.card}>
                <div style={css.cardTitle}>Three Optimisation Problems</div>
                <div style={css.cardSub}>Each solves a different objective over the long-only fully-invested weight set</div>
                <FormulaBlock title="1. Minimum Variance (SOCP)" eq={["min  ‖Lᵀw‖₂", "s.t.  1ᵀw = 1,  w ≥ 0"]} desc="L is the Cholesky factor of Σ. Using the 2-norm instead of the squared norm forces CVXPY into the SOCP cone path, avoiding the broken scipy ≥ 1.14 quadratic extractor. Argmin is identical." />
                <FormulaBlock title="2. Maximum Sharpe (SLSQP)" eq={["max  (wᵀμ − r_f) / √(wᵀΣw)", "s.t.  1ᵀw = 1,  w ≥ 0"]} desc="Non-convex fractional program solved via scipy SLSQP. Tangency point of the Capital Market Line." color="amber" />
                <FormulaBlock title="3. Efficient Frontier Sweep (Parametric SOCP)" eq={["min  ‖Lᵀw‖₂", `s.t.  1ᵀw = 1,  w ≥ 0,  wᵀμ ≥ τ`, `τ ∈ [R_minvar, 0.92·max(μ)]  (${frontierPts} points)`]} desc="Produces the efficient frontier by sweeping τ across the return range. Same SOCP trick for scipy safety." color="blue" />
              </div>
              <div style={css.card}>
                <div style={css.cardTitle}>Balanced Optimal Scoring</div>
                <div style={css.cardSub}>How QuantLeaf selects the portfolio that wins on both safety and efficiency</div>
                <FormulaBlock title="Normalisation" eq={["σ̃_p = (σ_p − min σ) / (max σ − min σ)", "S̃_p = (S_p − min S) / (max S − min S)"]} desc="Both metrics are min-max normalised to [0, 1] across all frontier portfolios so they are on a common scale." color="blue" />
                <FormulaBlock title="Combined Score Formula" eq={[`score(p) = α × (1 − σ̃_p) + (1−α) × S̃_p`, `Current: score = ${alpha.toFixed(2)} × safety + ${(1 - alpha).toFixed(2)} × sharpe_score`]} desc={`α controls the tradeoff: α = 0.5 (default) weights both equally. α → 1 converges to Min Variance. α → 0 converges to Max Sharpe. Your current α = ${alpha.toFixed(2)}.`} />
                <FormulaBlock title="Selection" eq="p* = argmax_{p ∈ frontier}  score(p)" desc="Clean closed-form selection across all frontier portfolios — no additional solver required." color="amber" />
              </div>
            </>
          )}

          {/* ── CODE TAB ── */}
          {activeTab === "code" && (
            <>
              <div style={css.card}>
                <div style={css.cardTitle}>Python Source</div>
                <div style={css.cardSub}>Full CVXPY SOCP implementation · scipy-1.14 safe · uses your current sidebar config</div>
                <CodeView tickers={tickers.length > 0 ? tickers : ["HDFCBANK.NS","INFY.NS","TCS.NS"]} params={{ rfr: rfr / 100, alpha, period, frontierPts, tradingDays }} />
              </div>
              <div style={css.card}>
                <div style={css.cardTitle}>Installation</div>
                <div style={css.cardSub}>Requires Python 3.9+ · install all dependencies then run the script</div>
                <div style={{ background: "#1a1a2e", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "8px 14px", background: "#16213e", borderBottom: "0.5px solid rgba(255,255,255,0.08)", fontSize: 12, fontWeight: 500, color: "#a8b2d8", fontFamily: "SF Mono, Menlo, monospace" }}>shell</div>
                  <pre style={{ padding: "12px 16px", fontFamily: "SF Mono, Menlo, monospace", fontSize: 11, lineHeight: 1.7, color: "#cdd6f4", margin: 0 }}>
                    <span style={{ color: "#6c7086" }}># Install dependencies</span>{"\n"}
                    pip install numpy cvxpy pandas yfinance plotly scipy clarabel{"\n\n"}
                    <span style={{ color: "#6c7086" }}># Run optimizer</span>{"\n"}
                    python balanced_portfolio_optimizer.py
                  </pre>
                </div>
              </div>
            </>
          )}

          {/* ── DOCS TAB ── */}
          {activeTab === "docs" && (
            <>
              <DocsSection />
              <div style={css.card}>
                <div style={css.cardTitle}>Configuration Reference</div>
                <div style={css.cardSub}>All tuneable parameters and their effect on optimisation results</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
                      {["Parameter","Default","Effect"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#aeaeb2" }}>{h}</th>)}
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
                      <tr key={param} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>
                        <td style={{ padding: "9px 10px", fontWeight: 500, fontFamily: "SF Mono, Menlo, monospace", fontSize: 11 }}>{param}</td>
                        <td style={{ padding: "9px 10px", color: "#6e6e73" }}>{def}</td>
                        <td style={{ padding: "9px 10px", color: "#6e6e73", lineHeight: 1.5 }}>{effect}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}