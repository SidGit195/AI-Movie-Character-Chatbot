// models/MovieScript.js
const mongoose = require('mongoose');

const dialogueSchema = new mongoose.Schema({
  character: String,
  dialogue: String,
  movie: String,
  genre: String,
  scene: String
});

module.exports = mongoose.model('Dialogue', dialogueSchema);