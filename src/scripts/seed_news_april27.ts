import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { COUNTRIES } from '../lib/countries';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const REGIONAL_THEMES: Record<string, string[]> = {
  "Europe": ["Paix", "Climat", "Futur", "Unité", "Espoir"],
  "Amérique du Nord": ["Liberté", "Tech", "IA", "Progrès"],
  "Amérique du Sud": ["Nature", "Culture", "Fête"],
  "Asie": ["Progrès", "Tradition", "Innovation", "Énergie"],
  "Afrique": ["Avenir", "Jeunesse", "Croissance"],
  "Océanie": ["Océan", "Climat", "Nature"]
};

const NEWS_WORDS: Record<string, { word: string, count: number }> = {
  "Liban": { word: "Frappes", count: 120 },
  "Israël": { word: "Conflit", count: 150 },
  "États-Unis": { word: "Fusillade", count: 300 }, // White House Correspondents' Dinner
  "Japon": { word: "Séisme", count: 140 }, // Hokkaido earthquake
  "Iran": { word: "Diplomatie", count: 90 },
  "Royaume-Uni": { word: "Explosion", count: 80 }, // Northern Ireland
  "Somalie": { word: "Piraterie", count: 70 },
  "Géorgie": { word: "Incendies", count: 110 }, // Wildfires in GA
  "France": { word: "Michael", count: 130 }, // Michael biopic success
  "Ukraine": { word: "Résilience", count: 100 }
};

async function seed() {
  console.log("🚀 Seeding des actualités du 27 Avril 2026...");
  
  const votes: any[] = [];
  const now = new Date();

  COUNTRIES.forEach(country => {
    let word = "";
    let count = 0;

    if (NEWS_WORDS[country.name]) {
      word = NEWS_WORDS[country.name].word;
      count = NEWS_WORDS[country.name].count;
    } else {
      // Defaults pour remplir
      const themes = REGIONAL_THEMES[country.continent] || ["Monde"];
      word = themes[Math.floor(Math.random() * themes.length)];
      count = 5 + Math.floor(Math.random() * 12);
    }

    for (let i = 0; i < count; i++) {
      votes.push({
        word: word.toLowerCase(),
        country: country.name,
        lat: country.lat + (Math.random() - 0.5) * 1.5,
        lng: country.lng + (Math.random() - 0.5) * 1.5,
        ip_hash: `news_seed_27_04_${country.name}_${i}`,
        // Timestamps répartis sur les 4 dernières heures
        created_at: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString()
      });
    }
  });

  console.log(`📦 Insertion de ${votes.length} votes...`);
  votes.sort(() => Math.random() - 0.5);

  for (let i = 0; i < votes.length; i += 200) {
    const chunk = votes.slice(i, i + 200);
    const { error } = await supabase.from('votes').insert(chunk);
    if (error) {
      console.error("❌ Erreur :", error.message);
      break;
    }
    console.log(`✅ ${Math.min(i + 200, votes.length)}/${votes.length} injectés...`);
  }

  console.log("✨ Le globe est à jour avec les actualités du jour !");
}

seed();
