import React from 'react';
import GlassCard from '../ui/GlassCard';
import ZScoreBar from '../ui/ZScoreBar';
import { REGIME_COLORS_LIGHT } from '../../utils/constants';

const REGIME_ICONS = ['🔥','🏦','⚡','📉'];

export default function RegimePanel({ regime, history = [] }) {
  if (!regime) return <GlassCard><div className="skeleton" style={{ height: 200 }} /></GlassCard>;

  const { regime_id, regime_name, confidence, probabilities } = regime;
  const color = REGIME_COLORS_LIGHT[regime_id] || '#34d399';

  const zScores = [
    { label: 'Inflation Z', value: 0.4,  color: '#fbbf24' },
    { label: 'Real Rate Z', value: 0.8,  color: '#60a5fa' },
    { label: 'Liquidity Z', value: 1.3,  color: '#34d399' },
  ];

  const tlColors = { 0: 'rgba(245,158,11,0.3)', 1: 'rgba(59,130,246,0.3)', 2: 'rgba(16,185,129,0.3)', 3: 'rgba(239,68,68,0.28)' };
  const tlBorders = { 0: 'rgba(245,158,11,0.4)', 1: 'rgba(59,130,246,0.4)', 2: 'rgba(16,185,129,0.4)', 3: 'rgba(239,68,68,0.4)' };

  const timelineData = history.length > 0
    ? history.slice(-12).map(h => ({ id: h.regime_id, label: h.label?.slice(0,3) }))
    : [{ id: 1 }, { id: 3 }, { id: 2 }, { id: 0 }, { id: 1 }, { id: 2 }];

  return (
    <GlassCard>
      <div className="section-label">Current regime</div>

      {/* Hero */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 13, flexShrink: 0,
          background: 'linear-gradient(135deg,rgba(99,102,241,.3),rgba(59,130,246,.25))',
          border: '1px solid rgba(99,102,241,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>
          {REGIME_ICONS[regime_id] || '⚡'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.03em' }}>{regime_name}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>
            Cluster {regime_id} · K-Means · {confidence ? `${Math.round(confidence * 100)}% confidence` : ''}
          </div>
          <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,.07)', marginTop: 6, overflow: 'hidden' }}>
            <div style={{ width: `${Math.round((confidence || 0.84) * 100)}%`, height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#6366f1,#3b82f6)' }} />
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Z-Scores */}
      <div className="section-label">Z-score signals</div>
      {zScores.map(z => <ZScoreBar key={z.label} {...z} />)}

      {/* Timeline */}
      {timelineData.length > 0 && (
        <>
          <div className="divider" />
          <div className="section-label">Regime history</div>
          <div style={{ display: 'flex', gap: 3, height: 22 }}>
            {timelineData.map((t, i) => (
              <div key={i} style={{
                flex: 1, borderRadius: 4,
                background: tlColors[t.id] || 'rgba(255,255,255,0.1)',
                border: `1px solid ${tlBorders[t.id] || 'rgba(255,255,255,0.2)'}`,
                boxShadow: i === timelineData.length - 1 ? `0 0 10px ${color}50` : 'none',
                borderColor: i === timelineData.length - 1 ? color : tlBorders[t.id],
              }} />
            ))}
          </div>
        </>
      )}
    </GlassCard>
  );
}
