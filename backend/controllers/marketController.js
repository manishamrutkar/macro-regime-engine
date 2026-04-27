const { runPython } = require('./pythonRunner');

// GET /api/market/tickers
exports.getTickers = async (req, res, next) => {
  try {
    const data = await runPython('api');
    res.json(data.current_regime?.macro_indicators || {});
  } catch (err) { next(err); }
};

// GET /api/market/yield-curve
exports.getYieldCurve = async (req, res, next) => {
  try {
    const data = await runPython('api');
    res.json(data.yield_curve);
  } catch (err) { next(err); }
};

// GET /api/market/sectors
exports.getSectors = async (req, res, next) => {
  try {
    const data = await runPython('api');
    res.json(data.sector_rotation);
  } catch (err) { next(err); }
};
