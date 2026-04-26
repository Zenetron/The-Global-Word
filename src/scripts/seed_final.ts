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
  "Amérique du Sud": ["Nature", "Justice", "Culture"],
  "Asie": ["Progrès", "Tradition", "Innovation", "Énergie"],
  "Afrique": ["Avenir", "Jeunesse", "Croissance", "Énergie"],
  "Océanie": ["Océan", "Climat", "Nature"]
};

async function seed() {
  console.log("🚀 Lancement du seeding global (Actualité + Monde)...");
  
  const votes: any[] = [];
  const now = new Date();

  COUNTRIES.forEach(country => {
    let word = "";
    let count = 0;

    if (country.name === "États-Unis") {
      word = "Attaque";
      count = 300;
    } else if (country.name === "France") {
      word = "Solidarité";
      count = 120;
    } else if (country.name === "Iran") {
      return; // Pas d'internet
    } else if (country.name === "Ukraine") {
      word = "Résistance";
      count = 100;
    } else if (country.name === "Israël") {
      word = "Défense";
      count = 110;
    } else if (country.name === "Liban") {
      word = "Survie";
      count = 90;
    } else {
      // Pour tous les autres pays, on met un mot thématique pour remplir le globe
      const themes = REGIONAL_THEMES[country.continent] || ["Vie", "Monde"];
      word = themes[Math.floor(Math.random() * themes.length)];
      count = 5 + Math.floor(Math.random() * 10); // 5 à 15 votes pour chaque pays
    }

    for (let i = 0; i < count; i++) {
      votes.push({
        word: word.toLowerCase(),
        country: country.name,
        lat: country.lat + (Math.random() - 0.5) * 1.5,
        lng: country.lng + (Math.random() - 0.5) * 1.5,
        ip_hash: `seed_final_${country.name}_${i}_${Date.now()}`,
        // On utilise les dernières 4 heures pour être sûr d'être dans le "aujourd'hui" de tout le monde
        created_at: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString()
      });
    }
  });

  console.log(`📦 Préparation de ${votes.length} votes...`);
  
  // Mélanger pour l'activité feed
  votes.sort(() => Math.random() - 0.5);

  // Insertion par paquets de 200
  for (let i = 0; i < votes.length; i += 200) {
    const chunk = votes.slice(i, i + 200);
    const { error } = await supabase.from('votes').insert(chunk);
    if (error) {
      console.error("❌ Erreur Supabase :", error.message);
      break;
    }
    console.log(`✅ ${Math.min(i + 200, votes.length)}/${votes.length} votes injectés...`);
  }

  console.log("✨ Le globe est maintenant complet et à jour !");
}

seed();
