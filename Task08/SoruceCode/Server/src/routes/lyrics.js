const express = require('express');
const router = express.Router();
const lyricsController = require('../controllers/lyricsController');

// Generate word cloud from song lyrics
router.post('/generate', lyricsController.generateWordCloud);

// Get lyrics only
router.post('/lyrics', lyricsController.getLyrics);

// Generate word cloud image (base64)
router.post('/generate-image', lyricsController.generateWordCloudImage);

module.exports = router;

