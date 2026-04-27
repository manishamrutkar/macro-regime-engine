import React from 'react';
import GlassCard from '../ui/GlassCard';

const LABEL_STYLE = {
  Bullish: { bg:'rgba(16,185,129,0.15)', border:'rgba(16,185,129,0.3)', color:'#34d399' },
  Bearish: { bg:'rgba(239,68,68,0.15)',  border:'rgba(239,68,68,0.3)',  color:'#f87171' },
  Neutral: { bg:'rgba(255,255,255,0.07)',border:'rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.4)' },
};

const MOCK_SOURCES = {
  'Fed Watch': { score: 72,  label: 'Bullish' },
  'Bloomberg': { score: 58,  label: 'Bullish' },
  'Reuters':   { score: 12,  label: 'Neutral' },
  'CNBC':      { score: 61,  label: 'Bullish' },
  'WSJ':       { score: -28, label: 'Bearish' },
};

export default function SentimentPanel({ sentiment }) {
  const sources    = sentiment?.sources || MOCK_SOURCES;
  const fearGreed  = sentiment?.fear_greed || { score: 62, label: 'Greed' };
  const fgScore    = fearGreed.score || 62;
  const fgColor    = fgScore >= 60 ? '#fbbf24' : fgScore <= 40 ? '#f87171' : '#60a5fa';

  return (
    <GlassCard>
      <div className="section-label">News sentiment <span className="badge-new">NEW</span></div>
      {Object.entries(sources).map(([src, data]) => {
        const s   = data.score || 0;
        const lbl = data.label || 'Neutral';
        const st  = LABEL_STYLE[lbl] || LABEL_STYLE.Neutral;
        const w   = Math.min(Math.abs(s), 100);
        const barColor = s > 0 ? 'linear-gradient(90deg,#10b981,#34d399)' : s < 0 ? 'linear-gradient(90deg,#ef4444,#f87171)' : 'rgba(255,255,255,0.2)';
        return (
          <div key={src} style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize:10, color:'#e2e8f0', width:72, flexShrink:0, fontWeight:500 }}>{src}</span>
            <div style={{ flex:1, height:4, borderRadius:2, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
              <div style={{ width:`${w}%`, height:'100%', borderRadius:2, background:barColor }} />
            </div>
            <span style={{ fontSize:10, fontWeight:700, color: s > 0 ? '#34d399' : s < 0 ? '#f87171' : 'rgba(255,255,255,0.4)', width:30, textAlign:'right' }}>
              {s > 0 ? '+' : ''}{s}
            </span>
            <span style={{ fontSize:8, padding:'2px 6px', borderRadius:8, fontWeight:600, background:st.bg, border:`1px solid ${st.border}`, color:st.color, flexShrink:0 }}>{lbl}</span>
          </div>
        );
      })}
      <div className="divider" />
      <div style={{ textAlign:'center' }}>
        <div className="section-label" style={{ marginBottom:4 }}>Fear & Greed Index</div>
        <div style={{ fontSize:30, fontWeight:700, color:fgColor, letterSpacing:'-0.04em' }}>{fgScore}</div>
        <div style={{ fontSize:11, fontWeight:600, color:fgColor, marginTop:2 }}>{fearGreed.label}</div>
        <div style={{ height:5, borderRadius:3, background:'linear-gradient(90deg,#ef4444,#f59e0b,#fbbf24,#34d399)', margin:'10px 0 3px', position:'relative' }}>
          <div style={{ position:'absolute', top:-3, left:`${fgScore}%`, width:2, height:11, background:'#fff', borderRadius:1, transform:'translateX(-50%)' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:8, color:'rgba(255,255,255,0.25)' }}>
          <span>Extreme Fear</span><span>Neutral</span><span>Extreme Greed</span>
        </div>
      </div>
    </GlassCard>
  );
}
