import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SKILLS_OPTIONS = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'Operations', 'Data/ML', 'Product', 'Legal', 'Healthcare', 'Education', 'Retail/E-commerce', 'Hardware'];
const INTERESTS_OPTIONS = ['B2B SaaS', 'Consumer Apps', 'Marketplace', 'Hardware', 'Fintech', 'Healthtech', 'Edtech', 'AI/ML', 'Web3', 'Climate', 'Social Impact', 'Gaming', 'Media'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [skills, setSkills] = useState(user?.skills || []);
  const [interests, setInterests] = useState(user?.interests || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (arr, setArr, val) => {
    setArr(arr.includes(val) ? arr.filter(x=>x!==val) : [...arr, val]);
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.put('/api/auth/profile', { skills, interests });
      updateUser({ skills, interests });
      setSaved(true);
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  };

  const ChipBtn = ({ val, active, onClick }) => (
    <button onClick={onClick} style={{
      padding:'8px 16px', borderRadius:20, border:'1.5px solid', fontSize:13, cursor:'pointer',
      background: active ? 'var(--dark-brown)' : 'var(--white)',
      color: active ? 'var(--cream)' : 'var(--text-muted)',
      borderColor: active ? 'var(--dark-brown)' : 'var(--sand)',
      transition:'all 0.15s', fontWeight: active ? 500 : 400,
    }}>{val}</button>
  );

  return (
    <div style={{ padding:'28px', maxWidth:760, margin:'0 auto', animation:'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:700, color:'var(--dark-brown)' }}>Founder Profile</h1>
        <p style={{ color:'var(--text-muted)', marginTop:4, fontSize:14 }}>Tell us your skills and interests — we use this to personalize founder-idea fit analysis</p>
      </div>

      <div style={{ background:'var(--white)', borderRadius:16, padding:26, boxShadow:'var(--shadow-sm)', border:'1.5px solid var(--sand)', marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--dark-brown)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Your Skills</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {SKILLS_OPTIONS.map(s=><ChipBtn key={s} val={s} active={skills.includes(s)} onClick={()=>toggle(skills,setSkills,s)} />)}
        </div>
      </div>

      <div style={{ background:'var(--white)', borderRadius:16, padding:26, boxShadow:'var(--shadow-sm)', border:'1.5px solid var(--sand)', marginBottom:24 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--dark-brown)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Your Interests</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {INTERESTS_OPTIONS.map(s=><ChipBtn key={s} val={s} active={interests.includes(s)} onClick={()=>toggle(interests,setInterests,s)} />)}
        </div>
      </div>

      <button onClick={save} disabled={saving} style={{
        padding:'13px 32px', borderRadius:10, border:'none', background:'var(--dark-brown)', color:'var(--cream)',
        fontSize:14, fontWeight:600, cursor:'pointer', opacity: saving ? 0.7 : 1, transition:'all 0.2s',
      }}>
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
      </button>

      {saved && (
        <div style={{ marginTop:14, fontSize:13, color:'var(--success)' }}>
          Profile saved. Future analyses will include personalized founder-fit scoring based on your profile.
        </div>
      )}

      <div style={{ marginTop:28, padding:20, background:'var(--beige)', borderRadius:12, border:'1px solid var(--sand)' }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--dark-brown)', marginBottom:6 }}>How this is used</div>
        <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7 }}>
          When you validate a startup idea, the AI uses your skill and interest profile to calculate a Founder-Idea Fit score. It identifies strengths you bring to this idea, gaps you need to fill (co-founder, hire, or learn), and gives you a personalized verdict on your suitability.
        </p>
      </div>
    </div>
  );
}
