const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/aiController');

router.post('/chat',           ctrl.chat);
router.post('/rag-query',      ctrl.ragQuery);
router.get('/market-summary',  ctrl.marketSummary);
router.post('/agent-run',      ctrl.agentRun);
router.post('/trade-recommend',ctrl.tradeRecommend);
router.post('/upload-doc',     ctrl.uploadDocument);

module.exports = router;
