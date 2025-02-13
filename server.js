require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.get('/check', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.post('/chat', async (req, res) => {
    const { character, movie, user_message } = req.body;
    const prompt = `Act as ${character} from the movie "${movie}". Stay in character and respond in their unique style, tone, and personality. Here is what the user says: "${user_message}". Your reply should be authentic to the character and fit the movie's context.`;
  
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
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
        character: character
      });
    } catch (error) {
      console.error('Gemini API Error:', error.response?.data || error.message);
      res.status(500).json({ error: 'Error generating response' });
    }
  });

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});