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
const promClient = require('prom-client');
const register = new promClient.Registry();

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

// Define metrics
const metrics = {
  responseTime: new promClient.Histogram({
    name: 'chat_response_time',
    help: 'Chat response time in milliseconds',
    buckets: [100, 200, 300, 400, 500]
  }),
  
  requestsTotal: new promClient.Counter({
    name: 'chat_requests_total',
    help: 'Total number of chat requests'
  }),

  cacheHits: new promClient.Counter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits'
  }),

  errors: new promClient.Counter({
    name: 'errors_total',
    help: 'Total number of errors'
  })
};

// Register metrics
Object.values(metrics).forEach(metric => register.registerMetric(metric));

app.post('/chat', async (req, res) => {
  const startTime = process.hrtime();
  metrics.requestsTotal.inc();

  const { character, user_message } = req.body;

  try {
    // Check cache first
    const cacheKey = `chat:${character}:${user_message}`;
    const cachedResponse = await redisClient.get(cacheKey);

    if (cachedResponse) {
      metrics.cacheHits.inc();
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
          // movie: new RegExp(movie, 'i')
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

You are ${character}. Using the context above and staying in character, respond to: "${user_message}"
Keep the response concise and authentic to the character's personality.`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    const finalResponse = {
      message: response.text(),
      // character: character,
      source: relevantDialogues.length > 0 ? 'rag_enhanced' : 'ai_generated',
      // context: relevantDialogues
    };

    await cache.set(cacheKey, finalResponse);

    // Record response time
    const endTime = process.hrtime(startTime);
    const duration = (endTime[0] * 1000 + endTime[1] / 1e6);
    metrics.responseTime.observe(duration);

    res.json(finalResponse);

  } catch (error) {
    metrics.errors.inc();
    console.error('Error:', error);
    res.status(500).json({ error: 'Error generating response' });
  }
});

// Metrics endpoint
app.get('/metrics', async (_, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
});