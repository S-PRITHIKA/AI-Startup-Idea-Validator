import React, { useState } from 'react';
import { generateReportDocx } from '../utils/exportReport';

const Card = ({ children, style = {} }) => (
  <div style={{ background: 'var(--white)', borderRadius: 14, padding: 26, boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--sand)', ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ label, sub }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-brown)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>{label}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>}
  </div>
);

const DecisionBadge = ({ action }) => {
  const cfg = {
    BUILD: { bg: 'var(--success-bg)', color: 'var(--success)', border: '#A8D5BC' },
    PIVOT: { bg: 'var(--warning-bg)', color: 'var(--warning)', border: '#E8C89A' },
    DROP:  { bg: 'var(--danger-bg)',  color: 'var(--danger)',  border: '#E8B4B4' },
  };
  const c = cfg[action] || cfg.BUILD;
  return (
    <span style={{ display: 'inline-block', padding: '7px 22px', borderRadius: 22, fontSize: 13, fontWeight: 700, background: c.bg, color: c.color, border: `1.5px solid ${c.border}`, letterSpacing: '0.06em' }}>
      {action}
    </span>
  );
};

const ReportSection = ({ number, label, text }) => (
  <div>
    <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', marginBottom: 10 }}>
      <span style={{
        fontSize: 11, fontWeight: 700, color: 'var(--brown)', letterSpacing: '0.08em',
        background: 'var(--beige)', padding: '4px 10px', borderRadius: 6, flexShrink: 0,
      }}>
        SECTION {number}
      </span>
      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--dark-brown)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </span>
    </div>
    <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, paddingLeft: 2 }}>
      {text || 'No data available.'}
    </p>
  </div>
);

const Divider = () => (
  <div style={{ height: 1, background: 'var(--sand)', margin: '22px 0' }} />
);

const EmptyState = ({ onGoValidate }) => (
  <div style={{ textAlign: 'center', padding: '90px 32px' }}>
    <div style={{ fontSize: 40, color: 'var(--tan)', marginBottom: 12 }}>◆</div>
    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--dark-brown)', marginBottom: 8 }}>No Report Yet</h2>
    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
      Validate a startup idea first to generate your investor-ready report.
    </p>
    <button onClick={onGoValidate} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: 'var(--dark-brown)', color: 'var(--cream)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
      Validate an Idea
    </button>
  </div>
);

export default function InvestorReportPage({ result, onGoValidate }) {
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!result || !result.smartReport) return <EmptyState onGoValidate={onGoValidate} />;

  const r = result.smartReport;
  const decision = r.finalDecision || result.decision || {};
  const verdict = (decision.verdict || decision.action || 'BUILD').toUpperCase();
  const decisionBg = verdict === 'BUILD' ? 'var(--success-bg)' : verdict === 'DROP' ? 'var(--danger-bg)' : 'var(--warning-bg)';

  const handleDownload = async () => {
    setExporting(true);
    try { await generateReportDocx(result); }
    catch (e) { alert('Export failed: ' + e.message); }
    finally { setExporting(false); }
  };

  const handleCopy = () => {
    const text = [
      'SMART VALIDATION REPORT',
      `Idea: ${result.idea}`,
      `Score: ${result.score}/100`,
      '',
      `1. IDEA SUMMARY\n${r.ideaSummary || ''}`,
      `\n2. MARKET OPPORTUNITY\n${r.marketOpportunity || ''}`,
      `\n3. COMPETITOR ANALYSIS\n${r.competitorAnalysis || ''}`,
      `\n4. GAP OPPORTUNITIES\n${r.gapOpportunities || ''}`,
      `\n5. RISK ANALYSIS\n${r.riskAnalysis || ''}`,
      `\n6. REVENUE MODEL\n${r.revenueAnalysis || ''}`,
      `\nFINAL DECISION: ${verdict}`,
      decision.rationale || '',
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ padding: '28px', maxWidth: 880, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--dark-brown)', marginBottom: 4 }}>
            Smart Validation Report
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Investor-ready summary — present this directly to your manager or stakeholders.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleCopy} style={{
            padding: '10px 16px', borderRadius: 9, border: '1.5px solid var(--sand)',
            background: copied ? 'var(--success-bg)' : 'var(--white)',
            color: copied ? 'var(--success)' : 'var(--text-muted)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {copied ? 'Copied' : 'Copy text'}
          </button>
          <button onClick={handleDownload} disabled={exporting} style={{
            padding: '10px 18px', borderRadius: 9, border: 'none',
            background: 'var(--dark-brown)', color: 'var(--cream)',
            fontSize: 13, fontWeight: 600, cursor: exporting ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, opacity: exporting ? 0.7 : 1,
          }}>
            <span style={{ fontSize: 14 }}>↓</span>
            {exporting ? 'Generating…' : 'Download Report (.docx)'}
          </button>
        </div>
      </div>

      {/* Cover Card */}
      <Card style={{ marginBottom: 22, borderLeft: '4px solid var(--brown)', background: 'linear-gradient(135deg, var(--beige) 0%, var(--white) 60%)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--tan)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Startup Idea</div>
            <p style={{ fontSize: 15, color: 'var(--dark-brown)', fontWeight: 600, lineHeight: 1.6 }}>{result.idea}</p>
            {result.improvedIdea && (
              <p style={{ fontSize: 13, color: 'var(--brown)', fontStyle: 'italic', marginTop: 10, lineHeight: 1.6 }}>
                Refined: {result.improvedIdea}
              </p>
            )}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14 }}>
              Prepared {new Date(result.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0, paddingLeft: 16, borderLeft: '1px solid var(--sand)' }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: result.score >= 70 ? 'var(--success)' : result.score >= 45 ? 'var(--warning)' : 'var(--danger)', fontFamily: "'Playfair Display',serif", lineHeight: 1 }}>
              {result.score}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>/ 100</div>
            <div style={{ marginTop: 10 }}>
              <DecisionBadge action={verdict} />
            </div>
          </div>
        </div>
      </Card>

      {/* Six Sections */}
      <Card style={{ marginBottom: 22 }}>
        <SectionTitle label="Validation Report" sub="Six-section investor-ready breakdown" />
        <ReportSection number="1" label="Idea Summary"        text={r.ideaSummary} />
        <Divider />
        <ReportSection number="2" label="Market Opportunity"  text={r.marketOpportunity} />
        <Divider />
        <ReportSection number="3" label="Competitor Analysis" text={r.competitorAnalysis} />
        <Divider />
        <ReportSection number="4" label="Gap Opportunities"   text={r.gapOpportunities} />
        <Divider />
        <ReportSection number="5" label="Risk Analysis"       text={r.riskAnalysis} />
        <Divider />
        <ReportSection number="6" label="Revenue Model"       text={r.revenueAnalysis} />
      </Card>

      {/* Final Decision */}
      <Card style={{ background: decisionBg, borderLeft: '4px solid var(--brown)', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <SectionTitle label="Final Decision" sub="Build / Pivot / Drop verdict" />
          <div style={{ marginLeft: 'auto' }}><DecisionBadge action={verdict} /></div>
        </div>
        <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.85, fontWeight: 500 }}>
          {decision.rationale || (decision.reasons || []).join(' ') || 'Based on the analysis, proceed with confidence.'}
        </p>
        {decision.pivotSuggestion && verdict === 'PIVOT' && (
          <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--white)', borderRadius: 10, fontSize: 13, color: 'var(--warning)', lineHeight: 1.6, border: '1px solid #E8C89A' }}>
            <strong>Suggested Pivot —</strong> {decision.pivotSuggestion}
          </div>
        )}
      </Card>

      {/* Pitch Deck Starter */}
      {result.pitchDeck && (
        <Card>
          <SectionTitle label="Appendix · Pitch Deck Starter" sub="Ready-to-use slide content" />
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { label: 'Elevator Pitch',    text: result.pitchDeck.elevatorPitch },
              { label: 'Problem Statement', text: result.pitchDeck.problemStatement },
              { label: 'Solution',          text: result.pitchDeck.solutionSummary },
            ].map((item, i) => item.text && (
              <div key={i} style={{ background: 'var(--beige)', borderRadius: 11, padding: '14px 18px', borderLeft: '3px solid var(--brown)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-brown)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{item.label}</div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
