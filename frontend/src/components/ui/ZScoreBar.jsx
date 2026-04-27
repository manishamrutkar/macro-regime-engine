import React from 'react';

export default function ZScoreBar({ label, value, color }) {
  // Z-scores typically range -3 to +3; map to 0-100%
  const pct = Math.min(Math.max(((value + 3) / 6) * 100, 0), 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', width: 72, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: color }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color, width: 32, textAlign: 'right' }}>
        {value >= 0 ? '+' : ''}{Number(value).toFixed(1)}
      </span>
    </div>
  );
}
