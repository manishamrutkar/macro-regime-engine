import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../utils/constants';
import { useRegimeContext } from '../../context/RegimeContext';
import { REGIME_COLORS_LIGHT } from '../../utils/constants';

const ICONS = {
  grid:     <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
  chat:     <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M14 10a2 2 0 01-2 2H5l-3 3V4a2 2 0 012-2h8a2 2 0 012 2v6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  pie:      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1v7l5.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/></svg>,
  trending: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1 11l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 4h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  book:     <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 2h8a1 1 0 011 1v10a1 1 0 01-1 1H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M3 2a2 2 0 000 4M3 6a2 2 0 000 4M3 10a2 2 0 000 4" stroke="currentColor" strokeWidth="1.5"/></svg>,
  settings: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
};

export default function Sidebar() {
  const { regime } = useRegimeContext();
  const regimeId   = regime?.regime_id ?? 2;
  const regimeColor = REGIME_COLORS_LIGHT[regimeId] || '#34d399';

  return (
    <aside style={{
      width: 'var(--sidebar-w)', flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4,
      background: 'rgba(0,0,0,0.15)', overflowY: 'auto',
    }}>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: 8, paddingLeft: 8 }}>
        Navigation
      </div>

      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '9px 10px', borderRadius: 9,
            fontSize: 12, fontWeight: 500, textDecoration: 'none',
            transition: 'all 0.18s',
            background: isActive ? (item.path === '/chat' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)') : 'transparent',
            color: isActive ? (item.path === '/chat' ? '#34d399' : '#c7d2fe') : 'rgba(255,255,255,0.45)',
            border: isActive ? `1px solid ${item.path === '/chat' ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}` : '1px solid transparent',
          })}
        >
          <span style={{ flexShrink: 0 }}>{ICONS[item.icon]}</span>
          {item.label}
          {item.path === '/chat' && (
            <span style={{ marginLeft: 'auto', fontSize: 8, padding: '1px 5px', borderRadius: 4, background: 'linear-gradient(135deg,#10b981,#06b6d4)', color: '#fff', fontWeight: 700 }}>AI</span>
          )}
        </NavLink>
      ))}

      {/* Regime status widget */}
      {regime && (
        <div style={{ marginTop: 'auto', padding: '14px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.28)', marginBottom: 8 }}>
            Current Regime
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: regimeColor, marginBottom: 4 }}>
            {regime.regime_name}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
            {regime.confidence ? `${Math.round(regime.confidence * 100)}% confidence` : ''}
          </div>
          <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.07)', marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${Math.round((regime.confidence || 0.8) * 100)}%`, height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#6366f1,#3b82f6)' }} />
          </div>
        </div>
      )}
    </aside>
  );
}
