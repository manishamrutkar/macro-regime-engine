import React from 'react';

const QUESTIONS = [
  { text: 'What is the current macro regime?',           icon: '📊' },
  { text: 'Should I buy gold right now?',                icon: '🥇' },
  { text: 'Compare Bitcoin vs S&P 500 risk metrics',     icon: '⚖️' },
  { text: 'What does the inverted yield curve mean?',    icon: '📈' },
  { text: 'Analyze my portfolio allocation',             icon: '💼' },
  { text: 'What is the recession probability?',          icon: '⚠️' },
  { text: 'Explain the Sharpe ratio in simple terms',    icon: '📚' },
  { text: 'What assets perform best in high inflation?', icon: '🔥' },
];

export default function SuggestedQuestions({ onSelect }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, textAlign: 'center' }}>
        Suggested questions
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q.text)}
            style={{
              padding: '9px 12px',
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, cursor: 'pointer',
              fontSize: 11, color: 'rgba(255,255,255,0.6)',
              textAlign: 'left', display: 'flex', alignItems: 'center', gap: 7,
              transition: 'all 0.2s', fontFamily: 'var(--font)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = '#c7d2fe'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            <span style={{ fontSize: 14 }}>{q.icon}</span>
            {q.text}
          </button>
        ))}
      </div>
    </div>
  );
}
