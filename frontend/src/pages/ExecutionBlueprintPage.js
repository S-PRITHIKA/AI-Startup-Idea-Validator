import React from 'react';

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
    <div style={{ fontSize: 40, color: 'var(--tan)', marginBottom: 12 }}>▣</div>
    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--dark-brown)', marginBottom: 8 }}>No Blueprint Yet</h2>
    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
      Validate a startup idea first to generate your step-by-step execution plan.
    </p>
    <button onClick={onGoValidate} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: 'var(--dark-brown)', color: 'var(--cream)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
      Validate an Idea
    </button>
  </div>
);

export default function ExecutionBlueprintPage({ result, onGoValidate }) {
  if (!result || !result.executionBlueprint) return <EmptyState onGoValidate={onGoValidate} />;

  const bp = result.executionBlueprint;

  return (
    <div style={{ padding: '28px', maxWidth: 960, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--dark-brown)', marginBottom: 4 }}>
          Execution Blueprint
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          A step-by-step plan to actually build this startup — tech stack, features, timeline, and tools.
        </p>
        {result.idea && (
          <div style={{ marginTop: 12, padding: '10px 16px', background: 'var(--beige)', borderRadius: 9, fontSize: 13, color: 'var(--brown)', fontStyle: 'italic', borderLeft: '3px solid var(--brown)' }}>
            {result.idea}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {bp.estimatedBudget && (
          <Card style={{ borderLeft: '4px solid var(--success)', background: 'var(--success-bg)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6 }}>Estimated Budget</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)', fontFamily: "'Playfair Display',serif" }}>{bp.estimatedBudget}</div>
          </Card>
        )}
        {(bp.teamNeeded || []).length > 0 && (
          <Card style={{ borderLeft: '4px solid var(--warning)', background: 'var(--warning-bg)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10 }}>Team Needed</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {bp.teamNeeded.map((t, i) => (
                <span key={i} style={{ background: 'var(--warning)', color: 'white', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </Card>
        )}
      </div>

      {bp.techStack && (
        <Card style={{ marginBottom: 20, borderLeft: '4px solid var(--blue)' }}>
          <SectionTitle label="Tech Stack" sub="Recommended technologies to build your MVP" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {Object.entries(bp.techStack).map(([cat, items]) =>
              (items || []).length > 0 && (
                <div key={cat} style={{ background: 'var(--beige)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: 8, fontWeight: 600 }}>
                    {cat.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(items || []).map((item, i) => (
                      <span key={i} style={{ background: 'var(--blue-bg)', color: 'var(--blue)', padding: '3px 9px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{item}</span>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </Card>
      )}

      {(bp.mvpFeatures || []).length > 0 && (
        <Card style={{ marginBottom: 20, borderLeft: '4px solid var(--success)' }}>
          <SectionTitle label="MVP Features" sub="Minimum features to launch and validate" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {bp.mvpFeatures.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', background: 'var(--success-bg)', borderRadius: 10 }}>
                <span style={{ background: 'var(--success)', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(bp.timeline || []).length > 0 && (
        <Card style={{ marginBottom: 20, borderLeft: '4px solid var(--brown)' }}>
          <SectionTitle label="Build Timeline" sub="Phase-by-phase roadmap to launch" />
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 10, top: 8, bottom: 8, width: 2, background: 'linear-gradient(to bottom, var(--brown), var(--sand))' }} />
            {bp.timeline.map((t, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 20, paddingLeft: 18 }}>
                <div style={{ position: 'absolute', left: -26, top: 4, width: 16, height: 16, borderRadius: '50%', background: 'var(--brown)', border: '3px solid var(--white)', boxShadow: '0 0 0 2px var(--sand)' }} />
                <div style={{ background: 'var(--beige)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brown)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.phase}</span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--dark-brown)', fontWeight: 600, marginBottom: 4 }}>{t.milestone}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>Deliverable — {t.deliverable}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(bp.tools || []).length > 0 && (
        <Card style={{ borderLeft: '4px solid var(--warning)' }}>
          <SectionTitle label="Recommended Tools" sub="Best tools for each part of your build" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {bp.tools.map((t, i) => (
              <div key={i} style={{ background: 'var(--beige)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>{t.category}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark-brown)', marginBottom: 4 }}>{t.tool}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{t.why}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
