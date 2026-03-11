import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Slider as MuiSlider,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const API_URL = 'http://localhost:8000/predict';

// ─── THEMES ───────────────────────────────────────────────────────────────────

const lightTokens = {
  primary:    '#4a7ab5',
  success:    '#4a7c59',
  warning:    '#b07d3a',
  error:      '#a04040',
  info:       '#3a7a99',
  bg:         '#f4f5f7',
  card:       '#ffffff',
  border:     '#dde1e7',
  text:       '#1e2228',
  muted:      '#6b7280',
  track:      '#e2e5ea',
  gaugeTrack: '#e2e5ea',
  btnBg:      '#4a7ab5',
  btnHover:   '#3d6799',
  btnShadow:  'rgba(74,122,181,0.18)',
};

const darkTokens = {
  primary:    '#7aa3cc',
  success:    '#6aab7e',
  warning:    '#c49a55',
  error:      '#c47070',
  info:       '#6aadcc',
  bg:         '#0d1117',
  card:       '#161b22',
  border:     '#30363d',
  text:       '#d8dde4',
  muted:      '#8b949e',
  track:      '#21262d',
  gaugeTrack: '#30363d',
  btnBg:      '#2a3a50',
  btnHover:   '#334861',
  btnShadow:  'rgba(42,58,80,0.5)',
};

const buildMuiTheme = (isDark) =>
  createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: { main: isDark ? '#7aa3cc' : '#4a7ab5' },
      background: {
        default: isDark ? '#0d1117' : '#f4f5f7',
        paper:   isDark ? '#161b22' : '#ffffff',
      },
      text: {
        primary:   isDark ? '#d8dde4' : '#1e2228',
        secondary: isDark ? '#8b949e' : '#6b7280',
      },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${isDark ? '#30363d' : '#dde1e7'}`,
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          rail: { backgroundColor: isDark ? '#30363d' : '#e2e5ea' },
        },
      },
    },
  });

const getRiskStyle = (level, t) => {
  if (level?.includes('LOW'))      return { color: t.success, bg: t === darkTokens ? '#0d2116' : '#edf7f0' };
  if (level?.includes('MODERATE')) return { color: t.warning, bg: t === darkTokens ? '#2a1a06' : '#fdf5e6' };
  if (level?.includes('HIGH'))     return { color: t.error,   bg: t === darkTokens ? '#2a0d0d' : '#fdf0f0' };
  return                                   { color: t.error,   bg: t === darkTokens ? '#2a0d0d' : '#fdf0f0' };
};

// ─── TOGGLE SWITCH ────────────────────────────────────────────────────────────

const ToggleTrack = styled('div')(({ isdark }) => ({
  position: 'relative',
  width: 52, height: 26, borderRadius: 13, cursor: 'pointer',
  background: isdark === 'true'
    ? 'linear-gradient(135deg, #1c2d40 0%, #0d1117 100%)'
    : 'linear-gradient(135deg, #c8daf0 0%, #aac4e0 100%)',
  border: isdark === 'true' ? '1px solid #2d3a48' : '1px solid #aac4e0',
  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': { opacity: 0.85 },
}));

const ToggleThumb = styled('div')(({ isdark }) => ({
  position: 'absolute',
  top: 3, left: isdark === 'true' ? 28 : 3,
  width: 18, height: 18, borderRadius: '50%',
  background: isdark === 'true'
    ? 'radial-gradient(circle at 30% 30%, #c8cfe8, #7a88bb)'
    : 'radial-gradient(circle at 30% 30%, #fde9a2, #d4a843)',
  boxShadow: isdark === 'true'
    ? '0 0 6px rgba(122,136,187,0.4)'
    : '0 0 6px rgba(212,168,67,0.35)',
  transition: 'left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
}));

// ─── GAUGE ────────────────────────────────────────────────────────────────────

const GaugeCanvas = ({ score, riskColor, isDark }) => {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const current   = useRef(0);
  const t         = isDark ? darkTokens : lightTokens;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = 240 * dpr;
    canvas.height = 150 * dpr;
    canvas.style.width    = '100%';
    canvas.style.maxWidth = '240px';
    canvas.style.height   = 'auto';
    ctx.scale(dpr, dpr);

    const cx = 120, cy = 105, radius = 88;
    const startAngle = Math.PI * 0.75;
    const endAngle   = Math.PI * 2.25;
    const target     = Math.min(40, Math.max(0, score));
    let   startVal   = current.current;
    const duration   = 800;
    const ease = (x) => x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x;

    const draw = (val) => {
      ctx.clearRect(0, 0, 240, 150);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.lineWidth = 14; ctx.strokeStyle = t.gaugeTrack; ctx.lineCap = 'round'; ctx.stroke();

      const fillEnd = startAngle + (endAngle - startAngle) * (val / 40);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, fillEnd);
      ctx.lineWidth = 14; ctx.strokeStyle = riskColor; ctx.lineCap = 'round'; ctx.stroke();

      const dotX = cx + radius * Math.cos(fillEnd);
      const dotY = cy + radius * Math.sin(fillEnd);
      ctx.beginPath(); ctx.arc(dotX, dotY, 7, 0, Math.PI * 2);
      ctx.fillStyle = riskColor; ctx.fill();

      ctx.font = 'bold 32px "SF Pro Display", system-ui, sans-serif';
      ctx.fillStyle = t.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(val.toFixed(1), cx, cy - 4);
      ctx.font = '13px system-ui, sans-serif'; ctx.fillStyle = t.muted;
      ctx.fillText('/ 40', cx, cy + 22);
    };

    let startTime = null;
    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const tt  = Math.min((ts - startTime) / duration, 1);
      const val = startVal + (target - startVal) * ease(tt);
      current.current = val; draw(val);
      if (tt < 1) animRef.current = requestAnimationFrame(animate);
    };
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [score, riskColor, isDark]);

  return <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto' }} />;
};

// ─── FACTOR BAR ──────────────────────────────────────────────────────────────

const FactorBarWrap = styled('div')(() => ({
  marginBottom: 14,
  '& .label': { display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 5 },
  '& .bar':   { height: 6, borderRadius: 4, overflow: 'hidden' },
  '& .fill':  { height: '100%', borderRadius: 4, transition: 'width 0.6s ease-out' },
}));

const FactorBar = ({ label, contrib, color, isDark }) => {
  const t = isDark ? darkTokens : lightTokens;
  return (
    <FactorBarWrap>
      <div className="label">
        <span style={{ color: t.text, textTransform: 'capitalize' }}>{label}</span>
        <span style={{ color: t.muted, fontVariantNumeric: 'tabular-nums' }}>{contrib.toFixed(1)}</span>
      </div>
      <div className="bar" style={{ background: t.track }}>
        <div className="fill" style={{ width: `${Math.min(100, contrib * 4)}%`, backgroundColor: color }} />
      </div>
    </FactorBarWrap>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function HealthRiskApp() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('hrp-theme');
      return stored !== null ? stored === 'dark' : true;
    } catch { return true; }
  });
  const t = isDark ? darkTokens : lightTokens;
  const muiTheme = buildMuiTheme(isDark);

  const [form, setForm] = useState({
    age: 40, bmi: 25.0, daily_steps: 7000,
    exercise_hours_week: 3.0, sleep_hours: 7.0,
    blood_sugar: 100, blood_pressure: 120, smoking: 0,
  });

  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleChange = (field) => (_, value) =>
    setForm(prev => ({ ...prev, [field]: value ?? 0 }));

  const handleRadio = (e) =>
    setForm(prev => ({ ...prev, smoking: Number(e.target.value) }));

  const predict = async () => {
    setLoading(true); setError(null); setResult(null);
    const payload = {
      age:                 Number(form.age),
      bmi:                 Number(form.bmi),
      daily_steps:         Number(Math.round(form.daily_steps)),
      exercise_hours_week: Number(form.exercise_hours_week),
      sleep_hours:         Number(form.sleep_hours),
      blood_sugar:         Number(form.blood_sugar),
      blood_pressure:      Number(form.blood_pressure),
      smoking:             Number(form.smoking),
    };
    try {
      const res = await axios.post(API_URL, payload);
      setResult(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        Array.isArray(detail)
          ? detail.map(d => d.msg || d).join(' • ')
          : detail || err.message || 'Connection failed – is backend running?'
      );
    } finally { setLoading(false); }
  };

  const riskStyle = result ? getRiskStyle(result.risk_level, t) : { color: t.muted, bg: t.track };

  const factorContrib = (key, val) => {
    if (key === 'age')                 return (val - 18) * 0.3;
    if (key === 'bmi')                 return Math.max(0, val - 25) * 0.8 + Math.max(0, 18.5 - val) * 0.6;
    if (key === 'daily_steps')         return Math.max(0, 10000 - val) * 0.001;
    if (key === 'exercise_hours_week') return Math.max(0, 4 - val) * 0.8;
    if (key === 'sleep_hours')         return Math.max(0, 7 - val) * 1.2 + Math.max(0, val - 9) * 0.6;
    if (key === 'blood_sugar')         return Math.max(0, val - 100) * 0.15 + Math.max(0, 100 - val) * 0.1;
    if (key === 'blood_pressure')      return Math.max(0, val - 120) * 0.12 + Math.max(0, 80 - val) * 0.15;
    if (key === 'smoking')             return val * 7;
    return 0;
  };

  const factorColors = [t.error, t.warning, '#b08a4a', t.success, t.info, t.primary, '#9070b0', '#b06080'];

  // Rank badge palette
  const rankColors = ['#c49a55', '#8b949e', '#a07850'];
  const rankBgs = isDark
    ? ['rgba(196,154,85,0.12)', 'rgba(139,148,158,0.1)', 'rgba(160,120,80,0.1)']
    : ['rgba(196,154,85,0.1)',  'rgba(139,148,158,0.08)', 'rgba(160,120,80,0.08)'];
  const rankLabels = ['#1 Priority', '#2 Priority', '#3 Priority'];

  // Always returns an array — uses `suggestions` (new backend) or wraps
  // single `suggestion` string (old backend) so UI never breaks
  const getSuggestions = (res) => {
    if (Array.isArray(res.suggestions) && res.suggestions.length > 0) {
      return res.suggestions; // [{factor, label, message, contribution}, ...]
    }
    return [{ factor: 'general', label: '💡 Recommendation', message: res.suggestion }];
  };

  const sliderFields = [
    { field: 'age',                label: 'Age',            unit: 'years',   min: 18, max: 80,    step: 1   },
    { field: 'bmi',                label: 'BMI',            unit: '',        min: 10, max: 45,    step: 0.1 },
    { field: 'daily_steps',        label: 'Daily Steps',    unit: 'steps',   min: 0,  max: 17000, step: 100 },
    { field: 'exercise_hours_week',label: 'Exercise',       unit: 'hrs/wk',  min: 0,  max: 8.5,   step: 0.1 },
    { field: 'sleep_hours',        label: 'Sleep',          unit: 'hrs/day', min: 2,  max: 12,    step: 0.1 },
    { field: 'blood_sugar',        label: 'Blood Sugar',    unit: 'mg/dL',   min: 50, max: 200,   step: 1   },
    { field: 'blood_pressure',     label: 'Blood Pressure', unit: 'mmHg',    min: 60, max: 180,   step: 1   },
  ];

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh', bgcolor: t.bg, color: t.text,
        transition: 'background-color 0.35s ease, color 0.35s ease',
        fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif',
      }}>

        {/* ── HEADER ── */}
        <Box sx={{
          position: 'sticky', top: 0, zIndex: 100,
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          bgcolor: isDark ? 'rgba(13,17,23,0.88)' : 'rgba(244,245,247,0.88)',
          borderBottom: `1px solid ${t.border}`,
          px: { xs: 2, sm: 3, md: 5 }, py: 1.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'background-color 0.35s ease',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box sx={{
              width: 30, height: 30, borderRadius: '8px',
              background: isDark ? 'linear-gradient(135deg,#1c2d40,#4a6a8a)' : 'linear-gradient(135deg,#3a6090,#6a98c4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0,
            }}>🫀</Box>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' }, letterSpacing: '-0.02em', color: t.text, whiteSpace: 'nowrap' }}>
              Health Risk Predictor
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.75rem', color: t.muted, fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </Typography>
            <ToggleTrack isdark={isDark.toString()} onClick={() => setIsDark(v => {
              const next = !v;
              try { localStorage.setItem('hrp-theme', next ? 'dark' : 'light'); } catch {}
              return next;
            })}>
              <ToggleThumb isdark={isDark.toString()}>{isDark ? '🌙' : '☀️'}</ToggleThumb>
            </ToggleTrack>
          </Box>
        </Box>

        {/* ── BODY ── */}
        <Box sx={{ px: { xs: 1.5, sm: 3, md: 5 }, py: { xs: 3, md: 5 } }}>
          <Typography align="center" sx={{ fontSize: { xs: '1.35rem', sm: '1.6rem', md: '2rem' }, fontWeight: 700, letterSpacing: '-0.03em', color: t.text, mb: 0.5 }}>
            Your Health Assessment
          </Typography>
          <Typography align="center" sx={{ color: t.muted, mb: { xs: 3, md: 5 }, fontSize: { xs: '0.8rem', sm: '0.88rem' } }}>
            Enter your details below to estimate your personal health risk score
          </Typography>

          <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, md: 3 } }}>

            {/* ════════════════════════════════════════
                LEFT COLUMN: Form  +  Your Inputs
            ════════════════════════════════════════ */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>

              {/* Input Panel */}
              <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3, md: 4 }, borderRadius: 3, bgcolor: t.card, border: `1px solid ${t.border}`, transition: 'background-color 0.35s ease, border-color 0.35s ease' }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: t.primary, mb: 3 }}>
                  Your Information
                </Typography>

                {sliderFields.map(({ field, label, unit, min, max, step }) => (
                  <Box key={field} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.83rem', color: t.muted }}>
                        {label}
                        {unit && <span style={{ color: t.muted, fontSize: '0.73rem', marginLeft: 4 }}>({unit})</span>}
                      </Typography>
                      <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: t.text, fontVariantNumeric: 'tabular-nums', minWidth: 60, textAlign: 'right' }}>
                        {field === 'daily_steps' ? form[field].toLocaleString() : form[field].toFixed(step < 1 ? 1 : 0)}
                      </Typography>
                    </Box>
                    <MuiSlider
                      value={form[field]} onChange={handleChange(field)}
                      min={min} max={max} step={step} valueLabelDisplay="auto"
                      sx={{
                        color: t.primary,
                        '& .MuiSlider-thumb': {
                          width: 15, height: 15,
                          boxShadow: isDark ? '0 0 0 3px rgba(122,163,204,0.15)' : '0 0 0 3px rgba(74,122,181,0.12)',
                          '&:hover': { boxShadow: isDark ? '0 0 0 5px rgba(122,163,204,0.2)' : '0 0 0 5px rgba(74,122,181,0.16)' },
                        },
                      }}
                    />
                  </Box>
                ))}

                <Box sx={{ mb: 3.5, mt: 1 }}>
                  <Typography sx={{ fontSize: '0.83rem', color: t.muted, mb: 1 }}>Do you smoke?</Typography>
                  <RadioGroup row value={form.smoking} onChange={handleRadio}>
                    {[['No', 0], ['Yes', 1]].map(([label, val]) => (
                      <FormControlLabel key={val} value={val}
                        control={<Radio size="small" sx={{ color: t.muted, '&.Mui-checked': { color: t.primary } }} />}
                        label={<Typography sx={{ fontSize: '0.83rem', color: t.text }}>{label}</Typography>}
                      />
                    ))}
                  </RadioGroup>
                </Box>

                {/* Submit button */}
                <Button
                  variant="contained" fullWidth size="large"
                  onClick={predict} disabled={loading}
                  sx={{
                    py: 1.4, borderRadius: 2, fontWeight: 600, letterSpacing: '0.025em', fontSize: '0.88rem',
                    bgcolor: t.btnBg, color: isDark ? '#c8d8e8' : '#fff',
                    border: `1px solid ${isDark ? '#3a5068' : '#3d6799'}`,
                    boxShadow: `0 2px 8px ${t.btnShadow}`,
                    '&:hover': { bgcolor: t.btnHover, boxShadow: `0 4px 12px ${t.btnShadow}` },
                    '&:active': { boxShadow: 'none', transform: 'translateY(1px)' },
                    '&.Mui-disabled': {
                      bgcolor: isDark ? '#1e2a38' : '#c8d4e4',
                      color: isDark ? '#4a5a6a' : '#7a90a8',
                      boxShadow: 'none',
                      border: `1px solid ${isDark ? '#2a3848' : '#b0c0d0'}`,
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {loading
                    ? <><CircularProgress size={18} sx={{ color: isDark ? '#7aa3cc' : '#fff', mr: 1.5 }} />Calculating…</>
                    : 'Get Risk Assessment'}
                </Button>
              </Paper>

              {/* ── YOUR INPUTS — directly below the button ── */}
              {result && (
                <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, bgcolor: t.card, border: `1px solid ${t.border}`, transition: 'background-color 0.35s ease, border-color 0.35s ease' }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: t.muted, mb: 2 }}>
                    Your Inputs
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)' }, gap: 1.5 }}>
                    {Object.entries(result.inputs).map(([k, v]) => (
                      <Box key={k} sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#0d1117' : '#f4f5f7', border: `1px solid ${t.border}` }}>
                        <Typography sx={{ fontSize: '0.67rem', color: t.muted, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
                          {k.replace(/_/g, ' ')}
                        </Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: t.text, fontVariantNumeric: 'tabular-nums' }}>
                          {k === 'smoking'
                            ? (v ? 'Yes' : 'No')
                            : k === 'daily_steps'
                            ? Number(v).toLocaleString()
                            : Number(v).toFixed(k.includes('bmi') || k.includes('hours') ? 1 : 0)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}
            </Box>

            {/* ════════════════════════════════════════
                RIGHT COLUMN: Score + Suggestions + Bars
            ════════════════════════════════════════ */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
              {error && (
                <Alert severity="error" sx={{ borderRadius: 2, bgcolor: isDark ? '#2a0d0d' : undefined, color: isDark ? '#c47070' : undefined, border: `1px solid ${isDark ? '#5a1a1a' : undefined}`, fontSize: '0.85rem' }}>
                  {error}
                </Alert>
              )}

              {/* Score card */}
              <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3, md: 4 }, borderRadius: 3, textAlign: 'center', bgcolor: t.card, border: `1px solid ${t.border}`, transition: 'background-color 0.35s ease, border-color 0.35s ease' }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: t.primary, mb: 2 }}>
                  Risk Score
                </Typography>
                {result ? (
                  <>
                    <GaugeCanvas score={result.risk_score} riskColor={riskStyle.color} isDark={isDark} />
                    <Box sx={{ mt: 2, display: 'inline-block', px: 3, py: 0.65, borderRadius: 2, bgcolor: riskStyle.bg, border: `1px solid ${riskStyle.color}40`, transition: 'all 0.3s ease' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.98rem', color: riskStyle.color, letterSpacing: '0.04em' }}>
                        {result.risk_level}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ height: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '1.8rem' }}>📊</Typography>
                    <Typography sx={{ color: t.muted, fontSize: '0.82rem', px: 2 }}>
                      Fill in the form and click "Get Risk Assessment"
                    </Typography>
                  </Box>
                )}
              </Paper>

              {result && (
                <>
                  {/* ── TOP RECOMMENDATIONS ── */}
                  <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, bgcolor: t.card, border: `1px solid ${t.border}`, transition: 'all 0.3s ease' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: t.primary, mb: 2.5 }}>
                      Top Recommendations
                    </Typography>

                    {getSuggestions(result).map((s, i) => {
                      const rc  = rankColors[i]  ?? rankColors[2];
                      const rbg = rankBgs[i]     ?? rankBgs[2];
                      const rl  = rankLabels[i]  ?? `#${i + 1} Priority`;
                      const isLast = i === getSuggestions(result).length - 1;
                      return (
                        <Box key={i} sx={{
                          display: 'flex', gap: 1.5, alignItems: 'flex-start',
                          mb: isLast ? 0 : 2.5,
                          pb: isLast ? 0 : 2.5,
                          borderBottom: isLast ? 'none' : `1px solid ${t.border}`,
                        }}>
                          {/* Rank badge */}
                          <Box sx={{
                            flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
                            bgcolor: rbg, border: `1px solid ${rc}55`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700, color: rc, mt: 0.1,
                          }}>
                            {i + 1}
                          </Box>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: t.text }}>
                                {s.label}
                              </Typography>
                              <Typography sx={{
                                fontSize: '0.67rem', fontWeight: 600, color: rc, bgcolor: rbg,
                                px: 1, py: 0.25, borderRadius: 1, letterSpacing: '0.04em',
                                textTransform: 'uppercase', whiteSpace: 'nowrap',
                              }}>
                                {rl}
                              </Typography>
                            </Box>
                            <Typography sx={{ fontSize: { xs: '0.82rem', sm: '0.86rem' }, color: t.muted, lineHeight: 1.65 }}>
                              {s.message}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Paper>

                  {/* Factor contribution bars */}
                  <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, bgcolor: t.card, border: `1px solid ${t.border}`, transition: 'background-color 0.35s ease, border-color 0.35s ease' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: t.muted, mb: 2.5 }}>
                      Risk Factor Contribution
                    </Typography>
                    {Object.entries(result.inputs || {}).map(([key, val], i) => (
                      <FactorBar key={key} label={key.replace(/_/g, ' ')} contrib={factorContrib(key, val)} color={factorColors[i % factorColors.length]} isDark={isDark} />
                    ))}
                  </Paper>
                </>
              )}
            </Box>

          </Box>
        </Box>

        {/* ── FOOTER ── */}
        <Typography align="center" sx={{ py: { xs: 3, md: 4 }, fontSize: '0.76rem', color: t.muted, borderTop: `1px solid ${t.border}`, mt: { xs: 3, md: 4 }, px: 2 }}>
          For educational purposes only — consult a doctor for medical advice
        </Typography>
      </Box>
    </ThemeProvider>
  );
}
