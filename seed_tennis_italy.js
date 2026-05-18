const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTennisWords() {
  const votes = [];
  const words = ["tennis", "atp", "grand chelem"];
  
  for (const word of words) {
    // Add around 15-20 votes for each to make them prominent but below 'sinner' (which has 50)
    for (let i = 0; i < 20; i++) {
      votes.push({
        word: word,
        country: "Italie",
        lat: 42.83333333 + (Math.random() - 0.5) * 2,
        lng: 12.83333333 + (Math.random() - 0.5) * 2,
        ip_hash: `tennis_seed_${word}_${i}_${Date.now()}`,
        created_at: new Date().toISOString()
      });
    }
  }

  const { error } = await supabase.from('votes').insert(votes);
  if (error) {
    console.error("Error inserting votes:", error.message);
  } else {
    console.log("Successfully inserted tennis related words for Italy!");
  }
}

seedTennisWords();
