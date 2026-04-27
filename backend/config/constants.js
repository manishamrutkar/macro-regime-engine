module.exports = {
  PYTHON_ENGINE_PATH: process.env.PYTHON_ENGINE_PATH || '../python_engine/main.py',
  PYTHON_CMD:         process.env.PYTHON_CMD         || 'python3',
  CACHE_TTL_SECONDS:  parseInt(process.env.CACHE_TTL || '3600'),  // 1 hour
  API_TIMEOUT_MS:     15000,
};
