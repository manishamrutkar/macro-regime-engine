export const REGIME_NAMES = {
  0: 'High Inflation',
  1: 'Tight Policy',
  2: 'Liquidity Boom',
  3: 'Recession',
};

export const REGIME_COLORS = {
  0: '#f59e0b',
  1: '#3b82f6',
  2: '#10b981',
  3: '#ef4444',
};

export const REGIME_COLORS_LIGHT = {
  0: '#fbbf24',
  1: '#60a5fa',
  2: '#34d399',
  3: '#f87171',
};

export const REGIME_BG = {
  0: 'rgba(245,158,11,0.15)',
  1: 'rgba(59,130,246,0.15)',
  2: 'rgba(16,185,129,0.15)',
  3: 'rgba(239,68,68,0.15)',
};

export const ASSET_COLORS = {
  SP500:  '#3b82f6',
  GOLD:   '#10b981',
  BTC:    '#f59e0b',
  ETH:    '#8b5cf6',
  SOL:    '#06b6d4',
  BNB:    '#f97316',
  BONDS:  'rgba(255,255,255,0.35)',
  OIL:    '#f97316',
  SILVER: '#94a3b8',
};

export const CHART_COLORS = {
  strategy: '#6366f1',
  bm_6040:  'rgba(255,255,255,0.3)',
  bm_gold:  '#10b981',
  bm_sp500: '#f59e0b',
};

export const GRID_COLOR  = 'rgba(255,255,255,0.04)';
export const TICK_COLOR  = 'rgba(255,255,255,0.28)';
export const TOOLTIP_BG  = 'rgba(6,10,20,0.95)';

export const REFRESH_INTERVAL_MS = 30000;

export const NAV_ITEMS = [
  { path: '/',          label: 'Dashboard',  icon: 'grid'     },
  { path: '/chat',      label: 'AI Chat',    icon: 'chat'     },
  { path: '/portfolio', label: 'Portfolio',  icon: 'pie'      },
  { path: '/forecast',  label: 'Forecast',   icon: 'trending' },
  { path: '/research',  label: 'Research',   icon: 'book'     },
  { path: '/settings',  label: 'Settings',   icon: 'settings' },
];
