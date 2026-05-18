const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedSinner() {
  const votes = [];
  for (let i = 0; i < 50; i++) {
    votes.push({
      word: "sinner",
      country: "Italie",
      lat: 42.83333333 + (Math.random() - 0.5) * 2,
      lng: 12.83333333 + (Math.random() - 0.5) * 2,
      ip_hash: `sinner_seed_${i}_${Date.now()}`,
      created_at: new Date().toISOString()
    });
  }

  const { error } = await supabase.from('votes').insert(votes);
  if (error) {
    console.error("Error inserting votes:", error.message);
  } else {
    console.log("Successfully inserted 50 votes for 'sinner' in Italy!");
  }
}

seedSinner();
