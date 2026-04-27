/**
 * Macro Regime Engine — Backend Server
 * Production-ready Express API with cloud deployment support
 */
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
require('dotenv').config();

const { validateEnvironment } = require('./config/environment');
const regimeRoutes    = require('./routes/regimeRoutes');
const riskRoutes      = require('./routes/riskRoutes');
const backtestRoutes  = require('./routes/backtestRoutes');
const forecastRoutes  = require('./routes/forecastRoutes');
const sentimentRoutes = require('./routes/sentimentRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const marketRoutes    = require('./routes/marketRoutes');
const aiRoutes        = require('./routes/aiRoutes');
const errorHandler    = require('./middleware/errorHandler');
const healthCtrl      = require('./controllers/healthController');

// Validate environment on startup
const env = validateEnvironment();
console.log(`🔧 Environment: ${env.environment} | Port: ${env.port}`);
console.log(`🔑 FRED API: ${env.hasFredKey ? '✅' : '❌'} | Groq: ${env.hasGroqKey ? '✅' : '⚠️ optional'} | DB: ${env.hasDatabase ? '✅' : '⚠️ optional'}`);

const app = express();

// ── Security ──────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Allow React app
  crossOriginEmbedderPolicy: false,
}));

// ── CORS ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Logging ───────────────────────────────────────────────────────────
app.use(morgan(env.environment === 'production' ? 'combined' : 'dev', {
  skip: (req) => req.url === '/health' || req.url === '/ready',
}));

// ── Body parsing ──────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ─────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs:   15 * 60 * 1000,
  max:        env.environment === 'production' ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// ── Health & Readiness probes (no rate limit) ─────────────────────────
app.get('/health', healthCtrl.health);
app.get('/ready',  healthCtrl.ready);
app.get('/',       (_, res) => res.json({ name: 'Macro Regime Engine API', version: '2.0.0', status: 'running' }));

// ── API Routes ────────────────────────────────────────────────────────
app.use('/api/regime',    regimeRoutes);
app.use('/api/risk',      riskRoutes);
app.use('/api/backtest',  backtestRoutes);
app.use('/api/forecast',  forecastRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/market',    marketRoutes);
app.use('/api/ai',        aiRoutes);

// ── 404 ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────
const PORT = env.port;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Macro Regime Engine v2.0 running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown for cloud environments
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received — shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received — shutting down gracefully');
  process.exit(0);
});

module.exports = app;
