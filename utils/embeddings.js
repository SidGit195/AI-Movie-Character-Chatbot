require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    
    // Extract the embedding values and ensure they're numbers
    const embeddingArray = result.embedding.values.map(Number);
    
    // Validate the embedding array
    if (!Array.isArray(embeddingArray) || !embeddingArray.every(num => typeof num === 'number')) {
      throw new Error('Invalid embedding format');
    }
    
    return embeddingArray;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

module.exports = { generateEmbedding };