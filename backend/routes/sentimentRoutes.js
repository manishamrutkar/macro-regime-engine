const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/sentimentController');

router.get('/scores',     ctrl.getScores);
router.get('/fear-greed', ctrl.getFearGreed);

module.exports = router;
