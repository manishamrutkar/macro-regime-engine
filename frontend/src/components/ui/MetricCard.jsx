import React from 'react';
import { fmtArrow } from '../../utils/formatters';

/**
 * KPI metric card with label, value, change, and mini bar.
 */
export default function MetricCard({ label, value, change, changeLabel, barWidth, barColor, badge }) {
  const isUp = change >= 0;
  return (
    <div className="glass" style={{ padding: '14px 16px' }}>
      <div className="section-label" style={{ marginBottom: 6 }}>
        {label}
        {badge && <span className="badge-new" style={{ marginLeft: 5 }}>{badge}</span>}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.04em', lineHeight: 1 }}>
        {value}
      </div>
      {(changeLabel || change != null) && (
        <div style={{ fontSize: 10, marginTop: 4, color: isUp ? '#34d399' : '#f87171' }}>
          {change != null ? fmtArrow(change) : ''} {changeLabel || ''}
        </div>
      )}
      {barWidth != null && (
        <div style={{ height: 2, borderRadius: 1, marginTop: 8, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(barWidth, 100)}%`, height: '100%', borderRadius: 1, background: barColor || 'rgba(255,255,255,0.3)' }} />
        </div>
      )}
    </div>
  );
}
