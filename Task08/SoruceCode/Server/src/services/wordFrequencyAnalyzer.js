class WordFrequencyAnalyzer {
  /**
   * Calculate word frequencies from token array
   */
  calculateFrequencies(tokens) {
    const frequencyMap = {};
    
    tokens.forEach(token => {
      frequencyMap[token] = (frequencyMap[token] || 0) + 1;
    });
    
    return frequencyMap;
  }

  /**
   * Get top N words by frequency
   */
  getTopWords(frequencyMap, limit = 50) {
    const sorted = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
    
    return sorted.map(([word, count]) => ({ word, count }));
  }

  /**
   * Normalize frequencies to a scale (for word cloud sizing)
   */
  normalizeFrequencies(frequencyMap, minSize = 10, maxSize = 100) {
    const frequencies = Object.values(frequencyMap);
    const minFreq = Math.min(...frequencies);
    const maxFreq = Math.max(...frequencies);
    const range = maxFreq - minFreq;
    
    const normalized = {};
    
    for (const [word, freq] of Object.entries(frequencyMap)) {
      if (range === 0) {
        normalized[word] = maxSize;
      } else {
        const normalizedValue = ((freq - minFreq) / range) * (maxSize - minSize) + minSize;
        normalized[word] = Math.round(normalizedValue);
      }
    }
    
    return normalized;
  }

  /**
   * Convert to word cloud format
   */
  toWordCloudFormat(frequencyMap, limit = 100) {
    const topWords = this.getTopWords(frequencyMap, limit);
    const normalized = this.normalizeFrequencies(
      Object.fromEntries(topWords.map(({ word, count }) => [word, count]))
    );
    
    return topWords.map(({ word, count }) => ({
      text: word,
      value: count,
      size: normalized[word]
    }));
  }

  /**
   * Get frequency statistics
   */
  getStats(frequencyMap) {
    const frequencies = Object.values(frequencyMap);
    const total = frequencies.reduce((sum, freq) => sum + freq, 0);
    const avg = total / frequencies.length;
    
    return {
      totalWords: total,
      uniqueWords: frequencies.length,
      averageFrequency: avg,
      maxFrequency: Math.max(...frequencies),
      minFrequency: Math.min(...frequencies)
    };
  }

  /**
   * Get word distribution by frequency ranges
   */
  getDistribution(frequencyMap) {
    const ranges = {
      '1': 0,
      '2-5': 0,
      '6-10': 0,
      '11-20': 0,
      '21+': 0
    };
    
    Object.values(frequencyMap).forEach(freq => {
      if (freq === 1) ranges['1']++;
      else if (freq <= 5) ranges['2-5']++;
      else if (freq <= 10) ranges['6-10']++;
      else if (freq <= 20) ranges['11-20']++;
      else ranges['21+']++;
    });
    
    return ranges;
  }

  /**
   * Filter words by minimum frequency
   */
  filterByMinFrequency(frequencyMap, minFreq = 2) {
    const filtered = {};
    
    for (const [word, freq] of Object.entries(frequencyMap)) {
      if (freq >= minFreq) {
        filtered[word] = freq;
      }
    }
    
    return filtered;
  }

  /**
   * Complete analysis pipeline
   */
  analyze(tokens, options = {}) {
    const {
      topN = 100,
      minFrequency = 1,
      includeStats = true
    } = options;

    // Calculate frequencies
    let frequencies = this.calculateFrequencies(tokens);
    
    // Filter by minimum frequency
    if (minFrequency > 1) {
      frequencies = this.filterByMinFrequency(frequencies, minFrequency);
    }
    
    // Get word cloud data
    const wordCloudData = this.toWordCloudFormat(frequencies, topN);
    
    // Get statistics
    const stats = includeStats ? this.getStats(frequencies) : null;
    
    // Get distribution
    const distribution = includeStats ? this.getDistribution(frequencies) : null;
    
    return {
      wordCloudData,
      topWords: this.getTopWords(frequencies, 20),
      stats,
      distribution
    };
  }
}

module.exports = new WordFrequencyAnalyzer();
