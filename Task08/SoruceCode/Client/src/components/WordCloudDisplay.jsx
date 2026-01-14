import { useEffect, useRef, useState } from 'react';
import WordCloud from 'wordcloud';

const WordCloudDisplay = ({ words }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });

  // Handle responsive sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 40; // Account for padding
        const width = Math.min(containerWidth, 800);
        const height = Math.round(width * 0.625); // 5:8 aspect ratio
        setCanvasSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !words || words.length === 0) return;

    const canvas = canvasRef.current;
    const wordList = words.map(w => [w.text, w.value]);

    // Clear previous word cloud
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate weight factor based on canvas size
    const weightFactor = Math.max(1, canvasSize.width / 300);

    // Generate word cloud
    WordCloud(canvas, {
      list: wordList,
      gridSize: Math.max(4, Math.round(canvasSize.width / 100)),
      weightFactor: weightFactor,
      fontFamily: 'Georgia, serif',
      color: () => {
        const colors = [
          '#5d4e37', '#8b7355', '#a0522d', '#6b5344', 
          '#4a3728', '#7c6a5d', '#94705a', '#5c4033',
          '#8b4513', '#704214'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      },
      rotateRatio: 0.2,
      rotationSteps: 2,
      backgroundColor: '#faf8f5',
      minSize: 10,
      drawOutOfBound: false,
      shrinkToFit: true,
      wait: 0
    });
  }, [words, canvasSize]);

  return (
    <div className="wordcloud-canvas-container" ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        width={canvasSize.width} 
        height={canvasSize.height}
        style={{ 
          display: 'block',
          maxWidth: '100%', 
          height: 'auto',
          margin: '0 auto'
        }}
      />
    </div>
  );
};

export default WordCloudDisplay;
