/**
 * Environment configuration
 * Validates required environment variables on startup
 */

const REQUIRED_VARS = ['FRED_API_KEY'];
const OPTIONAL_VARS = ['GROQ_API_KEY', 'OPENAI_API_KEY', 'DB_HOST', 'DB_PASSWORD'];

function validateEnvironment() {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing required env vars: ${missing.join(', ')}`);
    console.warn('   Some features may be limited. Check your .env file.');
  }

  const optional = OPTIONAL_VARS.filter(v => !process.env[v]);
  if (optional.length > 0) {
    console.info(`ℹ️  Optional env vars not set: ${optional.join(', ')}`);
  }

  return {
    isValid:       missing.length === 0,
    missing,
    hasFredKey:    !!process.env.FRED_API_KEY,
    hasGroqKey:    !!process.env.GROQ_API_KEY,
    hasOpenAIKey:  !!process.env.OPENAI_API_KEY,
    hasDatabase:   !!process.env.DB_HOST,
    environment:   process.env.NODE_ENV || 'development',
    port:          parseInt(process.env.PORT || '5000'),
  };
}

module.exports = { validateEnvironment };
