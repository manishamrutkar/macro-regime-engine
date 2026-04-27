import React from 'react';
import GlassCard from '../ui/GlassCard';

const DEFAULT_SECTORS = [
  { name:'Tech',     ret:0.024 }, { name:'Fin',      ret:0.018 },
  { name:'Energy',   ret:0.009 }, { name:'Util',     ret:-0.006 },
  { name:'Health',   ret:-0.003},{ name:'Consumer',  ret:0.004 },
  { name:'Ind',      ret:0.011 }, { name:'RE',       ret:-0.012 },
];

export default function SectorHeatmap({ sectors = DEFAULT_SECTORS }) {
  return (
    <GlassCard>
      <div className="section-label">Sector rotation <span className="badge-new">NEW</span></div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:4, marginTop:6 }}>
        {sectors.map(s => {
          const isUp = s.ret >= 0;
          const bg   = isUp ? `rgba(16,185,129,${0.08+Math.abs(s.ret)*3})` : `rgba(239,68,68,${0.08+Math.abs(s.ret)*3})`;
          const bdr  = isUp ? `rgba(16,185,129,${0.15+Math.abs(s.ret)*3})` : `rgba(239,68,68,${0.15+Math.abs(s.ret)*3})`;
          const col  = isUp ? '#34d399' : '#f87171';
          return (
            <div key={s.name} style={{ padding:'8px 6px', borderRadius:8, background:bg, border:`1px solid ${bdr}`, textAlign:'center' }}>
              <div style={{ fontSize:8, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>{s.name}</div>
              <div style={{ fontSize:13, fontWeight:700, color:col }}>{s.ret>=0?'+':''}{(s.ret*100).toFixed(1)}%</div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
