const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  version: Number,
  idea: String,
  score: Number,
  createdAt: { type: Date, default: Date.now }
});

const ideaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  idea: { type: String, required: true },
  score: { type: Number, default: 0 },
  verdict: String,
  scoreBreakdown: {
    marketDemand: Number,
    innovation: Number,
    scalability: Number,
    feasibility: Number,
    risk: Number
  },
  feedback: {
    investor: String,
    customer: String,
    competitor: String
  },
  improvedIdea: String,
  risks: [String],
  revenueModel: String,
  audience: {
    ageGroup: String,
    location: String,
    painPoints: [String],
    persona: String
  },
  similarStartups: [{ name: String, description: String, url: String }],
  pitchDeck: {
    elevatorPitch: String,
    problemStatement: String,
    solutionSummary: String
  },
  overlapPercentage: Number,
  overlapExplanation: String,
  decision: {
    action: { type: String, enum: ['BUILD', 'PIVOT', 'DROP'] },
    reasons: [String],
    pivotSuggestion: String
  },
  founderFit: {
    fitScore: Number,
    strengths: [String],
    gaps: [String],
    verdict: String
  },
  competitorGaps: [{ competitor: String, gap: String, opportunity: String }],
  marketSignals: { trendScore: Number, summary: String },

  // NEW: Execution Blueprint
  executionBlueprint: {
    techStack: {
      frontend: [String],
      backend: [String],
      database: [String],
      infrastructure: [String],
      thirdParty: [String]
    },
    mvpFeatures: [String],
    timeline: [{ phase: String, milestone: String, deliverable: String }],
    tools: [{ category: String, tool: String, why: String }],
    estimatedBudget: String,
    teamNeeded: [String]
  },

  // NEW: Proof-Based Validation
  proofValidation: {
    competitorEvidence: [{ name: String, url: String, fundingOrTraction: String, relevance: String }],
    marketEvidence: [{ claim: String, source: String, url: String }],
    demandSignals: [String],
    credibilityScore: Number
  },

  // NEW: Smart Investor-Ready Report
  smartReport: {
    ideaSummary: String,
    marketOpportunity: String,
    competitorAnalysis: String,
    gapOpportunities: String,
    riskAnalysis: String,
    revenueAnalysis: String,
    finalDecision: { verdict: String, rationale: String }
  },

  // NEW: Evolution Summary (original vs improved)
  evolutionSummary: {
    originalIdea: String,
    improvedIdea: String,
    keyChanges: String
  },

  versions: [versionSchema],
  chatHistory: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Idea', ideaSchema);
