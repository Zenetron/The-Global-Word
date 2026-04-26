const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function nuke() {
  console.log("Atomic Nuke starting...");
  
  let deletedTotal = 0;
  let hasMore = true;

  while (hasMore) {
    // On récupère les IDs par packs de 1000 (limite Supabase)
    const { data, error } = await supabase.from('votes').select('id').limit(1000);
    
    if (error) {
      console.error("Error fetching IDs:", error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    const ids = data.map(d => d.id);
    const { error: delErr } = await supabase.from('votes').delete().in('id', ids);
    
    if (delErr) {
      console.error("Error deleting batch:", delErr);
      // Si on ne peut pas supprimer, on s'arrête pour éviter une boucle infinie
      break;
    }

    deletedTotal += ids.length;
    console.log(`Deleted ${deletedTotal} rows...`);
    
    // Petite pause pour laisser respirer l'API
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`Nuclear cleanup finished. Total deleted: ${deletedTotal}`);
}

nuke();
