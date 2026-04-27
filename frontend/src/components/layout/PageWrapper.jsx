import React from 'react';

export default function PageWrapper({ title, subtitle, actions, children }) {
  return (
    <div className="fade-in">
      {(title || actions) && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            {title    && <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.03em' }}>{title}</h1>}
            {subtitle && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{subtitle}</p>}
          </div>
          {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
