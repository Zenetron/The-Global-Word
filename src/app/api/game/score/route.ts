import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, mock: true });
  }

  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { score, timeMs } = await req.json();

    if (typeof score !== 'number' || typeof timeMs !== 'number') {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    const { data: { user }, error: authError } = await supabase!.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const today = new Date().toISOString().split('T')[0];

    const { error } = await client
      .from('game_scores')
      .insert({
        user_id: user.id,
        game_date: today,
        score_total: Math.min(3000, Math.max(0, score)), // Max 3x1000 pts
        time_taken_ms: timeMs
      });

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json({ error: 'Tu as déjà joué aujourd\'hui' }, { status: 409 });
      }
      throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur POST Game Score:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
