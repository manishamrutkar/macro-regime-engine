import React from 'react';
import GlassCard from '../ui/GlassCard';
import { REGIME_COLORS, REGIME_NAMES } from '../../utils/constants';

const MOCK_HISTORY = [
  { regime_id:1, label:'Tight Policy',   months:14 },
  { regime_id:3, label:'Recession',      months:6  },
  { regime_id:2, label:'Liquidity Boom', months:18 },
  { regime_id:0, label:'High Inflation', months:10 },
  { regime_id:1, label:'Tight Policy',   months:8  },
  { regime_id:2, label:'Liquidity Boom', months:6  },
];

export default function RegimeTimeline({ history = MOCK_HISTORY }) {
  const total = history.reduce((a, b) => a + (b.months || 1), 0);
  return (
    <GlassCard>
      <div className="section-label">Regime timeline 2018–2025</div>
      <div style={{ display:'flex', gap:3, height:28, marginBottom:8 }}>
        {history.map((h, i) => {
          const color  = REGIME_COLORS[h.regime_id] || '#888';
          const flexVal = (h.months || 1) / total;
          const isLast  = i === history.length - 1;
          return (
            <div key={i} title={`${h.label} (${h.months}m)`} style={{
              flex: flexVal, borderRadius:4,
              background: `${color}44`,
              border: `1px solid ${color}66`,
              boxShadow: isLast ? `0 0 10px ${color}77` : 'none',
              borderColor: isLast ? color : `${color}66`,
              cursor:'pointer', transition:'all 0.2s',
            }} />
          );
        })}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
        {Object.entries(REGIME_NAMES).map(([id, name]) => (
          <span key={id} style={{ display:'flex', alignItems:'center', gap:3, fontSize:9, color:'rgba(255,255,255,0.35)' }}>
            <span style={{ width:7, height:7, borderRadius:2, background:`${REGIME_COLORS[id]}88`, display:'inline-block' }} />
            {name}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}
