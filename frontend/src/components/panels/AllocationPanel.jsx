import React from 'react';
import GlassCard from '../ui/GlassCard';
import { ASSET_COLORS } from '../../utils/constants';

const REGIME_ALLOCATIONS = {
  0: [{ asset:'SP500',5:0.20},{ asset:'GOLD',v:0.40},{ asset:'BTC',v:0.10},{ asset:'BONDS',v:0.20},{ asset:'OIL',v:0.10}],
  1: [{ asset:'SP500',v:0.20},{ asset:'GOLD',v:0.30},{ asset:'BTC',v:0.05},{ asset:'BONDS',v:0.40},{ asset:'OIL',v:0.05}],
  2: [{ asset:'SP500',v:0.50},{ asset:'GOLD',v:0.15},{ asset:'BTC',v:0.25},{ asset:'BONDS',v:0.07},{ asset:'OIL',v:0.03}],
  3: [{ asset:'SP500',v:0.10},{ asset:'GOLD',v:0.40},{ asset:'BTC',v:0.05},{ asset:'BONDS',v:0.40},{ asset:'OIL',v:0.05}],
};

const DEFAULT_ALLOC = [
  { asset:'SP500', v:0.50 }, { asset:'BTC', v:0.25 },
  { asset:'GOLD',  v:0.15 }, { asset:'BONDS', v:0.07 }, { asset:'OIL', v:0.03 }
];

export default function AllocationPanel({ regimeId = 2, riskMetrics }) {
  const alloc = REGIME_ALLOCATIONS[regimeId] || DEFAULT_ALLOC;

  const miniMetrics = riskMetrics ? [
    { label: 'Sharpe',  value: riskMetrics.sharpe?.toFixed(2),        color: '#a5b4fc' },
    { label: 'Max DD',  value: `${(riskMetrics.max_drawdown * 100).toFixed(1)}%`, color: '#f87171' },
    { label: 'CAGR',    value: `+${(riskMetrics.cagr * 100).toFixed(1)}%`,        color: '#34d399' },
    { label: 'Sortino', value: riskMetrics.sortino?.toFixed(2),        color: '#a5b4fc' },
  ] : [];

  return (
    <GlassCard>
      <div className="section-label">Dynamic allocation</div>
      {alloc.map(row => {
        const pct = (row.v || row[5] || 0) * 100;
        const color = ASSET_COLORS[row.asset] || '#6366f1';
        return (
          <div key={row.asset} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize:12, color:'#e2e8f0', fontWeight:500, width:56, flexShrink:0 }}>{row.asset}</span>
            <div style={{ flex:1, height:4, borderRadius:2, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
              <div style={{ width:`${pct}%`, height:'100%', borderRadius:2, background:`linear-gradient(90deg,${color}cc,${color})` }} />
            </div>
            <span style={{ fontSize:11, fontWeight:700, color, width:30, textAlign:'right' }}>{Math.round(pct)}%</span>
          </div>
        );
      })}
      {miniMetrics.length > 0 && (
        <>
          <div className="divider" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            {miniMetrics.map(m => (
              <div key={m.label} className="glass-card" style={{ padding:'10px 12px' }}>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.07em' }}>{m.label}</div>
                <div style={{ fontSize:16, fontWeight:700, color:m.color, marginTop:3, letterSpacing:'-0.03em' }}>{m.value || '—'}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </GlassCard>
  );
}
