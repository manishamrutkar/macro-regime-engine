import React from 'react';
import GlassCard from '../ui/GlassCard';

const ASSETS = ['Gold','BTC','S&P'];
const DEFAULT = [[1.00,0.62,0.31],[0.62,1.00,0.74],[0.31,0.74,1.00]];

function cellBg(v) {
  const a = 0.1 + Math.abs(v) * 0.3;
  return `rgba(16,185,129,${a.toFixed(2)})`;
}

export default function CorrelationHeatmap({ matrix = DEFAULT }) {
  return (
    <GlassCard>
      <div className="section-label">Correlation heatmap</div>
      <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:4, marginTop:6 }}>
        <thead>
          <tr>
            <th style={{ width:42 }} />
            {ASSETS.map(a => <th key={a} style={{ fontSize:9, color:'rgba(255,255,255,0.28)', fontWeight:400, textAlign:'center', paddingBottom:3 }}>{a}</th>)}
          </tr>
        </thead>
        <tbody>
          {ASSETS.map((rowAsset, i) => (
            <tr key={rowAsset}>
              <td style={{ fontSize:9, color:'rgba(255,255,255,0.28)', paddingRight:4 }}>{rowAsset}</td>
              {matrix[i].map((val, j) => (
                <td key={j} style={{ height:38, borderRadius:6, background:cellBg(val), textAlign:'center', fontSize:12, fontWeight:700, color:'#6ee7b7' }}>
                  {val.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}
