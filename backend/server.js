require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const ideaRoutes = require('./routes/ideas');
const searchRoutes = require('./routes/search');
const healthRoutes = require('./routes/health');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/startup-validator';
mongoose
  .connect(MONGO)
  .then(() => console.log('[mongo] connected:', MONGO.replace(/\/\/.*@/, '//***@')))
  .catch((err) => {
    console.error('[mongo] connection error:', err.message);
    console.error('Hint: start MongoDB locally (`mongod`) or set MONGODB_URI to an Atlas connection string in backend/.env');
  });

app.use('/api/auth', authRoutes);
app.use('/api', ideaRoutes);
app.use('/api', searchRoutes);
app.use('/api', healthRoutes);

app.get('/', (req, res) => res.json({ message: 'Startup Validator API v2' }));

// Centralized error handler so every error reaches the client with detail.
app.use((err, req, res, next) => {
  console.error('[error]', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Gemini check: http://localhost:${PORT}/api/health/gemini`);
});
