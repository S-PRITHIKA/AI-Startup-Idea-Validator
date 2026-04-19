// Gemini service — robust with model fallback, retries, and clear errors.
// Uses the REST API directly (no SDK) so we control the endpoint, error body,
// and can fall back across models without SDK version surprises.

const DEFAULT_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
  'gemini-pro-latest',
];

function requireKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key.includes('your-gemini-api-key')) {
    const e = new Error(
      'GEMINI_API_KEY is not set. Open backend/.env and set GEMINI_API_KEY=<your key from https://aistudio.google.com/app/apikey>'
    );
    e.code = 'NO_API_KEY';
    throw e;
  }
  return key.trim();
}

function getModelList() {
  const env = (process.env.GEMINI_MODEL || '').trim();
  if (env) return [env, ...DEFAULT_MODELS.filter(m => m !== env)];
  return DEFAULT_MODELS;
}

async function callGeminiOnce(model, prompt, key, { temperature = 0.7, maxOutputTokens = 8192 } = {}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature, maxOutputTokens, responseMimeType: 'text/plain' },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let data;
  try { data = await res.json(); } catch { data = null; }

  if (!res.ok) {
    const apiMsg = data?.error?.message || res.statusText || 'Unknown error';
    const status = data?.error?.status || res.status;
    const err = new Error(`Gemini API error [${model}] ${status}: ${apiMsg}`);
    err.status = res.status;
    err.gemini = data?.error || null;
    throw err;
  }

  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts) || parts.length === 0) {
    const finish = data?.candidates?.[0]?.finishReason;
    if (finish === 'SAFETY') {
      const err = new Error(`Gemini blocked the prompt for SAFETY (model ${model}). Try rephrasing the idea.`);
      err.status = 400;
      throw err;
    }
    const err = new Error(`Gemini returned no content (model ${model}, finishReason=${finish || 'unknown'})`);
    throw err;
  }

  const text = parts.map(p => p?.text || '').join('').trim();
  if (!text) throw new Error(`Gemini returned empty text (model ${model})`);
  const finishReason = data?.candidates?.[0]?.finishReason;
  if (finishReason === 'MAX_TOKENS') {
    console.warn(`[gemini] ${model} hit MAX_TOKENS — output truncated (${text.length} chars). Will attempt JSON repair.`);
  }
  return text;
}

async function callGemini(prompt, opts = {}) {
  const key = requireKey();
  const models = getModelList();
  let lastErr;
  for (const model of models) {
    try {
      return await callGeminiOnce(model, prompt, key, opts);
    } catch (e) {
      lastErr = e;
      const status = e.status;
      if (status === 400 && /API key/i.test(e.message)) throw e;
      if (status === 401 || status === 403) throw e;
      if (status && ![404, 429, 500, 502, 503, 504].includes(status)) throw e;
      console.warn(`[gemini] ${model} failed (${status || 'no status'}): ${e.message}. Trying next model...`);
    }
  }
  throw lastErr || new Error('All Gemini models failed');
}

function repairTruncatedJSON(src) {
  let inStr = false, esc = false;
  const stack = [];
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (inStr) {
      if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; continue; }
    if (c === '{' || c === '[') stack.push(c);
    else if (c === '}' || c === ']') stack.pop();
  }
  let out = src;
  if (inStr) out += '"';
  out = out.replace(/[,:\s]+$/, '');
  out = out.replace(/,\s*"[^"]*"\s*$/, '');
  out = out.replace(/,\s*"[^"]*$/, '');
  while (stack.length) {
    const open = stack.pop();
    out += open === '{' ? '}' : ']';
  }
  out = out.replace(/,(\s*[}\]])/g, '$1');
  return out;
}

function parseJSON(text) {
  let clean = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  const first = clean.indexOf('{');
  const last = clean.lastIndexOf('}');
  if (first === -1) throw new Error(`Gemini did not return JSON. Raw response starts with: ${text.slice(0, 200)}`);
  let candidate = last > first ? clean.slice(first, last + 1) : clean.slice(first);
  try { return JSON.parse(candidate); } catch (_) {}
  try { return JSON.parse(candidate.replace(/,(\s*[}\]])/g, '$1')); } catch (_) {}
  try {
    const repaired = repairTruncatedJSON(candidate);
    return JSON.parse(repaired);
  } catch (e2) {
    throw new Error(`Failed to parse Gemini JSON: ${e2.message}. Raw: ${candidate.slice(0, 300)}`);
  }
}

async function healthCheck() {
  const key = requireKey();
  const models = getModelList();
  const attempts = [];
  for (const model of models) {
    try {
      const text = await callGeminiOnce(model, 'Reply with just the word: OK', key, { temperature: 0, maxOutputTokens: 8 });
      return { ok: true, model, sample: text, attempts };
    } catch (e) {
      attempts.push({ model, status: e.status || null, error: e.message });
      if (e.status === 401 || e.status === 403) {
        const err = new Error(e.message);
        err.attempts = attempts;
        throw err;
      }
    }
  }
  const err = new Error('No Gemini model responded successfully');
  err.attempts = attempts;
  throw err;
}

function clampInt(v, lo, hi, fallback) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(lo, Math.min(hi, n));
}

// ---------- CORE ANALYSIS (call #1) ----------
async function analyzeCore(idea, founderProfile) {
  const founderSection = founderProfile
    ? `\nFounder Profile:\n- Skills: ${(founderProfile.skills || []).join(', ') || 'not specified'}\n- Interests: ${(founderProfile.interests || []).join(', ') || 'not specified'}`
    : '\nFounder Profile: not provided (set fitScore to 50 and leave strengths/gaps empty arrays).';

  const prompt = `You are a senior startup analyst and venture-capital expert. Analyze this startup idea rigorously and return ONLY valid JSON. No markdown, no commentary, no code fences.

Startup Idea: """${idea}"""${founderSection}

Required JSON shape (every field MUST be present):
{
  "score": <integer 1-100>,
  "verdict": "<one clear sentence>",
  "scoreBreakdown": {
    "marketDemand": <1-100>,
    "innovation": <1-100>,
    "scalability": <1-100>,
    "feasibility": <1-100>,
    "risk": <1-100, where 100 means very risky>
  },
  "feedback": {
    "investor": "<2-3 sentences on ROI, market size, funding potential>",
    "customer": "<2-3 sentences on pain points, usability, value>",
    "competitor": "<2-3 sentences on gaps, threats, differentiation>"
  },
  "improvedIdea": "<3-4 sentence sharper, more niche version>",
  "risks": ["<risk 1>", "<risk 2>", "<risk 3>", "<risk 4>", "<risk 5>"],
  "revenueModel": "<3-4 sentences with concrete pricing>",
  "audience": {
    "ageGroup": "<range>",
    "location": "<primary geos>",
    "painPoints": ["<p1>", "<p2>", "<p3>"],
    "persona": "<2-3 sentences>"
  },
  "similarStartups": [
    {"name": "<real company>", "description": "<one sentence>", "url": "<https URL of their website>"},
    {"name": "<real company>", "description": "<one sentence>", "url": "<https URL>"},
    {"name": "<real company>", "description": "<one sentence>", "url": "<https URL>"}
  ],
  "pitchDeck": {
    "elevatorPitch": "<2 sentences>",
    "problemStatement": "<2 sentences>",
    "solutionSummary": "<2-3 sentences>"
  },
  "overlapPercentage": <integer 0-100>,
  "overlapExplanation": "<2-3 sentences with concrete references>",
  "decision": {
    "action": "<BUILD or PIVOT or DROP>",
    "reasons": ["<reason 1>", "<reason 2>", "<reason 3>"],
    "pivotSuggestion": "<if PIVOT, the recommended pivot; otherwise empty string>"
  },
  "founderFit": {
    "fitScore": <1-100>,
    "strengths": ["<strength 1>", "<strength 2>"],
    "gaps": ["<gap 1>", "<gap 2>"],
    "verdict": "<2 sentences>"
  },
  "competitorGaps": [
    {"competitor": "<name>", "gap": "<what they miss>", "opportunity": "<your angle>"},
    {"competitor": "<name>", "gap": "<what they miss>", "opportunity": "<your angle>"}
  ],
  "marketSignals": {
    "trendScore": <1-100>,
    "summary": "<2-3 sentences on current demand and trajectory>"
  }
}

Use real, verifiable competitor names with plausible https:// URLs.`;

  const text = await callGemini(prompt, { temperature: 0.7, maxOutputTokens: 8192 });
  return parseJSON(text);
}

// ---------- EXTRAS: Blueprint + Proof + Smart Report (call #2) ----------
async function analyzeExtras(idea, coreSummary) {
  const prompt = `You are a senior startup advisor. For the following idea, produce ONLY a JSON object with execution blueprint, proof-based validation evidence, and a structured smart report. No markdown, no code fences.

Idea: """${idea}"""
Decision: ${coreSummary.decision?.action || 'UNKNOWN'}
Score: ${coreSummary.score}
Top competitors known: ${(coreSummary.similarStartups || []).map(s => s.name).join(', ') || 'none'}

Required JSON shape (every field MUST be present):
{
  "executionBlueprint": {
    "techStack": {
      "frontend": ["<tech1>", "<tech2>"],
      "backend": ["<tech1>", "<tech2>"],
      "database": ["<tech>"],
      "infrastructure": ["<host/cdn>", "<auth>"],
      "thirdParty": ["<paid api 1>", "<paid api 2>"]
    },
    "mvpFeatures": ["<feature 1>", "<feature 2>", "<feature 3>", "<feature 4>", "<feature 5>"],
    "timeline": [
      {"phase": "Week 1-2", "milestone": "<short>", "deliverable": "<short>"},
      {"phase": "Week 3-6", "milestone": "<short>", "deliverable": "<short>"},
      {"phase": "Week 7-10", "milestone": "<short>", "deliverable": "<short>"},
      {"phase": "Week 11-12", "milestone": "<short>", "deliverable": "<short>"}
    ],
    "tools": [
      {"category": "Design", "tool": "<name>", "why": "<short>"},
      {"category": "Dev", "tool": "<name>", "why": "<short>"},
      {"category": "Analytics", "tool": "<name>", "why": "<short>"},
      {"category": "Payments", "tool": "<name>", "why": "<short>"}
    ],
    "estimatedBudget": "<e.g. $2k-$5k for first 3 months>",
    "teamNeeded": ["<role 1>", "<role 2>"]
  },
  "proofValidation": {
    "competitorEvidence": [
      {"name": "<real company>", "url": "<https URL>", "fundingOrTraction": "<e.g. raised $10M Series A 2023, 50k users>", "relevance": "<one sentence>"},
      {"name": "<real company>", "url": "<https URL>", "fundingOrTraction": "<short>", "relevance": "<short>"},
      {"name": "<real company>", "url": "<https URL>", "fundingOrTraction": "<short>", "relevance": "<short>"}
    ],
    "marketEvidence": [
      {"claim": "<market stat with number, e.g. '$50B TAM by 2027'>", "source": "<publisher name>", "url": "<https URL of report or article>"},
      {"claim": "<short>", "source": "<short>", "url": "<https URL>"},
      {"claim": "<short>", "source": "<short>", "url": "<https URL>"}
    ],
    "demandSignals": [
      "<reddit/forum thread or trend signal proving demand>",
      "<google trends or search volume signal>",
      "<recent news or launch validating space>"
    ],
    "credibilityScore": <integer 1-100>
  },
  "smartReport": {
    "ideaSummary": "<3-4 sentence executive summary>",
    "marketOpportunity": "<3-4 sentences with TAM/SAM and growth>",
    "competitorAnalysis": "<3-4 sentences naming competitors and positioning>",
    "gapOpportunities": "<3-4 sentences on where to win>",
    "riskAnalysis": "<3-4 sentences covering top risks and mitigations>",
    "revenueAnalysis": "<3-4 sentences on revenue model and unit economics>",
    "finalDecision": {
      "verdict": "<BUILD or PIVOT or DROP>",
      "rationale": "<3-4 sentences justifying the verdict>"
    }
  }
}

Use REAL company names and PLAUSIBLE https:// URLs (Crunchbase, TechCrunch, official sites, App Store, Statista, Gartner, McKinsey). Never invent fake URLs — prefer well-known sources.`;

  const text = await callGemini(prompt, { temperature: 0.6, maxOutputTokens: 8192 });
  return parseJSON(text);
}

async function analyzeIdea(idea, founderProfile = null, previousIdea = null) {
  const core = await analyzeCore(idea, founderProfile);

  // Defensive defaults
  core.score = clampInt(core.score, 1, 100, 50);
  core.scoreBreakdown = core.scoreBreakdown || {};
  core.feedback = core.feedback || {};
  core.audience = core.audience || {};
  core.similarStartups = Array.isArray(core.similarStartups) ? core.similarStartups : [];
  core.risks = Array.isArray(core.risks) ? core.risks : [];
  core.competitorGaps = Array.isArray(core.competitorGaps) ? core.competitorGaps : [];
  core.decision = core.decision || { action: 'PIVOT', reasons: [], pivotSuggestion: '' };
  if (!['BUILD', 'PIVOT', 'DROP'].includes(core.decision.action)) core.decision.action = 'PIVOT';
  core.founderFit = core.founderFit || { fitScore: 50, strengths: [], gaps: [], verdict: '' };
  core.marketSignals = core.marketSignals || { trendScore: 50, summary: '' };
  core.overlapPercentage = clampInt(core.overlapPercentage, 0, 100, 50);

  // Second call — extras (blueprint, proof, smart report). If it fails we still return core.
  let extras = {};
  try {
    extras = await analyzeExtras(idea, core);
  } catch (err) {
    console.warn('[gemini] extras call failed, returning core-only result:', err.message);
    extras = {};
  }

  const result = {
    ...core,
    executionBlueprint: extras.executionBlueprint || null,
    proofValidation: extras.proofValidation || null,
    smartReport: extras.smartReport || null,
  };

  // Evolution summary — only when we have a previous idea
  if (previousIdea && previousIdea.trim() && previousIdea.trim() !== idea.trim()) {
    result.evolutionSummary = {
      originalIdea: previousIdea.trim(),
      improvedIdea: idea.trim(),
      keyChanges: 'Refined based on feedback — see score and decision changes for impact.',
    };
  }

  return result;
}

async function compareIdeas(idea1, idea2) {
  const prompt = `Compare these two startup ideas and decide which has stronger potential. Return ONLY JSON.

Idea 1: """${idea1}"""
Idea 2: """${idea2}"""

{
  "winner": <1 or 2>,
  "winnerReason": "<2-3 sentences>",
  "idea1Strengths": ["<s1>", "<s2>", "<s3>"],
  "idea2Strengths": ["<s1>", "<s2>", "<s3>"],
  "idea1Weaknesses": ["<w1>", "<w2>"],
  "idea2Weaknesses": ["<w1>", "<w2>"],
  "recommendation": "<2 sentences>"
}`;
  const text = await callGemini(prompt);
  return parseJSON(text);
}

async function whatIfSimulate(idea, variables) {
  const prompt = `Simulate how variable changes affect this startup. Return ONLY JSON.

Original Idea: """${idea}"""
Changes:
- Price: ${variables.price || 'unchanged'}
- Audience: ${variables.audience || 'unchanged'}
- Niche: ${variables.niche || 'unchanged'}

{
  "newScore": <1-100>,
  "scoreDelta": <integer, negative or positive>,
  "impact": "<2-3 sentences>",
  "newVerdict": "<one sentence>",
  "pros": ["<p1>", "<p2>", "<p3>"],
  "cons": ["<c1>", "<c2>", "<c3>"],
  "recommendation": "<1-2 sentences>"
}`;
  const text = await callGemini(prompt);
  return parseJSON(text);
}

async function coFounderChat(idea, history, userMessage) {
  const historyText = (history || [])
    .map(m => `${m.role === 'user' ? 'Founder' : 'Co-Founder'}: ${m.content}`)
    .join('\n');

  const prompt = `You are an experienced AI Co-Founder helping a founder develop their startup. You remember the conversation and build on it with specific, actionable advice.

Startup Idea: """${idea}"""

Conversation so far:
${historyText || '(no previous messages)'}

Founder's new message: "${userMessage}"

Reply as a knowledgeable co-founder. Be specific, direct, and constructive. Reference earlier points when relevant. Keep your reply under 200 words. Use natural conversational prose, not bullet points.`;

  return await callGemini(prompt, { temperature: 0.8, maxOutputTokens: 768 });
}

module.exports = { analyzeIdea, compareIdeas, whatIfSimulate, coFounderChat, healthCheck };
