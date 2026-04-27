import React, { useState, useEffect } from 'react';

/**
 * Shows cloud deployment status in the navbar.
 * Pings /health endpoint and shows environment info.
 */
export default function CloudStatus() {
  const [status,  setStatus]  = useState('checking');
  const [env,     setEnv]     = useState('');
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    const check = async () => {
      const start = Date.now();
      try {
        const base = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
        const res  = await fetch(`${base}/health`, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        setStatus(data.status === 'ok' ? 'online' : 'degraded');
        setEnv(data.environment || '');
        setLatency(Date.now() - start);
      } catch {
        setStatus('offline');
        setLatency(null);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const colors = {
    checking: 'rgba(255,255,255,0.3)',
    online:   '#34d399',
    degraded: '#fbbf24',
    offline:  '#f87171',
  };

  const labels = {
    checking: 'Connecting...',
    online:   `Online${latency ? ` · ${latency}ms` : ''}`,
    degraded: 'Degraded',
    offline:  'Offline',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      fontSize: 10,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: colors[status],
        animation: status === 'online' ? 'pulse 2s infinite' : 'none',
        flexShrink: 0,
      }} />
      <span style={{ color: colors[status], fontWeight: 500 }}>
        {labels[status]}
      </span>
      {env && (
        <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 2 }}>
          · {env}
        </span>
      )}
    </div>
  );
}
