const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const COUNTRIES_DATA = [
  { name: 'France', continent: 'Europe', lat: 46.2276, lng: 2.2137 },
  { name: 'États-Unis', continent: 'Amérique du Nord', lat: 37.0902, lng: -95.7129 },
  { name: 'Israël', continent: 'Moyen-Orient', lat: 31.0461, lng: 34.8516 },
  { name: 'Ukraine', continent: 'Europe', lat: 48.3794, lng: 31.1656 },
  { name: 'Japon', continent: 'Asie', lat: 36.2048, lng: 138.2529 },
  { name: 'Chine', continent: 'Asie', lat: 35.8617, lng: 104.1954 },
  { name: 'Allemagne', continent: 'Europe', lat: 51.1657, lng: 10.4515 },
  { name: 'Angleterre', continent: 'Europe', lat: 52.3555, lng: -1.1743 },
  { name: 'Brésil', continent: 'Amérique du Sud', lat: -14.2350, lng: -51.9253 },
  { name: 'Nigeria', continent: 'Afrique', lat: 9.0820, lng: 8.6753 },
  { name: 'Égypte', continent: 'Afrique', lat: 26.8206, lng: 30.8025 },
  { name: 'Canada', continent: 'Amérique du Nord', lat: 56.1304, lng: -106.3468 },
  { name: 'Australie', continent: 'Océanie', lat: -25.2744, lng: 133.7751 },
  { name: 'Congo', continent: 'Afrique', lat: -0.2280, lng: 15.8277 },
  { name: 'Mauritanie', continent: 'Afrique', lat: 21.0079, lng: -10.9408 },
  { name: 'Palestine', continent: 'Moyen-Orient', lat: 31.9522, lng: 35.2332 },
  { name: 'Espagne', continent: 'Europe', lat: 40.4637, lng: -3.7492 },
  { name: 'Italie', continent: 'Europe', lat: 41.8719, lng: 12.5674 },
  { name: 'Sénégal', continent: 'Afrique', lat: 14.4974, lng: -14.4524 },
  { name: 'Maroc', continent: 'Afrique', lat: 31.7917, lng: -7.0926 }
];

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
  console.log("Cleaning up old mock data...");
  const { error: delErr } = await supabase.from('votes').delete().like('ip_hash', '%seed%');
  if (delErr) console.error("Error deleting seed data:", delErr);
  
  const { error: delErr2 } = await supabase.from('votes').delete().like('ip_hash', '%mock%');
  if (delErr2) console.error("Error deleting mock data:", delErr2);

  console.log("Injecting fresh 1500 pure ENGLISH mock votes...");
  
  const votes = [];
  const now = new Date();

  for (let i = 0; i < 1500; i++) {
    const country = COUNTRIES_DATA[Math.floor(Math.random() * COUNTRIES_DATA.length)];
    const themes = THEMES_EN[country.continent] || ["peace", "future"];
    const word = themes[Math.floor(Math.random() * themes.length)];
    
    votes.push({
      word: word.toLowerCase(),
      country: country.name,
      lat: country.lat + (Math.random() - 0.5) * 6,
      lng: country.lng + (Math.random() - 0.5) * 6,
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
