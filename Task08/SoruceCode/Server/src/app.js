const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/lyrics', require('./routes/lyrics'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Lyrics Word Cloud API is running' });
});

module.exports = app;
