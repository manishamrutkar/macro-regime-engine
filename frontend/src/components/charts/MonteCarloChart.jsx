import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import GlassCard from '../ui/GlassCard';
import { GRID_COLOR, TICK_COLOR } from '../../utils/constants';

Chart.register(...registerables);

export default function MonteCarloChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const paths = data?.percentile_paths;
    const labels = paths?.labels || ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9','Y10'];

    const datasets = [];
    // Sample paths (light background paths)
    if (data?.sample_paths) {
      data.sample_paths.slice(0, 15).forEach(path => {
        datasets.push({ data:path, borderColor:'rgba(99,102,241,0.2)', backgroundColor:'transparent', tension:0.4, pointRadius:0, borderWidth:1 });
      });
    }
    // Percentile bands
    if (paths) {
      datasets.push({ data:paths.p90, borderColor:'rgba(16,185,129,0.5)', backgroundColor:'transparent', tension:0.4, pointRadius:0, borderDash:[3,3], borderWidth:1.5 });
      datasets.push({ data:paths.p50, borderColor:'#6366f1', backgroundColor:'transparent', tension:0.4, pointRadius:0, borderWidth:2.5 });
      datasets.push({ data:paths.p10, borderColor:'rgba(239,68,68,0.5)', backgroundColor:'transparent', tension:0.4, pointRadius:0, borderDash:[3,3], borderWidth:1.5 });
    }

    chartRef.current = new Chart(canvasRef.current, {
      type:'line',
      data:{ labels, datasets },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{legend:{display:false},tooltip:{enabled:false}},
        scales:{
          x:{grid:{color:GRID_COLOR},ticks:{color:TICK_COLOR,font:{size:9}}},
          y:{grid:{color:GRID_COLOR},ticks:{color:TICK_COLOR,font:{size:9}}},
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [data]);

  const s = data || {};
  const stats = [
    { label:'Median 10Y', value:s.median_final ? `+${((s.median_final/100)-1)*100|0}%` : '+187%', color:'#34d399' },
    { label:'10th pct',   value:s.p10_final    ? `+${((s.p10_final/100)-1)*100|0}%`    : '+42%',  color:'#f87171' },
    { label:'90th pct',   value:s.p90_final    ? `+${((s.p90_final/100)-1)*100|0}%`    : '+410%', color:'#34d399' },
    { label:'Prob Profit',value:s.prob_profit   ? `${(s.prob_profit*100).toFixed(0)}%`  : '91%',   color:'#a5b4fc' },
  ];

  return (
    <GlassCard>
      <div className="section-label">Monte Carlo simulation <span className="badge-new">NEW</span></div>
      <div style={{ position:'relative', height:150 }}><canvas ref={canvasRef} /></div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5, marginTop:8 }}>
        {stats.map(s => (
          <div key={s.label} className="glass-card" style={{ padding:'9px 10px' }}>
            <div style={{ fontSize:8, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
            <div style={{ fontSize:14, fontWeight:700, color:s.color, marginTop:3, letterSpacing:'-0.03em' }}>{s.value}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
