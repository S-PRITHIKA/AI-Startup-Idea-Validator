import React from 'react';
import { useAuth } from '../context/AuthContext';

// Consistent minimal glyph set — geometric, no colored emoji
const NAV = [
  { id: 'home',     icon: '✦', label: 'Validate Idea' },
  { id: 'history',  icon: '◈', label: 'My Ideas' },
  { id: 'compare',  icon: '⇄', label: 'Compare Ideas' },
  { id: 'profile',  icon: '◉', label: 'Founder Profile' },
];

const REPORT_TOOLS = [
  { id: 'investor-report', icon: '◆', label: 'Validation Report' },
  { id: 'blueprint',       icon: '▣', label: 'Execution Blueprint' },
  { id: 'competitor-gap',  icon: '◎', label: 'Competitor Gaps' },
];

const SIDEBAR_TOOLS = [
  { id: 'cofounder',  icon: '◐', label: 'AI Co-Founder' },
  { id: 'whatif',     icon: '⇋', label: 'What-If Simulator' },
  { id: 'resources',  icon: '❒', label: 'Learning Hub' },
  { id: 'timeline',   icon: '◷', label: 'Idea Timeline' },
];

export default function Sidebar({ page, setPage, collapsed, setCollapsed, activeIdeaId }) {
  const { user, logout } = useAuth();

  const NavBtn = ({ item, active, disabled }) => (
    <button
      onClick={() => !disabled && setPage(item.id)}
      title={collapsed ? item.label : disabled ? 'Analyze an idea first' : ''}
      style={{
        display:'flex', alignItems:'center', gap:10, padding: collapsed ? '10px' : '10px 12px',
        borderRadius:9, border:'none', width:'100%', textAlign:'left', fontSize:13.5, fontWeight:500,
        background: active ? 'var(--dark-brown)' : 'transparent',
        color: active ? 'var(--cream)' : disabled ? 'var(--tan)' : 'var(--text-muted)',
        transition:'all 0.15s', cursor: disabled ? 'not-allowed' : 'pointer',
        justifyContent: collapsed ? 'center' : 'flex-start',
        opacity: disabled ? 0.55 : 1,
        marginBottom: 2,
      }}
      onMouseEnter={e => { if (!active && !disabled) { e.currentTarget.style.background='var(--beige)'; e.currentTarget.style.color='var(--text)'; } }}
      onMouseLeave={e => { if (!active && !disabled) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)'; } }}
    >
      <span style={{ fontSize:15, width:20, textAlign:'center', flexShrink:0, fontFamily:'Inter, system-ui, sans-serif' }}>{item.icon}</span>
      {!collapsed && <span style={{ whiteSpace:'nowrap' }}>{item.label}</span>}
    </button>
  );

  const needsIdea = ['cofounder','whatif','timeline','investor-report','blueprint','competitor-gap'];

  return (
    <div style={{
      width: collapsed ? 60 : 'var(--sidebar-width)',
      background:'var(--white)', borderRight:'1.5px solid var(--sand)',
      display:'flex', flexDirection:'column', flexShrink:0,
      transition:'width 0.25s ease', overflow:'hidden',
      boxShadow:'var(--shadow-sm)',
    }}>
      {/* Header */}
      <div style={{ padding:'16px 12px', borderBottom:'1.5px solid var(--sand)', display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={() => setCollapsed(!collapsed)} style={{
          width:32, height:32, borderRadius:8, border:'none', background:'var(--beige)',
          cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center',
          color:'var(--text-muted)', flexShrink:0,
        }}>
          {collapsed ? '›' : '‹'}
        </button>
        {!collapsed && (
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:'var(--dark-brown)', whiteSpace:'nowrap' }}>
            IdeaValidator
          </span>
        )}
      </div>

      <nav style={{ padding:'12px 8px', borderBottom:'1.5px solid var(--sand)' }}>
        {!collapsed && <div style={{ fontSize:10, fontWeight:600, color:'var(--tan)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8, paddingLeft:4 }}>Main</div>}
        {NAV.map(n => <NavBtn key={n.id} item={n} active={page === n.id || (page === 'results' && n.id === 'home')} />)}
      </nav>

      <nav style={{ padding:'12px 8px', borderBottom:'1.5px solid var(--sand)' }}>
        {!collapsed && <div style={{ fontSize:10, fontWeight:600, color:'var(--tan)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8, paddingLeft:4 }}>Report</div>}
        {REPORT_TOOLS.map(n => (
          <NavBtn key={n.id} item={n} active={page === n.id} disabled={!activeIdeaId} />
        ))}
      </nav>

      <nav style={{ padding:'12px 8px', flex:1 }}>
        {!collapsed && <div style={{ fontSize:10, fontWeight:600, color:'var(--tan)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8, paddingLeft:4 }}>Tools</div>}
        {SIDEBAR_TOOLS.map(n => (
          <NavBtn key={n.id} item={n} active={page === n.id}
            disabled={needsIdea.includes(n.id) && !activeIdeaId} />
        ))}
      </nav>

      <div style={{ padding:'12px 8px', borderTop:'1.5px solid var(--sand)' }}>
        {!collapsed && (
          <div style={{ padding:'10px 12px', background:'var(--beige)', borderRadius:9, marginBottom:8 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--dark-brown)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
          </div>
        )}
        <button onClick={logout} style={{
          display:'flex', alignItems:'center', gap:10, padding: collapsed ? '10px' : '10px 12px',
          borderRadius:9, border:'none', width:'100%', textAlign:'left', fontSize:13.5,
          background:'transparent', color:'var(--danger)', cursor:'pointer', transition:'all 0.15s',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
          onMouseEnter={e => e.currentTarget.style.background='var(--danger-bg)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}
        >
          <span style={{ fontSize:15, width:20, textAlign:'center', flexShrink:0 }}>↶</span>
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  );
}
