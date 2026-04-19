import React, { useState } from 'react';
import axios from 'axios';

const scoreColor = s => s>=70?'var(--success)':s>=45?'var(--warning)':'var(--danger)';

export default function TimelinePage({ result, onGoValidate }) {
  const [refineText, setRefineText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentResult, setCurrentResult] = useState(result);

  if (!currentResult) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', padding:40 }}>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <h2 style={{ fontSize:22, color:'var(--dark-brown)', marginBottom:12 }}>Idea Evolution Timeline</h2>
        <p style={{ color:'var(--text-muted)', fontSize:14, lineHeight:1.7, marginBottom:24 }}>
          Validate a startup idea first, then refine it here. Each version is tracked so you can see how your idea evolves and improves over time.
        </p>
        <button onClick={onGoValidate} style={{ padding:'12px 24px', borderRadius:10, border:'none', background:'var(--dark-brown)', color:'var(--cream)', fontSize:14, fontWeight:600, cursor:'pointer' }}>
          Validate an Idea
        </button>
      </div>
    </div>
  );

  const versions = currentResult.versions || [{ version:1, idea: currentResult.idea, score: currentResult.score }];

  const refine = async () => {
    if (!refineText.trim() || refineText.trim().length < 10) { setError('Please write a refined version of your idea.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await axios.put(`/api/ideas/${currentResult._id}/refine`, { refinedIdea: refineText.trim() });
      setCurrentResult(res.data);
      setRefineText('');
    } catch(e) {
      setError(e.response?.data?.error || 'Refinement failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding:'28px', maxWidth:800, margin:'0 auto', animation:'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:700, color:'var(--dark-brown)' }}>Idea Evolution Timeline</h1>
        <p style={{ color:'var(--text-muted)', marginTop:4, fontSize:14 }}>Track how your idea improves with each refinement</p>
      </div>

      {/* Timeline */}
      <div style={{ marginBottom:28 }}>
        {versions.map((v, i) => (
          <div key={i} style={{ display:'flex', gap:16, marginBottom: i < versions.length-1 ? 0 : 0 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background: i===versions.length-1?'var(--dark-brown)':'var(--white)', border:`2px solid ${i===versions.length-1?'var(--dark-brown)':'var(--tan)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:i===versions.length-1?'var(--cream)':'var(--tan)' }}>
                v{v.version}
              </div>
              {i < versions.length-1 && <div style={{ width:2, flex:1, background:'var(--sand)', margin:'6px 0', minHeight:32 }} />}
            </div>
            <div style={{ flex:1, background:'var(--white)', borderRadius:12, padding:'16px 18px', border:`1.5px solid ${i===versions.length-1?'var(--brown)':'var(--sand)'}`, marginBottom:i<versions.length-1?12:0, boxShadow:'var(--shadow-sm)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div>
                  <span style={{ fontSize:12, fontWeight:700, color:'var(--dark-brown)' }}>Version {v.version}</span>
                  {i===versions.length-1 && <span style={{ marginLeft:8, fontSize:10, fontWeight:600, background:'var(--dark-brown)', color:'var(--cream)', padding:'2px 8px', borderRadius:8 }}>LATEST</span>}
                </div>
                {v.score > 0 && (
                  <span style={{ fontSize:18, fontWeight:700, color:scoreColor(v.score), fontFamily:"'Playfair Display',serif" }}>{v.score}</span>
                )}
              </div>
              <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.6 }}>{v.idea}</p>
              {v.score > 0 && i > 0 && versions[i-1]?.score > 0 && (
                <div style={{ marginTop:10, fontSize:12, color: v.score >= versions[i-1].score ? 'var(--success)' : 'var(--danger)', fontWeight:500 }}>
                  {v.score >= versions[i-1].score ? '+' : ''}{v.score - versions[i-1].score} from previous version
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Refine Box */}
      <div style={{ background:'var(--white)', borderRadius:16, padding:22, border:'1.5px solid var(--sand)', boxShadow:'var(--shadow-sm)' }}>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--dark-brown)', marginBottom:14 }}>Refine Your Idea — Add Version {versions.length + 1}</div>
        {error && <div style={{ background:'var(--danger-bg)', border:'1px solid #E8B4B4', color:'var(--danger)', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:14 }}>{error}</div>}
        <textarea
          value={refineText}
          onChange={e=>setRefineText(e.target.value)}
          placeholder={`Write your improved version of the idea... (based on: "${currentResult.idea?.slice(0,60)}...")`}
          rows={5}
          style={{
            width:'100%', padding:'13px 15px', borderRadius:10, border:'1.5px solid var(--sand)',
            background:'var(--cream)', fontSize:14, color:'var(--text)', outline:'none',
            resize:'vertical', lineHeight:1.7, transition:'border-color 0.2s', marginBottom:14,
          }}
          onFocus={e=>e.target.style.borderColor='var(--brown)'}
          onBlur={e=>e.target.style.borderColor='var(--sand)'}
        />
        <button onClick={refine} disabled={loading} style={{
          width:'100%', padding:'13px', borderRadius:10, border:'none',
          background:'var(--dark-brown)', color:'var(--cream)', fontSize:14, fontWeight:600, cursor:'pointer',
          opacity: loading ? 0.7 : 1, transition:'all 0.2s',
        }}>
          {loading ? 'Analyzing refined idea...' : 'Refine and Re-Analyze'}
        </button>
      </div>
    </div>
  );
}
