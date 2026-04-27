import React from 'react';
import GlassCard from '../ui/GlassCard';

export default function FearGreedPanel({ score = 62, label = 'Greed' }) {
  const color = score >= 60 ? '#fbbf24' : score <= 40 ? '#f87171' : '#60a5fa';
  return (
    <GlassCard style={{ textAlign:'center' }}>
      <div className="section-label" style={{ marginBottom:6 }}>Fear & Greed</div>
      <div style={{ fontSize:38, fontWeight:700, color, letterSpacing:'-0.05em' }}>{score}</div>
      <div style={{ fontSize:12, fontWeight:600, color, marginTop:3 }}>{label}</div>
      <div style={{ height:6, borderRadius:3, background:'linear-gradient(90deg,#ef4444,#f59e0b,#fbbf24,#34d399)', margin:'12px 0 4px', position:'relative' }}>
        <div style={{ position:'absolute', top:-4, left:`${score}%`, width:3, height:14, background:'#fff', borderRadius:2, transform:'translateX(-50%)' }} />
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'rgba(255,255,255,0.25)' }}>
        <span>Fear</span><span>Neutral</span><span>Greed</span>
      </div>
    </GlassCard>
  );
}
