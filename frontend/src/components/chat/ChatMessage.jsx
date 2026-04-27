import React from 'react';

export default function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  const isBot  = msg.role === 'assistant';

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: 10,
      marginBottom: 16,
      alignItems: 'flex-start',
    }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14,
        background: isUser
          ? 'linear-gradient(135deg,#6366f1,#3b82f6)'
          : 'linear-gradient(135deg,rgba(16,185,129,0.3),rgba(6,182,212,0.3))',
        border: isUser ? 'none' : '1px solid rgba(16,185,129,0.4)',
      }}>
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '75%' }}>
        <div style={{
          padding: '12px 16px',
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          background: isUser
            ? 'linear-gradient(135deg,rgba(99,102,241,0.35),rgba(59,130,246,0.35))'
            : 'rgba(255,255,255,0.05)',
          border: isUser
            ? '1px solid rgba(99,102,241,0.4)'
            : '1px solid rgba(255,255,255,0.08)',
          fontSize: 13,
          color: '#f1f5f9',
          lineHeight: 1.6,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          whiteSpace: 'pre-wrap',
        }}>
          {msg.content}
        </div>

        {/* Sources */}
        {isBot && msg.sources && msg.sources.length > 0 && (
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {msg.sources.map((src, i) => (
              <span key={i} style={{
                fontSize: 9, padding: '2px 7px', borderRadius: 10,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                color: '#34d399',
              }}>
                📄 {src}
              </span>
            ))}
          </div>
        )}

        {/* Tools used badge */}
        {isBot && msg.tools_used && msg.tools_used.length > 0 && (
          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {msg.tools_used.map((t, i) => (
              <span key={i} style={{
                fontSize: 9, padding: '2px 7px', borderRadius: 10,
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.25)',
                color: '#a5b4fc',
              }}>
                🔧 {t}
              </span>
            ))}
          </div>
        )}

        {/* Mode badge */}
        {isBot && msg.mode && (
          <div style={{ marginTop: 4 }}>
            <span style={{
              fontSize: 8, padding: '1px 6px', borderRadius: 8,
              background: msg.mode === 'agent' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
              border: `1px solid ${msg.mode === 'agent' ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'}`,
              color: msg.mode === 'agent' ? '#fbbf24' : '#60a5fa',
            }}>
              {msg.mode === 'agent' ? '🤖 Agentic AI' : msg.mode === 'rag' ? '📚 RAG' : '⚡ Fallback'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
