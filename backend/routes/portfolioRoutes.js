const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/portfolioController');

router.post('/simulate',    ctrl.simulate);
router.get('/monte-carlo',  ctrl.getMonteCarlo);

module.exports = router;
