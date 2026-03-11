// src/pages/LandingPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const light = {
 bg: '#cdd5e0',        // deep slate-blue — rich, not white
  panel: '#dce4f0',     // strong panel with blue tint
  panelAlt: '#c6cfdd',  // noticeably deeper alt
  border: '#8aa0bc',    // bold visible border
  borderStrong: '#5e7a98',
  text: '#04080e',      // near-black
  textSub: '#14223a',
  muted: '#2c4460',     // deep navy-grey — never faded
  accent: '#0c3e80',    // deep royal blue button color
  accentDim: '#a8c4e4', // visible tint
  success: '#0a4228',   // deep forest green
  successDim: '#a8d4bc',
  warn: '#4e2804',
  warnDim: '#ecc898',
  danger: '#5e0e0e',
  dangerDim: '#e8a8a8',
};

const dark = {
  bg: '#080c10', 
  panel: '#0e1520', 
  panelAlt: '#121c28',
  border: '#1a2535', 
  borderStrong: '#243448',
  text: '#e8eef5', 
  textSub: '#bccad8', 
  muted: '#6a8099',
  accent: '#4d9de0', 
  accentDim: '#0e2040',
  success: '#3dba6e', 
  successDim: '#0a2018',
  warn: '#e8a035', 
  warnDim: '#201408',
  danger: '#e05050', 
  dangerDim: '#200a0a',
};

export default function LandingPage() {
  const [isDark, setIsDark] = useState(() => {
    try { const s = localStorage.getItem('hrp-theme'); return s !== null ? s === 'dark' : true; }
    catch { return true; }
  });
  const toggle = () => setIsDark(v => {
    const n = !v; try { localStorage.setItem('hrp-theme', n ? 'dark' : 'light'); } catch {}; return n;
  });
  const t = isDark ? dark : light;

  const useVis = (threshold = 0.12) => {
    const ref = useRef(null);
    const [v, setV] = useState(false);
    useEffect(() => {
      const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold });
      if (ref.current) o.observe(ref.current);
      return () => o.disconnect();
    }, []);
    return [ref, v];
  };

  const Count = ({ to, suffix = '' }) => {
    const [val, setVal] = useState(0);
    const r = useRef(null); const done = useRef(false);
    useEffect(() => {
      const o = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !done.current) {
          done.current = true;
          const t0 = performance.now();
          const tick = now => {
            const p = Math.min((now - t0) / 1600, 1);
            const ep = p < .5 ? 2*p*p : -1+(4-2*p)*p;
            setVal(Math.round(ep * to));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }, { threshold: 0.5 });
      if (r.current) o.observe(r.current);
      return () => o.disconnect();
    }, [to]);
    return <span ref={r}>{val}{suffix}</span>;
  };

  const [h1Ref, h1Vis] = useVis(0.05);
  const [statRef, statVis] = useVis();
  const [featRef, featVis] = useVis();
  const [stepsRef, stepsVis] = useVis();
  const [ctaRef, ctaVis] = useVis();

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500;600&family=Fraunces:opsz,wght@9..144,700;9..144,900&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }

    .lp {
      min-height: 100vh; background: ${t.bg}; color: ${t.text};
      font-family: 'IBM Plex Sans', system-ui, sans-serif;
      transition: background .3s, color .3s; overflow-x: hidden;
    }

    /* ─── NAV ─── */
    .nav {
      position: sticky; top: 0; z-index: 200;
      height: 52px; display: flex; align-items: center;
      justify-content: space-between; padding: 0 28px;
      background: ${isDark ? 'rgba(8,12,16,0.95)' : 'rgba(180,192,210,0.97)'};
      border-bottom: 1px solid ${t.border};
      backdrop-filter: blur(12px);
      transition: background .3s, border-color .3s;
    }
    .nav-brand { display: flex; align-items: center; gap: 8px; }
    .nav-chip {
      background: ${isDark ? t.accentDim : '#90b4d8'}; border: 1px solid ${isDark ? '#1a3560' : '#4e7aa8'};
      border-radius: 4px; width: 26px; height: 26px;
      display: flex; align-items: center; justify-content: center; font-size: 13px;
    }
    .nav-name {
      font-family: 'IBM Plex Mono', monospace; font-size: 0.78rem;
      font-weight: 600; color: ${t.text}; letter-spacing: 0.01em;
    }
    .nav-right { display: flex; align-items: center; gap: 10px; }
    .theme-btn {
      all: unset; cursor: pointer;
      font-family: 'IBM Plex Mono', monospace; font-size: 0.68rem; font-weight: 500;
      color: ${t.muted}; border: 1px solid ${t.border}; border-radius: 4px;
      padding: 4px 10px; transition: all .2s; letter-spacing: 0.04em;
    }
    .theme-btn:hover { color: ${t.text}; border-color: ${t.accent}; }
    .nav-btn {
      text-decoration: none; font-family: 'IBM Plex Mono', monospace;
      font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em;
      color: ${isDark ? '#9ecae8' : '#e8f2ff'};
      background: ${t.accent}; border-radius: 4px;
      padding: 6px 14px; transition: all .2s;
      border: 1px solid ${isDark ? '#2a5080' : '#1246a0'};
    }
    .nav-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

    /* ─── HERO ─── */
    .hero {
      display: grid; grid-template-columns: 1fr 380px;
      min-height: calc(100vh - 52px); max-height: 860px;
      border-bottom: 1px solid ${t.border};
    }
    .hero-left {
      padding: 60px 44px 60px 36px;
      display: flex; flex-direction: column; justify-content: center;
      border-right: 1px solid ${t.border};
      opacity: 0; transform: translateY(20px);
      transition: opacity .7s ease, transform .7s ease;
    }
    .hero-left.vis { opacity: 1; transform: translateY(0); }
    .hero-right {
      display: flex; flex-direction: column;
      background: ${t.panelAlt}; border-left: 2px solid ${t.border};
      border-radius: 16px;
      margin: 24px 24px 24px 0;
      opacity: 0; transform: translateY(20px);
      transition: opacity .7s .15s ease, transform .7s .15s ease;
    }
    .hero-right.vis { opacity: 1; transform: translateY(0); }

    .tag {
      display: inline-flex; align-items: center; gap: 6px;
      font-family: 'IBM Plex Mono', monospace; font-size: 0.63rem;
      font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
      color: ${t.accent}; border: 1px solid ${isDark ? '#1a3560' : '#5e88b8'};
      background: ${isDark ? t.accentDim : '#90b4d4'}; padding: 4px 10px; border-radius: 3px;
      margin-bottom: 28px; width: fit-content;
    }
    .tag-dot {
      width: 5px; height: 5px; border-radius: 50%; background: ${t.accent};
      animation: blink 2s ease infinite;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

    .hero-h1 {
      font-family: 'Fraunces', serif; font-weight: 900;
      font-size: clamp(2.4rem, 4.2vw, 3.8rem);
      line-height: 1.02; letter-spacing: -0.03em;
      color: ${t.text}; margin-bottom: 20px;
    }
    .hero-h1 em { font-style: italic; color: ${t.accent}; }

    .hero-p {
      font-size: 0.92rem; line-height: 1.75; color: ${t.muted};
      max-width: 420px; margin-bottom: 36px;
    }

    .hero-btns { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn-primary {
      text-decoration: none; font-family: 'IBM Plex Mono', monospace;
      font-size: 0.78rem; font-weight: 600; letter-spacing: 0.04em;
      color: ${isDark ? '#b8d8f0' : '#f0f8ff'};
      background: ${isDark ? t.accent : '#0c3e80'}; padding: 11px 22px; border-radius: 5px;
      border: 1px solid ${isDark ? '#2a5080' : '#1246a0'};
      box-shadow: ${isDark ? '0 2px 12px rgba(77,157,224,0.15)' : '0 2px 8px rgba(26,86,160,0.2)'};
      transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
    }
    .btn-primary:hover { filter: brightness(1.12); transform: translateY(-2px); }
    .btn-ghost {
      text-decoration: none; font-family: 'IBM Plex Mono', monospace;
      font-size: 0.78rem; font-weight: 500; letter-spacing: 0.03em;
      color: ${t.muted}; background: transparent;
      padding: 11px 18px; border-radius: 5px;
      border: 1px solid ${t.border}; transition: all .2s;
    }
    .btn-ghost:hover { border-color: ${t.accent}; color: ${t.accent}; background: ${isDark ? t.accentDim : '#90b4d4'}; }

    /* Right — data panel */
    .data-header {
      padding: 16px 20px; border-bottom: 1px solid ${t.border};
      font-family: 'IBM Plex Mono', monospace; font-size: 0.6rem;
      font-weight: 600; letter-spacing: 0.1em; color: ${t.muted};
      text-transform: uppercase; display: flex; align-items: center; gap: 8px;
    }
    .data-header::before {
      content:''; width: 6px; height: 6px; border-radius: 50%;
      background: ${t.success}; animation: blink 1.5s ease infinite;
    }
    .data-rows { flex: 1; display: flex; flex-direction: column; }
    .data-row {
      display: grid; grid-template-columns: 1fr auto;
      align-items: center; padding: 12px 20px;
      border-bottom: 1px solid ${t.border};
      gap: 12px;
    }
    .data-row:last-child { border-bottom: none; }
    .data-row:hover { background: ${isDark ? 'rgba(77,157,224,0.04)' : 'rgba(26,86,160,0.02)'}; }
    .data-label { font-size: 0.74rem; color: ${t.muted}; font-weight: 500; margin-bottom: 5px; }
    .data-bar { height: 2px; background: ${t.border}; border-radius: 1px; overflow: hidden; }
    .data-bar-fill { height: 100%; border-radius: 1px; background: ${t.accent}; transition: width 1.4s ease .5s; }
    .data-val {
      font-family: 'IBM Plex Mono', monospace; font-size: 0.76rem;
      font-weight: 600; color: ${t.text}; white-space: nowrap;
    }
    .data-score {
      margin: 14px 20px 20px; padding: 14px 16px;
      background: ${isDark ? 'rgba(61,186,110,0.08)' : 'rgba(10,66,40,0.1)'};
      border: 1px solid ${isDark ? 'rgba(61,186,110,0.22)' : 'rgba(10,66,40,0.35)'};
      border-radius: 6px;
    }
    .data-score-lbl {
      font-family: 'IBM Plex Mono', monospace; font-size: 0.58rem;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: ${isDark ? t.success : '#0a4228'}; margin-bottom: 4px; font-weight: 600;
    }
    .data-score-val {
      font-family: 'Fraunces', serif; font-size: 1.9rem; font-weight: 900;
      color: ${t.text}; letter-spacing: -0.02em; line-height: 1;
    }
    .data-score-sub { font-size: 0.68rem; color: ${t.muted}; margin-top: 3px; }

    /* ─── STATS ─── */
    .stats-row {
      display: grid; grid-template-columns: repeat(4,1fr);
      border-bottom: 1px solid ${t.border};
      opacity: 0; transform: translateY(12px);
      transition: opacity .6s, transform .6s;
    }
    .stats-row.vis { opacity: 1; transform: translateY(0); }
    .stat {
      padding: 22px 28px; border-right: 1px solid ${t.border};
      background: ${isDark ? t.panel : '#d4dce8'};
    }
    .stat:last-child { border-right: none; }
    .stat-n {
      font-family: 'Fraunces', serif; font-weight: 900;
      font-size: 2rem; line-height: 1; letter-spacing: -0.03em;
      color: ${t.accent}; margin-bottom: 4px;
    }
    .stat-label { font-size: 0.73rem; color: ${t.muted}; font-weight: 500; line-height: 1.4; }

    /* ─── SECTION ─── */
    .section { border-bottom: 1px solid ${t.border}; }
    .section-head {
      display: flex; align-items: baseline; gap: 14px; padding: 32px 36px 0;
    }
    .s-num {
      font-family: 'IBM Plex Mono', monospace; font-size: 0.63rem;
      font-weight: 600; letter-spacing: 0.1em; color: ${t.muted}; white-space: nowrap;
    }
    .s-title {
      font-family: 'Fraunces', serif; font-weight: 900;
      font-size: clamp(1.3rem, 2.4vw, 1.8rem); letter-spacing: -0.025em;
      color: ${t.text}; line-height: 1.1;
    }

    /* ─── FEATURE GRID ─── */
    .feat-grid {
      display: grid; grid-template-columns: repeat(3,1fr);
      gap: 1px; background: ${t.border};
      margin: 24px 36px 32px; border-radius: 7px;
      border: 1px solid ${t.border}; overflow: hidden;
      opacity: 0; transform: translateY(16px);
      transition: opacity .6s, transform .6s;
    }
    .feat-grid.vis { opacity: 1; transform: translateY(0); }
    .feat { background: ${isDark ? t.panel : '#d4dce8'}; padding: 24px 22px; transition: background .2s; }
    .feat:hover { background: ${isDark ? '#141e2c' : '#bccad8'}; }
    .feat-icon {
      width: 32px; height: 32px; border-radius: 5px;
      display: flex; align-items: center; justify-content: center; font-size: 16px;
      margin-bottom: 12px;
    }
    .feat-title { font-weight: 600; font-size: 0.86rem; color: ${t.text}; margin-bottom: 6px; }
    .feat-text { font-size: 0.78rem; color: ${t.muted}; line-height: 1.7; }

    /* ─── HOW IT WORKS ─── */
    .how-grid {
      display: grid; grid-template-columns: repeat(3,1fr);
      gap: 1px; background: ${t.border};
      margin: 24px 36px 32px; border-radius: 7px;
      border: 1px solid ${t.border}; overflow: hidden;
      opacity: 0; transform: translateY(16px);
      transition: opacity .6s, transform .6s;
    }
    .how-grid.vis { opacity: 1; transform: translateY(0); }
    .how-step { background: ${isDark ? t.panel : '#d4dce8'}; padding: 28px 24px; }
    .step-n {
      font-family: 'IBM Plex Mono', monospace; font-size: 0.62rem;
      font-weight: 600; letter-spacing: 0.1em; color: ${t.accent};
      text-transform: uppercase; margin-bottom: 14px;
      display: flex; align-items: center; gap: 8px;
    }
    .step-n::after { content:''; flex:1; height:1px; background:${isDark ? t.border : '#5e7a98'}; max-width:36px; }
    .step-title { font-weight: 600; font-size: 0.9rem; color: ${t.text}; margin-bottom: 7px; }
    .step-text { font-size: 0.78rem; color: ${t.muted}; line-height: 1.7; }

    /* ─── DISCLAIMER + CTA ─── */
    .cta-band {
      display: grid; grid-template-columns: 1fr 1fr;
      border-bottom: 1px solid ${t.border};
      opacity: 0; transform: translateY(16px);
      transition: opacity .6s, transform .6s;
    }
    .cta-band.vis { opacity: 1; transform: translateY(0); }

    .disclaimer {
      padding: 40px 36px; border-right: 1px solid ${t.border};
      background: ${isDark ? 'rgba(224,80,80,0.02)' : 'rgba(94,14,14,0.06)'};
    }
    .disc-badge {
      display: inline-flex; align-items: center; gap: 5px;
      font-family: 'IBM Plex Mono', monospace; font-size: 0.6rem;
      font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
      color: ${isDark ? t.danger : '#5e0e0e'}; background: ${isDark ? t.dangerDim : '#e8a8a8'};
      border: 1px solid ${isDark ? 'rgba(224,80,80,0.28)' : 'rgba(94,14,14,0.45)'};
      padding: 3px 9px; border-radius: 3px; margin-bottom: 16px;
    }
    .disc-title {
      font-family: 'Fraunces', serif; font-weight: 900; font-size: 1.35rem;
      letter-spacing: -0.02em; color: ${t.text}; margin-bottom: 12px;
    }
    .disc-text { font-size: 0.8rem; color: ${t.muted}; line-height: 1.85; }
    .disc-text strong { color: ${t.textSub}; font-weight: 600; }

    .cta-box { padding: 40px 36px; display: flex; flex-direction: column; justify-content: center; }
    .cta-title {
      font-family: 'Fraunces', serif; font-weight: 900; font-size: 1.35rem;
      letter-spacing: -0.02em; color: ${t.text}; margin-bottom: 18px;
    }
    .cta-checks { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 26px; }
    .cta-check { font-size: 0.79rem; color: ${t.muted}; display: flex; align-items: center; gap: 9px; }
    .check-mark {
      width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
      background: ${t.successDim}; border: 1px solid ${isDark ? 'rgba(61,186,110,0.28)' : 'rgba(10,66,40,0.45)'};
      display: flex; align-items: center; justify-content: center;
      font-size: 8px; color: ${t.success};
    }

    /* ─── FOOTER ─── */
    .footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 28px; flex-wrap: wrap; gap: 8px;
    }
    .footer-brand { display: flex; align-items: center; gap: 8px; }
    .footer-name { font-family:'IBM Plex Mono',monospace; font-size:0.7rem; font-weight:600; color:${t.muted}; }
    .footer-note { font-size: 0.7rem; color: ${t.muted}; }

    /* ─── RESPONSIVE ─── */
    @media(max-width:860px){
      .hero { grid-template-columns:1fr; max-height:none; min-height:auto; }
      .hero-left { padding:44px 20px 32px; border-right:none; border-bottom:1px solid ${t.border}; }
      .hero-right { border-left:none; margin: 0 16px 24px 16px; }
    }
    @media(max-width:720px){
      .feat-grid, .how-grid { grid-template-columns:1fr; margin:16px 16px 24px; }
      .section-head { padding:28px 20px 0; }
      .stats-row { grid-template-columns:repeat(2,1fr); }
      .stat:nth-child(2){ border-right:none; }
      .stat:nth-child(3){ border-top:1px solid ${t.border}; }
    }
    @media(max-width:680px){
      .cta-band { grid-template-columns:1fr; }
      .disclaimer { border-right:none; border-bottom:1px solid ${t.border}; padding:32px 20px; }
      .cta-box { padding:32px 20px; }
    }
    @media(max-width:480px){
      .nav { padding:0 14px; }
      .nav-name { display:none; }
      .footer { padding:14px 16px; }
    }
  `;

  const inputRows = [
    { label: 'Age', val: '42 yrs', bar: 30 },
    { label: 'BMI', val: '26.6', bar: 55 },
    { label: 'Daily Steps', val: '7,654', bar: 50 },
    { label: 'Exercise', val: '4.1 hrs/wk', bar: 60 },
    { label: 'Sleep', val: '7.3 hrs', bar: 70 },
    { label: 'Blood Sugar', val: '119 mg/dL', bar: 40 },
    { label: 'Blood Pressure', val: '136 mmHg', bar: 62 },
    { label: 'Smoking', val: 'No', bar: 0 },
  ];

  const feats = [
    { icon: '📊', bg: t.accentDim,                                              title: 'Personalised Risk Score',   text: 'Instant overall risk estimate out of 40, based on your exact health profile across 8 measured factors.' },
    { icon: '🤖', bg: isDark ? 'rgba(61,186,110,0.1)' : light.successDim,       title: 'XGBoost ML Model',          text: 'Gradient-boosted trees trained on real lifestyle and biometric patterns. High accuracy, low noise.' },
    { icon: '💡', bg: isDark ? 'rgba(232,160,53,0.1)' : light.warnDim,          title: 'Smart Recommendations',     text: 'Only flags factors that are genuinely compromised — no padding, no filler suggestions.' },
    { icon: '⚡', bg: t.accentDim,                                              title: 'Under 60 Seconds',          text: 'No registration needed. Adjust sliders and get a full risk breakdown the moment you hit submit.' },
    { icon: '🔒', bg: isDark ? 'rgba(61,186,110,0.1)' : light.successDim,       title: 'Zero Data Stored',          text: 'Nothing leaves your browser. No tracking, no accounts, complete privacy — always.' },
    { icon: '📈', bg: isDark ? 'rgba(224,80,80,0.1)'  : light.dangerDim,        title: 'Factor Contribution Chart', text: 'Visual bars show exactly which metric drives your score and by how much, so you know where to focus.' },
  ];

  const howSteps = [
    { n: '01', title: 'Enter your details',   text: 'Sliders for age, BMI, steps, sleep, blood readings, exercise and smoking. Takes under 60 seconds.' },
    { n: '02', title: 'Model runs instantly', text: 'XGBoost processes 11 engineered features from your inputs and generates a calibrated risk score in milliseconds.' },
    { n: '03', title: 'Act on your results',  text: 'See your risk tier and only the recommendations that genuinely apply to your profile — nothing irrelevant.' },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="lp">

        {/* NAV */}
        <nav className="nav">
          <div className="nav-brand">
            <div className="nav-chip">🫀</div>
            <span className="nav-name">HEALTH RISK PREDICTOR</span>
          </div>
          <div className="nav-right">
            <button className="theme-btn" onClick={toggle}>{isDark ? '☀ LIGHT' : '☽ DARK'}</button>
            <Link to="/predict" className="nav-btn">OPEN APP →</Link>
          </div>
        </nav>

        {/* HERO */}
        <div className="hero" ref={h1Ref}>
          <div className={`hero-left ${h1Vis ? 'vis' : ''}`}>
            <div className="tag"><div className="tag-dot" />ML · XGBoost · Health Analytics</div>
            <h1 className="hero-h1">Your health risk,<br /><em>measured.</em></h1>
            <p className="hero-p">
              Enter 8 health metrics. Get an instant, ML-powered risk score out of 40 — and only the recommendations that actually apply to you.
            </p>
            <div className="hero-btns">
              <Link to="/predict" className="btn-primary">Get my score →</Link>
              <a href="#features" className="btn-ghost">See how it works</a>
            </div>
          </div>

          <div className={`hero-right ${h1Vis ? 'vis' : ''}`}>
            <div className="data-header">SAMPLE ASSESSMENT · PATIENT 001</div>
            <div className="data-rows">
              {inputRows.map((r, i) => (
                <div className="data-row" key={i}>
                  <div>
                    <div className="data-label">{r.label}</div>
                    <div className="data-bar">
                      <div className="data-bar-fill" style={{ width: h1Vis ? `${r.bar}%` : '0%' }} />
                    </div>
                  </div>
                  <div className="data-val">{r.val}</div>
                </div>
              ))}
            </div>
            <div className="data-score">
              <div className="data-score-lbl">▲ Risk Score</div>
              <div className="data-score-val">
                13.6
                <span style={{ fontSize: '1rem', color: t.muted, fontFamily: "'IBM Plex Mono',monospace" }}> /40</span>
              </div>
              <div className="data-score-sub">MODERATE RISK · Age &amp; Sugar flagged</div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className={`stats-row ${statVis ? 'vis' : ''}`} ref={statRef}>
          {[
            { n: 8,  s: '',       label: 'health factors tracked' },
            { n: 95, s: '%',      label: 'model accuracy (R²)' },
            { n: 60, s: 's',      label: 'avg. time to complete' },
            { n: 0,  s: ' stored',label: 'data points — full privacy' },
          ].map((s, i) => (
            <div className="stat" key={i}>
              <div className="stat-n"><Count to={s.n} suffix={s.s} /></div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* FEATURES */}
        <div className="section" id="features" ref={featRef}>
          <div className="section-head">
            <span className="s-num">01 —</span>
            <span className="s-title">What does it do?</span>
          </div>
          <div className={`feat-grid ${featVis ? 'vis' : ''}`}>
            {feats.map((f, i) => (
              <div className="feat" key={i} style={{ transitionDelay: `${i * 55}ms` }}>
                <div className="feat-icon" style={{ background: f.bg }}>{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <p className="feat-text">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="section" ref={stepsRef}>
          <div className="section-head">
            <span className="s-num">02 —</span>
            <span className="s-title">How it works</span>
          </div>
          <div className={`how-grid ${stepsVis ? 'vis' : ''}`}>
            {howSteps.map((s, i) => (
              <div className="how-step" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="step-n">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <p className="step-text">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* DISCLAIMER + CTA */}
        <div className={`cta-band ${ctaVis ? 'vis' : ''}`} ref={ctaRef}>
          <div className="disclaimer">
            <div className="disc-badge">⚠ Disclaimer</div>
            <div className="disc-title">Not a medical diagnosis</div>
            <p className="disc-text">
              This tool is <strong>for educational purposes only.</strong> It is not a medical device, not a clinical diagnosis, and <strong>not a substitute</strong> for professional medical advice.<br /><br />
              Predictions are estimates based on simplified models. <strong>Always consult a qualified healthcare professional</strong> regarding your health.
            </p>
          </div>
          <div className="cta-box">
            <div className="cta-title">Ready to check<br />your score?</div>
            <ul className="cta-checks">
              {['No sign-up required', 'Results in under 60 seconds', 'Zero data stored or transmitted', 'Free — always'].map((c, i) => (
                <li className="cta-check" key={i}>
                  <div className="check-mark">✓</div>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <Link to="/predict" className="btn-primary" style={{ width: 'fit-content' }}>
              Start free assessment →
            </Link>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-brand">
            <div className="nav-chip">🫀</div>
            <span className="footer-name">HEALTH RISK PREDICTOR</span>
          </div>
          <span className="footer-note">Educational use only · Not medical advice · No data stored</span>
        </footer>

      </div>
    </>
  );
}