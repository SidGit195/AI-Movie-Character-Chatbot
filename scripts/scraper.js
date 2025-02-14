const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const genres = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
  'Drama', 'Family', 'Fantasy', 'Film-Noir', 'Horror',
  'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Short',
  'Thriller', 'War', 'Western'
];

const formatMovieName = (name) => name.replace(/[^a-zA-Z0-9]/g, '-');

async function getMoviesByGenre(genre) {
  try {
    const url = `https://imsdb.com/genre/${genre}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    const movies = [];
    // Target specific table containing movie links
    $('p a').each((i, elem) => {
      if (i < 3) { // Get only first 3 movies
        const movieName = $(elem).text().trim();
        if (movieName && !movieName.includes('Genre') && !movieName.includes('Writers')) {
          movies.push(movieName);
        }
      }
    });
    
    console.log(`Found ${movies.length} movies for ${genre}:`, movies);
    return movies;
  } catch (error) {
    console.error(`Error fetching ${genre} movies:`, error.message);
    return [];
  }
}

async function scrapeMovieScript(movieName) {
  try {
    const formattedName = formatMovieName(movieName);
    const url = `https://imsdb.com/scripts/${formattedName}.html`;
    console.log(`Scraping: ${url}`);
    
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    // Target pre tag containing script content
    const scriptContent = $('pre').text().trim();
    
    if (!scriptContent) {
      console.log(`No script content found for ${movieName}`);
      return null;
    }

    return {
      title: movieName,
      url: url,
      content: scriptContent.substring(0, 1000) // Store first 1000 chars as preview
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
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  fs.writeFileSync('movie_scripts.json', JSON.stringify(allMovies, null, 2));
  console.log('\nScraping completed! Data saved to movie_scripts.json');
}

scrapeAllMovies();