const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/forecastController');

router.get('/next-regime', ctrl.getNextRegime);

module.exports = router;
