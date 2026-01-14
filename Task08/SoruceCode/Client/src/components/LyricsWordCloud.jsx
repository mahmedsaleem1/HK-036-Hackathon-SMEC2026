import { useState } from 'react';
import axios from 'axios';
import './LyricsWordCloud.css';
import WordCloudDisplay from './WordCloudDisplay';

const LyricsWordCloud = () => {
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!songName.trim()) {
      setError('Please enter a song name');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/lyrics/generate', {
        songName: songName.trim(),
        artistName: artistName.trim(),
        options: {
          topN: 100,
          minFrequency: 1,
          useStemming: true,
          removeStops: true
        }
      });

      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.error || 'Failed to generate word cloud');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to connect to server. Make sure the backend is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSongName('');
    setArtistName('');
    setResult(null);
    setError('');
    setShowLyrics(false);
  };

  return (
    <div className="lyrics-wordcloud-container">
      <header className="header">
        <h1>Lyrics Word Cloud</h1>
        <p>Discover the words that matter most in your favorite songs</p>
      </header>

      <div className="search-section">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Song name (e.g., Imagine)"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              disabled={loading}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Artist name (optional, e.g., John Lennon)"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              disabled={loading}
              className="input-field"
            />
          </div>
          
          <div className="button-group">
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Creating...' : 'Create Word Cloud'}
            </button>
            
            {result && (
              <button 
                type="button" 
                onClick={handleClear}
                className="btn btn-secondary"
              >
                Start Over
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {loading && (
          <div className="loading-message">
            <div className="spinner"></div>
            <p>Finding lyrics and creating your word cloud...</p>
          </div>
        )}
      </div>

      {result && (
        <div className="results-section">
          <div className="song-info">
            <h2>{result.song.name}</h2>
            <p className="artist">by {result.song.artist}</p>
            <p className="source">Source: {result.song.source}</p>
            {result.song.url && (
              <a href={result.song.url} target="_blank" rel="noopener noreferrer">
                View on {result.song.source}
              </a>
            )}
          </div>

          <div className="wordcloud-container">
            <h3>Word Cloud</h3>
            <WordCloudDisplay words={result.wordCloud.words} />
          </div>

          <div className="stats-container">
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Words</h4>
                <p className="stat-value">{result.analysis.textStats.totalWords}</p>
              </div>
              <div className="stat-card">
                <h4>Unique Words</h4>
                <p className="stat-value">{result.analysis.textStats.uniqueWords}</p>
              </div>
              <div className="stat-card">
                <h4>Character Count</h4>
                <p className="stat-value">{result.analysis.textStats.characterCount}</p>
              </div>
              <div className="stat-card">
                <h4>Avg Word Length</h4>
                <p className="stat-value">
                  {result.analysis.textStats.avgWordLength.toFixed(1)} chars
                </p>
              </div>
            </div>
          </div>

          <div className="top-words-container">
            <h3>Top 20 Words</h3>
            <div className="top-words-grid">
              {result.analysis.topWords.map((word, index) => (
                <div key={index} className="word-item">
                  <span className="word-rank">#{index + 1}</span>
                  <span className="word-text">{word.word}</span>
                  <span className="word-count">{word.count}×</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lyrics-section">
            <button 
              onClick={() => setShowLyrics(!showLyrics)}
              className="btn btn-secondary"
            >
              {showLyrics ? 'Hide Lyrics' : 'View Lyrics'}
            </button>
            
            {showLyrics && (
              <div className="lyrics-display">
                <pre>{result.lyrics}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LyricsWordCloud;
