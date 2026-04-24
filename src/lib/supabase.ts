import { createClient } from '@supabase/supabase-js';

// Configuration avec des variables d'environnement, avec un fallback vide 
// pour ne pas crasher si Supabase n'est pas encore configuré
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const isSupabaseConfigured = () => supabase !== null;
