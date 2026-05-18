const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTotalVotes() {
  const { data, count, error } = await supabase
    .from('votes')
    .select('country', { count: 'exact' });
    
  if (error) {
    console.error("Error:", error);
    return;
  }
  
  console.log(`Total votes in DB: ${count}`);
}

checkTotalVotes();
