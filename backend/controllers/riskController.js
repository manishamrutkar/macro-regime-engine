const { runPython } = require('./pythonRunner');

// GET /api/risk/metrics?regime=Liquidity+Boom
exports.getMetrics = async (req, res, next) => {
  try {
    const data   = await runPython('api');
    const regime = req.query.regime;
    const metrics = regime
      ? { [regime]: data.risk_metrics[regime] }
      : data.risk_metrics;
    res.json(metrics);
  } catch (err) { next(err); }
};

// GET /api/risk/var
exports.getVaR = async (req, res, next) => {
  try {
    const data = await runPython('api');
    res.json(data.var_metrics);
  } catch (err) { next(err); }
};
