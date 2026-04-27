import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import GlassCard from '../ui/GlassCard';
import { GRID_COLOR, TICK_COLOR } from '../../utils/constants';

Chart.register(...registerables);

export default function YieldCurveChart({ yieldData }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const labels  = ['1M','3M','6M','1Y','2Y','5Y','10Y','30Y'];
  const current = yieldData?.latest_yields
    ? ['1M','3M','6M','1Y','2Y','5Y','10Y','30Y'].map((k, i) => yieldData.latest_yields[k] ?? [5.1,5.3,5.4,5.2,4.9,4.5,4.5,4.7][i])
    : [5.1,5.3,5.4,5.2,4.9,4.5,4.5,4.7];
  const normal  = [3.2,3.4,3.6,3.8,4.0,4.3,4.5,4.6];

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { data:current, borderColor:'#6366f1', backgroundColor:'rgba(99,102,241,0.08)', tension:0.4, pointRadius:2, fill:true, borderWidth:2 },
          { data:normal,  borderColor:'rgba(16,185,129,0.4)', backgroundColor:'transparent', tension:0.4, pointRadius:0, borderDash:[4,4], borderWidth:1.2 },
        ],
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{legend:{display:false}, tooltip:{backgroundColor:'rgba(6,10,20,0.95)',borderColor:'rgba(255,255,255,0.1)',borderWidth:1,titleColor:'rgba(255,255,255,0.7)',bodyColor:'rgba(255,255,255,0.5)',padding:8}},
        scales:{
          x:{display:false},
          y:{grid:{color:GRID_COLOR},ticks:{color:TICK_COLOR,font:{size:9},callback:v=>v.toFixed(1)+'%'}},
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [yieldData]);

  const inverted = yieldData?.inverted_2y10y ?? true;
  const spread   = yieldData?.spreads?.['2Y_10Y'] ?? -0.42;

  return (
    <GlassCard>
      <div className="section-label">Bond yield curve <span className="badge-new">NEW</span></div>
      <div style={{ position:'relative', height:110 }}><canvas ref={canvasRef} /></div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:8, color:'rgba(255,255,255,0.25)', marginTop:2 }}>
        {labels.map(l => <span key={l}>{l}</span>)}
      </div>
      <div style={{ marginTop:8, padding:'7px 10px', borderRadius:8, background:inverted?'rgba(239,68,68,0.08)':'rgba(16,185,129,0.08)', border:`1px solid ${inverted?'rgba(239,68,68,0.2)':'rgba(16,185,129,0.2)'}` }}>
        <div style={{ fontSize:10, fontWeight:600, color:inverted?'#f87171':'#34d399' }}>
          {inverted ? '⚠ Yield curve inverted' : '✓ Normal yield curve'}
        </div>
        <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:1 }}>
          2Y–10Y spread: {(spread*100).toFixed(0)}bps · {inverted?'Recession signal active':'No inversion signal'}
        </div>
      </div>
    </GlassCard>
  );
}
