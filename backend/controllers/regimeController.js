const { runPython } = require('./pythonRunner');
const { query }     = require('../config/db');

// GET /api/regime/current
exports.getCurrent = async (req, res, next) => {
  try {
    const data = await runPython('api');
    res.json(data.current_regime);
  } catch (err) { next(err); }
};

// GET /api/regime/history
exports.getHistory = async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT date, regime_id, label, confidence FROM regimes ORDER BY date ASC'
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/regime/transition-matrix
exports.getTransitionMatrix = async (req, res, next) => {
  try {
    const data = await runPython('api');
    res.json(data.transition_matrix);
  } catch (err) { next(err); }
};

// POST /api/regime/refresh  (triggers full retrain)
exports.refresh = async (req, res, next) => {
  try {
    const data = await runPython('full');
    res.json({ status: 'ok', current_regime: data.current_regime });
  } catch (err) { next(err); }
};
