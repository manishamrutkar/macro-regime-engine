import React from 'react';
import GlassCard from '../ui/GlassCard';
import { REGIME_NAMES } from '../../utils/constants';

const DEFAULT = [
  [0.60,0.20,0.10,0.10],
  [0.15,0.55,0.20,0.10],
  [0.10,0.15,0.65,0.10],
  [0.20,0.25,0.15,0.40],
];

function cellBg(v) {
  const a = v * 0.6;
  return `rgba(99,102,241,${a.toFixed(2)})`;
}

export default function TransitionMatrix({ matrix = DEFAULT }) {
  const labels = Object.values(REGIME_NAMES).map(n => n.split(' ')[0]);

  return (
    <GlassCard>
      <div className="section-label">Transition matrix P(Ri→Rj)</div>
      <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:3, marginTop:6 }}>
        <thead>
          <tr>
            <th style={{ width:32 }} />
            {labels.map((l,i) => <th key={i} style={{ fontSize:9, color:'rgba(255,255,255,0.28)', fontWeight:400, textAlign:'center', paddingBottom:3 }}>R{i}</th>)}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td style={{ fontSize:9, color:'rgba(255,255,255,0.28)', textAlign:'right', paddingRight:4 }}>R{i}</td>
              {row.map((val, j) => (
                <td key={j} style={{ height:32, borderRadius:5, background:cellBg(val), textAlign:'center', fontSize:11, fontWeight:700, color: val > 0.4 ? '#c7d2fe' : '#818cf8' }}>
                  {val.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop:6, fontSize:9, color:'rgba(255,255,255,0.22)' }}>
        R0 High Infl · R1 Tight · R2 Liq Boom · R3 Recession
      </div>
    </GlassCard>
  );
}
