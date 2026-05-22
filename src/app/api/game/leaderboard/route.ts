import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache de 60 secondes pour éviter de spammer la DB

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      leaderboard: [
        { rank: 1, username: 'MockMaster', score: 2500, time: 12500 },
        { rank: 2, username: 'PlayerOne', score: 1800, time: 24000 }
      ]
    });
  }

  try {
    // On récupère tous les scores avec le profil associé
    // Si la DB devient énorme, il faudra créer une Vue ou une fonction RPC côté Supabase.
    // Pour l'instant, on aggrége en JS.
    const { data: scores, error } = await supabase!
      .from('game_scores')
      .select(`
        score_total,
        time_taken_ms,
        user_id,
        profiles (
          username
        )
      `);

    if (error) throw error;

    const userStats = new Map<string, { username: string, score: number, time: number }>();

    for (const row of scores) {
      if (!row.profiles) continue; // Si le profil n'existe plus
      const username = (row.profiles as any).username;
      
      if (!userStats.has(row.user_id)) {
        userStats.set(row.user_id, { username, score: 0, time: 0 });
      }
      
      const stats = userStats.get(row.user_id)!;
      stats.score += row.score_total;
      stats.time += row.time_taken_ms;
    }

    // Convertir en tableau et trier (Score décroissant, puis temps croissant)
    let leaderboard = Array.from(userStats.values());
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.time - b.time;
    });

    // Garder le Top 50 et ajouter le rang
    leaderboard = leaderboard.slice(0, 50).map((u, index) => ({
      ...u,
      rank: index + 1
    }));

    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error('Erreur API Leaderboard:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
