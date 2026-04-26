const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const NEWS_DATA = [
  { name: 'France', word: 'Solidarité', lat: 46.2276, lng: 2.2137, count: 120 },
  { name: 'États-Unis', word: 'Attaque', lat: 37.0902, lng: -95.7129, count: 300 },
  { name: 'Ukraine', word: 'Résistance', lat: 48.3794, lng: 31.1656, count: 100 },
  { name: 'Israël', word: 'Défense', lat: 31.0461, lng: 34.8516, count: 110 },
  { name: 'Liban', word: 'Survie', lat: 33.8547, lng: 35.8623, count: 90 },
  { name: 'Japon', word: 'Avenir', lat: 36.2048, lng: 138.2529, count: 80 },
  { name: 'Chine', word: 'Espace', lat: 35.8617, lng: 104.1954, count: 70 },
  { name: 'Allemagne', word: 'Unité', lat: 51.1657, lng: 10.4515, count: 60 },
  { name: 'Royaume-Uni', word: 'Couronne', lat: 55.3781, lng: -3.4360, count: 50 },
  { name: 'Brésil', word: 'Nature', lat: -14.2350, lng: -51.9253, count: 40 }
];

async function seed() {
  console.log("🚀 Injection des mots d'actualité...");
  
  const votes = [];
  const now = new Date();

  NEWS_DATA.forEach(country => {
    for (let i = 0; i < country.count; i++) {
      votes.push({
        word: country.word.toLowerCase(),
        country: country.name,
        lat: country.lat + (Math.random() - 0.5) * 2,
        lng: country.lng + (Math.random() - 0.5) * 2,
        ip_hash: `news_actualite_${country.name}_${i}`,
        // On met des dates très récentes pour qu'ils soient dans le "aujourd'hui" de chaque pays
        created_at: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString() 
      });
    }
  });

  // Mélanger pour l'activité feed
  votes.sort(() => Math.random() - 0.5);

  for (let i = 0; i < votes.length; i += 100) {
    const chunk = votes.slice(i, i + 100);
    const { error } = await supabase.from('votes').insert(chunk);
    if (error) console.error("❌ Erreur paquet :", error.message);
    else console.log(`✅ ${i + chunk.length}/${votes.length} votes injectés...`);
  }

  console.log("✨ Globe mis à jour avec les mots d'actualité !");
}

seed();
