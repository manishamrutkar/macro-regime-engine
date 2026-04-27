const { runPython } = require('./pythonRunner');

// GET /api/forecast/next-regime
exports.getNextRegime = async (req, res, next) => {
  try {
    const data = await runPython('api');
    res.json(data.forecast);
  } catch (err) { next(err); }
};
