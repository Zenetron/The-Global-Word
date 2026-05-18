const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUS() {
  const { data, error } = await supabase
    .from('votes')
    .select('word')
    .eq('country', 'États-Unis');
    
  if (error) {
    console.error("Error:", error);
    return;
  }
  
  const counts = {};
  for(const row of data) {
     counts[row.word] = (counts[row.word] || 0) + 1;
  }
  
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  console.log("Top words in the US:");
  console.log(sorted.slice(0, 10));
}

checkUS();
