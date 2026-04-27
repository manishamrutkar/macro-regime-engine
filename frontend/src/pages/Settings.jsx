import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import GlassCard from '../components/ui/GlassCard';

export default function Settings() {
  const [fredKey,    setFredKey]    = useState('');
  const [apiUrl,     setApiUrl]     = useState('http://localhost:5000/api');
  const [interval,   setInterval_]  = useState(30);
  const [saved,      setSaved]      = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageWrapper title="Settings" subtitle="Configure API keys, refresh intervals and connections">
      <div style={{ display:'flex', flexDirection:'column', gap:12, maxWidth:600 }}>
        <GlassCard>
          <div className="section-label">API Configuration</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              { label:'FRED API Key', value:fredKey, set:setFredKey, type:'password', placeholder:'Enter FRED API key...' },
              { label:'Backend API URL', value:apiUrl, set:setApiUrl, placeholder:'http://localhost:5000/api' },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginBottom:5 }}>{f.label}</div>
                <input
                  type={f.type || 'text'}
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  style={{ width:'100%', padding:'9px 12px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f1f5f9', fontSize:12, fontFamily:'var(--font)', outline:'none' }}
                />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="section-label">Data Refresh</div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>Refresh interval (seconds)</span>
            <input type="range" min={10} max={300} step={10} value={interval} onChange={e => setInterval_(+e.target.value)} style={{ flex:1, accentColor:'#6366f1' }} />
            <span style={{ fontSize:12, fontWeight:700, color:'#a5b4fc', width:36 }}>{interval}s</span>
          </div>
        </GlassCard>

        <button className="btn btn-primary" style={{ alignSelf:'flex-start', padding:'10px 24px', fontSize:13 }} onClick={handleSave}>
          {saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>
    </PageWrapper>
  );
}
