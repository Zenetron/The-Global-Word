const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function purgeElections() {
  console.log("Removing ALL 'élections' globally...");
  
  const { error } = await supabase
    .from('votes')
    .delete()
    .eq('word', 'élections');
    
  if (error) {
    console.error("Error deleting:", error);
  } else {
    console.log("Successfully deleted ALL 'élections' votes everywhere!");
  }
}

purgeElections();
