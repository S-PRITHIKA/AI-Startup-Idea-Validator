const express = require('express');
const { healthCheck } = require('./geminiService');
const router = express.Router();

// GET /api/health  -> basic liveness
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    env: {
      hasGemini: !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your-gemini-api-key'),
      hasMongo: !!process.env.MONGODB_URI,
      hasJwt: !!process.env.JWT_SECRET,
      hasSerp: !!process.env.SERPAPI_KEY,
      hasYoutube: !!process.env.YOUTUBE_API_KEY,
    },
  });
});

// GET /api/health/gemini -> calls Gemini with a tiny prompt and returns the model that worked
router.get('/health/gemini', async (req, res) => {
  try {
    const result = await healthCheck();
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: e.message,
      attempts: e.attempts || [],
      hint: 'Get a free key at https://aistudio.google.com/app/apikey and put it in backend/.env as GEMINI_API_KEY=...',
    });
  }
});

module.exports = router;
