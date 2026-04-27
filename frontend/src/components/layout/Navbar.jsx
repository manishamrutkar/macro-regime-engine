import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LiveDot from '../ui/LiveDot';
import Badge from '../ui/Badge';
import CloudStatus from '../ui/CloudStatus';
import { useRegimeContext } from '../../context/RegimeContext';
import { REGIME_COLORS_LIGHT, NAV_ITEMS } from '../../utils/constants';

export default function Navbar() {
  const { regime, loading } = useRegimeContext();
  const location = useLocation();

  const regimeName = regime?.regime_name  || 'Loading...';
  const regimeId   = regime?.regime_id    ?? 2;
  const confidence = regime?.confidence   ? `${Math.round(regime.confidence * 100)}%` : '';
  const badgeVariant = ['amber','blue','green','red'][regimeId] || 'green';

  return (
    <header className="glass-strong" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', height: 'var(--navbar-h)', flexShrink: 0,
      borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none',
      zIndex: 100, position: 'relative',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg,#6366f1,#3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8l4 4 8-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.03em' }}>
            Macro Regime Engine
            <span className="badge-new">v2.0</span>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
            AI · RAG · AgenticAI · Cloud
          </div>
        </div>
      </div>

      {/* Nav tabs */}
      <nav style={{
        display: 'flex', gap: 3,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10, padding: 3,
      }}>
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path === '/' && location.pathname === '/');
          const isChat = item.path === '/chat';
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                padding: '5px 12px', borderRadius: 7,
                fontSize: 11, fontWeight: 500, textDecoration: 'none',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 4,
                background: isActive
                  ? isChat ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.25)'
                  : 'transparent',
                border: isActive
                  ? `1px solid ${isChat ? 'rgba(16,185,129,0.4)' : 'rgba(99,102,241,0.4)'}`
                  : '1px solid transparent',
                color: isActive
                  ? isChat ? '#34d399' : '#c7d2fe'
                  : 'rgba(255,255,255,0.4)',
              }}
            >
              {item.label}
              {isChat && (
                <span style={{
                  fontSize: 7, padding: '1px 4px', borderRadius: 3,
                  background: 'linear-gradient(135deg,#10b981,#06b6d4)',
                  color: '#fff', fontWeight: 700,
                }}>AI</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CloudStatus />
        <Badge variant="green"><LiveDot />Live</Badge>
        {!loading && (
          <Badge variant={badgeVariant}>
            {regimeName}{confidence ? ` · ${confidence}` : ''}
          </Badge>
        )}
        <Badge variant="purple">AI Active</Badge>
      </div>
    </header>
  );
}
