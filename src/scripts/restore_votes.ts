import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function restore() {
  console.log("🔄 Restauration des votes pour aujourd'hui...");
  
  // On met à jour tous les votes des dernières 48h pour qu'ils soient considérés comme "aujourd'hui"
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('votes')
    .update({ created_at: now })
    .gt('created_at', fortyEightHoursAgo);

  if (error) {
    console.error("❌ Erreur lors de la restauration :", error.message);
  } else {
    console.log("✅ Tous les votes ont été remis à 'maintenant'. Le globe devrait être rempli !");
  }
}

restore();
