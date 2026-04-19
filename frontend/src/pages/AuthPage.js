import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display:'block', fontSize:13, fontWeight:500, color:'var(--dark-brown)', marginBottom:6 }}>{label}</label>
    <input {...props} style={{
      width:'100%', padding:'11px 14px', borderRadius: 10, fontSize:14,
      border:'1.5px solid var(--sand)', background:'var(--cream)', color:'var(--text)',
      outline:'none', transition:'border-color 0.2s',
      ...props.style
    }}
      onFocus={e => e.target.style.borderColor = 'var(--brown)'}
      onBlur={e => e.target.style.borderColor = 'var(--sand)'}
    />
  </div>
);

export default function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form;
      const res = await axios.post(endpoint, payload);
      login(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)', padding:24 }}>
      <div style={{ width:'100%', maxWidth:420, animation:'fadeIn 0.5s ease' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ width:56, height:56, background:'var(--dark-brown)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:26 }}>
            S
          </div>
          <h1 style={{ fontSize:28, fontWeight:700, color:'var(--dark-brown)' }}>Startup Validator</h1>
          <p style={{ color:'var(--text-muted)', marginTop:6, fontSize:14 }}>AI-powered idea validation</p>
        </div>

        <div style={{ background:'var(--white)', borderRadius:20, padding:32, boxShadow:'var(--shadow-md)' }}>
          <div style={{ display:'flex', gap:4, background:'var(--beige)', borderRadius:10, padding:4, marginBottom:28 }}>
            {['login','register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                flex:1, padding:'9px', borderRadius:8, border:'none', fontSize:14, fontWeight:500,
                background: mode === m ? 'var(--white)' : 'transparent',
                color: mode === m ? 'var(--dark-brown)' : 'var(--text-muted)',
                boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                transition:'all 0.2s', textTransform:'capitalize'
              }}>{m}</button>
            ))}
          </div>

          {error && (
            <div style={{ background:'var(--danger-bg)', border:'1px solid #E8B4B4', color:'var(--danger)', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:20 }}>
              {error}
            </div>
          )}

          {mode === 'register' && <Input label="Full Name" type="text" placeholder="Your name" value={form.name} onChange={set('name')} />}
          <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />

          <button onClick={submit} disabled={loading} style={{
            width:'100%', padding:'13px', borderRadius:10, border:'none',
            background:'var(--dark-brown)', color:'var(--cream)', fontSize:15, fontWeight:600,
            marginTop:8, transition:'all 0.2s', opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
