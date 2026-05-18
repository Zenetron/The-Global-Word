const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const COUNTRIES = require('./countries.json');

async function seedOtherTopWords() {
  const votes = [];
  
  // Data structure: word, country, voteCount
  const topGlobalWords = [
    { word: "élections", countryName: "États-Unis", count: 120 },
    { word: "macron", countryName: "France", count: 90 },
    { word: "ia", countryName: "Japon", count: 70 },
    { word: "inflation", countryName: "Royaume-Uni", count: 65 }
  ];

  for (const item of topGlobalWords) {
    const countryInfo = COUNTRIES.find(c => c.name === item.countryName || c.nameEn === item.countryName);
    if (!countryInfo) {
      console.error(`Could not find coordinates for ${item.countryName}`);
      continue;
    }

    for (let i = 0; i < item.count; i++) {
      votes.push({
        word: item.word,
        country: countryInfo.name,
        lat: countryInfo.lat + (Math.random() - 0.5) * 2,
        lng: countryInfo.lng + (Math.random() - 0.5) * 2,
        ip_hash: `global_top_${item.word}_${i}_${Date.now()}`,
        created_at: new Date().toISOString()
      });
    }
  }

  const { error } = await supabase.from('votes').insert(votes);
  if (error) {
    console.error("Error inserting votes:", error.message);
  } else {
    console.log("Successfully inserted global top words to dethrone Sinner globally!");
  }
}

seedOtherTopWords();
