import React, { useState, useEffect } from 'react';
import axios from 'axios';

const scoreColor = s => s>=70?'var(--success)':s>=45?'var(--warning)':'var(--danger)';
const scoreLabel = s => s>=70?'Promising':s>=45?'Moderate':'Challenging';

const DecisionBadge = ({ action }) => {
  if (!action) return null;
  const cfg = { BUILD:{bg:'var(--success-bg)',color:'var(--success)'}, PIVOT:{bg:'var(--warning-bg)',color:'var(--warning)'}, DROP:{bg:'var(--danger-bg)',color:'var(--danger)'} };
  const c = cfg[action]||cfg.BUILD;
  return <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:10, background:c.bg, color:c.color }}>{action}</span>;
};

export default function HistoryPage({ onViewResult }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchIdeas(); }, []);

  const fetchIdeas = async () => {
    try { const res = await axios.get('/api/my-ideas'); setIdeas(res.data); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const deleteIdea = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this idea?')) return;
    setDeleting(id);
    try { await axios.delete(`/api/ideas/${id}`); setIdeas(ideas.filter(i=>i._id!==id)); }
    catch(e) { console.error(e); }
    finally { setDeleting(null); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ width:32, height:32, border:'3px solid var(--sand)', borderTopColor:'var(--brown)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ padding:'28px', maxWidth:860, margin:'0 auto', animation:'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:700, color:'var(--dark-brown)' }}>My Ideas</h1>
        <p style={{ color:'var(--text-muted)', marginTop:4, fontSize:14 }}>{ideas.length} idea{ideas.length!==1?'s':''} analyzed</p>
      </div>

      {ideas.length === 0 ? (
        <div style={{ textAlign:'center', padding:'70px 40px', background:'var(--white)', borderRadius:18, border:'1.5px dashed var(--sand)' }}>
          <div style={{ fontSize:40, color:'var(--tan)', marginBottom:14 }}>◈</div>
          <h2 style={{ fontSize:20, color:'var(--dark-brown)', marginBottom:10 }}>No ideas yet</h2>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>Validate your first startup idea to see it here.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {ideas.map((idea, i) => (
            <div key={idea._id} onClick={() => onViewResult(idea)} style={{
              background:'var(--white)', borderRadius:14, padding:'20px 22px',
              boxShadow:'var(--shadow-sm)', border:'1.5px solid var(--sand)',
              cursor:'pointer', transition:'all 0.2s',
              animation:`fadeIn 0.4s ${i*0.04}s ease both`,
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.borderColor='var(--tan)'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='var(--shadow-sm)'; e.currentTarget.style.borderColor='var(--sand)'; e.currentTarget.style.transform='none'; }}
            >
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, color:'var(--text)', lineHeight:1.6, fontWeight:500, marginBottom:10 }}>
                    {idea.idea.length>180 ? idea.idea.slice(0,180)+'...' : idea.idea}
                  </p>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>
                      {new Date(idea.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                    </span>
                    {idea.score>0 && (
                      <span style={{ fontSize:12, fontWeight:600, color:scoreColor(idea.score), background:`color-mix(in srgb, ${scoreColor(idea.score)} 12%, white)`, padding:'3px 10px', borderRadius:10 }}>
                        {scoreLabel(idea.score)}
                      </span>
                    )}
                    {idea.decision?.action && <DecisionBadge action={idea.decision.action} />}
                    {(idea.versions||[]).length > 1 && (
                      <span style={{ fontSize:11, color:'var(--text-muted)', background:'var(--beige)', padding:'3px 8px', borderRadius:8 }}>
                        v{idea.versions.length}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
                  {idea.score > 0 && (
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:26, fontWeight:700, color:scoreColor(idea.score), fontFamily:"'Playfair Display',serif", lineHeight:1 }}>{idea.score}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>/100</div>
                    </div>
                  )}
                  <button onClick={e=>deleteIdea(idea._id,e)} disabled={deleting===idea._id} style={{
                    background:'var(--beige)', border:'none', borderRadius:8, width:32, height:32,
                    cursor:'pointer', fontSize:14, color:'var(--text-muted)', transition:'all 0.2s',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.background='var(--danger-bg)'; e.currentTarget.style.color='var(--danger)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background='var(--beige)'; e.currentTarget.style.color='var(--text-muted)'; }}
                  >
                    {deleting===idea._id ? '...' : 'X'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
