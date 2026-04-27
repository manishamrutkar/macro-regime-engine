import React from 'react';
import GlassCard from '../ui/GlassCard';

export default function VaRPanel({ varData }) {
  const strategy = varData?.strategy || {};

  const rows = [
    { label:'VaR 95%',  value: strategy.hist_var_95,  color:'#f87171' },
    { label:'VaR 99%',  value: strategy.hist_var_99,  color:'#ef4444' },
    { label:'CVaR 95%', value: strategy.hist_cvar_95, color:'#fca5a5' },
  ];

  return (
    <GlassCard>
      <div className="section-label">VaR & CVaR <span className="badge-new">NEW</span></div>
      {rows.map(row => {
        const pct = row.value ? Math.min(Math.abs(row.value) * 15, 100) : 0;
        const display = row.value ? `${(row.value * 100).toFixed(1)}%` : '—';
        return (
          <div key={row.label} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)', width:60, flexShrink:0 }}>{row.label}</span>
            <div style={{ flex:1, height:5, borderRadius:3, background:'rgba(255,255,255,0.05)', overflow:'hidden' }}>
              <div style={{ width:`${pct}%`, height:'100%', borderRadius:3, background:`linear-gradient(90deg,${row.color}99,${row.color})` }} />
            </div>
            <span style={{ fontSize:11, fontWeight:700, color:row.color, width:38, textAlign:'right' }}>{display}</span>
          </div>
        );
      })}
    </GlassCard>
  );
}
