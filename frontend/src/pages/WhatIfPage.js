import React, { useState } from 'react';
import axios from 'axios';

export default function WhatIfPage({ ideaId, result, onGoValidate }) {
  const [price, setPrice] = useState('');
  const [audience, setAudience] = useState('');
  const [niche, setNiche] = useState('');
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!ideaId) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', padding:40 }}>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <h2 style={{ fontSize:22, color:'var(--dark-brown)', marginBottom:12 }}>What-If Simulator</h2>
        <p style={{ color:'var(--text-muted)', fontSize:14, lineHeight:1.7, marginBottom:24 }}>
          Validate a startup idea first, then use this tool to simulate how changing variables affects your score.
        </p>
        <button onClick={onGoValidate} style={{ padding:'12px 24px', borderRadius:10, border:'none', background:'var(--dark-brown)', color:'var(--cream)', fontSize:14, fontWeight:600, cursor:'pointer' }}>
          Validate an Idea
        </button>
      </div>
    </div>
  );

  const run = async () => {
    if (!price && !audience && !niche) { setError('Change at least one variable.'); return; }
    setError(''); setLoading(true); setSimResult(null);
    try {
      const res = await axios.post(`/api/ideas/${ideaId}/whatif`, { price, audience, niche });
      setSimResult(res.data);
    } catch(e) {
      setError(e.response?.data?.error || 'Simulation failed');
    } finally { setLoading(false); }
  };

  const deltaColor = d => d > 0 ? 'var(--success)' : d < 0 ? 'var(--danger)' : 'var(--text-muted)';

  const inputStyle = {
    width:'100%', padding:'11px 14px', borderRadius:10, border:'1.5px solid var(--sand)',
    background:'var(--cream)', fontSize:14, color:'var(--text)', outline:'none', transition:'border-color 0.2s',
  };

  return (
    <div style={{ padding:'28px', maxWidth:800, margin:'0 auto', animation:'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:700, color:'var(--dark-brown)' }}>What-If Simulator</h1>
        <p style={{ color:'var(--text-muted)', marginTop:4, fontSize:14 }}>Tweak variables and see how your score changes</p>
      </div>

      {result?.idea && (
        <div style={{ background:'var(--white)', borderRadius:13, padding:'14px 18px', marginBottom:20, border:'1.5px solid var(--sand)', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Current Idea (Score: {result.score}/100)</div>
          <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.6 }}>{result.idea.slice(0,200)}{result.idea.length>200?'...':''}</p>
        </div>
      )}

      <div style={{ background:'var(--white)', borderRadius:16, padding:24, boxShadow:'var(--shadow-sm)', border:'1.5px solid var(--sand)', marginBottom:22 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:18, marginBottom:20 }}>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--dark-brown)', marginBottom:7 }}>Price Point</label>
            <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="e.g. $29/mo freemium" style={inputStyle}
              onFocus={e=>e.target.style.borderColor='var(--brown)'}
              onBlur={e=>e.target.style.borderColor='var(--sand)'}
            />
          </div>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--dark-brown)', marginBottom:7 }}>Target Audience</label>
            <input value={audience} onChange={e=>setAudience(e.target.value)} placeholder="e.g. enterprise CTOs" style={inputStyle}
              onFocus={e=>e.target.style.borderColor='var(--brown)'}
              onBlur={e=>e.target.style.borderColor='var(--sand)'}
            />
          </div>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--dark-brown)', marginBottom:7 }}>Niche / Focus</label>
            <input value={niche} onChange={e=>setNiche(e.target.value)} placeholder="e.g. healthcare only" style={inputStyle}
              onFocus={e=>e.target.style.borderColor='var(--brown)'}
              onBlur={e=>e.target.style.borderColor='var(--sand)'}
            />
          </div>
        </div>

        {error && <div style={{ background:'var(--danger-bg)', border:'1px solid #E8B4B4', color:'var(--danger)', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:14 }}>{error}</div>}

        <button onClick={run} disabled={loading} style={{
          width:'100%', padding:'13px', borderRadius:10, border:'none',
          background:'var(--dark-brown)', color:'var(--cream)', fontSize:14, fontWeight:600, cursor:'pointer',
          opacity: loading ? 0.7 : 1, transition:'all 0.2s',
        }}>
          {loading ? 'Simulating...' : 'Run Simulation'}
        </button>
      </div>

      {simResult && (
        <div style={{ animation:'scaleIn 0.4s ease' }}>
          <div style={{ background:'var(--white)', borderRadius:16, padding:24, boxShadow:'var(--shadow-sm)', border:'1.5px solid var(--sand)', marginBottom:18 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:20 }}>
              <div style={{ textAlign:'center', padding:'20px', background:'var(--beige)', borderRadius:12 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>New Score</div>
                <div style={{ fontSize:52, fontWeight:700, color:'var(--dark-brown)', fontFamily:"'Playfair Display',serif", lineHeight:1 }}>{simResult.newScore}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>/100</div>
              </div>
              <div style={{ textAlign:'center', padding:'20px', background:'var(--beige)', borderRadius:12 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Score Change</div>
                <div style={{ fontSize:52, fontWeight:700, color:deltaColor(simResult.scoreDelta), fontFamily:"'Playfair Display',serif", lineHeight:1 }}>
                  {simResult.scoreDelta > 0 ? '+' : ''}{simResult.scoreDelta}
                </div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>from original</div>
              </div>
            </div>

            <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>New Verdict</div>
            <p style={{ fontSize:14, color:'var(--dark-brown)', lineHeight:1.7, marginBottom:18, fontStyle:'italic' }}>"{simResult.newVerdict}"</p>

            <p style={{ fontSize:14, color:'var(--text)', lineHeight:1.7, marginBottom:20 }}>{simResult.impact}</p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
              <div style={{ background:'var(--success-bg)', borderRadius:11, padding:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--success)', marginBottom:10 }}>Pros of these changes</div>
                {(simResult.pros||[]).map((p,i)=><div key={i} style={{ fontSize:13, color:'var(--text)', lineHeight:1.5, marginBottom:7 }}>+ {p}</div>)}
              </div>
              <div style={{ background:'var(--danger-bg)', borderRadius:11, padding:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--danger)', marginBottom:10 }}>Cons of these changes</div>
                {(simResult.cons||[]).map((c,i)=><div key={i} style={{ fontSize:13, color:'var(--text)', lineHeight:1.5, marginBottom:7 }}>- {c}</div>)}
              </div>
            </div>

            {simResult.recommendation && (
              <div style={{ marginTop:18, padding:'14px 18px', background:'var(--beige)', borderRadius:11, fontSize:14, color:'var(--dark-brown)', lineHeight:1.7 }}>
                <strong>Recommendation:</strong> {simResult.recommendation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
