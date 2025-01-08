const express = require('express');
const { fetchRSSFeed, fetchLotteryResults } = require('../services/rssService');
const router = express.Router();

// GET /api/rss
router.get('/rss', fetchRSSFeed);
router.get('/lottery-result', fetchLotteryResults);

module.exports = router;
