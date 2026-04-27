const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/regimeController');

router.get('/current',           ctrl.getCurrent);
router.get('/history',           ctrl.getHistory);
router.get('/transition-matrix', ctrl.getTransitionMatrix);
router.post('/refresh',          ctrl.refresh);

module.exports = router;
