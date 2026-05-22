import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { COUNTRIES } from '@/lib/countries';
import { getLocalMidnightAndDate } from '@/lib/ipUtils';

export const dynamic = 'force-dynamic';

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        rounds: [
          { word: 'bonjour', correctCountry: 'France', options: ['France', 'Canada', 'Belgique'] },
          { word: 'hello', correctCountry: 'United States', options: ['United Kingdom', 'United States', 'Australia'] },
          { word: 'hola', correctCountry: 'Spain', options: ['Spain', 'Mexico', 'Argentina'] }
        ]
      });
    }
    
    // On récupère l'utilisateur s'il est connecté
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    let userId = null;

    if (token) {
      const { data: { user } } = await supabase!.auth.getUser(token);
      if (user) {
        userId = user.id;
        
        // Vérifier s'il a déjà joué aujourd'hui
        const { localDateStr } = await getLocalMidnightAndDate(req);
        
        const { data: existingScore } = await supabase!
          .from('game_scores')
          .select('id')
          .eq('user_id', userId)
          .eq('game_date', localDateStr)
          .maybeSingle();

        if (existingScore) {
          return NextResponse.json({ error: 'already_played' });
        }
      }
    }

    // On cherche les mots de la veille
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    
    // Pour éviter de renvoyer un tableau vide si hier il n'y a pas eu de votes,
    // on prend simplement les 50 derniers votes et on tire au hasard.
    const { data: recentVotes, error } = await supabase!
      .from('votes')
      .select('word, country')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    if (!recentVotes || recentVotes.length < 3) {
      return NextResponse.json({ error: 'Pas assez de données pour générer un jeu' }, { status: 400 });
    }

    // Rendre les mots uniques
    const uniqueVotesMap = new Map();
    for (const v of recentVotes) {
      if (!uniqueVotesMap.has(v.word.toLowerCase())) {
        uniqueVotesMap.set(v.word.toLowerCase(), v.country);
      }
    }
    const uniqueVotes = Array.from(uniqueVotesMap.entries()).map(([word, country]) => ({ word, country }));
    
    // Si moins de 3 mots uniques, on s'adapte ou on renvoie une erreur
    if (uniqueVotes.length < 3) {
      return NextResponse.json({ error: 'Pas assez de mots uniques pour jouer' }, { status: 400 });
    }

    // Tirer 3 mots au hasard
    const selected = shuffle(uniqueVotes).slice(0, 3);

    const rounds = selected.map((item) => {
      const correct = item.country;
      // Choisir 2 faux pays
      const otherCountries = COUNTRIES.map(c => c.nameEn).filter(c => c !== correct);
      const shuffledOthers = shuffle(otherCountries);
      const options = shuffle([correct, shuffledOthers[0], shuffledOthers[1]]);
      
      return {
        word: item.word,
        correctCountry: correct,
        options
      };
    });

    return NextResponse.json({ rounds });
  } catch (err) {
    console.error('Erreur API Daily Game:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
