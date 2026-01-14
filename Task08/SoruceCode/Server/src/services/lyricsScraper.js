const axios = require('axios');
const cheerio = require('cheerio');

class LyricsScraper {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  }

  /**
   * Scrape lyrics from Genius.com
   */
  async scrapeFromGenius(songName, artistName = '') {
    try {
      const query = artistName ? `${songName} ${artistName}` : songName;
      const searchUrl = `https://genius.com/api/search/multi?q=${encodeURIComponent(query)}`;
      
      const searchResponse = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });

      const sections = searchResponse.data.response.sections;
      const hits = sections.find(s => s.type === 'song')?.hits || [];
      
      if (hits.length === 0) {
        throw new Error('No songs found');
      }

      const songUrl = hits[0].result.url;
      const songTitle = hits[0].result.title;
      const songArtist = hits[0].result.primary_artist.name;
      
      const pageResponse = await axios.get(songUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });

      const $ = cheerio.load(pageResponse.data);
      let lyrics = '';

      // Genius uses data-lyrics-container attribute
      $('[data-lyrics-container="true"]').each((i, elem) => {
        // Get text and preserve line breaks
        $(elem).find('br').replaceWith('\n');
        const text = $(elem).text();
        lyrics += text + '\n\n';
      });

      if (!lyrics) {
        throw new Error('Could not extract lyrics');
      }

      return {
        lyrics: lyrics.trim(),
        source: 'Genius',
        url: songUrl,
        songTitle,
        artistName: songArtist
      };
    } catch (error) {
      console.error('Genius scraping error:', error.message);
      return null;
    }
  }

  /**
   * Scrape lyrics from AZLyrics.com
   */
  async scrapeFromAZLyrics(songName, artistName = '') {
    try {
      if (!artistName) {
        // AZLyrics requires artist name, skip if not provided
        throw new Error('Artist name required for AZLyrics');
      }
      // AZLyrics URL format: https://www.azlyrics.com/lyrics/artist/song.html
      const cleanArtist = artistName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanSong = songName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const url = `https://www.azlyrics.com/lyrics/${cleanArtist}/${cleanSong}.html`;

      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // AZLyrics has lyrics in a specific div without class
      let lyrics = '';
      $('div').each((i, elem) => {
        const html = $(elem).html();
        if (html && html.includes('<!-- Usage of azlyrics.com content')) {
          lyrics = $(elem).text().trim();
          return false; // break
        }
      });

      if (!lyrics) {
        throw new Error('Could not extract lyrics');
      }

      return {
        lyrics: lyrics,
        source: 'AZLyrics',
        url: url
      };
    } catch (error) {
      console.error('AZLyrics scraping error:', error.message);
      return null;
    }
  }

  /**
   * Scrape lyrics from Lyrics.com
   */
  async scrapeFromLyricsCom(songName, artistName = '') {
    try {
      const query = artistName ? `${artistName} ${songName}` : songName;
      const searchUrl = `https://www.lyrics.com/serp.php?st=${encodeURIComponent(query)}`;

      const searchResponse = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent }
      });

      const $ = cheerio.load(searchResponse.data);
      const firstResult = $('.best-matches .bm-case a').first().attr('href');

      if (!firstResult) {
        throw new Error('No songs found');
      }

      const songUrl = `https://www.lyrics.com${firstResult}`;
      const pageResponse = await axios.get(songUrl, {
        headers: { 'User-Agent': this.userAgent }
      });

      const $page = cheerio.load(pageResponse.data);
      const lyrics = $page('#lyric-body-text').text().trim();

      if (!lyrics) {
        throw new Error('Could not extract lyrics');
      }

      return {
        lyrics: lyrics,
        source: 'Lyrics.com',
        url: songUrl
      };
    } catch (error) {
      console.error('Lyrics.com scraping error:', error.message);
      return null;
    }
  }

  /**
   * Try multiple sources in order
   */
  async scrapeLyrics(songName, artistName = '') {
    const searchTerm = artistName ? `${songName} by ${artistName}` : songName;
    console.log(`Searching for: ${searchTerm}`);

    // Try each source in order
    const sources = [
      () => this.scrapeFromGenius(songName, artistName),
      () => this.scrapeFromLyricsCom(songName, artistName),
      () => this.scrapeFromAZLyrics(songName, artistName)
    ];

    for (const scrapeFunc of sources) {
      const result = await scrapeFunc();
      if (result && result.lyrics) {
        console.log(`Found lyrics from ${result.source}`);
        return result;
      }
    }

    throw new Error('Could not find lyrics from any source');
  }
}

module.exports = new LyricsScraper();
