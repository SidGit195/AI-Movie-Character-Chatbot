// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const Dialogue = require('./models/MovieScript');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateEmbedding } = require('./utils/embeddings');

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

app.post('/chat', async (req, res) => {
  const { character, movie, user_message } = req.body;
  
  try {
    const queryEmbedding = await generateEmbedding(user_message);

    const relevantDialogues = await Dialogue.aggregate([
      {
        $search: {
          index: "default",
          knnBeta: {
            vector: queryEmbedding,
            path: "embedding",
            k: 3
          }
        }
      },
      {
        $match: {
          character: new RegExp(character, 'i'),
          movie: new RegExp(movie, 'i')
        }
      }
    ]).exec();

    // Context enhancement
    const context = relevantDialogues
      .map(d => `${d.character}: ${d.dialogue}`)
      .join('\n');

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
Context from movie:
${context}

You are ${character} from "${movie}". Using the context above and staying in character, respond to: "${user_message}"
Keep the response concise and authentic to the character's personality.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.json({
      message: response.text(),
      character: character,
      source: relevantDialogues.length > 0 ? 'rag_enhanced' : 'ai_generated',
      context: relevantDialogues.map(d => ({
        dialogue: d.dialogue,
        similarity: d._score
      }))
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error generating response' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});