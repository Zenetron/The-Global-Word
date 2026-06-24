import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigValid = !!(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('votre_url') &&
  !supabaseKey.includes('votre_cle')
);

export const supabase = isConfigValid
  ? createClient(supabaseUrl, supabaseKey)
  : null as any;

export const isSupabaseConfigured = () => isConfigValid;

export function createAuthedClient(token: string) {
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
}
