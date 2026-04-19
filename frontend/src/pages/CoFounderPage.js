import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function CoFounderPage({ ideaId, result, onGoValidate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (ideaId) {
      axios.get(`/api/ideas/${ideaId}/chat`)
        .then(r => setMessages(r.data.history || []))
        .catch(() => {})
        .finally(() => setFetching(false));
    } else {
      setFetching(false);
    }
  }, [ideaId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading || !ideaId) return;
    const msg = input.trim();
    setInput('');
    setMessages(m => [...m, { role:'user', content:msg }]);
    setLoading(true);
    try {
      const res = await axios.post(`/api/ideas/${ideaId}/chat`, { message: msg });
      setMessages(res.data.history || []);
    } catch(e) {
      setMessages(m => [...m, { role:'assistant', content:'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!ideaId) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', padding:40 }}>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <div style={{ fontSize:48, marginBottom:20 }}>F</div>
        <h2 style={{ fontSize:22, color:'var(--dark-brown)', marginBottom:12 }}>AI Co-Founder</h2>
        <p style={{ color:'var(--text-muted)', fontSize:14, lineHeight:1.7, marginBottom:24 }}>
          Validate a startup idea first, then come back here to have a deep, ongoing conversation with your AI co-founder who remembers everything about your idea.
        </p>
        <button onClick={onGoValidate} style={{ padding:'12px 24px', borderRadius:10, border:'none', background:'var(--dark-brown)', color:'var(--cream)', fontSize:14, fontWeight:600, cursor:'pointer' }}>
          Validate an Idea
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      {/* Header */}
      <div style={{ padding:'18px 24px', background:'var(--white)', borderBottom:'1.5px solid var(--sand)', flexShrink:0 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'var(--dark-brown)' }}>AI Co-Founder</div>
        {result?.idea && (
          <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3, maxWidth:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            Discussing: {result.idea.slice(0,80)}{result.idea.length>80?'...':''}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflow:'auto', padding:'20px 24px' }}>
        {fetching && <div style={{ textAlign:'center', color:'var(--text-muted)', fontSize:14 }}>Loading conversation...</div>}

        {!fetching && messages.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 20px' }}>
            <p style={{ color:'var(--text-muted)', fontSize:14, lineHeight:1.7 }}>
              Your AI co-founder is ready. Ask anything about your idea — strategy, pricing, go-to-market, risks, hiring, technical stack, or fundraising.
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:20 }}>
              {[
                "What's the fastest way to validate this with real users?",
                "What should I build first as an MVP?",
                "Who should I hire first?",
                "What are the biggest risks I'm not seeing?",
              ].map((q,i) => (
                <button key={i} onClick={() => setInput(q)} style={{
                  padding:'9px 14px', borderRadius:9, border:'1.5px solid var(--sand)', background:'var(--white)',
                  fontSize:13, color:'var(--text-muted)', cursor:'pointer', textAlign:'left', transition:'all 0.2s',
                }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--tan)';e.currentTarget.style.color='var(--text)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--sand)';e.currentTarget.style.color='var(--text-muted)';}}
                >{q}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start',
            marginBottom:14, animation:'fadeIn 0.3s ease',
          }}>
            {m.role === 'assistant' && (
              <div style={{ width:32, height:32, borderRadius:9, background:'var(--dark-brown)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--cream)', fontSize:12, fontWeight:700, marginRight:10, flexShrink:0, marginTop:2 }}>
                AI
              </div>
            )}
            <div style={{
              maxWidth:'72%', padding:'12px 16px', borderRadius: m.role==='user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: m.role==='user' ? 'var(--dark-brown)' : 'var(--white)',
              color: m.role==='user' ? 'var(--cream)' : 'var(--text)',
              fontSize:14, lineHeight:1.7,
              boxShadow: m.role==='assistant' ? 'var(--shadow-sm)' : 'none',
              border: m.role==='assistant' ? '1.5px solid var(--sand)' : 'none',
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'var(--dark-brown)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--cream)', fontSize:12, fontWeight:700, flexShrink:0 }}>AI</div>
            <div style={{ background:'var(--white)', border:'1.5px solid var(--sand)', borderRadius:'14px 14px 14px 4px', padding:'12px 16px', display:'flex', gap:5 }}>
              {[0,1,2].map(i=><div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'var(--tan)', animation:`pulse 1.2s ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding:'16px 24px', background:'var(--white)', borderTop:'1.5px solid var(--sand)', flexShrink:0 }}>
        <div style={{ display:'flex', gap:10 }}>
          <textarea
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} }}
            placeholder="Ask your AI co-founder anything... (Enter to send)"
            rows={2}
            style={{
              flex:1, padding:'12px 14px', borderRadius:10, border:'1.5px solid var(--sand)',
              background:'var(--cream)', fontSize:14, color:'var(--text)', outline:'none',
              resize:'none', lineHeight:1.6, transition:'border-color 0.2s',
            }}
            onFocus={e=>e.target.style.borderColor='var(--brown)'}
            onBlur={e=>e.target.style.borderColor='var(--sand)'}
          />
          <button onClick={send} disabled={loading||!input.trim()} style={{
            padding:'0 20px', borderRadius:10, border:'none',
            background: input.trim() ? 'var(--dark-brown)' : 'var(--sand)',
            color: input.trim() ? 'var(--cream)' : 'var(--text-muted)',
            fontSize:13, fontWeight:600, cursor: input.trim() ? 'pointer' : 'not-allowed', transition:'all 0.2s',
          }}>
            Send
          </button>
        </div>
        <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:8 }}>Shift+Enter for new line. Conversation is saved per idea.</div>
      </div>
    </div>
  );
}
