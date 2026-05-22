import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ profile: { username: 'MockUser' } });
  }

  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { data: { user }, error: authError } = await supabase!.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: profile, error } = await client
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    
    return NextResponse.json({ profile });
  } catch (err) {
    console.error('Erreur API Profile:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, mock: true });
  }

  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { username } = await req.json();
    if (!username || username.trim().length < 3 || username.trim().length > 30) {
      return NextResponse.json({ error: 'Le pseudo doit faire entre 3 et 30 caractères' }, { status: 400 });
    }

    const { data: { user }, error: authError } = await supabase!.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // Vérifier si le pseudo existe déjà
    const { data: existing } = await client
      .from('profiles')
      .select('id')
      .ilike('username', username.trim())
      .maybeSingle();
      
    if (existing) {
      return NextResponse.json({ error: 'Ce pseudo est déjà pris' }, { status: 409 });
    }

    const { error } = await client
      .from('profiles')
      .insert({ id: user.id, username: username.trim() });

    if (error) {
      if (error.code === '23505') { // Unique violation fallback
        return NextResponse.json({ error: 'Ce pseudo est déjà pris' }, { status: 409 });
      }
      throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur POST Profile:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
