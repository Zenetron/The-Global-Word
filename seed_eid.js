const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const COUNTRIES = require('./countries.json');

const EID_EVENTS = ["eid", "mouton", "fête", "famille", "prière", "partage", "célébration"];

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

// List of countries with significant Muslim populations where Eid is prominently celebrated
const EID_COUNTRIES = [
    // Moyen-Orient & Afrique du Nord
    "Arabie Saoudite", "Émirats Arabes Unis", "Qatar", "Bahreïn", "Koweït", "Oman", "Yémen", "Irak", "Syrie", "Liban", "Jordanie", "Palestine",
    "Égypte", "Libye", "Tunisie", "Algérie", "Maroc", "Mauritanie", "Soudan",
    // Asie
    "Indonésie", "Pakistan", "Bangladesh", "Malaisie", "Afghanistan", "Iran", "Turquie", "Ouzbékistan", "Tadjikistan", "Kirghizistan", "Turkménistan", "Azerbaïdjan", "Maldives",
    // Afrique Sub-saharienne
    "Sénégal", "Mali", "Niger", "Tchad", "Nigeria", "Somalie", "Djibouti", "Comores", "Guinée", "Côte d'Ivoire", "Burkina Faso"
];

async function seedMixedEid() {
  console.log("Nuking old votes and populating the globe with Eid as Global Top 1...");

  const { error: deleteError } = await supabase.from('votes').delete().neq('id', 0);
  
  if (deleteError) {
      console.log("Error deleting old votes:", deleteError);
  } else {
      console.log("Old votes deleted.");
  }

  const votes = [];
  let otherCountryIndex = 0;
  
  for (const country of COUNTRIES) {
    let topics = [];
    
    // Check if country should have Eid topics
    const isEidCountry = EID_COUNTRIES.includes(country.name) || EID_COUNTRIES.includes(country.nameEn);
    
    if (isEidCountry) {
        // Eid country: "aïd" gets 5 votes to ensure it becomes Global Top 1 across these 40 countries
        // Another random Eid word gets 1 vote
        const shuffled = [...EID_EVENTS].sort(() => 0.5 - Math.random());
        topics = [
            { word: "aïd", count: 5 }, // 40 countries * 5 = 200 votes globally for "aïd"
            { word: shuffled[0], count: 1 }
        ];
    } else {
        // Normal country: local news + global trends (monday/coffee)
        const eventsPool = NEWS_EVENTS[country.continent] || GENERAL_EVENTS;
        const topic1 = eventsPool[Math.floor(Math.random() * eventsPool.length)];
        const mainWord = otherCountryIndex % 2 === 0 ? "monday" : "coffee";
        otherCountryIndex++;

        topics = [
            { word: topic1, count: 2 }, // Top 1 local
            { word: mainWord, count: 1 } // Top 2 local (~90 votes globally each)
        ];
    }

    for (const t of topics) {
      for (let i = 0; i < t.count; i++) {
        votes.push({
          word: t.word,
          country: country.name,
          lat: country.lat + (Math.random() - 0.5) * 4,
          lng: country.lng + (Math.random() - 0.5) * 4,
          ip_hash: `seed_${country.name}_${t.word}_${i}_${Date.now()}`,
          created_at: new Date().toISOString()
        });
      }
    }
  }

  console.log(`Inserting ${votes.length} votes...`);

  for (let i = 0; i < votes.length; i += 500) {
    const chunk = votes.slice(i, i + 500);
    const { error } = await supabase.from('votes').insert(chunk);
    if (error) {
        console.error("Error inserting chunk:", error.message);
    } else {
        console.log(`✅ ${i + chunk.length}/${votes.length} votes injectés...`);
    }
  }

  console.log("✨ Globe fully populated: Aïd is Global Top 1, but only appears locally in relevant countries!");
}

seedMixedEid();
