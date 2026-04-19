import React, { useState } from 'react';
import axios from 'axios';

export default function HomePage({ onResult }) {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('');

  const stages = [
    'Analyzing your idea with Gemini AI...',
    'Consulting investor perspective...',
    'Checking competitor landscape...',
    'Calculating overlap percentage...',
    'Generating Build/Pivot/Drop decision...',
    'Evaluating founder-idea fit...',
    'Finding competitor gaps...',
    'Computing market signals...',
    'Finalizing analysis...',
  ];

  const handleSubmit = async () => {
    if (!idea.trim() || idea.trim().length < 10) {
      setError('Please describe your idea in at least 10 characters.');
      return;
    }
    setError(''); setLoading(true);
    let i = 0;
    setStage(stages[0]);
    const interval = setInterval(() => { i++; setStage(stages[i % stages.length]); }, 2200);
    try {
      const res = await axios.post('/api/analyze-idea', { idea: idea.trim() });
      clearInterval(interval);
      onResult(res.data);
    } catch (err) {
      clearInterval(interval);
      const apiErr = err.response?.data?.error;
      const status = err.response?.status;
      if (status === 400 && /API key|GEMINI_API_KEY/i.test(apiErr || '')) {
        setError(apiErr + ' — then restart the backend.');
      } else if (apiErr) {
        setError(apiErr);
      } else if (err.message === 'Network Error') {
        setError('Cannot reach the backend at http://localhost:5000. Is `npm start` running in the backend folder?');
      } else {
        setError(err.message || 'Analysis failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    'An AI-powered meal planning app that considers health conditions, budget, and local ingredient availability',
    'A marketplace connecting elderly homeowners with verified students who do chores in exchange for reduced rent',
    'A SaaS platform that auto-generates legal contracts for freelancers using AI and jurisdiction-aware templates',
  ];

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>
      <div style={{ maxWidth:680, width:'100%', animation:'fadeIn 0.5s ease' }}>
        <div style={{ textAlign:'center', marginBottom:44 }}>
          <h1 style={{ fontSize:38, fontWeight:700, color:'var(--dark-brown)', lineHeight:1.2, marginBottom:14 }}>
            Validate Your Startup Idea
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:16, lineHeight:1.7 }}>
            Get AI analysis with competitor evidence, overlap scores, Build/Pivot/Drop decisions, and founder-fit scoring — powered by Gemini.
          </p>
        </div>

        <div style={{ background:'var(--white)', borderRadius:20, padding:28, boxShadow:'var(--shadow-md)', border:'1.5px solid var(--sand)' }}>
          {error && (
            <div style={{ background:'var(--danger-bg)', border:'1px solid #E8B4B4', color:'var(--danger)', padding:'11px 14px', borderRadius:9, fontSize:13, marginBottom:18 }}>
              {error}
            </div>
          )}

          <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--dark-brown)', marginBottom:8 }}>
            Your Startup Idea
          </label>
          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            placeholder="Describe your startup idea in detail — what problem does it solve? Who is it for? What makes it different?"
            disabled={loading}
            rows={6}
            style={{
              width:'100%', padding:'14px 16px', borderRadius:12, fontSize:14,
              border:'1.5px solid var(--sand)', background:'var(--cream)',
              color:'var(--text)', outline:'none', resize:'vertical', lineHeight:1.7,
              transition:'border-color 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor='var(--brown)'; e.target.style.boxShadow='0 0 0 3px rgba(139,111,71,0.1)'; }}
            onBlur={e => { e.target.style.borderColor='var(--sand)'; e.target.style.boxShadow='none'; }}
          />

          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, marginBottom:20 }}>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>{idea.length} chars</span>
            <span style={{ fontSize:12, color: idea.length >= 10 ? 'var(--success)' : 'var(--text-muted)', fontWeight:500 }}>
              {idea.length >= 10 ? 'Ready to analyze' : 'Min 10 characters'}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:'16px 0' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:14 }}>
                <div style={{ width:20, height:20, border:'2.5px solid var(--sand)', borderTopColor:'var(--brown)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                <span style={{ color:'var(--brown)', fontWeight:500, fontSize:14 }}>{stage}</span>
              </div>
              <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'var(--tan)', animation:`pulse 1.4s ${i*0.2}s infinite` }} />
                ))}
              </div>
            </div>
          ) : (
            <button onClick={handleSubmit} style={{
              width:'100%', padding:'14px', borderRadius:11, border:'none',
              background:'var(--dark-brown)', color:'var(--cream)', fontSize:15, fontWeight:600,
              transition:'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.background='var(--brown)'; e.target.style.transform='translateY(-1px)'; e.target.style.boxShadow='0 6px 20px rgba(74,55,40,0.25)'; }}
              onMouseLeave={e => { e.target.style.background='var(--dark-brown)'; e.target.style.transform='none'; e.target.style.boxShadow='none'; }}
            >
              Validate My Idea
            </button>
          )}
        </div>

        <div style={{ marginTop:32 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Try an example</div>
          {examples.map((ex, i) => (
            <button key={i} onClick={() => setIdea(ex)} disabled={loading} style={{
              display:'block', width:'100%', background:'var(--white)', border:'1.5px solid var(--sand)',
              borderRadius:11, padding:'12px 16px', textAlign:'left', cursor:'pointer', fontSize:13,
              color:'var(--text)', lineHeight:1.5, marginBottom:8, transition:'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--tan)'; e.currentTarget.style.background='var(--beige)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--sand)'; e.currentTarget.style.background='var(--white)'; }}
            >
              <span style={{ color:'var(--brown)', marginRight:8, fontWeight:600 }}>{i+1}.</span>{ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
