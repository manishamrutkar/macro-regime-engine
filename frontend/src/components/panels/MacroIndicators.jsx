import React from 'react';
import MetricCard from '../ui/MetricCard';

const DEFAULT_INDICATORS = [
  { label:'Inflation YoY', value:'3.4%',  change:-0.001, changeLabel:'easing',     barWidth:34, barColor:'linear-gradient(90deg,#f59e0b,#fbbf24)' },
  { label:'Real Rate',     value:'1.8%',  change: 0.002, changeLabel:'restrictive', barWidth:55, barColor:'linear-gradient(90deg,#6366f1,#818cf8)' },
  { label:'M2 Growth',     value:'+4.2%', change: 0.003, changeLabel:'expanding',   barWidth:62, barColor:'linear-gradient(90deg,#10b981,#34d399)' },
  { label:'Fed Rate',      value:'5.25%', change: 0,     changeLabel:'hold',        barWidth:80, barColor:'linear-gradient(90deg,#3b82f6,#60a5fa)' },
  { label:'Fear & Greed',  value:'62',    change: 0.001, changeLabel:'Greed zone',  barWidth:62, barColor:'linear-gradient(90deg,#f59e0b,#fbbf24)', badge:'NEW' },
];

export default function MacroIndicators({ data = DEFAULT_INDICATORS }) {
  return (
    <div className="grid-5" style={{ marginBottom: 12 }}>
      {data.map(d => <MetricCard key={d.label} {...d} />)}
    </div>
  );
}
