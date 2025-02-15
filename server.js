// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const Dialogue = require('./models/MovieScript');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateEmbedding } = require('./utils/embeddings');
const rateLimit = require('express-rate-limit');
const { redisClient, cache } = require('./utils/redis');

const app = express();
app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 5, // 5 requests per second
  message: 'Too many requests, please try again later'
});

app.use(limiter);


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
    // Check cache first
    const cacheKey = `chat:${character}:${movie}:${user_message}`;
    const cachedResponse = await redisClient.get(cacheKey);

    if (cachedResponse) {
      return res.json(JSON.parse(cachedResponse));
    }

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

    const prompt = `
Context from movie:
${context}

You are ${character} from "${movie}". Using the context above and staying in character, respond to: "${user_message}"
Keep the response concise and authentic to the character's personality.`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    const finalResponse = {
      message: response.text(),
      character: character,
      source: relevantDialogues.length > 0 ? 'rag_enhanced' : 'ai_generated',
      context: relevantDialogues
    };

    await cache.set(cacheKey, finalResponse);
    res.json(finalResponse);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error generating response' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});