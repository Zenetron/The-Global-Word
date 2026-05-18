const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const COUNTRIES = require('./countries.json');

const NEWS_EVENTS = {
  "Europe": ["climat", "eurovision", "quantum", "inflation", "supercalculateur", "football", "cyber", "sécurité", "grève"],
  "Amérique du Nord": ["bourse", "ia", "tech", "météo", "spatial", "espace", "sport", "diplomatie"],
  "Amérique du Sud": ["agritech", "manifestation", "forêt", "football", "économie", "sécurité", "culture", "carnaval"],
  "Moyen-Orient": ["hydrogène", "paix", "technologie", "fusion", "diplomatie", "innovation", "énergie"],
  "Asie": ["semi-conducteurs", "ia", "robotique", "typhon", "exportations", "technologie", "démographie", "espace", "exploration"],
  "Afrique": ["développement", "startups", "agritech", "fintech", "infrastructures", "climat", "solaire", "ressources"],
  "Océanie": ["corail", "climat", "exploration", "écologie", "pacifique", "technologie", "sport"]
};

const GENERAL_EVENTS = ["activisme", "climat", "économie", "santé", "sport", "culture", "innovation"];

async function resetAllGlobeData() {
  console.log("Preparing ultra-premium optimized data with monday and coffee for all countries...");
  
  const votes = [];
  let otherCountryIndex = 0;
  
  for (const country of COUNTRIES) {
    if (country.name === 'États-Unis' || country.nameEn === 'United States') {
       const topics = [
         { word: "grève", count: 8 },
         { word: "monday", count: 4 },
         { word: "coffee", count: 3 }
       ];
       for (const t of topics) {
         for (let i = 0; i < t.count; i++) {
           votes.push({
             word: t.word,
             country: country.name,
             lat: country.lat + (Math.random() - 0.5) * 4,
             lng: country.lng + (Math.random() - 0.5) * 4,
             ip_hash: `us_${t.word}_${i}_${Date.now()}`,
             created_at: new Date().toISOString()
           });
         }
       }
       continue;
    }

    if (country.name === 'Italie' || country.nameEn === 'Italy') {
       const topics = [
         { word: "sinner", count: 6 },
         { word: "tennis", count: 2 },
         { word: "climat", count: 1 }
       ];
       for (const t of topics) {
         for (let i = 0; i < t.count; i++) {
           votes.push({
             word: t.word,
             country: country.name,
             lat: country.lat + (Math.random() - 0.5) * 4,
             lng: country.lng + (Math.random() - 0.5) * 4,
             ip_hash: `italy_${t.word}_${i}_${Date.now()}`,
             created_at: new Date().toISOString()
           });
         }
       }
       continue;
    }

    // Default for other countries: exactly 3 votes per country to fit perfectly in 1000 limit
    // The news topic has 3 votes (Top 1 local), and monday/coffee has 2 votes (Top 2 local).
    // This ensures every country shows actual news, but monday/coffee accumulate the most votes globally!
    const eventsPool = NEWS_EVENTS[country.continent] || GENERAL_EVENTS;
    const topic1 = eventsPool[Math.floor(Math.random() * eventsPool.length)];
    
    const mainWord = otherCountryIndex % 2 === 0 ? "monday" : "coffee";
    otherCountryIndex++;

    const topics = [
      { word: topic1, count: 2 },
      { word: mainWord, count: 1 }
    ];

    for (const t of topics) {
      for (let i = 0; i < t.count; i++) {
        votes.push({
          word: t.word,
          country: country.name,
          lat: country.lat + (Math.random() - 0.5) * 4,
          lng: country.lng + (Math.random() - 0.5) * 4,
          ip_hash: `globe_${country.name}_${t.word}_${i}_${Date.now()}`,
          created_at: new Date().toISOString()
        });
      }
    }
  }

  console.log(`Inserting ${votes.length} optimized premium votes...`);

  for (let i = 0; i < votes.length; i += 500) {
    const chunk = votes.slice(i, i + 500);
    const { error } = await supabase.from('votes').insert(chunk);
    if (error) {
        console.error("Error inserting chunk:", error.message);
    } else {
        console.log(`✅ ${i + chunk.length}/${votes.length} votes injectés...`);
    }
  }

  console.log("✨ Globe fully populated with premium terms!");
}

resetAllGlobeData();
