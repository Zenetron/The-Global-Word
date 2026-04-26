const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const frenchWords = [
  "soleil", "avenir", "transport", "paix", "espoir", "sante", "santé", 
  "climat", "technologie", "solidarite", "solidarité", "croissance",
  "culture", "education", "éducation", "energie", "énergie", 
  "vacances", "festival", "musique", "sport", "football", "euro", 
  "histoire", "art", "developpement", "développement", "jeunesse", 
  "innovation", "agriculture", "eau", "ressources", "communaute", 
  "communauté", "tradition", "safari", "nature", "danse", "force", 
  "progres", "progrès", "defense", "défense", "ecologie", "écologie", 
  "soutien", "courage", "victoire", "joie", "amour", "tristesse", "zen", "chaos"
];

async function targetDelete() {
  console.log("Starting targeted deletion...");
  for (const word of frenchWords) {
    const { error } = await supabase.from('votes').delete().ilike('word', word);
    if (error) {
      console.error(`Error deleting ${word}:`, error);
    } else {
      console.log(`Successfully purged: ${word}`);
    }
  }
  console.log("Targeted deletion finished.");
}

targetDelete();
