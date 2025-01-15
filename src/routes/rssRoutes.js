const express = require('express');
const { fetchRSSFeed, fetchLotteryResults, fetchNews, fetchPowerResults, predictMegaResults, saveGuess, savePrediction, getLatestPrediction } = require('../services/rssService');
const router = express.Router();

// GET /api/rss
router.get('/rss', fetchRSSFeed);
router.get('/lottery-result', fetchLotteryResults);
router.get('/power-result', fetchPowerResults);
router.post('/guess', saveGuess);
router.post('/prediction', savePrediction)
router.get('/prediction/latest', getLatestPrediction)
router.get('/vietlottnews', async (req, res) => {
    const news = await fetchNews();
    res.json(news);
});
module.exports = router;
