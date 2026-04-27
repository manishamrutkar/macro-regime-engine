import React, { useState, useRef, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import ChatMessage from '../components/chat/ChatMessage';
import ReasoningTrace from '../components/chat/ReasoningTrace';
import SuggestedQuestions from '../components/chat/SuggestedQuestions';
import GlassCard from '../components/ui/GlassCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const MODES = [
  { value: 'auto',   label: 'Auto',   icon: '⚡', desc: 'Smart routing' },
  { value: 'rag',    label: 'RAG',    icon: '📚', desc: 'Knowledge base' },
  { value: 'agent',  label: 'Agent',  icon: '🤖', desc: 'Agentic AI' },
];

export default function Chat() {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [mode,      setMode]      = useState('auto');
  const [showTrace, setShowTrace] = useState(null);
  const [docText,   setDocText]   = useState('');
  const [docTitle,  setDocTitle]  = useState('');
  const [uploadMsg, setUploadMsg] = useState('');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text.trim(), mode, history: messages.slice(-6) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role:       'assistant',
        content:    data.content || data.answer || 'No response generated.',
        sources:    data.sources    || [],
        tools_used: data.tools_used || [],
        trace:      data.trace      || [],
        mode:       data.mode       || mode,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: 'Currently in offline mode. Based on macro analysis: We are in a Liquidity Boom regime. S&P 500 (50%) and Bitcoin (25%) are the recommended overweights. Real rates remain accommodative and M2 growth is expanding.',
        sources: ['Offline fallback'],
        mode:    'fallback',
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleUpload = async () => {
    if (!docText.trim() || !docTitle.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/ai/upload-doc`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text: docText, title: docTitle }),
      });
      const data = await res.json();
      setUploadMsg(`✅ Added "${docTitle}" (${data.chunks_added} chunks) to knowledge base`);
      setDocText(''); setDocTitle('');
      setTimeout(() => setUploadMsg(''), 4000);
    } catch {
      setUploadMsg('❌ Upload failed. Check backend connection.');
      setTimeout(() => setUploadMsg(''), 3000);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <PageWrapper
      title="AI Financial Assistant"
      subtitle="RAG-powered Q&A + Agentic AI for macro analysis"
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          {messages.length > 0 && (
            <button className="btn" onClick={clearChat}>Clear chat</button>
          )}
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14, height: 'calc(100vh - 160px)' }}>

        {/* ── Main Chat Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Mode selector */}
          <div style={{ display: 'flex', gap: 6 }}>
            {MODES.map(m => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                style={{
                  padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
                  fontSize: 11, fontWeight: 500, fontFamily: 'var(--font)',
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: mode === m.value ? 'linear-gradient(135deg,rgba(99,102,241,0.35),rgba(59,130,246,0.35))' : 'rgba(255,255,255,0.04)',
                  border: mode === m.value ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  color: mode === m.value ? '#c7d2fe' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                <span>{m.icon}</span> {m.label}
                <span style={{ fontSize: 9, color: mode === m.value ? '#a5b4fc' : 'rgba(255,255,255,0.25)' }}>({m.desc})</span>
              </button>
            ))}
            <div style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center' }}>
              {mode === 'agent' ? '🤖 Multi-step reasoning active' : mode === 'rag' ? '📚 Knowledge base search active' : '⚡ Auto mode'}
            </div>
          </div>

          {/* Messages area */}
          <GlassCard style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {messages.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                {/* Welcome */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
                    background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(16,185,129,0.3))',
                    border: '1px solid rgba(99,102,241,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                  }}>🤖</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.03em', marginBottom: 6 }}>
                    Macro AI Assistant
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', maxWidth: 400, lineHeight: 1.6 }}>
                    Ask me anything about macro regimes, asset allocation, risk metrics, or financial concepts.
                    I use RAG + Agentic AI to give you data-driven answers.
                  </div>
                </div>
                <SuggestedQuestions onSelect={q => sendMessage(q)} />
              </div>
            ) : (
              <div>
                {messages.map((msg, i) => (
                  <div key={i}>
                    <ChatMessage msg={msg} />
                    {msg.trace && msg.trace.length > 0 && (
                      <div style={{ marginLeft: 42, marginTop: -8, marginBottom: 12 }}>
                        <ReasoningTrace trace={msg.trace} />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(16,185,129,0.3),rgba(6,182,212,0.3))', border: '1px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                    <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {[0,1,2].map(i => (
                          <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />
                        ))}
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>
                          {mode === 'agent' ? 'Agent is reasoning...' : 'Searching knowledge base...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </GlassCard>

          {/* Input area */}
          <GlassCard padding="12px 16px">
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask about macro regimes, asset allocation, risk metrics... (Enter to send, Shift+Enter for new line)"
                rows={2}
                style={{
                  flex: 1, padding: '10px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, color: '#f1f5f9',
                  fontSize: 13, fontFamily: 'var(--font)',
                  resize: 'none', outline: 'none', lineHeight: 1.5,
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{
                  padding: '10px 20px', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading || !input.trim()
                    ? 'rgba(255,255,255,0.04)'
                    : 'linear-gradient(135deg,rgba(99,102,241,0.5),rgba(59,130,246,0.5))',
                  border: '1px solid rgba(99,102,241,0.4)',
                  color: '#c7d2fe', fontSize: 13, fontWeight: 600,
                  fontFamily: 'var(--font)', transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {loading ? '...' : 'Send →'}
              </button>
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>
              Enter to send · Shift+Enter for new line · Powered by RAG + Agentic AI
            </div>
          </GlassCard>
        </div>

        {/* ── Right Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>

          {/* Capabilities */}
          <GlassCard>
            <div className="section-label">AI Capabilities</div>
            {[
              { icon: '📚', title: 'RAG Search',      desc: 'Searches 12+ financial knowledge docs + your uploads' },
              { icon: '🤖', title: 'Agentic AI',      desc: 'Multi-step reasoning with 8 financial tools' },
              { icon: '📊', title: 'Live Data',       desc: 'Accesses real-time regime, risk & sentiment data' },
              { icon: '💡', title: 'GenAI Narratives',desc: 'Plain English market intelligence reports' },
            ].map(c => (
              <div key={c.title} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{c.title}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </GlassCard>

          {/* Quick questions */}
          {messages.length > 0 && (
            <GlassCard>
              <div className="section-label">Quick questions</div>
              {[
                'What regime are we in?',
                'Best assets right now?',
                'Show me risk metrics',
                'Explain VaR simply',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '7px 10px', marginBottom: 5,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 8, cursor: 'pointer',
                    fontSize: 11, color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'var(--font)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.color = '#c7d2fe'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                >
                  {q} →
                </button>
              ))}
            </GlassCard>
          )}

          {/* Document upload */}
          <GlassCard>
            <div className="section-label">Upload to Knowledge Base <span className="badge-new">RAG</span></div>
            <input
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              placeholder="Document title..."
              style={{
                width: '100%', padding: '8px 10px', marginBottom: 6,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, color: '#f1f5f9', fontSize: 11,
                fontFamily: 'var(--font)', outline: 'none',
              }}
            />
            <textarea
              value={docText}
              onChange={e => setDocText(e.target.value)}
              placeholder="Paste financial report, research, or any text here..."
              rows={4}
              style={{
                width: '100%', padding: '8px 10px', marginBottom: 6,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, color: '#f1f5f9', fontSize: 11,
                fontFamily: 'var(--font)', resize: 'vertical', outline: 'none',
              }}
            />
            <button
              onClick={handleUpload}
              disabled={!docText.trim() || !docTitle.trim()}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: 11 }}
            >
              Add to Knowledge Base
            </button>
            {uploadMsg && (
              <div style={{ marginTop: 6, fontSize: 10, color: uploadMsg.startsWith('✅') ? '#34d399' : '#f87171' }}>
                {uploadMsg}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
}
