const express = require('express');
const { fetchRSSFeed, fetchLotteryResults, fetchNews, fetchPowerResults } = require('../services/rssService');
const router = express.Router();

// GET /api/rss
router.get('/rss', fetchRSSFeed);
router.get('/lottery-result', fetchLotteryResults);
router.get('/power-result', fetchPowerResults)
router.get('/vietlottnews', async (req, res) => {
    const news = await fetchNews();
    res.json(news);
});
module.exports = router;
