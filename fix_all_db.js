const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const translations = {
  "climat": "climate",
  "technologie": "technology",
  "avenir": "future",
  "solidarité": "solidarity",
  "solidarite": "solidarity",
  "croissance": "growth",
  "santé": "health",
  "sante": "health",
  "culture": "culture",
  "éducation": "education",
  "education": "education",
  "transport": "transport",
  "énergie": "energy",
  "energie": "energy",
  "soleil": "sun",
  "vacances": "holidays",
  "festival": "festival",
  "musique": "music",
  "sport": "sport",
  "football": "football",
  "euro": "euro",
  "histoire": "history",
  "art": "art",
  "développement": "development",
  "developpement": "development",
  "jeunesse": "youth",
  "innovation": "innovation",
  "agriculture": "agriculture",
  "eau": "water",
  "ressources": "resources",
  "communauté": "community",
  "communaute": "community",
  "tradition": "tradition",
  "espoir": "hope",
  "safari": "safari",
  "nature": "nature",
  "danse": "dance",
  "force": "strength",
  "progrès": "progress",
  "progres": "progress",
  "défense": "defense",
  "defense": "defense",
  "paix": "peace",
  "écologie": "ecology",
  "ecologie": "ecology",
  "soutien": "support",
  "courage": "courage",
  "victoire": "victory"
};

async function fixAll() {
  console.log("Starting massive update...");
  let offset = 0;
  let totalUpdated = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('votes')
      .select('id, word')
      .range(offset, offset + 999);

    if (error) {
      console.error(error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    for (const row of data) {
      const lowerWord = row.word ? row.word.toLowerCase() : "";
      if (translations[lowerWord]) {
        const { error: upErr } = await supabase
          .from('votes')
          .update({ word: translations[lowerWord] })
          .eq('id', row.id);
        
        if (!upErr) totalUpdated++;
      }
    }

    console.log(`Processed ${offset + data.length} rows, updated ${totalUpdated}...`);
    offset += 1000;
  }

  console.log(`Finished! Total updated: ${totalUpdated}`);
}

fixAll();
