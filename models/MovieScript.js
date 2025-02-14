const mongoose = require('mongoose');

const dialogueSchema = new mongoose.Schema({
  character: String,
  dialogue: String,
  movie: String,
  genre: String,
  scene: String,
  embedding: {
    type: [Number],
    required: false,
    validate: {
      validator: function(v) {
        return v === null || (Array.isArray(v) && v.every(num => typeof num === 'number'))
      }
    }
  }
});

// Create index for vector search
dialogueSchema.index({ embedding: '2dsphere' });

module.exports = mongoose.model('Dialogue', dialogueSchema);