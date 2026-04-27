import React from 'react';
import GlassCard from '../ui/GlassCard';
import { fmtPctRaw, fmtNum } from '../../utils/formatters';

export default function RiskMetricsPanel({ metrics, title = 'Risk metrics' }) {
  const items = metrics ? [
    { label:'Sharpe',      value: fmtNum(metrics.sharpe, 2),                   color:'#a5b4fc' },
    { label:'Sortino',     value: fmtNum(metrics.sortino, 2),                  color:'#a5b4fc' },
    { label:'CAGR',        value: fmtPctRaw((metrics.cagr || 0) * 100, 1),     color:'#34d399' },
    { label:'Volatility',  value: fmtPctRaw((metrics.ann_volatility || 0) * 100, 1), color:'#f87171' },
    { label:'Max DD',      value: fmtPctRaw((metrics.max_drawdown || 0) * 100, 1),   color:'#f87171' },
    { label:'Calmar',      value: fmtNum(metrics.calmar, 2),                   color:'#a5b4fc' },
  ] : [];

  return (
    <GlassCard>
      <div className="section-label">{title}</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
        {items.map(item => (
          <div key={item.label} className="glass-card" style={{ padding:'10px 12px' }}>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.07em' }}>{item.label}</div>
            <div style={{ fontSize:16, fontWeight:700, color:item.color, marginTop:3, letterSpacing:'-0.03em' }}>{item.value}</div>
          </div>
        ))}
        {!metrics && <div className="skeleton" style={{ gridColumn:'1/-1', height:80 }} />}
      </div>
    </GlassCard>
  );
}
