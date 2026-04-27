const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/backtestController');

router.get('/results', ctrl.getResults);

module.exports = router;
