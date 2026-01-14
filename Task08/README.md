# Lyrics Word Cloud Generator - Task 08

## Overview
A web application that scrapes song lyrics from multiple sources and generates beautiful word cloud visualizations with NLP analysis.

## Architecture

```
User Input (Song / Artist)
        ↓
Lyrics Scraper (Genius, AZLyrics, Lyrics.com)
        ↓
Text Cleaning & NLP Processing
        ↓
Word Frequency Analyzer
        ↓
Word Cloud Generator
        ↓
Frontend Display
```

## Features

### Backend
- **Multi-source Lyrics Scraping**: Automatically tries Genius, AZLyrics, and Lyrics.com
- **NLP Text Processing**: 
  - Tokenization
  - Stopword removal (English + custom lyrics stopwords)
  - Stemming/Lemmatization
  - Text cleaning
- **Word Frequency Analysis**:
  - Frequency calculation
  - Top N words extraction
  - Statistical analysis
  - Frequency normalization
- **Word Cloud Generation**: Canvas-based word cloud image generation

### Frontend
- **Interactive Search**: Song and artist input
- **Word Cloud Visualization**: Interactive canvas-based word cloud
- **Statistics Dashboard**: 
  - Total words
  - Unique words
  - Character count
  - Average word length
- **Top 20 Words Display**: Ranked list with frequencies
- **Lyrics Viewer**: Toggle to show/hide full lyrics

## Installation & Setup

### Backend
```bash
cd Task08/SoruceCode/Server
npm install
npm start
```

Server runs on: `http://localhost:5000`

### Frontend
```bash
cd Task08/SoruceCode/Client
npm install
npm run dev
```

Client runs on: `http://localhost:5173` (or your Vite port)

## API Endpoints

### POST /api/lyrics/generate
Generate word cloud from song lyrics
```json
{
  "songName": "Bohemian Rhapsody",
  "artistName": "Queen",
  "options": {
    "topN": 100,
    "minFrequency": 1,
    "useStemming": true,
    "removeStops": true
  }
}
```

### POST /api/lyrics/lyrics
Get lyrics only (no word cloud)
```json
{
  "songName": "Song Name",
  "artistName": "Artist Name"
}
```

### POST /api/lyrics/generate-image
Generate word cloud as base64 image
```json
{
  "songName": "Song Name",
  "artistName": "Artist Name"
}
```

## Tech Stack

### Backend
- Node.js + Express
- axios (HTTP requests)
- cheerio (Web scraping)
- natural (NLP processing)
- stopword (Stopword removal)
- canvas (Image generation)

### Frontend
- React 18
- Vite
- wordcloud (Word cloud visualization)
- axios (API requests)

## Usage

1. Start the backend server
2. Start the frontend dev server
3. Enter song name and artist name
4. Click "Generate Word Cloud"
5. View the word cloud, statistics, and top words
6. Optionally view full lyrics

## How It Works

1. **Scraping**: System tries multiple sources sequentially until lyrics are found
2. **Processing**: Lyrics are cleaned, tokenized, and processed with NLP
3. **Analysis**: Word frequencies are calculated and normalized
4. **Visualization**: Word cloud is generated with size based on frequency
5. **Display**: Results shown with interactive UI

## Notes

- The scraper respects website structures and uses proper user agents
- Lyrics are for educational/personal use only
- Multiple sources ensure higher success rate
- NLP processing removes common words and lyrics-specific filler words
- Word cloud uses spiral placement algorithm for optimal layout

## Example Songs to Try

- "Bohemian Rhapsody" by "Queen"
- "Imagine" by "John Lennon"
- "Hey Jude" by "The Beatles"
- "Stairway to Heaven" by "Led Zeppelin"
- "Smells Like Teen Spirit" by "Nirvana"
