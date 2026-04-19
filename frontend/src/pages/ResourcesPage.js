import React, { useState, useEffect } from 'react';
import axios from 'axios';

const STATIC_RESOURCES = [
  { title:'The Mom Test', description:'How to talk to customers and learn if your business is a good idea', url:'http://momtestbook.com', type:'book' },
  { title:'Paul Graham – How to Get Startup Ideas', description:'Seminal essay on finding problems worth solving', url:'http://paulgraham.com/startupideas.html', type:'article' },
  { title:'Y Combinator Startup Library', description:'Curated resources from YC on building startups', url:'https://www.ycombinator.com/library', type:'article' },
  { title:'First Round Capital Review', description:'Tactical advice for startup founders', url:'https://review.firstround.com', type:'article' },
  { title:'Indie Hackers', description:'Community of founders building profitable products', url:'https://indiehackers.com', type:'community' },
  { title:'Product Hunt', description:'Discover and launch new products', url:'https://producthunt.com', type:'tool' },
];

const typeColor = { book:'var(--blue)', article:'var(--success)', community:'var(--warning)', tool:'var(--danger)' };
const typeBg = { book:'var(--blue-bg)', article:'var(--success-bg)', community:'var(--warning-bg)', tool:'var(--danger-bg)' };

export default function ResourcesPage({ result }) {
  const [videos, setVideos] = useState([]);
  const [vtLoading, setVtLoading] = useState(false);
  const [searchQueries, setSearchQueries] = useState([]);
  const [activeQuery, setActiveQuery] = useState(0);
  const [ytStatus, setYtStatus] = useState('');

  useEffect(() => {
    const ideaWords = (result?.idea || '').split(' ').slice(0, 4).join(' ') || 'startup';
    const fallback = [
      `${ideaWords} startup demo`,
      `how to validate startup idea ${ideaWords}`,
      'startup idea validation',
      'how to build a startup MVP',
    ];
    setSearchQueries(fallback);
    fetchVideos(fallback[0], fallback.slice(1));

  }, [result?._id]);

  const fetchVideos = async (query, fallback = []) => {
    setVtLoading(true); setVideos([]); setYtStatus('');
    try {
      const res = await axios.post('/api/search/youtube', { query, fallback });
      const vids = res.data.videos || [];
      setVideos(vids);
      if (res.data.configured === false) setYtStatus('no-key');
      else if (vids.length === 0) setYtStatus(res.data.error ? 'error' : 'no-results');
    } catch(e) { setYtStatus('error'); }
    setVtLoading(false);
  };

  const switchQuery = (i) => { setActiveQuery(i); fetchVideos(searchQueries[i]); };

  return (
    <div style={{ padding:'28px', maxWidth:1000, margin:'0 auto', animation:'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:700, color:'var(--dark-brown)' }}>Learning Hub</h1>
        <p style={{ color:'var(--text-muted)', marginTop:4, fontSize:14 }}>Curated resources and videos to help you build your startup</p>
      </div>

      {/* YouTube Videos */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--dark-brown)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>YouTube Videos</div>
        {searchQueries.length > 1 && (
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
            {searchQueries.map((q,i) => (
              <button key={i} onClick={()=>switchQuery(i)} style={{
                padding:'7px 14px', borderRadius:8, border:'1.5px solid var(--sand)', background: activeQuery===i?'var(--dark-brown)':'var(--white)',
                color: activeQuery===i?'var(--cream)':'var(--text-muted)', fontSize:12, cursor:'pointer', transition:'all 0.2s',
              }}>
                {q.slice(0,40)}{q.length>40?'...':''}
              </button>
            ))}
          </div>
        )}
        {vtLoading && <div style={{ fontSize:13, color:'var(--text-muted)', padding:'20px 0' }}>Loading videos...</div>}
        {!vtLoading && ytStatus === 'no-key' && (
          <div style={{ background:'var(--warning-bg)', border:'1px solid #E8C89A', color:'var(--warning)', padding:'14px 16px', borderRadius:10, fontSize:13, lineHeight:1.7 }}>
            <strong>YouTube integration not configured.</strong>
            <ol style={{ marginTop:8, paddingLeft:20 }}>
              <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" style={{ color:'var(--warning)', fontWeight:600 }}>Google Cloud Console</a> and create / pick a project.</li>
              <li>APIs &amp; Services → Library → enable <strong>YouTube Data API v3</strong>.</li>
              <li>APIs &amp; Services → Credentials → Create Credentials → API key.</li>
              <li>Add <code>YOUTUBE_API_KEY=your-key</code> to <code>backend/.env</code> and restart the backend.</li>
            </ol>
          </div>
        )}
        {!vtLoading && ytStatus === 'no-results' && <div style={{ fontSize:13, color:'var(--text-muted)' }}>No matching videos for this query.</div>}
        {!vtLoading && ytStatus === 'error' && <div style={{ fontSize:13, color:'var(--danger)' }}>YouTube API error — verify your key and that YouTube Data API v3 is enabled in Google Cloud Console.</div>}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16, marginTop: videos.length ? 14 : 0 }}>
          {videos.map((v,i) => (
            <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" style={{ display:'block', borderRadius:12, overflow:'hidden', border:'1.5px solid var(--sand)', textDecoration:'none', background:'var(--white)', transition:'all 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='var(--shadow-md)';e.currentTarget.style.transform='translateY(-2px)';}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none';}}
            >
              {v.thumbnail && <img src={v.thumbnail} alt={v.title} style={{ width:'100%', height:124, objectFit:'cover', display:'block' }} />}
              <div style={{ padding:'12px 14px' }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--dark-brown)', lineHeight:1.4, marginBottom:5 }}>{v.title?.slice(0,68)}{v.title?.length>68?'...':''}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{v.channel}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Static Curated Resources */}
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--dark-brown)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Essential Startup Resources</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
          {STATIC_RESOURCES.map((r,i) => (
            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{
              display:'block', background:'var(--white)', borderRadius:12, padding:18,
              border:'1.5px solid var(--sand)', textDecoration:'none', transition:'all 0.2s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='var(--shadow-md)';e.currentTarget.style.borderColor='var(--tan)';}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.borderColor='var(--sand)';}}
            >
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:10, textTransform:'uppercase', letterSpacing:'0.05em', background:typeBg[r.type]||'var(--beige)', color:typeColor[r.type]||'var(--text-muted)' }}>
                  {r.type}
                </span>
              </div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--dark-brown)', marginBottom:6, lineHeight:1.4 }}>{r.title}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5 }}>{r.description}</div>
              <div style={{ fontSize:11, color:'var(--blue)', marginTop:12 }}>{r.url.replace('https://','').replace('http://','').split('/')[0]}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
