const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Function to clean only whitespace while preserving newlines
const cleanText = (text) => {
  return text
    .split('\n')
    .map(line => 
      line
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .trim()                // Remove leading/trailing spaces
    )
    .join('\n');              // Rejoin with newlines
};

async function scrapeMovieScript(movieName) {
  try {
    const formattedName = formatMovieName(movieName);
    const url = `https://imsdb.com/scripts/${formattedName}.html`;
    console.log(`Scraping: ${url}`);
    
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    // Get script content and clean whitespace
    const scriptContent = $('pre').text();
    const cleanedContent = cleanText(scriptContent);
    
    return {
      title: movieName,
      url: url,
      content: cleanedContent
    };
  } catch (error) {
    console.error(`Error scraping ${movieName}:`, error.message);
    return null;
  }
}

async function scrapeAllMovies() {
  const allMovies = {
    genres: {}
  };

  for (const genre of genres) {
    console.log(`\nProcessing ${genre} genre...`);
    allMovies.genres[genre] = [];
    
    const movies = await getMoviesByGenre(genre);
    
    for (const movie of movies) {
      const scriptData = await scrapeMovieScript(movie);
      if (scriptData) {
        allMovies.genres[genre].push(scriptData);
        console.log(`Added script for: ${movie}`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Save to JSON file with cleaned content
  fs.writeFileSync('movieScripts.json', JSON.stringify(allMovies, null, 2));
  console.log('\nScraping completed! Data saved to movie_scripts.json');
}

// Helper function to clean existing JSON file
function cleanExistingJSON() {
  try {
    // Read existing file
    const data = JSON.parse(fs.readFileSync('movie_scripts.json', 'utf8'));
    
    // Clean content in each movie
    Object.keys(data.genres).forEach(genre => {
      data.genres[genre].forEach(movie => {
        if (movie.content) {
          movie.content = cleanText(movie.content);
        }
      });
    });
    
    // Save cleaned data
    fs.writeFileSync('movie_scripts_clean.json', JSON.stringify(data, null, 2));
    console.log('Cleaned movie scripts saved to movie_scripts_clean.json');
  } catch (error) {
    console.error('Error cleaning JSON:', error.message);
  }
}

// Run the cleaner on existing file
cleanExistingJSON();