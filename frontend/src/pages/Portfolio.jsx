import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import GlassCard from '../components/ui/GlassCard';
import PortfolioSlider from '../components/ui/PortfolioSlider';
import MonteCarloChart from '../components/charts/MonteCarloChart';
import PerformanceChart from '../components/charts/PerformanceChart';
import { usePortfolio } from '../hooks/usePortfolio';
import { fmtPctRaw, fmtNum } from '../utils/formatters';

export default function Portfolio() {
  const { weights, updateWeight, totalWeight, liveMetrics, monteCarlo, runMonteCarlo, simulating } = usePortfolio();

  const totalPct    = Math.round(totalWeight * 100);
  const totalColor  = Math.abs(totalPct - 100) <= 2 ? '#34d399' : '#f87171';
  const assets      = ['SP500','GOLD','BTC','BONDS'];

  return (
    <PageWrapper title="Portfolio Simulator" subtitle="Build and stress-test your own allocation">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>

        {/* Sliders */}
        <GlassCard>
          <div className="section-label">Custom allocation <span className="badge-new">NEW</span></div>
          {assets.map(a => (
            <PortfolioSlider key={a} asset={a} value={weights[a] || 0} onChange={updateWeight} />
          ))}
          <div style={{ fontSize:10, marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:'rgba(255,255,255,0.3)' }}>Portfolio total</span>
            <span style={{ fontWeight:700, color:totalColor }}>{totalPct}%</span>
          </div>
          <button className="btn btn-primary" style={{ width:'100%' }} onClick={runMonteCarlo} disabled={simulating}>
            {simulating ? 'Simulating...' : 'Run Monte Carlo →'}
          </button>
        </GlassCard>

        {/* Live metrics */}
        <GlassCard>
          <div className="section-label">Estimated metrics (current regime)</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
            {[
              { label:'Est. CAGR',    value: `+${fmtPctRaw(liveMetrics.cagr * 100)}`,   color:'#34d399' },
              { label:'Volatility',   value: fmtPctRaw(liveMetrics.volatility * 100),     color:'#f87171' },
              { label:'Sharpe Ratio', value: fmtNum(liveMetrics.sharpe, 2),               color:'#a5b4fc' },
              { label:'Calmar Est.',  value: liveMetrics.volatility > 0 ? fmtNum(liveMetrics.cagr / liveMetrics.volatility, 2) : '—', color:'#a5b4fc' },
            ].map(m => (
              <div key={m.label} className="glass-card" style={{ padding:'12px 14px' }}>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.07em' }}>{m.label}</div>
                <div style={{ fontSize:22, fontWeight:700, color:m.color, marginTop:4, letterSpacing:'-0.04em' }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Allocation bars */}
          <div className="section-label">Allocation breakdown</div>
          {assets.map(a => {
            const pct = Math.round((weights[a] || 0) * 100);
            const colors = { SP500:'#3b82f6', GOLD:'#10b981', BTC:'#f59e0b', BONDS:'rgba(255,255,255,0.35)' };
            return (
              <div key={a} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                <span style={{ fontSize:11, color:'#e2e8f0', fontWeight:500, width:52, flexShrink:0 }}>{a}</span>
                <div style={{ flex:1, height:4, borderRadius:2, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                  <div style={{ width:`${pct}%`, height:'100%', borderRadius:2, background:colors[a] || '#6366f1' }} />
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:colors[a]||'#6366f1', width:30, textAlign:'right' }}>{pct}%</span>
              </div>
            );
          })}
        </GlassCard>
      </div>

      {/* Monte Carlo + Performance */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <MonteCarloChart data={monteCarlo} />
        <PerformanceChart />
      </div>
    </PageWrapper>
  );
}
