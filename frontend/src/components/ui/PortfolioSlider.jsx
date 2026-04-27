import React from 'react';
import { ASSET_COLORS } from '../../utils/constants';

export default function PortfolioSlider({ asset, value, onChange }) {
  const color = ASSET_COLORS[asset] || '#6366f1';
  const pct   = Math.round(value * 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', width: 58, flexShrink: 0 }}>{asset}</span>
      <input
        type="range"
        min={0} max={100} step={1}
        value={pct}
        onChange={e => onChange(asset, e.target.value / 100)}
        style={{ flex: 1, accentColor: color, cursor: 'pointer' }}
      />
      <span style={{ fontSize: 11, fontWeight: 700, color, width: 32, textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  );
}
