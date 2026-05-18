const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const COUNTRIES = require('./countries.json');

const NEWS_EVENTS = {
  "Europe": ["élections", "climat", "grève", "sommet", "inflation", "technologie", "football", "accord", "sécurité", "eurovision"],
  "Amérique du Nord": ["bourse", "ia", "tech", "élections", "météo", "startup", "espace", "sport", "diplomatie"],
  "Amérique du Sud": ["agriculture", "manifestation", "élections", "forêt", "football", "économie", "sécurité", "culture"],
  "Moyen-Orient": ["pétrole", "paix", "technologie", "reconstruction", "diplomatie", "innovation", "énergie"],
  "Asie": ["semi-conducteurs", "ia", "croissance", "typhon", "exportations", "technologie", "démographie", "espace", "tourisme"],
  "Afrique": ["développement", "startups", "agriculture", "sommet", "infrastructures", "climat", "jeunesse", "ressources"],
  "Océanie": ["corail", "climat", "tourisme", "écologie", "pacifique", "technologie", "sport"]
};

const GENERAL_EVENTS = ["politique", "climat", "économie", "santé", "sport", "culture", "innovation"];

async function seedNews() {
  console.log("CLEANING UP ALL DATA FROM DATABASE...");
  const { error: delErr } = await supabase.from('votes').delete().neq('id', -1);
  if (delErr) {
    console.error("Error deleting data:", delErr);
    return;
  }

  console.log(`Injecting fresh 1500 news events across ${COUNTRIES.length} countries...`);
  
  const votes = [];
  for (let i = 0; i < 1500; i++) {
    const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    let events = NEWS_EVENTS[country.continent] || GENERAL_EVENTS;
    const word = events[Math.floor(Math.random() * events.length)];
    
    votes.push({
      word: word,
      country: country.name,
      lat: country.lat + (Math.random() - 0.5) * 4,
      lng: country.lng + (Math.random() - 0.5) * 4,
      ip_hash: `news_seed_${i}_${Date.now()}`,
      created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  for (let i = 0; i < votes.length; i += 200) {
    const chunk = votes.slice(i, i + 200);
    const { error } = await supabase.from('votes').insert(chunk);
    if (error) {
        console.error("Error inserting chunk:", error.message);
    } else {
        console.log(`✅ ${i + chunk.length}/1500 votes injectés...`);
    }
  }

  console.log("✨ Database fully reset and populated with today's events!");
}

seedNews();
