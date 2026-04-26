const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const COUNTRIES = require('./countries.json');

const THEMES_EN = {
  "Europe": ["climate", "ecology", "peace", "defense", "innovation", "economy", "culture"],
  "Amérique du Nord": ["ai", "tech", "future", "liberty", "finance", "business"],
  "Moyen-Orient": ["peace", "stability", "energy", "oil", "community"],
  "Asie": ["security", "technology", "ai", "tourism", "progress"],
  "Afrique": ["development", "youth", "innovation", "agriculture", "water"],
  "Amérique du Sud": ["justice", "security", "reform", "nature", "community"],
  "Océanie": ["nature", "ocean", "climate", "tourism"]
};

async function resetAndSeed() {
  console.log("CLEANING UP ALL DATA FROM DATABASE...");
  const { error: delErr } = await supabase.from('votes').delete().neq('id', -1);
  if (delErr) console.error("Error deleting data:", delErr);

  console.log(`Injecting fresh 1500 pure ENGLISH mock votes across ${COUNTRIES.length} countries...`);
  
  const votes = [];
  for (let i = 0; i < 1500; i++) {
    const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const themes = THEMES_EN[country.continent] || ["peace", "future"];
    const word = themes[Math.floor(Math.random() * themes.length)];
    
    votes.push({
      word: word.toLowerCase(),
      country: country.name,
      lat: country.lat + (Math.random() - 0.5) * 4,
      lng: country.lng + (Math.random() - 0.5) * 4,
      ip_hash: `fresh_seed_${i}`,
      created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  for (let i = 0; i < votes.length; i += 200) {
    const chunk = votes.slice(i, i + 200);
    const { error } = await supabase.from('votes').insert(chunk);
    if (error) console.error("Error inserting chunk:", error.message);
    else console.log(`✅ ${i + chunk.length}/1500 votes injectés...`);
  }

  console.log("✨ Database fully reset and populated with pure English data!");
}

resetAndSeed();
