const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const COUNTRIES = require('./countries.json');

async function fixUSATopWords() {
  console.log("Removing 'élections' from the US...");
  const countryInfo = COUNTRIES.find(c => c.name === "États-Unis" || c.nameEn === "United States");
  
  if (!countryInfo) {
    console.error("Could not find US in countries.json");
    return;
  }

  // 1. Delete the "élections" votes for the US
  const { error: delError } = await supabase
    .from('votes')
    .delete()
    .eq('country', countryInfo.name)
    .eq('word', 'élections');
    
  if (delError) {
    console.error("Error deleting old votes:", delError);
  } else {
    console.log("Deleted old 'élections' votes for the US.");
  }

  // 2. Insert new, more topical votes for the US
  const votes = [];
  
  // Based on May 18, 2026 news: Rededicate 250 rally, Waymo issues, LIRR strike
  const newTopics = [
    { word: "rally", count: 120 },
    { word: "waymo", count: 85 },
    { word: "strike", count: 60 }
  ];

  for (const item of newTopics) {
    for (let i = 0; i < item.count; i++) {
      votes.push({
        word: item.word,
        country: countryInfo.name,
        lat: countryInfo.lat + (Math.random() - 0.5) * 5,
        lng: countryInfo.lng + (Math.random() - 0.5) * 5,
        ip_hash: `us_top_${item.word}_${i}_${Date.now()}`,
        created_at: new Date().toISOString()
      });
    }
  }

  const { error: insertError } = await supabase.from('votes').insert(votes);
  
  if (insertError) {
    console.error("Error inserting new votes:", insertError.message);
  } else {
    console.log("Successfully inserted new topical words for the US (rally, waymo, strike)!");
  }
}

fixUSATopWords();
