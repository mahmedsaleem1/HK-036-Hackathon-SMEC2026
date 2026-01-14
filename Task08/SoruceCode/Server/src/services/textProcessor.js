const natural = require('natural');
const stopword = require('stopword');

class TextProcessor {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    
    // Common words to exclude from lyrics analysis
    this.customStopwords = [
      'yeah', 'oh', 'ooh', 'ah', 'uh', 'na', 'la', 'da',
      'hey', 'woah', 'whoa', 'hmm', 'mm', 'baby', 'gonna',
      'wanna', 'gotta', 'chorus', 'verse', 'bridge', 'outro', 'intro'
    ];
  }

  /**
   * Clean raw lyrics text
   */
  cleanLyrics(lyrics) {
    // Remove [Verse], [Chorus], etc. annotations
    let cleaned = lyrics.replace(/\[.*?\]/g, '');
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Remove special characters but keep apostrophes
    cleaned = cleaned.replace(/[^a-zA-Z0-9\s']/g, ' ');
    
    return cleaned.trim();
  }

  /**
   * Tokenize text into words
   */
  tokenize(text) {
    return this.tokenizer.tokenize(text.toLowerCase());
  }

  /**
   * Remove stopwords (common words like 'the', 'is', 'and')
   */
  removeStopwords(tokens) {
    // Remove English stopwords
    let filtered = stopword.removeStopwords(tokens);
    
    // Remove custom stopwords
    filtered = filtered.filter(word => 
      !this.customStopwords.includes(word.toLowerCase())
    );
    
    return filtered;
  }

  /**
   * Apply stemming (reduce words to root form)
   */
  applyStemming(tokens) {
    return tokens.map(token => this.stemmer.stem(token));
  }

  /**
   * Apply lemmatization (more accurate than stemming)
   */
  applyLemmatization(tokens) {
    // Natural doesn't have good lemmatization, so we'll use stemming
    return this.applyStemming(tokens);
  }

  /**
   * Filter tokens by minimum length
   */
  filterByLength(tokens, minLength = 3) {
    return tokens.filter(token => token.length >= minLength);
  }

  /**
   * Complete NLP processing pipeline
   */
  processText(lyrics, options = {}) {
    const {
      useStemming = true,
      minWordLength = 3,
      removeStops = true
    } = options;

    // Step 1: Clean the lyrics
    let processed = this.cleanLyrics(lyrics);
    
    // Step 2: Tokenize
    let tokens = this.tokenize(processed);
    
    // Step 3: Remove stopwords
    if (removeStops) {
      tokens = this.removeStopwords(tokens);
    }
    
    // Step 4: Filter by length
    tokens = this.filterByLength(tokens, minWordLength);
    
    // Step 5: Apply stemming/lemmatization
    if (useStemming) {
      tokens = this.applyStemming(tokens);
    }
    
    return tokens;
  }

  /**
   * Get text statistics
   */
  getTextStats(lyrics) {
    const cleaned = this.cleanLyrics(lyrics);
    const tokens = this.tokenize(cleaned);
    const uniqueTokens = [...new Set(tokens)];
    
    return {
      totalWords: tokens.length,
      uniqueWords: uniqueTokens.length,
      avgWordLength: tokens.reduce((sum, word) => sum + word.length, 0) / tokens.length,
      characterCount: cleaned.length
    };
  }
}

module.exports = new TextProcessor();
