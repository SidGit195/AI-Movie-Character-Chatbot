require('dotenv').config();
const mongoose = require('mongoose');
const { generateEmbedding } = require('../utils/embeddings');
const Dialogue = require('../models/MovieScript');

async function generateAllEmbeddings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const dialogues = await Dialogue.find({ embedding: { $exists: false } });
    console.log(`Found ${dialogues.length} dialogues without embeddings`);
    
    for (const dialogue of dialogues) {
      try {
        const embedding = await generateEmbedding(dialogue.dialogue);
        
        // Validate embedding before saving
        if (Array.isArray(embedding) && embedding.every(num => typeof num === 'number')) {
          dialogue.embedding = embedding;
          await dialogue.save();
          console.log(`Generated embedding for dialogue: ${dialogue._id}`);
        } else {
          console.error(`Invalid embedding format for dialogue: ${dialogue._id}`);
        }
      } catch (error) {
        console.error(`Error processing dialogue ${dialogue._id}:`, error);
        continue; // Skip to next dialogue on error
      }
    }
    
    console.log('Embeddings generation completed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

generateAllEmbeddings();