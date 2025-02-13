// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const Dialogue = require('./models/MovieScript');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection failed:', err));

app.get('/check', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.post('/chat', async (req, res) => {
  const { character, movie, user_message } = req.body;
  
  try {
    // First try to find relevant dialogue from database
    const relevantDialogue = await Dialogue.findOne({
      character: new RegExp(character, 'i'),
      movie: new RegExp(movie, 'i'),
      dialogue: new RegExp(user_message.split(' ').join('|'), 'i')
    });

    if (relevantDialogue) {
      // Return actual movie dialogue if found
      return res.json({
        message: relevantDialogue.dialogue,
        character: character,
        source: 'movie_script from db'
      });
    }

    // Fallback to Gemini API if no relevant dialogue found
    const prompt = `Act as ${character} from the movie "${movie}". Stay in character and respond in their unique style, tone, and personality. Here is what the user says: "${user_message}". Your reply should be authentic to the character and fit the movie's context.`;
    
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.7
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          key: process.env.GEMINI_API_KEY
        }
      }
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;
    res.json({
      message: generatedText,
      character: character,
      source: 'ai'
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error generating response' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});