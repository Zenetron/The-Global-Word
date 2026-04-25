const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_')) {
  console.error("Erreur : Variables Supabase manquantes dans .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const WORDS = [
  "Hope", "Peace", "Love", "Future", "Unity", "Freedom", "Dream", "Action", "Energy", "Light",
  "Connection", "Change", "Nature", "Joy", "Strength", "Health", "Wisdom", "Courage", "Success",
  "Balance", "Kindness", "Passion", "Truth", "Creation", "Harmony", "Growth", "Spirit", "Smile"
];

const LOCATIONS = [
  { country: "France", city: "Paris", lat: 48.8566, lng: 2.3522 },
  { country: "États-Unis", city: "New York", lat: 40.7128, lng: -74.0060 },
  { country: "Japon", city: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { country: "Brésil", city: "Rio", lat: -22.9068, lng: -43.1729 },
  { country: "Australie", city: "Sydney", lat: -33.8688, lng: 151.2093 },
  { country: "Afrique du Sud", city: "Cape Town", lat: -33.9249, lng: 18.4241 },
  { country: "Royaume-Uni", city: "London", lat: 51.5074, lng: -0.1278 },
  { country: "Inde", city: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { country: "Canada", city: "Toronto", lat: 43.6532, lng: -79.3832 },
  { country: "Allemagne", city: "Berlin", lat: 52.5200, lng: 13.4050 },
  { country: "Italie", city: "Rome", lat: 41.9028, lng: 12.4964 },
  { country: "Espagne", city: "Madrid", lat: 40.4168, lng: -3.7038 },
  { country: "Mexique", city: "Mexico City", lat: 19.4326, lng: -99.1332 },
  { country: "Argentine", city: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
  { country: "Chine", city: "Beijing", lat: 39.9042, lng: 116.4074 },
  { country: "Égypte", city: "Cairo", lat: 30.0444, lng: 31.2357 },
  { country: "Thaïlande", city: "Bangkok", lat: 13.7563, lng: 100.5018 },
  { country: "Islande", city: "Reykjavik", lat: 64.1265, lng: -21.8174 },
  { country: "Grèce", city: "Athens", lat: 37.9838, lng: 23.7275 },
  { country: "Norvège", city: "Oslo", lat: 59.9139, lng: 10.7522 }
];

async function seed() {
  console.log("🚀 Lancement du remplissage massif (900 votes)...");
  
  const votes = [];
  
  for (let i = 0; i < 900; i++) {
    const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    
    votes.push({
      word: word.toLowerCase(),
      country: loc.country,
      city: loc.city,
      lat: loc.lat + (Math.random() - 0.5) * 5, // Ajouter un peu de variation pour ne pas être tous au même point
      lng: loc.lng + (Math.random() - 0.5) * 5,
      ip_hash: `seed_mass_${i}`,
      created_at: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString()
    });
  }

  // Insérer par paquets de 200 pour éviter les limites
  for (let i = 0; i < votes.length; i += 200) {
    const chunk = votes.slice(i, i + 200);
    const { error } = await supabase.from('votes').insert(chunk);
    if (error) {
      console.error("❌ Erreur lors de l'insertion d'un paquet :", error.message);
    } else {
      console.log(`✅ Paquet de ${chunk.length} votes inséré...`);
    }
  }

  console.log("✨ Opération terminée !");
}

seed();
