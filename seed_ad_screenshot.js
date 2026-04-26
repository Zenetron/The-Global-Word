const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { COUNTRIES } = require('./countries.json');

const wordsEurope = ["climate", "technology", "future", "solidarity", "growth", "health", "culture", "education", "transport", "energy", "sun", "holidays", "festival", "music", "sport", "football", "euro", "history", "art"];
const wordsAfrica = ["development", "youth", "innovation", "agriculture", "water", "resources", "community", "tradition", "future", "sun", "hope", "education", "safari", "nature", "music", "dance", "strength", "progress"];

const europeCountriesData = COUNTRIES.filter(c => c.continent === 'Europe').slice(0, 20);
const africaCountriesData = COUNTRIES.filter(c => c.continent === 'Afrique').slice(0, 15);

const generateVotes = (countryData, wordsPool, countPerCountry) => {
  const votes = [];
  countryData.forEach(countryInfo => {
    const selectedWords = new Set();
    while (selectedWords.size < countPerCountry) {
      selectedWords.add(wordsPool[Math.floor(Math.random() * wordsPool.length)]);
    }
    
    selectedWords.forEach(word => {
      const voteCount = Math.floor(Math.random() * 10) + 5;
      for (let i = 0; i < voteCount; i++) {
        votes.push({
          word: word.toLowerCase(),
          country: countryInfo.name,
          lat: countryInfo.lat + (Math.random() - 0.5) * 2,
          lng: countryInfo.lng + (Math.random() - 0.5) * 2,
          ip_hash: `seed-${Math.random().toString(36).substring(7)}`,
          created_at: new Date().toISOString()
        });
      }
    });
  });
  return votes;
};

async function seed() {
  console.log("Generating data...");
  const europeVotes = generateVotes(europeCountriesData, wordsEurope, 3);
  const africaVotes = generateVotes(africaCountriesData, wordsAfrica, 3);
  const allVotes = [...europeVotes, ...africaVotes];
  
  const batchSize = 100;
  console.log(`Inserting ${allVotes.length} votes...`);
  
  for (let i = 0; i < allVotes.length; i += batchSize) {
    const batch = allVotes.slice(i, i + batchSize);
    const { error } = await supabase.from('votes').insert(batch);
    if (error) {
      console.error(`Error inserting batch:`, error);
      return;
    }
    console.log(`Inserted ${i + batch.length}/${allVotes.length}`);
  }
  console.log("Done! Pure English seed complete.");
}

seed();
