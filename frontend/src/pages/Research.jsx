import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import GlassCard from '../components/ui/GlassCard';

const SECTIONS = [
  {
    title: '1. Problem Statement',
    content: `Traditional portfolio strategies fail to adapt to the macro cycle. This project builds a data-driven system that detects the current macro regime and dynamically adjusts asset allocation based on empirical regime-specific risk/return profiles.`,
  },
  {
    title: '2. Economic Thesis',
    content: `Macro regimes are defined by three orthogonal forces: inflation level, monetary policy tightness (real rates), and liquidity expansion (M2). Each combination creates a distinct environment where different asset classes outperform. Gold thrives in high inflation; equities in liquidity booms; bonds in recessions.`,
  },
  {
    title: '3. Methodology',
    content: `Z-score normalization is applied to [inflation_yoy, real_rate, liquidity_yoy] to remove scale bias. K-Means clustering (k=4) on these normalized features groups months into four regimes. Cluster labels are interpreted by centroid values. A Markov transition matrix captures regime persistence.`,
  },
  {
    title: '4. Why K-Means?',
    content: `K-Means is interpretable, fast, and appropriate for hard cluster assignments. Unlike GMMs, it doesn't assume Gaussian distributions. The choice of k=4 is driven by economic theory (the four macro quadrants). Silhouette scoring is used to validate the separation quality.`,
  },
  {
    title: '5. Look-Ahead Bias Prevention',
    content: `The backtest is designed with a strict one-month lag: regime detected at month T is applied to portfolio weights at month T+1. This ensures the strategy only uses information available at the time of the trade. Walk-forward validation is used for the forecast model.`,
  },
  {
    title: '6. Risk Metrics',
    content: `Per-regime metrics include: Sharpe Ratio (excess return per unit of total risk), Sortino Ratio (excess return per unit of downside risk), Maximum Drawdown, Calmar Ratio, and Recovery Time. VaR and CVaR are computed using both historical simulation and parametric (normal) methods.`,
  },
  {
    title: '7. Monte Carlo Simulation',
    content: `Bootstrap resampling of historical monthly returns generates 1,000 portfolio paths over 10 years. This avoids distributional assumptions. The output is a percentile fan chart showing P10, P25, P50, P75, P90 confidence bands and the probability of profit.`,
  },
  {
    title: '8. Limitations & Biases',
    content: `Survivorship bias: only currently active assets are included. Data frequency mismatch: FRED data is monthly while crypto trades 24/7. Overfitting: K-Means with k=4 is chosen on economic priors, not data snooping. Regime label instability: K-Means cluster IDs can flip on re-run; we handle this with a deterministic centroid interpretation.`,
  },
  {
    title: '9. Future Work',
    content: `Hidden Markov Models for soft regime assignments. Incorporating alternative data (credit spreads, VIX, PMI). LSTM for sequence-aware regime forecasting. Real-time dashboard with WebSocket updates. Options strategy overlay per regime.`,
  },
];

export default function Research() {
  const [open, setOpen] = useState(0);

  return (
    <PageWrapper title="Research Report" subtitle="Methodology, bias analysis and future work">
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {SECTIONS.map((sec, i) => (
          <GlassCard key={i} padding="0" style={{ cursor:'pointer' }} onClick={() => setOpen(open === i ? -1 : i)}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px' }}>
              <span style={{ fontSize:13, fontWeight:600, color: open===i ? '#c7d2fe' : '#f1f5f9' }}>{sec.title}</span>
              <span style={{ fontSize:16, color:'rgba(255,255,255,0.4)', transform: open===i ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>›</span>
            </div>
            {open === i && (
              <div style={{ padding:'0 18px 16px', fontSize:12, color:'rgba(255,255,255,0.55)', lineHeight:1.8, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ height:12 }} />
                {sec.content}
              </div>
            )}
          </GlassCard>
        ))}
      </div>

      {/* Interview prep */}
      <GlassCard style={{ marginTop:14 }}>
        <div className="section-label">Interview Prep — Key Questions</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            ['Why K-Means?', 'Interpretable hard clusters, k=4 from economic theory, validated by silhouette score'],
            ['Why Z-score?', 'Removes scale differences between CPI (%), real rates (%), and M2 (trillions)'],
            ['Why real rates affect gold?', 'Gold has no yield; when real rates rise, opportunity cost of holding gold rises → gold falls'],
            ['What is look-ahead bias?', 'Using future data to make past decisions. Prevented by 1-month lag on regime signals'],
            ['Why log returns?', 'Log returns are time-additive and approximately normally distributed; arithmetic returns compound incorrectly'],
            ['What is Sharpe Ratio?', '(Portfolio Return - Risk Free Rate) / Portfolio Std Dev × √12. Measures risk-adjusted return'],
          ].map(([q, a]) => (
            <div key={q} className="glass-card" style={{ padding:'12px 14px' }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#c7d2fe', marginBottom:6 }}>Q: {q}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>A: {a}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </PageWrapper>
  );
}
