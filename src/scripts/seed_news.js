const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const REGIONAL_THEMES = {
  "Europe": ["Climat", "Green", "Écologie", "Paix", "Défense", "Innovation"],
  "Amérique du Nord": ["IA", "Tech", "Nasdaq", "Futur", "Liberté", "Finance"],
  "Moyen-Orient": ["Paix", "Stabilité", "Énergie", "Pétrole", "Marine"],
  "Asie": ["Sécurité", "Riz", "IA", "Tourisme", "Tokyo", "Progrès"],
  "Afrique": ["IA", "Progrès", "Avenir", "Gouvernance", "Jeunesse"],
  "Amérique latine": ["Justice", "Sécurité", "Réforme", "Nature"],
  "Ukraine": ["Liberté", "Victoire", "Soutien", "Courage"]
};

const COUNTRIES_DATA = [
  { name: 'France', continent: 'Europe', lat: 46.2276, lng: 2.2137 },
  { name: 'États-Unis', continent: 'Amérique du Nord', lat: 37.0902, lng: -95.7129 },
  { name: 'Israël', continent: 'Moyen-Orient', lat: 31.0461, lng: 34.8516 },
  { name: 'Ukraine', continent: 'Ukraine', lat: 48.3794, lng: 31.1656 },
  { name: 'Japon', continent: 'Asie', lat: 36.2048, lng: 138.2529 },
  { name: 'Chine', continent: 'Asie', lat: 35.8617, lng: 104.1954 },
  { name: 'Allemagne', continent: 'Europe', lat: 51.1657, lng: 10.4515 },
  { name: 'Royaume-Uni', continent: 'Europe', lat: 55.3781, lng: -3.4360 },
  { name: 'Brésil', continent: 'Amérique latine', lat: -14.2350, lng: -51.9253 },
  { name: 'Nigeria', continent: 'Afrique', lat: 9.0820, lng: 8.6753 },
  { name: 'Égypte', continent: 'Afrique', lat: 26.8206, lng: 30.8025 },
  { name: 'Canada', continent: 'Amérique du Nord', lat: 56.1304, lng: -106.3468 },
  { name: 'Australie', continent: 'Asie', lat: -25.2744, lng: 133.7751 },
  { name: 'Salvador', continent: 'Amérique latine', lat: 13.7942, lng: -88.8965 },
  { name: 'Congo', continent: 'Afrique', lat: -0.2280, lng: 15.8277 }
];

async function seed() {
  console.log("🚀 Injection de 1500 votes basés sur l'actualité d'avril 2026...");
  
  const votes = [];
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  for (let i = 0; i < 1500; i++) {
    const country = COUNTRIES_DATA[Math.floor(Math.random() * COUNTRIES_DATA.length)];
    const themes = REGIONAL_THEMES[country.continent] || ["Paix", "Futur"];
    const word = themes[Math.floor(Math.random() * themes.length)];
    
    votes.push({
      word: word.toLowerCase(),
      country: country.name,
      lat: country.lat + (Math.random() - 0.5) * 6,
      lng: country.lng + (Math.random() - 0.5) * 6,
      ip_hash: `news_seed_${i}`,
      created_at: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString() // Mots très récents (dernières 4h)
    });
  }

  for (let i = 0; i < votes.length; i += 200) {
    const chunk = votes.slice(i, i + 200);
    const { error } = await supabase.from('votes').insert(chunk);
    if (error) console.error("❌ Erreur paquet :", error.message);
    else console.log(`✅ ${i + chunk.length}/1500 votes injectés...`);
  }

  console.log("✨ Globe mis à jour avec l'actualité mondiale !");
}

seed();
