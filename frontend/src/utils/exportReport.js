// Generate an investor-ready Smart Validation Report as a .docx file.
// Uses the `docx` library on the client, then triggers a download via file-saver.

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  PageNumber, Header, Footer, LevelFormat,
} from 'docx';
import { saveAs } from 'file-saver';

const BROWN = '4A3728';
const LIGHT_BROWN = '8B6F47';
const TAN = 'C9B99A';
const SAND = 'E5DDD3';
const TEXT = '1A1208';
const MUTED = '7A6A58';
const SUCCESS = '2D7D5A';
const WARNING = 'B86B2A';
const DANGER = 'A03030';

const verdictColor = (v) =>
  v === 'BUILD' ? SUCCESS : v === 'DROP' ? DANGER : WARNING;

const heading = (text, level = HeadingLevel.HEADING_1) =>
  new Paragraph({
    heading: level,
    spacing: { before: 280, after: 140 },
    children: [
      new TextRun({ text, bold: true, color: BROWN, font: 'Calibri' }),
    ],
  });

const sectionLabel = (number, label) =>
  new Paragraph({
    spacing: { before: 320, after: 100 },
    border: { bottom: { color: SAND, space: 4, style: BorderStyle.SINGLE, size: 6 } },
    children: [
      new TextRun({ text: `${number}.  `, bold: true, color: LIGHT_BROWN, size: 26, font: 'Calibri' }),
      new TextRun({ text: label.toUpperCase(), bold: true, color: BROWN, size: 26, font: 'Calibri', characterSpacing: 30 }),
    ],
  });

const body = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 140, line: 320 },
    alignment: AlignmentType.JUSTIFIED,
    children: [
      new TextRun({ text: text || '—', color: TEXT, size: 22, font: 'Calibri', ...opts }),
    ],
  });

const bullet = (text) =>
  new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 80, line: 300 },
    children: [new TextRun({ text, color: TEXT, size: 22, font: 'Calibri' })],
  });

const small = (text, color = MUTED) =>
  new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, color, size: 18, italics: true, font: 'Calibri' })],
  });

const kvCell = (label, value, color = TEXT) =>
  new TableCell({
    width: { size: 4500, type: WidthType.DXA },
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    shading: { fill: 'FAF8F5', type: ShadingType.CLEAR, color: 'auto' },
    children: [
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: label.toUpperCase(), bold: true, color: MUTED, size: 16, font: 'Calibri', characterSpacing: 30 })],
      }),
      new Paragraph({
        children: [new TextRun({ text: value || '—', bold: true, color, size: 28, font: 'Calibri' })],
      }),
    ],
  });

export async function generateReportDocx(result) {
  if (!result) throw new Error('No result to export');
  const r = result.smartReport || {};
  const decision = r.finalDecision || result.decision || {};
  const verdict = (decision.verdict || decision.action || 'BUILD').toUpperCase();
  const score = result.score ?? 0;
  const date = new Date(result.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // Multi-paragraph helper for long text
  const paragraphs = (text) => {
    const t = (text || '').trim();
    if (!t) return [body('No data available.')];
    return t.split(/\n\s*\n/).map((chunk) => body(chunk.trim()));
  };

  const children = [];

  // ---- Cover ----
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 100 },
      children: [new TextRun({ text: 'SMART VALIDATION REPORT', bold: true, color: BROWN, size: 44, font: 'Calibri', characterSpacing: 60 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: 'Investor-Ready Startup Analysis', color: LIGHT_BROWN, size: 24, italics: true, font: 'Calibri' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [new TextRun({ text: `Prepared on ${date}`, color: MUTED, size: 20, font: 'Calibri' })],
    }),
  );

  // ---- KPI table: Score | Decision ----
  children.push(
    new Table({
      width: { size: 9000, type: WidthType.DXA },
      columnWidths: [4500, 4500],
      rows: [
        new TableRow({
          children: [
            kvCell('Overall Score', `${score} / 100`, verdictColor(verdict === 'BUILD' ? 'BUILD' : verdict)),
            kvCell('Final Decision', verdict, verdictColor(verdict)),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun('')] }),
  );

  // ---- Idea ----
  children.push(
    sectionLabel('1', 'Idea Summary'),
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: 'Original Idea', bold: true, color: LIGHT_BROWN, size: 20, font: 'Calibri' })],
    }),
    body(result.idea),
  );
  if (result.improvedIdea) {
    children.push(
      new Paragraph({
        spacing: { before: 160, after: 100 },
        children: [new TextRun({ text: 'AI-Improved Version', bold: true, color: LIGHT_BROWN, size: 20, font: 'Calibri' })],
      }),
      body(result.improvedIdea, { italics: true, color: LIGHT_BROWN }),
    );
  }
  if (r.ideaSummary) children.push(small('Executive summary'), ...paragraphs(r.ideaSummary));

  // ---- Market ----
  children.push(sectionLabel('2', 'Market Opportunity'));
  children.push(...paragraphs(r.marketOpportunity));
  if (result.audience?.persona) {
    children.push(
      new Paragraph({ spacing: { before: 140, after: 80 }, children: [new TextRun({ text: 'Target Persona', bold: true, color: LIGHT_BROWN, size: 20, font: 'Calibri' })] }),
      body(result.audience.persona, { italics: true }),
    );
  }
  (result.audience?.painPoints || []).slice(0, 6).forEach((p) => children.push(bullet(p)));

  // ---- Competitor analysis ----
  children.push(sectionLabel('3', 'Competitor Analysis'));
  children.push(...paragraphs(r.competitorAnalysis));
  const proofs = result.proofValidation?.competitorEvidence || [];
  if (proofs.length) {
    children.push(small('Verified competitor references'));
    proofs.slice(0, 6).forEach((p) =>
      children.push(bullet(`${p.name || 'Competitor'} — ${p.note || p.url || ''}`))
    );
  }

  // ---- Gaps ----
  children.push(sectionLabel('4', 'Gap Opportunities'));
  children.push(...paragraphs(r.gapOpportunities));

  // ---- Risk ----
  children.push(sectionLabel('5', 'Risk Analysis'));
  children.push(...paragraphs(r.riskAnalysis));
  (result.risks || []).slice(0, 5).forEach((rk) => {
    if (typeof rk === 'string') children.push(bullet(rk));
    else if (rk?.risk) children.push(bullet(`${rk.risk}${rk.mitigation ? ' — Mitigation: ' + rk.mitigation : ''}`));
  });

  // ---- Revenue ----
  children.push(sectionLabel('6', 'Revenue Model'));
  children.push(...paragraphs(r.revenueAnalysis));
  if (result.revenueModel?.streams?.length) {
    children.push(small('Suggested revenue streams'));
    result.revenueModel.streams.slice(0, 5).forEach((s) =>
      children.push(bullet(typeof s === 'string' ? s : `${s.name || 'Stream'} — ${s.detail || ''}`))
    );
  }

  // ---- Final Decision ----
  children.push(
    new Paragraph({
      spacing: { before: 360, after: 120 },
      border: { bottom: { color: BROWN, space: 4, style: BorderStyle.SINGLE, size: 12 } },
      children: [
        new TextRun({ text: 'FINAL DECISION', bold: true, color: BROWN, size: 28, font: 'Calibri', characterSpacing: 40 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 160 },
      children: [
        new TextRun({ text: `  ${verdict}  `, bold: true, color: 'FFFFFF', size: 36, font: 'Calibri', shading: { type: ShadingType.CLEAR, color: 'auto', fill: verdictColor(verdict) } }),
      ],
    }),
    body(decision.rationale || (decision.reasons || []).join(' ') || 'Proceed based on the analysis above.'),
  );
  if (decision.pivotSuggestion) {
    children.push(
      new Paragraph({ spacing: { before: 120, after: 80 }, children: [new TextRun({ text: 'Suggested Pivot', bold: true, color: WARNING, size: 20, font: 'Calibri' })] }),
      body(decision.pivotSuggestion),
    );
  }

  // ---- Optional: Pitch deck appendix ----
  if (result.pitchDeck) {
    children.push(heading('Appendix · Pitch Deck Starter', HeadingLevel.HEADING_2));
    [
      ['Elevator Pitch', result.pitchDeck.elevatorPitch],
      ['Problem Statement', result.pitchDeck.problemStatement],
      ['Solution', result.pitchDeck.solutionSummary],
    ].forEach(([k, v]) => {
      if (!v) return;
      children.push(
        new Paragraph({ spacing: { before: 140, after: 60 }, children: [new TextRun({ text: k, bold: true, color: LIGHT_BROWN, size: 20, font: 'Calibri' })] }),
        body(v),
      );
    });
  }

  const doc = new Document({
    creator: 'IdeaValidator',
    title: 'Smart Validation Report',
    description: 'Investor-ready startup validation report',
    styles: {
      default: { document: { run: { font: 'Calibri', size: 22 } } },
    },
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '\u2022',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 540, hanging: 240 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1100, bottom: 1100, left: 1300, right: 1300 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'IdeaValidator  ·  Smart Validation Report', color: TAN, size: 16, font: 'Calibri' })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Page ', color: MUTED, size: 16, font: 'Calibri' }),
                  new TextRun({ children: [PageNumber.CURRENT], color: MUTED, size: 16, font: 'Calibri' }),
                  new TextRun({ text: ' of ', color: MUTED, size: 16, font: 'Calibri' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], color: MUTED, size: 16, font: 'Calibri' }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safe = (result.idea || 'idea').replace(/[^a-z0-9]+/gi, '-').slice(0, 40).toLowerCase();
  saveAs(blob, `validation-report-${safe || 'startup'}.docx`);
}
