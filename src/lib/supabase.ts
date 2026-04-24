import { createClient } from '@supabase/supabase-js';

// Configuration avec des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Vérification si la configuration est valide (pas vide et pas les placeholders)
const isConfigValid = !!(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('votre_url') && 
  !supabaseKey.includes('votre_cle')
);

// On utilise 'any' pour le fallback pour éviter les erreurs de type dans l'IDE
// tout en sachant que isSupabaseConfigured() protégera l'exécution.
export const supabase = isConfigValid 
  ? createClient(supabaseUrl, supabaseKey)
  : null as any;

export const isSupabaseConfigured = () => isConfigValid;
