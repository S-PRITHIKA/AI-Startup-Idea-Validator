import React, { useState } from 'react';

const Card = ({ children, style = {} }) => (
  <div style={{ background: 'var(--white)', borderRadius: 14, padding: 24, boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--sand)', ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ label, sub }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-brown)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>{label}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>}
  </div>
);

const EmptyState = ({ onGoValidate }) => (
  <div style={{ textAlign: 'center', padding: '90px 32px' }}>
    <div style={{ fontSize: 40, color: 'var(--tan)', marginBottom: 12 }}>◎</div>
    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--dark-brown)', marginBottom: 8 }}>No Competitor Data</h2>
    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
      Validate a startup idea first to see who your competitors are and what gaps they leave open.
    </p>
    <button onClick={onGoValidate} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: 'var(--dark-brown)', color: 'var(--cream)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
      Validate an Idea
    </button>
  </div>
);

export default function CompetitorGapPage({ result, onGoValidate }) {
  const [activeGap, setActiveGap] = useState(null);

  if (!result) return <EmptyState onGoValidate={onGoValidate} />;

  const gaps = result.competitorGaps || [];
  const competitors = result.proofValidation?.competitorEvidence || result.similarStartups || [];
  const hasData = gaps.length > 0 || competitors.length > 0;

  if (!hasData) return <EmptyState onGoValidate={onGoValidate} />;

  return (
    <div style={{ padding: '28px', maxWidth: 1000, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--dark-brown)', marginBottom: 4 }}>
          Competitor Gap Finder
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Not just who exists — but what they are missing, and where your opportunity lies.
        </p>
        {result.idea && (
          <div style={{ marginTop: 12, padding: '10px 16px', background: 'var(--beige)', borderRadius: 9, fontSize: 13, color: 'var(--brown)', fontStyle: 'italic', borderLeft: '3px solid var(--brown)' }}>
            {result.idea}
          </div>
        )}
      </div>

      {gaps.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionTitle label="Gaps → Opportunities" sub="Each gap is a door your competitors left open" />
          <div style={{ display: 'grid', gap: 14 }}>
            {gaps.map((g, i) => {
              const isOpen = activeGap === i;
              return (
                <div key={i} onClick={() => setActiveGap(isOpen ? null : i)}
                  style={{
                    background: 'var(--white)',
                    border: isOpen ? '2px solid var(--brown)' : '1.5px solid var(--sand)',
                    borderRadius: 12, padding: '18px 20px', cursor: 'pointer',
                    transition: 'all 0.2s', boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  }}
                  onMouseEnter={e => { if (!isOpen) e.currentTarget.style.borderColor = 'var(--tan)'; }}
                  onMouseLeave={e => { if (!isOpen) e.currentTarget.style.borderColor = 'var(--sand)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 9, background: 'var(--beige)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--brown)' }}>
                      {(g.competitor || 'C')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark-brown)', marginBottom: 2 }}>{g.competitor}</div>
                      <div style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>
                        Gap — {g.gap}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, fontSize: 12, color: 'var(--text-muted)', background: 'var(--beige)', borderRadius: 8, padding: '6px 12px', fontWeight: 600 }}>
                      {isOpen ? '–' : '+'}
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ marginTop: 16, borderTop: '1px solid var(--sand)', paddingTop: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div style={{ background: 'var(--danger-bg)', borderRadius: 10, padding: '12px 14px' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Their Gap</div>
                          <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{g.gap}</p>
                        </div>
                        <div style={{ background: 'var(--success-bg)', borderRadius: 10, padding: '12px 14px' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Your Opportunity</div>
                          <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{g.opportunity}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {competitors.length > 0 && (
        <Card style={{ marginBottom: 20, borderLeft: '4px solid var(--blue)' }}>
          <SectionTitle label="Competitors with Proof" sub="Validated competitors with evidence of traction" />
          <div style={{ display: 'grid', gap: 14 }}>
            {competitors.map((c, i) => (
              <div key={i} style={{ background: 'var(--beige)', borderRadius: 11, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark-brown)' }}>{c.name}</span>
                  {c.url && (
                    <a href={c.url.startsWith('http') ? c.url : `https://${c.url}`} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ fontSize: 11, color: 'var(--blue)', background: 'var(--blue-bg)', padding: '2px 9px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>
                      Visit ↗
                    </a>
                  )}
                  {(c.fundingOrTraction) && (
                    <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginLeft: 'auto' }}>
                      {c.fundingOrTraction}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.relevance || c.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {result.overlapPercentage !== undefined && (
        <Card style={{ marginTop: 20, borderLeft: '4px solid var(--warning)' }}>
          <SectionTitle label="Market Overlap" sub="How crowded is this space?" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 44, fontWeight: 700, fontFamily: "'Playfair Display',serif", color: result.overlapPercentage > 70 ? 'var(--danger)' : result.overlapPercentage > 40 ? 'var(--warning)' : 'var(--success)' }}>
                {result.overlapPercentage}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>similar to existing</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 10, background: 'var(--sand)', borderRadius: 5, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: `${result.overlapPercentage}%`, borderRadius: 5, transition: 'width 1s ease',
                  background: result.overlapPercentage > 70 ? 'var(--danger)' : result.overlapPercentage > 40 ? 'var(--warning)' : 'var(--success)' }} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{result.overlapExplanation}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
