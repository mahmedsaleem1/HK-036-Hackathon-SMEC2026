const { createCanvas } = require('canvas');

class WordCloudGenerator {
  constructor() {
    this.defaultOptions = {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      fontFamily: 'Arial',
      colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2']
    };
  }

  /**
   * Generate random color from palette
   */
  getRandomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Check if word overlaps with existing words
   */
  checkOverlap(newWord, placedWords) {
    for (const placed of placedWords) {
      if (
        newWord.x < placed.x + placed.width &&
        newWord.x + newWord.width > placed.x &&
        newWord.y < placed.y + placed.height &&
        newWord.y + newWord.height > placed.y
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Find position for word using spiral placement
   */
  findPosition(word, canvas, ctx, placedWords, centerX, centerY) {
    const maxAttempts = 500;
    const spiralStep = 2;
    
    for (let angle = 0; angle < Math.PI * 20; angle += 0.1) {
      const radius = spiralStep * angle;
      const x = centerX + radius * Math.cos(angle) - word.width / 2;
      const y = centerY + radius * Math.sin(angle) - word.height / 2;
      
      // Check bounds
      if (x < 0 || y < 0 || x + word.width > canvas.width || y + word.height > canvas.height) {
        continue;
      }
      
      const wordBox = { x, y, width: word.width, height: word.height };
      
      if (!this.checkOverlap(wordBox, placedWords)) {
        return { x, y };
      }
    }
    
    return null;
  }

  /**
   * Generate word cloud as base64 image
   */
  async generateImage(wordData, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    const canvas = createCanvas(opts.width, opts.height);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = opts.backgroundColor;
    ctx.fillRect(0, 0, opts.width, opts.height);
    
    const centerX = opts.width / 2;
    const centerY = opts.height / 2;
    const placedWords = [];
    
    // Sort words by value (largest first)
    const sortedWords = [...wordData].sort((a, b) => b.value - a.value);
    
    // Place each word
    for (const wordObj of sortedWords) {
      const fontSize = Math.max(12, Math.min(100, wordObj.size || wordObj.value * 2));
      ctx.font = `bold ${fontSize}px ${opts.fontFamily}`;
      
      const metrics = ctx.measureText(wordObj.text);
      const width = metrics.width;
      const height = fontSize;
      
      const position = this.findPosition(
        { width, height, text: wordObj.text },
        canvas,
        ctx,
        placedWords,
        centerX,
        centerY
      );
      
      if (position) {
        ctx.fillStyle = this.getRandomColor(opts.colors);
        ctx.fillText(wordObj.text, position.x, position.y + height);
        
        placedWords.push({
          x: position.x,
          y: position.y,
          width,
          height,
          text: wordObj.text
        });
      }
    }
    
    // Convert to base64
    return canvas.toDataURL('image/png');
  }

  /**
   * Generate word cloud data for frontend rendering
   */
  generateData(wordData, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    
    return {
      words: wordData.map((word, index) => ({
        text: word.text,
        value: word.value,
        size: word.size || word.value,
        color: opts.colors[index % opts.colors.length]
      })),
      options: {
        width: opts.width,
        height: opts.height,
        fontFamily: opts.fontFamily
      }
    };
  }
}

module.exports = new WordCloudGenerator();
