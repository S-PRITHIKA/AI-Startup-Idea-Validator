const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/search/competitors', auth, async (req, res) => {
  const { query } = req.body;
  if (!process.env.SERPAPI_KEY) {
    return res.json({ results: [], note: 'SERPAPI_KEY not configured in backend/.env' });
  }
  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: { q: query, api_key: process.env.SERPAPI_KEY, num: 6, hl: 'en', gl: 'us' }
    });
    const results = (response.data.organic_results || []).slice(0, 6).map(r => ({
      title: r.title, link: r.link, snippet: r.snippet, domain: r.displayed_link
    }));
    res.json({ results });
  } catch (err) {
    console.error('SerpAPI error:', err.message);
    res.json({ results: [], error: err.message });
  }
});

router.post('/search/trends', auth, async (req, res) => {
  const { query } = req.body;
  if (!process.env.SERPAPI_KEY) {
    return res.json({ results: [], note: 'SERPAPI_KEY not configured in backend/.env' });
  }
  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: { engine: 'google_trends', q: query, api_key: process.env.SERPAPI_KEY, data_type: 'TIMESERIES' }
    });
    res.json({ data: response.data });
  } catch (err) {
    console.error('Trends error:', err.message);
    res.json({ data: null, error: err.message });
  }
});

// YouTube — accepts POST { query } or POST { query, fallback: ['q1','q2'] }
router.post('/search/youtube', auth, async (req, res) => {
  const { query, fallback } = req.body;
  if (!process.env.YOUTUBE_API_KEY) {
    return res.json({
      videos: [],
      configured: false,
      hint: 'Add YOUTUBE_API_KEY to backend/.env to enable. Get a free key at https://console.cloud.google.com/apis/credentials (enable "YouTube Data API v3").'
    });
  }
  const queries = [query, ...(Array.isArray(fallback) ? fallback : [])].filter(Boolean);
  let lastError = null;
  for (const q of queries) {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet', q, type: 'video', maxResults: 6,
          key: process.env.YOUTUBE_API_KEY,
          relevanceLanguage: 'en', order: 'relevance', safeSearch: 'moderate'
        }
      });
      const videos = (response.data.items || []).map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.medium?.url,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));
      if (videos.length) return res.json({ videos, configured: true, queryUsed: q });
    } catch (err) {
      lastError = err.response?.data?.error?.message || err.message;
      console.error('YouTube API error for query', q, ':', lastError);
    }
  }
  res.json({ videos: [], configured: true, error: lastError || 'No videos returned for any query' });
});

module.exports = router;
