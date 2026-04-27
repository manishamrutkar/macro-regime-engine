const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/riskController');

router.get('/metrics', ctrl.getMetrics);
router.get('/var',     ctrl.getVaR);

module.exports = router;
