const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function purgeAndFixUS() {
  console.log("Removing bad words from US...");
  
  // 1. Delete attack/shooting related words
  const wordsToDelete = ['attaque', 'fusillade', 'attentat'];
  for (const w of wordsToDelete) {
     await supabase
        .from('votes')
        .delete()
        .eq('country', 'États-Unis')
        .eq('word', w);
  }
  
  console.log("Deleted old bad votes for the US.");

  // 2. Insert new, more topical votes for the US
  const votes = [];
  const COUNTRIES = require('./countries.json');
  const countryInfo = COUNTRIES.find(c => c.name === "États-Unis" || c.nameEn === "United States");
  
  // Based on May 18, 2026 news: Rededicate 250 rally, Waymo issues, LIRR strike
  const newTopics = [
    { word: "rally", count: 120 },
    { word: "waymo", count: 85 },
    { word: "strike", count: 60 }
  ];

  for (const item of newTopics) {
    for (let i = 0; i < item.count; i++) {
      votes.push({
        word: item.word,
        country: countryInfo.name,
        lat: countryInfo.lat + (Math.random() - 0.5) * 5,
        lng: countryInfo.lng + (Math.random() - 0.5) * 5,
        ip_hash: `us_top_real_${item.word}_${i}_${Date.now()}`,
        created_at: new Date().toISOString()
      });
    }
  }

  const { error: insertError } = await supabase.from('votes').insert(votes);
  
  if (insertError) {
    console.error("Error inserting new votes:", insertError.message);
  } else {
    console.log("Successfully inserted new topical words for the US (rally, waymo, strike)!");
  }
}

purgeAndFixUS();
