import React, { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { generateReportDocx } from '../utils/exportReport';

const Card = ({ children, style = {} }) => (
  <div style={{ background: 'var(--white)', borderRadius: 14, padding: 24, boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--sand)', ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ label, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-brown)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>{label}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
  </div>
);

const ScoreRing = ({ score }) => {
  const color = score >= 70 ? 'var(--success)' : score >= 45 ? 'var(--warning)' : 'var(--danger)';
  const label = score >= 70 ? 'Promising' : score >= 45 ? 'Moderate' : 'Challenging';
  const r = 58, circ = 2 * Math.PI * r;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={r} fill="none" stroke="var(--sand)" strokeWidth={11} />
        <circle cx={70} cy={70} r={r} fill="none" stroke={color} strokeWidth={11}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round" transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
        <text x={70} y={65} textAnchor="middle" fill={color} fontSize={30} fontWeight={700} fontFamily="Playfair Display,serif">{score}</text>
        <text x={70} y={82} textAnchor="middle" fill="var(--text-muted)" fontSize={11}>/100</text>
      </svg>
      <div style={{ fontSize: 14, fontWeight: 600, color }}>{label}</div>
    </div>
  );
};

const DecisionBadge = ({ action }) => {
  const cfg = {
    BUILD: { bg: 'var(--success-bg)', color: 'var(--success)', border: '#A8D5BC' },
    PIVOT: { bg: 'var(--warning-bg)', color: 'var(--warning)', border: '#E8C89A' },
    DROP:  { bg: 'var(--danger-bg)',  color: 'var(--danger)',  border: '#E8B4B4' },
  };
  const c = cfg[action] || cfg.BUILD;
  return (
    <span style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 22, fontSize: 13, fontWeight: 700, background: c.bg, color: c.color, border: `1.5px solid ${c.border}`, letterSpacing: '0.06em' }}>
      {action}
    </span>
  );
};

const ShortcutCard = ({ glyph, label, sub, onClick }) => (
  <button onClick={onClick} style={{
    background: 'var(--white)', borderRadius: 12, padding: '16px 18px',
    border: '1.5px solid var(--sand)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: 14, width: '100%',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brown)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--sand)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--beige)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--brown)', fontWeight: 700, flexShrink: 0 }}>
      {glyph}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark-brown)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{sub}</div>
    </div>
    <span style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--tan)' }}>→</span>
  </button>
);

export default function ResultsPage({ result, onBack, onNavigate }) {
  const [exporting, setExporting] = useState(false);

  const radarData = result.scoreBreakdown ? [
    { subject: 'Market',      A: result.scoreBreakdown.marketDemand },
    { subject: 'Innovation',  A: result.scoreBreakdown.innovation },
    { subject: 'Scalability', A: result.scoreBreakdown.scalability },
    { subject: 'Feasibility', A: result.scoreBreakdown.feasibility },
    { subject: 'Safety',      A: 100 - (result.scoreBreakdown.risk || 50) },
  ] : [];

  const handleDownload = async () => {
    setExporting(true);
    try { await generateReportDocx(result); }
    catch (e) { alert('Export failed: ' + e.message); }
    finally { setExporting(false); }
  };

  return (
    <div style={{ padding: '28px', maxWidth: 1140, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, animation: 'fadeIn 0.4s ease', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ background: 'var(--white)', border: '1.5px solid var(--sand)', borderRadius: 9, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--tan)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--sand)'}
        >← New Idea</button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--dark-brown)' }}>Analysis Overview</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {new Date(result.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          {result.decision?.action && <DecisionBadge action={result.decision.action} />}
          <button onClick={handleDownload} disabled={exporting} style={{
            padding: '10px 18px', borderRadius: 9, border: 'none',
            background: 'var(--dark-brown)', color: 'var(--cream)',
            fontSize: 13, fontWeight: 600, cursor: exporting ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, opacity: exporting ? 0.7 : 1,
          }}>
            <span style={{ fontSize: 14 }}>↓</span>
            {exporting ? 'Generating…' : 'Download Report'}
          </button>
        </div>
      </div>

      {/* Score + Idea */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 18, marginBottom: 18, animation: 'fadeIn 0.4s ease' }}>
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Overall Score</div>
          <ScoreRing score={result.score} />
          {result.verdict && <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.6 }}>"{result.verdict}"</p>}
        </Card>
        <Card>
          <SectionTitle label="Your Idea" />
          <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: 14, marginBottom: 18 }}>{result.idea}</p>
          {result.improvedIdea && (
            <>
              <div style={{ height: 1, background: 'var(--sand)', margin: '0 0 18px' }} />
              <SectionTitle label="AI-Improved Version" sub="Refined for clarity & focus" />
              <p style={{ color: 'var(--brown)', lineHeight: 1.8, fontSize: 14, fontStyle: 'italic' }}>{result.improvedIdea}</p>
            </>
          )}
        </Card>
      </div>

      {/* Radar */}
      {radarData.length > 0 && (
        <Card style={{ marginBottom: 18, animation: 'fadeIn 0.4s 0.1s ease both' }}>
          <SectionTitle label="Score Breakdown" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--sand)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: 'var(--text-muted)', fontFamily: 'Inter' }} />
                <Radar dataKey="A" stroke="var(--brown)" fill="var(--brown)" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip formatter={v => [`${v}/100`]} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(result.scoreBreakdown || {}).map(([k, v]) => {
                const labels = { marketDemand: 'Market Demand', innovation: 'Innovation', scalability: 'Scalability', feasibility: 'Feasibility', risk: 'Risk Level' };
                const isRisk = k === 'risk';
                const c = isRisk ? (v > 60 ? 'var(--danger)' : 'var(--warning)') : v >= 70 ? 'var(--success)' : v >= 45 ? 'var(--warning)' : 'var(--danger)';
                return (
                  <div key={k}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--text)' }}>{labels[k] || k}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: c }}>{v}/100</span>
                    </div>
                    <div style={{ height: 7, background: 'var(--sand)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${v}%`, background: c, borderRadius: 4, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Sidebar shortcuts */}
      <div style={{ marginBottom: 22, animation: 'fadeIn 0.4s 0.15s ease both' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tan)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>
          Open Detailed Reports
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          <ShortcutCard glyph="◆" label="Smart Validation Report"
            sub="6-section investor-ready breakdown + downloadable .docx"
            onClick={() => onNavigate('investor-report')} />
          <ShortcutCard glyph="▣" label="Execution Blueprint"
            sub="Tech stack, MVP features, timeline & tools"
            onClick={() => onNavigate('blueprint')} />
          <ShortcutCard glyph="◎" label="Competitor Gap Finder"
            sub="What competitors miss — your opportunity"
            onClick={() => onNavigate('competitor-gap')} />
          <ShortcutCard glyph="◐" label="AI Co-Founder Chat"
            sub="Brainstorm next steps with the assistant"
            onClick={() => onNavigate('cofounder')} />
          <ShortcutCard glyph="⇋" label="What-If Simulator"
            sub="Stress-test your idea with scenarios"
            onClick={() => onNavigate('whatif')} />
          <ShortcutCard glyph="◷" label="Idea Timeline"
            sub="See how your idea evolved over versions"
            onClick={() => onNavigate('timeline')} />
        </div>
      </div>

      {/* Decision summary */}
      {result.decision && (
        <Card style={{ animation: 'fadeIn 0.4s 0.2s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <SectionTitle label="Build / Pivot / Drop" sub="Final verdict — see the full report for rationale" />
            <div style={{ marginLeft: 'auto' }}><DecisionBadge action={result.decision.action} /></div>
          </div>
          {(result.decision.reasons || []).slice(0, 3).map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ color: 'var(--brown)', flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
              <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{r}</span>
            </div>
          ))}
          <button onClick={() => onNavigate('investor-report')} style={{
            marginTop: 12, padding: '10px 18px', borderRadius: 9, border: '1.5px solid var(--brown)',
            background: 'transparent', color: 'var(--brown)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            View Full Validation Report →
          </button>
        </Card>
      )}
    </div>
  );
}
