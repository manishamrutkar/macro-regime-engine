import React from 'react';
import GlassCard from '../ui/GlassCard';
import { REGIME_COLORS_LIGHT } from '../../utils/constants';

export default function ForecastPanel({ forecast }) {
  if (!forecast) return <GlassCard><div className="skeleton" style={{ height: 180 }} /></GlassCard>;

  const { probabilities = {}, predicted_regime_name, model } = forecast;

  return (
    <GlassCard>
      <div className="section-label">AI regime forecast <span className="badge-new">NEW</span></div>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)', marginBottom:12 }}>
        <span style={{ fontSize:18 }}>🤖</span>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:'#c7d2fe' }}>Next month: {predicted_regime_name}</div>
          <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{model} · Updated daily</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5 }}>
        {Object.entries(probabilities).map(([name, prob], i) => {
          const color = REGIME_COLORS_LIGHT[i] || '#34d399';
          const pct   = Math.round(prob * 100);
          return (
            <div key={name} className="glass-card" style={{ padding:'9px 10px', textAlign:'center' }}>
              <div style={{ fontSize:9, fontWeight:600, color, marginBottom:3 }}>{name.split(' ')[0]}</div>
              <div style={{ fontSize:17, fontWeight:700, color, letterSpacing:'-0.03em' }}>{pct}%</div>
              <div style={{ height:3, borderRadius:2, marginTop:5, background:`${color}20`, overflow:'hidden' }}>
                <div style={{ width:`${pct}%`, height:'100%', borderRadius:2, background:`linear-gradient(90deg,${color}99,${color})` }} />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
