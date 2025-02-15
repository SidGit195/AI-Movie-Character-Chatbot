const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Dialogue = require('../models/MovieScript');

require('dotenv').config();

async function loadScripts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const scripts = JSON.parse(fs.readFileSync(path.join(__dirname, './movie_scripts_clean.json')));
    
    for (const [genre, movies] of Object.entries(scripts.genres)) {
      for (const movie of movies) {
        const scenes = movie.content.split('\n\n');
        
        // Parse scenes for dialogues
        scenes.forEach(async (scene) => {
          if (scene.includes(':')) {
            const [character, dialogue] = scene.split(':').map(s => s.trim());
            if (character && dialogue) {
              await Dialogue.create({
                character: character,
                dialogue: dialogue,
                movie: movie.title,
                genre: genre,
                scene: scene
              });
            }
          }
        });
      }
    }
    console.log('Scripts loaded successfully');
  } catch (error) {
    console.error('Error loading scripts:', error);
  }
}

loadScripts();