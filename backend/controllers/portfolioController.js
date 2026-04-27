// GET /api/portfolio/simulate
// Body: { SP500: 0.4, GOLD: 0.3, BTC: 0.2, BONDS: 0.1 }
exports.simulate = async (req, res, next) => {
  try {
    const weights = req.body;
    const total   = Object.values(weights).reduce((a, b) => a + b, 0);
    if (Math.abs(total - 1.0) > 0.05) {
      return res.status(400).json({ error: 'Weights must sum to 1.0 (±0.05)' });
    }
    // Expected return / vol per asset (simplified regime-weighted estimates)
    const assetStats = {
      SP500: { cagr: 0.12, vol: 0.16 },
      GOLD:  { cagr: 0.08, vol: 0.14 },
      BTC:   { cagr: 0.45, vol: 0.75 },
      BONDS: { cagr: 0.04, vol: 0.05 },
      OIL:   { cagr: 0.06, vol: 0.32 },
    };
    let portCagr = 0, portVar = 0;
    for (const [asset, w] of Object.entries(weights)) {
      const stats = assetStats[asset];
      if (!stats) continue;
      portCagr += w * stats.cagr;
      portVar  += (w * stats.vol) ** 2;
    }
    const portVol   = Math.sqrt(portVar);
    const rf        = 0.05;
    const sharpe    = portVol > 0 ? (portCagr - rf) / portVol : 0;
    res.json({
      weights,
      metrics: {
        estimated_cagr:       parseFloat(portCagr.toFixed(4)),
        estimated_volatility: parseFloat(portVol.toFixed(4)),
        estimated_sharpe:     parseFloat(sharpe.toFixed(4)),
      },
    });
  } catch (err) { next(err); }
};

// GET /api/portfolio/monte-carlo
exports.getMonteCarlo = async (req, res, next) => {
  try {
    const { runPython } = require('./pythonRunner');
    const data = await runPython('api');
    res.json(data.monte_carlo);
  } catch (err) { next(err); }
};
