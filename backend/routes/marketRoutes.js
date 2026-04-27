const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/marketController');

router.get('/tickers',     ctrl.getTickers);
router.get('/yield-curve', ctrl.getYieldCurve);
router.get('/sectors',     ctrl.getSectors);

module.exports = router;
