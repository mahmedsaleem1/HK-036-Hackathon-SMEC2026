const lyricsScraper = require('../services/lyricsScraper');
const textProcessor = require('../services/textProcessor');
const wordFrequencyAnalyzer = require('../services/wordFrequencyAnalyzer');
const wordCloudGenerator = require('../services/wordCloudGenerator');

/**
 * Generate word cloud from song lyrics
 */
exports.generateWordCloud = async (req, res) => {
  try {
    const { songName, artistName = '', options = {} } = req.body;

    if (!songName) {
      return res.status(400).json({
        success: false,
        error: 'Song name is required'
      });
    }

    // Step 1: Scrape lyrics
    console.log('Scraping lyrics...');
    const lyricsData = await lyricsScraper.scrapeLyrics(songName, artistName);

    if (!lyricsData || !lyricsData.lyrics) {
      return res.status(404).json({
        success: false,
        error: 'Could not find lyrics for this song'
      });
    }

    // Step 2: Process text with NLP
    console.log('Processing text...');
    const tokens = textProcessor.processText(lyricsData.lyrics, {
      useStemming: options.useStemming !== false,
      minWordLength: options.minWordLength || 3,
      removeStops: options.removeStops !== false
    });

    // Step 3: Analyze word frequencies
    console.log('Analyzing word frequencies...');
    const analysis = wordFrequencyAnalyzer.analyze(tokens, {
      topN: options.topN || 100,
      minFrequency: options.minFrequency || 1,
      includeStats: true
    });

    // Step 4: Generate word cloud data
    console.log('Generating word cloud...');
    const wordCloudData = wordCloudGenerator.generateData(
      analysis.wordCloudData,
      options.cloudOptions || {}
    );

    // Step 5: Get text statistics
    const textStats = textProcessor.getTextStats(lyricsData.lyrics);

    res.json({
      success: true,
      data: {
        song: {
          name: lyricsData.songTitle || songName,
          artist: lyricsData.artistName || artistName,
          source: lyricsData.source,
          url: lyricsData.url
        },
        lyrics: lyricsData.lyrics,
        wordCloud: wordCloudData,
        analysis: {
          topWords: analysis.topWords,
          stats: analysis.stats,
          distribution: analysis.distribution,
          textStats
        }
      }
    });
  } catch (error) {
    console.error('Error generating word cloud:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate word cloud'
    });
  }
};

/**
 * Get lyrics only (no word cloud)
 */
exports.getLyrics = async (req, res) => {
  try {
    const { songName, artistName = '' } = req.body;

    if (!songName) {
      return res.status(400).json({
        success: false,
        error: 'Song name is required'
      });
    }

    const lyricsData = await lyricsScraper.scrapeLyrics(songName, artistName);

    if (!lyricsData || !lyricsData.lyrics) {
      return res.status(404).json({
        success: false,
        error: 'Could not find lyrics for this song'
      });
    }

    const textStats = textProcessor.getTextStats(lyricsData.lyrics);

    res.json({
      success: true,
      data: {
        song: {
          name: songName,
          artist: artistName,
          source: lyricsData.source,
          url: lyricsData.url
        },
        lyrics: lyricsData.lyrics,
        stats: textStats
      }
    });
  } catch (error) {
    console.error('Error getting lyrics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get lyrics'
    });
  }
};

/**
 * Generate word cloud image (base64)
 */
exports.generateWordCloudImage = async (req, res) => {
  try {
    const { songName, artistName = '', options = {} } = req.body;

    if (!songName) {
      return res.status(400).json({
        success: false,
        error: 'Song name is required'
      });
    }

    // Scrape and process
    const lyricsData = await lyricsScraper.scrapeLyrics(songName, artistName);
    const tokens = textProcessor.processText(lyricsData.lyrics);
    const analysis = wordFrequencyAnalyzer.analyze(tokens, { topN: 100 });

    // Generate image
    const imageBase64 = await wordCloudGenerator.generateImage(
      analysis.wordCloudData,
      options.cloudOptions || {}
    );

    res.json({
      success: true,
      data: {
        image: imageBase64,
        song: {
          name: songName,
          artist: artistName,
          source: lyricsData.source
        }
      }
    });
  } catch (error) {
    console.error('Error generating word cloud image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate word cloud image'
    });
  }
};
