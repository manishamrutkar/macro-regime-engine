import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import GlassCard from '../components/ui/GlassCard';
import ForecastPanel from '../components/panels/ForecastPanel';
import TransitionMatrix from '../components/charts/TransitionMatrix';
import RegimeTimeline from '../components/charts/RegimeTimeline';
import { useForecast } from '../hooks/useForecast';
import { useRegime } from '../hooks/useRegime';
import { REGIME_COLORS_LIGHT, REGIME_NAMES } from '../utils/constants';

export default function Forecast() {
  const { forecast, loading } = useForecast();
  const { current, history, transition } = useRegime();

  return (
    <PageWrapper title="AI Forecast" subtitle="Next-month regime prediction using Random Forest on macro signals">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
        <ForecastPanel forecast={forecast} />

        {/* Next regime detail */}
        <GlassCard>
          <div className="section-label">Forecast interpretation</div>
          {forecast ? (
            <>
              <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)', marginBottom:14 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#c7d2fe', marginBottom:4 }}>
                  Most likely: {forecast.predicted_regime_name}
                </div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.6 }}>
                  The model has analysed {Object.keys(forecast.probabilities || {}).length} macro signals
                  and lagged regime history to forecast the next month's regime with
                  {' '}{Math.round((forecast.probabilities?.[forecast.predicted_regime_name] || 0) * 100)}% probability.
                </div>
              </div>
              {Object.entries(forecast.probabilities || {}).map(([name, prob], i) => {
                const color = REGIME_COLORS_LIGHT[i] || '#34d399';
                const pct   = Math.round(prob * 100);
                return (
                  <div key={name} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <span style={{ fontSize:11, color:'#e2e8f0', width:110, flexShrink:0 }}>{name}</span>
                    <div style={{ flex:1, height:6, borderRadius:3, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', borderRadius:3, background:`linear-gradient(90deg,${color}88,${color})` }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color, width:34, textAlign:'right' }}>{pct}%</span>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="skeleton" style={{ height:160 }} />
          )}
        </GlassCard>
      </div>

      {/* Transition Matrix + Timeline */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <TransitionMatrix matrix={transition ? Object.values(transition).map(r => Object.values(r)) : undefined} />
        <RegimeTimeline history={history?.slice(-18).map(h => ({ regime_id: h.regime_id, label: h.label, months: 1 }))} />
      </div>
    </PageWrapper>
  );
}
