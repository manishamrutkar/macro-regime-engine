const { validateEnvironment } = require('../config/environment');
const { pool }                = require('../config/db');
const path                    = require('path');
const fs                      = require('fs');

/**
 * GET /health
 * Comprehensive health check for cloud monitoring
 */
exports.health = async (req, res) => {
  const start  = Date.now();
  const config = validateEnvironment();

  // Check database
  let dbStatus = 'not_configured';
  if (config.hasDatabase) {
    try {
      await pool.query('SELECT 1');
      dbStatus = 'connected';
    } catch {
      dbStatus = 'error';
    }
  }

  // Check Python engine results exist
  const resultsPath  = path.join(__dirname, '../../data/processed/results.json');
  const pipelineRun  = fs.existsSync(resultsPath);

  const health = {
    status:      'ok',
    timestamp:   new Date().toISOString(),
    version:     '2.0.0',
    uptime:      Math.round(process.uptime()),
    environment: config.environment,
    latency_ms:  Date.now() - start,
    services: {
      database:     dbStatus,
      fred_api:     config.hasFredKey    ? 'configured' : 'missing',
      groq_api:     config.hasGroqKey    ? 'configured' : 'not_set',
      openai_api:   config.hasOpenAIKey  ? 'configured' : 'not_set',
      pipeline:     pipelineRun          ? 'ready'      : 'not_run',
    },
    memory: {
      used_mb:  Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  };

  // Return 503 if critical services are down
  const statusCode = dbStatus === 'error' ? 503 : 200;
  res.status(statusCode).json(health);
};

/**
 * GET /ready
 * Kubernetes/Railway readiness probe
 */
exports.ready = async (req, res) => {
  const resultsPath = path.join(__dirname, '../../data/processed/results.json');
  const ready       = fs.existsSync(resultsPath);

  res.status(ready ? 200 : 503).json({
    ready,
    reason: ready ? 'Pipeline results available' : 'Pipeline not run yet',
  });
};
