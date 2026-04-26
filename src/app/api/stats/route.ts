import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { globalMockVotes } from '@/lib/mockData';
import { normalizeCountryName, getRandomNeonColor } from '@/lib/utils';
import { isForbidden } from '@/lib/blacklist';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const since = searchParams.get('since');
  const lang = req.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'en'; // Détection de la langue du visiteur

  if (!isSupabaseConfigured()) {
    // Mode Mock dynamique (déjà géré par le fallback existant)
    // ... (le reste du bloc mock reste inchangé)
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
      .filter(([word]) => word.length >= 3 && !isForbidden(word))
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

    // 4. Traduire le Top 10 dans la langue de l'utilisateur pour l'affichage
    const translatedTopWords = await Promise.all(
      mockTopWords.slice(0, 10).map(async (item: any) => {
        if (lang === 'en') return item; // Déjà en anglais (notre pivot)
        
        try {
          const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(item.word)}`);
          if (res.ok) {
            const data = await res.json();
            return { ...item, word: data[0][0][0] };
          }
        } catch (e) {
          console.error('Erreur traduction retour:', e);
        }
        return item;
      })
    );

    return NextResponse.json({
      globeData,
      topWords: translatedTopWords,
      recentVotes: recentVotes.slice(0, 50)
    });
  }

  try {
    // 1. Récupérer les votes récents
    let query = supabase!
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Si un paramètre "since" est fourni, on filtre pour n'avoir que les mots d'aujourd'hui
    if (since) {
      query = query.gt('created_at', since);
    } else {
      // Sinon on garde une limite de sécurité
      query = query.limit(1000);
    }

    const { data: votes, error } = await query;

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
      .filter(([word]) => word.length >= 3 && !isForbidden(word)) // On ignore les mots courts et interdits
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

    // 4. Traduire le Top 10 et les votes récents dans la langue de l'utilisateur pour l'affichage
    const translatedTopWords = await Promise.all(
      topWords.map(async (item: any) => {
        if (lang === 'en') return item;
        try {
          const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(item.word)}`);
          if (res.ok) {
            const data = await res.json();
            return { ...item, word: data[0][0][0] };
          }
        } catch (e) {
          console.error('Erreur traduction retour topWords:', e);
        }
        return item;
      })
    );

    const translatedRecentVotes = await Promise.all(
      (recentVotes || []).map(async (item: any) => {
        if (lang === 'en') return item;
        try {
          const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(item.text)}`);
          if (res.ok) {
            const data = await res.json();
            return { ...item, text: data[0][0][0] };
          }
        } catch (e) {
          console.error('Erreur traduction retour recentVotes:', e);
        }
        return item;
      })
    );

    return NextResponse.json({ 
      globeData, 
      topWords: translatedTopWords, 
      recentVotes: translatedRecentVotes 
    });

  } catch (err) {
    console.error('Erreur Fetch Stats Supabase:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
