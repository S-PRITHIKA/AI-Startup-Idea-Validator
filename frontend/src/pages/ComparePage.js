import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ComparePage() {
  const [ideas, setIdeas] = useState([]);
  const [s1, setS1] = useState('');
  const [s2, setS2] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/my-ideas').then(r=>setIdeas(r.data)).catch(console.error).finally(()=>setFetching(false));
  }, []);

  const handleCompare = async () => {
    if (!s1||!s2||s1===s2) { setError('Select two different ideas.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await axios.post('/api/compare', { ideaId1:s1, ideaId2:s2 });
      setResult(res.data);
    } catch(err) {
      setError(err.response?.data?.error||'Comparison failed');
    } finally { setLoading(false); }
  };

  const sc = s => s>=70?'var(--success)':s>=45?'var(--warning)':'var(--danger)';

  const selStyle = {
    width:'100%', padding:'12px 14px', borderRadius:10, border:'1.5px solid var(--sand)',
    background:'var(--cream)', fontSize:13, color:'var(--text)', outline:'none', cursor:'pointer',
  };

  if (fetching) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ width:32,height:32,border:'3px solid var(--sand)',borderTopColor:'var(--brown)',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ padding:'28px', maxWidth:960, margin:'0 auto', animation:'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:700, color:'var(--dark-brown)' }}>Compare Ideas</h1>
        <p style={{ color:'var(--text-muted)', marginTop:4, fontSize:14 }}>Pick two ideas — AI decides which has better potential</p>
      </div>

      {ideas.length < 2 ? (
        <div style={{ textAlign:'center', padding:'70px 40px', background:'var(--white)', borderRadius:18, border:'1.5px dashed var(--sand)' }}>
          <h2 style={{ fontSize:20, color:'var(--dark-brown)', marginBottom:10 }}>Need at least 2 ideas</h2>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>Validate more startup ideas first.</p>
        </div>
      ) : (
        <>
          <div style={{ background:'var(--white)', borderRadius:16, padding:24, boxShadow:'var(--shadow-sm)', border:'1.5px solid var(--sand)', marginBottom:22 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:18, alignItems:'end' }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--dark-brown)', marginBottom:7 }}>Idea #1</label>
                <select value={s1} onChange={e=>setS1(e.target.value)} style={selStyle}
                  onFocus={e=>e.target.style.borderColor='var(--brown)'}
                  onBlur={e=>e.target.style.borderColor='var(--sand)'}
                >
                  <option value="">Select an idea...</option>
                  {ideas.map(i=><option key={i._id} value={i._id} disabled={i._id===s2}>{i.idea.slice(0,65)}{i.idea.length>65?'...':''} (Score: {i.score})</option>)}
                </select>
              </div>
              <div style={{ fontSize:22, color:'var(--tan)', paddingBottom:10, fontWeight:700 }}>vs</div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--dark-brown)', marginBottom:7 }}>Idea #2</label>
                <select value={s2} onChange={e=>setS2(e.target.value)} style={selStyle}
                  onFocus={e=>e.target.style.borderColor='var(--brown)'}
                  onBlur={e=>e.target.style.borderColor='var(--sand)'}
                >
                  <option value="">Select an idea...</option>
                  {ideas.map(i=><option key={i._id} value={i._id} disabled={i._id===s1}>{i.idea.slice(0,65)}{i.idea.length>65?'...':''} (Score: {i.score})</option>)}
                </select>
              </div>
            </div>
            {error && <div style={{ background:'var(--danger-bg)', border:'1px solid #E8B4B4', color:'var(--danger)', padding:'10px 14px', borderRadius:8, fontSize:13, marginTop:16 }}>{error}</div>}
            <button onClick={handleCompare} disabled={loading||!s1||!s2} style={{
              marginTop:20, width:'100%', padding:'13px', borderRadius:10, border:'none',
              background:s1&&s2?'var(--dark-brown)':'var(--sand)',
              color:s1&&s2?'var(--cream)':'var(--text-muted)',
              fontSize:14, fontWeight:600, cursor:s1&&s2?'pointer':'not-allowed', transition:'all 0.2s',
            }}>
              {loading ? 'Comparing...' : 'Compare Ideas'}
            </button>
          </div>

          {result && (
            <div style={{ animation:'fadeIn 0.5s ease' }}>
              <div style={{ background:'linear-gradient(135deg, var(--dark-brown), var(--brown))', borderRadius:18, padding:'26px 28px', marginBottom:20, color:'var(--cream)', textAlign:'center' }}>
                <div style={{ fontSize:12, fontWeight:600, opacity:0.7, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Winner</div>
                <h2 style={{ fontSize:24, fontWeight:700, marginBottom:14 }}>Idea #{result.comparison.winner}</h2>
                <p style={{ opacity:0.85, lineHeight:1.7, fontSize:14, maxWidth:580, margin:'0 auto 16px' }}>{result.comparison.winnerReason}</p>
                <div style={{ background:'rgba(255,255,255,0.12)', borderRadius:10, padding:'12px 18px', display:'inline-block', fontSize:13 }}>
                  {result.comparison.recommendation}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
                {[
                  {num:1, idea:result.idea1, strengths:result.comparison.idea1Strengths, weaknesses:result.comparison.idea1Weaknesses},
                  {num:2, idea:result.idea2, strengths:result.comparison.idea2Strengths, weaknesses:result.comparison.idea2Weaknesses},
                ].map(({num, idea, strengths, weaknesses}) => (
                  <div key={num} style={{
                    background:'var(--white)', borderRadius:14, padding:22,
                    boxShadow:'var(--shadow-sm)',
                    border:`2px solid ${result.comparison.winner===num?'var(--brown)':'var(--sand)'}`,
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:'var(--dark-brown)' }}>Idea #{num}</div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        {result.comparison.winner===num && <span style={{ background:'var(--dark-brown)', color:'var(--cream)', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:10 }}>WINNER</span>}
                        {idea.score>0 && <span style={{ fontSize:22, fontWeight:700, color:sc(idea.score), fontFamily:"'Playfair Display',serif" }}>{idea.score}</span>}
                      </div>
                    </div>
                    <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6, marginBottom:18, paddingBottom:18, borderBottom:'1px solid var(--sand)' }}>{idea.idea}</p>
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--success)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Strengths</div>
                      {(strengths||[]).map((s,i)=><div key={i} style={{ fontSize:13, color:'var(--text)', marginBottom:6, lineHeight:1.5 }}>+ {s}</div>)}
                    </div>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--danger)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Weaknesses</div>
                      {(weaknesses||[]).map((w,i)=><div key={i} style={{ fontSize:13, color:'var(--text)', marginBottom:6, lineHeight:1.5 }}>- {w}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
