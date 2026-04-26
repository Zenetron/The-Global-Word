const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const translations = {
  "climat": "climate",
  "technologie": "technology",
  "avenir": "future",
  "solidarite": "solidarity",
  "solidarité": "solidarity",
  "croissance": "growth",
  "sante": "health",
  "santé": "health",
  "culture": "culture",
  "education": "education",
  "éducation": "education",
  "transport": "transport",
  "energie": "energy",
  "énergie": "energy",
  "soleil": "sun",
  "vacances": "holidays",
  "festival": "festival",
  "musique": "music",
  "sport": "sport",
  "football": "football",
  "euro": "euro",
  "histoire": "history",
  "art": "art",
  "developpement": "development",
  "développement": "development",
  "jeunesse": "youth",
  "innovation": "innovation",
  "agriculture": "agriculture",
  "eau": "water",
  "ressources": "resources",
  "communaute": "community",
  "communauté": "community",
  "tradition": "tradition",
  "espoir": "hope",
  "safari": "safari",
  "nature": "nature",
  "danse": "dance",
  "force": "strength",
  "progres": "progress",
  "progrès": "progress",
  "defense": "defense",
  "défense": "defense",
  "paix": "peace",
  "ecologie": "ecology",
  "écologie": "ecology",
  "soutien": "support",
  "courage": "courage",
  "victoire": "victory",
  "ia": "ai",
  "je": "ai"
};

async function fix() {
  console.log("Fetching all votes...");
  const { data: votes, error } = await supabase.from('votes').select('id, word');
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Found ${votes.length} votes. Processing...`);
  
  let updatedCount = 0;
  for (const vote of votes) {
    const w = vote.word ? vote.word.toLowerCase() : "";
    if (translations[w]) {
      const enWord = translations[w];
      const { error: upErr } = await supabase.from('votes').update({ word: enWord }).eq('id', vote.id);
      if (upErr) {
        console.error(`Failed to update ${vote.id}: ${upErr.message}`);
      } else {
        updatedCount++;
      }
    }
  }
  console.log(`Successfully updated ${updatedCount} rows to English pivot.`);
}

fix();
