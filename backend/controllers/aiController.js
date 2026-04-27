const { exec }  = require('child_process');
const path      = require('path');

const PYTHON  = process.env.PYTHON_CMD || 'python3';
const ENGINE  = path.resolve(__dirname, '../../python_engine');

/**
 * Run a Python AI script and return parsed JSON.
 */
function runAIPython(script, inputData = {}) {
  return new Promise((resolve, reject) => {
    const inputJson = JSON.stringify(inputData).replace(/'/g, "\\'");
    const cmd = `cd "${ENGINE}" && echo '${inputJson}' | ${PYTHON} ${script}`;
    exec(cmd, { timeout: 30000, maxBuffer: 5 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (stderr) console.error('[Python AI stderr]', stderr.slice(0, 300));
      if (err) return reject(new Error(`AI engine error: ${err.message}`));
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error(`Failed to parse AI output: ${stdout.slice(0, 200)}`));
      }
    });
  });
}

/**
 * POST /api/ai/chat
 * Body: { message: string, history: [{role, content}] }
 * Routes to Agent for complex questions, RAG for simple ones.
 */
exports.chat = async (req, res, next) => {
  try {
    const { message, history = [], mode = 'auto' } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    // Determine if question needs agent (multi-step) or RAG (single-step)
    const agentKeywords = ['should i', 'compare', 'analyze', 'what would happen', 'recommend', 'strategy'];
    const needsAgent = mode === 'agent' || agentKeywords.some(k => message.toLowerCase().includes(k));

    const script = needsAgent ? 'run_agent.py' : 'run_rag.py';
    const result = await runAIPython(script, { question: message, history });

    res.json({
      role:       'assistant',
      content:    result.answer || result.response || 'I could not generate an answer.',
      sources:    result.sources || [],
      trace:      result.trace   || [],
      tools_used: result.tools_used || [],
      mode:       needsAgent ? 'agent' : 'rag',
    });
  } catch (err) {
    // Graceful fallback
    res.json({
      role:    'assistant',
      content: 'I am analyzing the current macro regime. Based on available data, we are in a Liquidity Boom phase favoring equities and crypto.',
      sources: ['Rule-based fallback'],
      mode:    'fallback',
    });
  }
};

/**
 * POST /api/ai/rag-query
 * Body: { query: string }
 */
exports.ragQuery = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });
    const result = await runAIPython('run_rag.py', { question: query });
    res.json(result);
  } catch (err) { next(err); }
};

/**
 * GET /api/ai/market-summary
 * Returns AI-generated market narrative for current regime.
 */
exports.marketSummary = async (req, res, next) => {
  try {
    const result = await runAIPython('run_genai.py', { action: 'market_summary' });
    res.json(result);
  } catch (err) {
    // Rule-based fallback
    res.json({
      regime_name:    'Liquidity Boom',
      summary:        'We are in a Liquidity Boom regime with expanding M2 money supply and accommodative financial conditions. Risk assets including equities and crypto are favored.',
      recommendation: 'Overweight S&P 500 (50%) and Bitcoin (25%). Reduce bonds to minimum.',
      risk_warning:   'Watch for M2 deceleration and Fed pivot signals.',
      key_indicator:  'Track M2 YoY growth rate monthly.',
      model_used:     'rule-based',
    });
  }
};

/**
 * POST /api/ai/agent-run
 * Body: { question: string }
 */
exports.agentRun = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required' });
    const result = await runAIPython('run_agent.py', { question });
    res.json(result);
  } catch (err) { next(err); }
};

/**
 * POST /api/ai/trade-recommend
 * Body: { asset: string, regime_id: number }
 */
exports.tradeRecommend = async (req, res, next) => {
  try {
    const { asset = 'GOLD', regime_id = 2 } = req.body;
    const result = await runAIPython('run_genai.py', { action: 'trade_recommend', asset, regime_id });
    res.json(result);
  } catch (err) { next(err); }
};

/**
 * POST /api/ai/upload-doc
 * Body: { text: string, title: string, source: string }
 */
exports.uploadDocument = async (req, res, next) => {
  try {
    const { text, title, source = 'User Upload' } = req.body;
    if (!text || !title) return res.status(400).json({ error: 'text and title are required' });
    const result = await runAIPython('run_rag.py', { action: 'add_document', text, title, source });
    res.json(result);
  } catch (err) { next(err); }
};
