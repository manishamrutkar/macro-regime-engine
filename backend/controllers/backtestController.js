const { runPython } = require('./pythonRunner');

// GET /api/backtest/results
exports.getResults = async (req, res, next) => {
  try {
    const data = await runPython('api');
    res.json(data.backtest);
  } catch (err) { next(err); }
};
