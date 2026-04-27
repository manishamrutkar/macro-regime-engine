import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import GlassCard from '../ui/GlassCard';
import { CHART_COLORS, GRID_COLOR, TICK_COLOR } from '../../utils/constants';

Chart.register(...registerables);

const MOCK_DATA = {
  labels: ['2018','2019','2020','2021','2022','2023','2024','2025'],
  strategy: [100,118,108,152,161,189,224,261],
  bm_6040:  [100,110,104,128,119,138,152,168],
  bm_gold:  [100,115,139,148,160,170,195,208],
  bm_sp500: [100,130,122,168,148,175,210,238],
};

export default function PerformanceChart({ data = MOCK_DATA }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const tt = {
      backgroundColor: 'rgba(6,10,20,0.95)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: 'rgba(255,255,255,0.7)',
      bodyColor: 'rgba(255,255,255,0.5)',
      padding: 10,
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          { label:'Strategy', data:data.strategy, borderColor:'#6366f1', backgroundColor:'rgba(99,102,241,0.07)', tension:0.4, pointRadius:3, fill:true, borderWidth:2 },
          { label:'60/40',    data:data.bm_6040,  borderColor:'rgba(255,255,255,0.3)', backgroundColor:'transparent', tension:0.4, pointRadius:0, borderDash:[5,4], borderWidth:1.5 },
          { label:'Gold',     data:data.bm_gold,  borderColor:'#10b981', backgroundColor:'transparent', tension:0.4, pointRadius:0, borderDash:[3,3], borderWidth:1.5 },
          { label:'S&P',      data:data.bm_sp500, borderColor:'#f59e0b', backgroundColor:'transparent', tension:0.4, pointRadius:0, borderDash:[7,3], borderWidth:1.5 },
        ],
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:tt },
        scales:{
          x:{ grid:{color:GRID_COLOR}, ticks:{color:TICK_COLOR,font:{size:10}} },
          y:{ grid:{color:GRID_COLOR}, ticks:{color:TICK_COLOR,font:{size:10}} },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [data]);

  const legends = [
    { label:'Strategy', color:'#6366f1' },
    { label:'60/40',    color:'rgba(255,255,255,0.3)' },
    { label:'Gold',     color:'#10b981' },
    { label:'S&P',      color:'#f59e0b' },
  ];

  return (
    <GlassCard>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div className="section-label" style={{ margin:0 }}>Strategy vs benchmarks</div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {legends.map(l => (
            <span key={l.label} style={{ display:'flex', alignItems:'center', gap:3, fontSize:10, color:'rgba(255,255,255,0.4)' }}>
              <span style={{ width:10, height:2, background:l.color, borderRadius:1, display:'inline-block' }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
      <div style={{ position:'relative', height:180 }}>
        <canvas ref={canvasRef} />
      </div>
    </GlassCard>
  );
}
