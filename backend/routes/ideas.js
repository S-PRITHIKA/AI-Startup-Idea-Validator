const express = require('express');
const auth = require('../middleware/auth');
const Idea = require('../models/Idea');
const User = require('../models/User');
const { analyzeIdea, compareIdeas, whatIfSimulate, coFounderChat } = require('./geminiService');
const router = express.Router();

function sendError(res, err, fallbackStatus = 500) {
  console.error('[ideas]', err);
  const status = err.code === 'NO_API_KEY' ? 400 : (err.status || fallbackStatus);
  res.status(status).json({
    error: err.message || 'Server error',
    code: err.code || undefined,
    gemini: err.gemini || undefined,
  });
}

const ALL_FIELDS = [
  'score', 'verdict', 'scoreBreakdown', 'feedback', 'improvedIdea', 'risks',
  'revenueModel', 'audience', 'similarStartups', 'pitchDeck',
  'overlapPercentage', 'overlapExplanation', 'decision', 'founderFit',
  'competitorGaps', 'marketSignals',
  'executionBlueprint', 'proofValidation', 'smartReport', 'evolutionSummary',
];

function pickFields(analysis) {
  const out = {};
  for (const k of ALL_FIELDS) if (analysis[k] !== undefined) out[k] = analysis[k];
  return out;
}

router.post('/analyze-idea', auth, async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea || idea.trim().length < 10) return res.status(400).json({ error: 'Idea too short (min 10 chars)' });

    const user = await User.findById(req.user.id);
    const founderProfile = user?.skills?.length || user?.interests?.length
      ? { skills: user.skills, interests: user.interests } : null;

    const analysis = await analyzeIdea(idea.trim(), founderProfile);

    const saved = await Idea.create({
      userId: req.user.id,
      idea: idea.trim(),
      ...pickFields(analysis),
      versions: [{ version: 1, idea: idea.trim(), score: analysis.score }],
    });

    res.json({ ...analysis, _id: saved._id, createdAt: saved.createdAt });
  } catch (err) { sendError(res, err); }
});

router.get('/my-ideas', auth, async (req, res) => {
  try {
    const ideas = await Idea.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(ideas);
  } catch (err) { sendError(res, err); }
});

router.get('/ideas/:id', auth, async (req, res) => {
  try {
    const idea = await Idea.findOne({ _id: req.params.id, userId: req.user.id });
    if (!idea) return res.status(404).json({ error: 'Not found' });
    res.json(idea);
  } catch (err) { sendError(res, err); }
});

router.delete('/ideas/:id', auth, async (req, res) => {
  try {
    await Idea.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (err) { sendError(res, err); }
});

router.put('/ideas/:id/refine', auth, async (req, res) => {
  try {
    const { refinedIdea } = req.body;
    if (!refinedIdea || refinedIdea.trim().length < 10) {
      return res.status(400).json({ error: 'Refined idea too short' });
    }
    const existing = await Idea.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const user = await User.findById(req.user.id);
    const founderProfile = user?.skills?.length || user?.interests?.length
      ? { skills: user.skills, interests: user.interests } : null;
    const previousIdea = existing.idea;
    const analysis = await analyzeIdea(refinedIdea.trim(), founderProfile, previousIdea);

    const nextVersion = (existing.versions?.length || 1) + 1;
    existing.versions.push({ version: nextVersion, idea: refinedIdea.trim(), score: analysis.score });
    Object.assign(existing, { idea: refinedIdea.trim() }, pickFields(analysis));
    await existing.save();
    res.json({ ...analysis, _id: existing._id, versions: existing.versions, createdAt: existing.createdAt });
  } catch (err) { sendError(res, err); }
});

router.post('/compare', auth, async (req, res) => {
  try {
    const { ideaId1, ideaId2 } = req.body;
    const [i1, i2] = await Promise.all([
      Idea.findOne({ _id: ideaId1, userId: req.user.id }),
      Idea.findOne({ _id: ideaId2, userId: req.user.id }),
    ]);
    if (!i1 || !i2) return res.status(404).json({ error: 'Ideas not found' });
    const comparison = await compareIdeas(i1.idea, i2.idea);
    res.json({ comparison, idea1: i1, idea2: i2 });
  } catch (err) { sendError(res, err); }
});

router.post('/ideas/:id/whatif', auth, async (req, res) => {
  try {
    const { price, audience, niche } = req.body;
    const idea = await Idea.findOne({ _id: req.params.id, userId: req.user.id });
    if (!idea) return res.status(404).json({ error: 'Not found' });
    const result = await whatIfSimulate(idea.idea, { price, audience, niche });
    res.json(result);
  } catch (err) { sendError(res, err); }
});

router.post('/ideas/:id/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: 'Empty message' });
    const idea = await Idea.findOne({ _id: req.params.id, userId: req.user.id });
    if (!idea) return res.status(404).json({ error: 'Not found' });

    const response = await coFounderChat(idea.idea, idea.chatHistory || [], message.trim());

    idea.chatHistory.push({ role: 'user', content: message.trim() });
    idea.chatHistory.push({ role: 'assistant', content: response });
    if (idea.chatHistory.length > 40) idea.chatHistory = idea.chatHistory.slice(-40);
    await idea.save();

    res.json({ response, history: idea.chatHistory });
  } catch (err) { sendError(res, err); }
});

router.get('/ideas/:id/chat', auth, async (req, res) => {
  try {
    const idea = await Idea.findOne({ _id: req.params.id, userId: req.user.id });
    if (!idea) return res.status(404).json({ error: 'Not found' });
    res.json({ history: idea.chatHistory || [] });
  } catch (err) { sendError(res, err); }
});

module.exports = router;
