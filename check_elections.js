const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkElections() {
  const { data, error } = await supabase
    .from('votes')
    .select('country')
    .eq('word', 'élections');
    
  if (error) {
    console.error("Error:", error);
    return;
  }
  
  const counts = {};
  for(const row of data) {
     counts[row.country] = (counts[row.country] || 0) + 1;
  }
  console.log("Count of 'élections' by country:");
  console.log(counts);
}

checkElections();
