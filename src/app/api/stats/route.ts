import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { globalMockVotes } from '@/lib/mockData';
import { getRandomNeonColor } from '../../../lib/utils';
import { normalizeCountryName } from '@/lib/countries';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // Pour la V1, on peut utiliser period et zone pour filtrer (à implémenter en SQL plus tard si nécessaire)
  // const period = searchParams.get('period') || 'today';
  // const zone = searchParams.get('zone') || 'world';

  if (!isSupabaseConfigured()) {
    // Mode Mock dynamique
    const wordCounts: Record<string, { count: number, firstSeen: string, color: string }> = {};
    const wordDistribution: Record<string, Record<string, number>> = {};

    globalMockVotes.forEach(v => {
      const normalizedWord = v.word.charAt(0).toUpperCase() + v.word.slice(1).toLowerCase();
      
      // Compte global
      if (!wordCounts[normalizedWord]) {
        wordCounts[normalizedWord] = { 
          count: 0, 
          firstSeen: v.created_at || new Date().toISOString(),
          color: v.color 
        };
      }
      wordCounts[normalizedWord].count++;

      // Distribution par pays
      if (!wordDistribution[normalizedWord]) {
        wordDistribution[normalizedWord] = {};
      }
      if (v.country) {
        wordDistribution[normalizedWord][v.country] = (wordDistribution[normalizedWord][v.country] || 0) + 1;
      }
    });

    const mockTopWords = Object.entries(wordCounts)
      .sort((a, b) => {
        if (b[1].count !== a[1].count) return b[1].count - a[1].count;
        return new Date(a[1].firstSeen).getTime() - new Date(b[1].firstSeen).getTime();
      })
      .slice(0, 10)
      .map(([word, data]) => ({
        word,
        count: data.count,
        color: data.color,
        distribution: wordDistribution[word] || {}
      }));

    // Préparer globeData : 1 seul mot par pays (le gagnant)
    const countryTopWord: Record<string, { text: string, count: number, firstSeen: string, color: string, lat: number, lng: number }> = {};
    
    globalMockVotes.forEach(v => {
      const normalizedWord = v.word.charAt(0).toUpperCase() + v.word.slice(1).toLowerCase();
      const currentCount = wordCounts[normalizedWord].count;
      const currentFirstSeen = wordCounts[normalizedWord].firstSeen;
      
      if (!countryTopWord[v.country]) {
        countryTopWord[v.country] = { 
          text: normalizedWord, 
          count: currentCount, 
          firstSeen: currentFirstSeen, 
          color: v.color, 
          lat: v.lat, 
          lng: v.lng 
        };
      } else {
        const existing = countryTopWord[v.country];
        // Règle du gagnant : plus de votes, ou plus ancien si égalité
        const isNewWinner = currentCount > existing.count || 
                           (currentCount === existing.count && new Date(currentFirstSeen).getTime() < new Date(existing.firstSeen).getTime());
        
        if (isNewWinner) {
          countryTopWord[v.country] = { 
            text: normalizedWord, 
            count: currentCount, 
            firstSeen: currentFirstSeen, 
            color: v.color, 
            lat: v.lat, 
            lng: v.lng 
          };
        }
      }
    });

    // Préparer globeData : 1 seul mot par pays (le gagnant)
    const sortedCountriesByVotes = Object.entries(countryTopWord)
      .map(([country, data]) => ({ country, ...data }))
      .sort((a, b) => b.count - a.count);

    const maxVotes = sortedCountriesByVotes.length > 0 ? sortedCountriesByVotes[0].count : 1;

    const globeData = sortedCountriesByVotes.map(data => {
      // Calcul de taille relative : le top mondial est la référence
      // On utilise une échelle logarithmique ou linéaire accentuée
      const ratio = data.count / maxVotes;
      const size = 0.5 + (ratio * 1.5); // Entre 0.5 (min) et 2.0 (max)

      return {
        lat: data.lat,
        lng: data.lng,
        size: size,
        text: data.text,
        color: data.color,
        country: data.country
      };
    });

    // Préparer les votes récents pour le flux d'activité (non filtrés par pays)
    const recentVotes = [...globalMockVotes]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(v => ({
        id: v.id,
        text: v.word.charAt(0).toUpperCase() + v.word.slice(1).toLowerCase(),
        country: v.country,
        color: v.color,
        created_at: v.created_at
      }));

    return NextResponse.json({
      globeData,
      topWords: mockTopWords,
      recentVotes
    });
  }

  try {
    // 1. Récupérer les votes récents (ex: les 1000 derniers)
    const { data: votes, error } = await supabase!
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    // --- LOGIQUE D'AGRÉGATION (identique au mode mock mais sur données réelles) ---
    const wordCounts: Record<string, { count: number, firstSeen: string, color: string }> = {};
    const wordDistribution: Record<string, Record<string, number>> = {};
    const countryTopWord: Record<string, { text: string, count: number, firstSeen: string, color: string, lat: number, lng: number }> = {};

    votes?.forEach((v: any) => {
      const normalizedWord = v.word.charAt(0).toUpperCase() + v.word.slice(1).toLowerCase();
      const color = getRandomNeonColor();
      const country = normalizeCountryName(v.country);
      
      // Compte global
      if (!wordCounts[normalizedWord]) {
        wordCounts[normalizedWord] = { count: 0, firstSeen: v.created_at, color };
      }
      wordCounts[normalizedWord].count++;

      // Distribution
      if (!wordDistribution[normalizedWord]) wordDistribution[normalizedWord] = {};
      wordDistribution[normalizedWord][country] = (wordDistribution[normalizedWord][country] || 0) + 1;

      // Gagnant par pays
      const currentCount = wordCounts[normalizedWord].count;
      if (!countryTopWord[country]) {
        countryTopWord[country] = { text: normalizedWord, count: currentCount, firstSeen: v.created_at, color, lat: v.lat, lng: v.lng };
      } else {
        const existing = countryTopWord[country];
        if (currentCount > existing.count || (currentCount === existing.count && new Date(v.created_at).getTime() < new Date(existing.firstSeen).getTime())) {
          countryTopWord[country] = { text: normalizedWord, count: currentCount, firstSeen: v.created_at, color, lat: v.lat, lng: v.lng };
        }
      }
    });

    const topWords = Object.entries(wordCounts)
      .sort((a, b) => b[1].count - a[1].count || new Date(a[1].firstSeen).getTime() - new Date(b[1].firstSeen).getTime())
      .slice(0, 10)
      .map(([word, data]) => ({ word, count: data.count, color: data.color, distribution: wordDistribution[word] }));

    const maxVotes = Math.max(...Object.values(countryTopWord).map(d => d.count), 1);
    const globeData = Object.entries(countryTopWord).map(([country, data]) => ({
      lat: data.lat,
      lng: data.lng,
      size: 0.5 + (data.count / maxVotes * 1.5),
      text: data.text,
      color: data.color,
      country
    }));

    const recentVotes = votes?.slice(0, 10).map((v: any) => ({
      id: v.id,
      text: v.word.charAt(0).toUpperCase() + v.word.slice(1).toLowerCase(),
      country: v.country,
      color: getRandomNeonColor(),
      created_at: v.created_at
    }));

    return NextResponse.json({ globeData, topWords, recentVotes });

  } catch (err) {
    console.error('Erreur Fetch Stats Supabase:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
