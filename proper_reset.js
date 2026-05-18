const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const COUNTRIES = require('./countries.json');

const NEWS_EVENTS = {
  "Europe": ["climat", "eurovision", "sommet", "inflation", "technologie", "football", "accord", "sécurité", "grève"],
  "Amérique du Nord": ["bourse", "ia", "tech", "météo", "startup", "espace", "sport", "diplomatie"],
  "Amérique du Sud": ["agriculture", "manifestation", "forêt", "football", "économie", "sécurité", "culture", "carnaval"],
  "Moyen-Orient": ["pétrole", "paix", "technologie", "reconstruction", "diplomatie", "innovation", "énergie"],
  "Asie": ["semi-conducteurs", "ia", "croissance", "typhon", "exportations", "technologie", "démographie", "espace", "tourisme"],
  "Afrique": ["développement", "startups", "agriculture", "sommet", "infrastructures", "climat", "jeunesse", "ressources"],
  "Océanie": ["corail", "climat", "tourisme", "écologie", "pacifique", "technologie", "sport"]
};

const GENERAL_EVENTS = ["politique", "climat", "économie", "santé", "sport", "culture", "innovation"];

async function resetAllGlobeData() {
  console.log("Preparing data for all countries...");
  
  const votes = [];
  
  for (const country of COUNTRIES) {
    if (country.name === 'États-Unis' || country.nameEn === 'United States') {
       // USA specific logic: greve top 1
       const topics = [
         { word: "grève", count: 120 },
         { word: "tech", count: 50 },
         { word: "ia", count: 30 }
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
       // Italy specific logic: sinner top 1
       const topics = [
         { word: "sinner", count: 80 },
         { word: "tennis", count: 40 },
         { word: "climat", count: 20 }
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

    // Default for other countries
    const eventsPool = NEWS_EVENTS[country.continent] || GENERAL_EVENTS;
    
    // Pick 2 distinct topics
    const topic1 = eventsPool[Math.floor(Math.random() * eventsPool.length)];
    let topic2 = eventsPool[Math.floor(Math.random() * eventsPool.length)];
    while (topic1 === topic2 && eventsPool.length > 1) {
      topic2 = eventsPool[Math.floor(Math.random() * eventsPool.length)];
    }

    const topics = [
      { word: topic1, count: Math.floor(Math.random() * 10) + 15 }, // higher base count
      { word: topic2, count: Math.floor(Math.random() * 10) + 5 }
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

  console.log(`Inserting ${votes.length} clean votes...`);

  // Insert in chunks of 500
  for (let i = 0; i < votes.length; i += 500) {
    const chunk = votes.slice(i, i + 500);
    const { error } = await supabase.from('votes').insert(chunk);
    if (error) {
        console.error("Error inserting chunk:", error.message);
    } else {
        console.log(`✅ ${i + chunk.length}/${votes.length} votes injectés...`);
    }
  }

  console.log("✨ Globe fully reset with the correct rules!");
}

resetAllGlobeData();
