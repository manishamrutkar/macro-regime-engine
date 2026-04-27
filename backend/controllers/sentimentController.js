const { runPython } = require('./pythonRunner');

// GET /api/sentiment/scores
exports.getScores = async (req, res, next) => {
  try {
    const data = await runPython('api');
    res.json(data.sentiment);
  } catch (err) { next(err); }
};

// GET /api/sentiment/fear-greed
exports.getFearGreed = async (req, res, next) => {
  try {
    const data = await runPython('api');
    res.json(data.sentiment.fear_greed || { score: 50, label: 'Neutral' });
  } catch (err) { next(err); }
};
