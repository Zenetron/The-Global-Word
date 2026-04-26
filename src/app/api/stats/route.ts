import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { globalMockVotes } from '@/lib/mockData';
import { getRandomNeonColor } from '@/lib/utils';
import { normalizeCountryName } from '@/lib/countries';
import { isForbidden } from '@/lib/blacklist';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const since = searchParams.get('since');
  const lang = searchParams.get('lang') || req.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'en'; // Priorité à la langue passée par le client

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
    const countryWordDistribution: Record<string, Record<string, number>> = {};
    const countryTopWord: Record<string, { text: string, count: number, firstSeen: string, color: string, lat: number, lng: number }> = {};

    votes?.forEach((v: any) => {
      const cleanWord = v.word.normalize('NFC').trim();
      if (cleanWord.length < 3) return;

      // On utilise une version minuscule pour les clés de dictionnaire (pour éviter les doublons "Paix" / "paix")
      const wordKey = cleanWord.toLowerCase();
      // On garde une version jolie pour l'affichage
      const displayWord = wordKey.charAt(0).toUpperCase() + wordKey.slice(1);
      
      const color = getRandomNeonColor();
      const country = normalizeCountryName(v.country);
      
      // Compte global pour les stats
      if (!wordCounts[displayWord]) {
        wordCounts[displayWord] = { count: 0, firstSeen: v.created_at, color };
      }
      wordCounts[displayWord].count++;

      // Distribution par mot (pour les pays où un mot est présent)
      if (!wordDistribution[displayWord]) wordDistribution[displayWord] = {};
      wordDistribution[displayWord][country] = (wordDistribution[displayWord][country] || 0) + 1;

      // Distribution par pays (pour le calcul des Top 10 locaux)
      if (!countryWordDistribution[country]) countryWordDistribution[country] = {};
      countryWordDistribution[country][displayWord] = (countryWordDistribution[country][displayWord] || 0) + 1;

      // Top word par pays (pour le globe)
      if (!countryTopWord[country]) {
        countryTopWord[country] = { text: displayWord, count: 1, firstSeen: v.created_at, color, lat: v.lat, lng: v.lng };
      } else {
        const currentLocalCount = countryWordDistribution[country][displayWord];
        const existing = countryTopWord[country];
        if (currentLocalCount > existing.count) {
          countryTopWord[country] = { text: displayWord, count: currentLocalCount, firstSeen: v.created_at, color, lat: v.lat, lng: v.lng };
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
      text: v.word.normalize('NFC').charAt(0).toUpperCase() + v.word.normalize('NFC').slice(1).toLowerCase(),
      country: v.country,
      color: getRandomNeonColor(),
      created_at: v.created_at
    }));

    const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 4. Traduire le Globe, le Top 10 et les votes récents dans la langue de l'utilisateur
    const translatedGlobeData = await Promise.all(
      globeData.map(async (item: any) => {
        let finalWord = item.text;
        if (lang !== 'en') {
          try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(item.text)}`);
            if (res.ok) {
              const data = await res.json();
              finalWord = data[0][0][0].normalize('NFC');
            }
          } catch (e) {
            console.error('Erreur traduction globeData:', e);
          }
        }
        // Pour le globe, on enlève les accents pour éviter le "?"
        return { ...item, text: removeAccents(finalWord) };
      })
    );

    const translatedTopWords = await Promise.all(
      topWords.map(async (item: any) => {
        if (lang === 'en') return item;
        try {
          const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(item.word)}`);
          if (res.ok) {
            const data = await res.json();
            return { ...item, word: data[0][0][0].normalize('NFC') };
          }
        } catch (e) {
          console.error('Erreur traduction topWords:', e);
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
            return { ...item, text: data[0][0][0].normalize('NFC') };
          }
        } catch (e) {
          console.error('Erreur traduction recentVotes:', e);
        }
        return item;
      })
    );

    // 4. Calculer les Top 10 par pays pour la barre latérale
    const countryTrends: Record<string, any[]> = {};
    Object.entries(countryWordDistribution).forEach(([country, words]) => {
      countryTrends[country] = Object.entries(words)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));
    });

    // 5. Traduire les Top 10 locaux
    const translatedCountryTrends: Record<string, any[]> = {};
    for (const [country, trends] of Object.entries(countryTrends)) {
      translatedCountryTrends[country] = await Promise.all(
        trends.map(async (item: any) => {
          if (lang === 'en') return item;
          try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(item.word)}`);
            if (res.ok) {
              const data = await res.json();
              return { ...item, word: data[0][0][0].normalize('NFC') };
            }
          } catch (e) {}
          return item;
        })
      );
    }

    return NextResponse.json({ 
      globeData: translatedGlobeData, 
      topWords: translatedTopWords, 
      recentVotes: translatedRecentVotes,
      countryTrends: translatedCountryTrends
    });

  } catch (err) {
    console.error('Erreur Fetch Stats Supabase:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
