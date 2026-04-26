const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const wordsEurope = [
  "Climat", "Technologie", "Avenir", "Solidarité", "Croissance", "Santé", 
  "Culture", "Éducation", "Transport", "Énergie", "Soleil", "Vacances", 
  "Festival", "Musique", "Sport", "Football", "Euro", "Histoire", "Art"
];

const wordsAfrica = [
  "Développement", "Jeunesse", "Innovation", "Agriculture", "Eau", "Ressources",
  "Communauté", "Tradition", "Avenir", "Soleil", "Espoir", "Éducation",
  "Safari", "Nature", "Musique", "Danse", "Force", "Progrès"
];

const europeCountriesData = [
  { name: 'Allemagne', lat: 51.1657, lng: 10.4515 },
  { name: 'Belgique', lat: 50.5039, lng: 4.4699 },
  { name: 'Espagne', lat: 40.4637, lng: -3.7492 },
  { name: 'France', lat: 46.2276, lng: 2.2137 },
  { name: 'Grèce', lat: 39.0742, lng: 21.8243 },
  { name: 'Irlande', lat: 53.1424, lng: -7.6921 },
  { name: 'Italie', lat: 41.8719, lng: 12.5674 },
  { name: 'Norvège', lat: 60.472, lng: 8.4689 },
  { name: 'Pays-Bas', lat: 52.1326, lng: 5.2913 },
  { name: 'Pologne', lat: 51.9194, lng: 19.1451 },
  { name: 'Portugal', lat: 39.3999, lng: -8.2245 },
  { name: 'Angleterre', lat: 52.3555, lng: -1.1743 },
  { name: 'Écosse', lat: 56.4907, lng: -4.2026 },
  { name: 'Pays de Galles', lat: 52.1307, lng: -3.7837 },
  { name: 'Irlande du Nord', lat: 54.7877, lng: -6.4923 },
  { name: 'Russie', lat: 61.524, lng: 105.3188 },
  { name: 'Suède', lat: 60.1282, lng: 18.6435 },
  { name: 'Suisse', lat: 46.8182, lng: 8.2275 },
  { name: 'Ukraine', lat: 48.3794, lng: 31.1656 }
];

const africaCountriesData = [
  { name: 'Afrique du Sud', lat: -30.5595, lng: 22.9375 },
  { name: 'Algérie', lat: 28.0339, lng: 1.6596 },
  { name: 'Congo', lat: -0.228, lng: 15.8277 },
  { name: 'Égypte', lat: 26.8206, lng: 30.8025 },
  { name: 'Madagascar', lat: -18.7669, lng: 46.8691 },
  { name: 'Mali', lat: 17.5707, lng: -3.9962 },
  { name: 'Maroc', lat: 31.7917, lng: -7.0926 },
  { name: 'Nigeria', lat: 9.082, lng: 8.6753 },
  { name: 'Sénégal', lat: 14.4974, lng: -14.4524 },
  { name: 'Tunisie', lat: 33.8869, lng: 9.5375 }
];

const generateVotes = (countryData, wordsPool, countPerCountry) => {
  const votes = [];
  countryData.forEach(countryInfo => {
    const country = countryInfo.name;
    // Generate multiple random words for each country
    const selectedWords = new Set();
    while (selectedWords.size < countPerCountry) {
      selectedWords.add(wordsPool[Math.floor(Math.random() * wordsPool.length)]);
    }
    
    selectedWords.forEach(word => {
      // Add a random number of votes to make it the clear winner for that country
      // between 5 and 15
      // We need lat and lng to make them appear on the globe!
      const countryInfo = [...europeCountriesData, ...africaCountriesData].find(c => c.name === country);
      
      const voteCount = Math.floor(Math.random() * 10) + 5;
      for (let i = 0; i < voteCount; i++) {
        votes.push({
          word: word.toLowerCase(),
          country: country,
          lat: countryInfo ? countryInfo.lat : 0,
          lng: countryInfo ? countryInfo.lng : 0,
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
  const europeVotes = generateVotes(europeCountriesData, wordsEurope, 3); // 3 different trending words per country
  const africaVotes = generateVotes(africaCountriesData, wordsAfrica, 3); // 3 different trending words per country
  
  const allVotes = [...europeVotes, ...africaVotes];
  
  // Insert in batches of 100 to avoid limits
  const batchSize = 100;
  let inserted = 0;
  
  console.log(`Inserting ${allVotes.length} votes...`);
  
  for (let i = 0; i < allVotes.length; i += batchSize) {
    const batch = allVotes.slice(i, i + batchSize);
    const { error } = await supabase.from('votes').insert(batch);
    if (error) {
      console.error(`Error inserting batch ${i}:`, error);
      return;
    }
    inserted += batch.length;
    console.log(`Inserted ${inserted}/${allVotes.length}`);
  }
  
  console.log("Done! The globe should now be very populated in Europe and Africa.");
}

seed();
