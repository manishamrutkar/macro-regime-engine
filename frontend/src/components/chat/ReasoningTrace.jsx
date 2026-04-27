import React, { useState } from 'react';

export default function ReasoningTrace({ trace = [] }) {
  const [open, setOpen] = useState(false);
  if (!trace || trace.length === 0) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 10, color: 'rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', gap: 4, padding: 0,
        }}
      >
        <span style={{ transform: open ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: '0.2s' }}>›</span>
        View agent reasoning ({trace.length} steps)
      </button>

      {open && (
        <div style={{
          marginTop: 8, padding: '10px 12px',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10, fontSize: 11,
        }}>
          {trace.map((step, i) => (
            <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: i < trace.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{
                  fontSize: 9, padding: '1px 6px', borderRadius: 8, fontWeight: 600,
                  background: step.type === 'thought' ? 'rgba(99,102,241,0.2)' : step.type === 'action' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                  color: step.type === 'thought' ? '#a5b4fc' : step.type === 'action' ? '#fbbf24' : '#34d399',
                }}>
                  {step.type === 'thought' ? '💭 THINK' : step.type === 'action' ? `🔧 ${step.tool || 'ACTION'}` : '✅ ANSWER'}
                </span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>Step {step.step}</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                {step.content || step.result || ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
