import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const country = "Indonésie";
  const word = "Nusantara";
  const count = 13;
  const lat = -0.7893;
  const lng = 113.9213;

  console.log(`🚀 Ajout de ${count} votes pour ${word} en ${country}...`);
  
  const votes = [];
  for (let i = 0; i < count; i++) {
    votes.push({
      word: word.toLowerCase(),
      country: country,
      lat: lat + (Math.random() - 0.5) * 2,
      lng: lng + (Math.random() - 0.5) * 2,
      ip_hash: `seed_manual_${country}_${i}_${Date.now()}`,
      created_at: new Date().toISOString()
    });
  }

  const { error } = await supabase.from('votes').insert(votes);
  if (error) console.error("❌ Erreur :", error.message);
  else console.log("✅ Votes ajoutés avec succès !");
}

seed();
