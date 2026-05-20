import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { globalMockVotes } from '@/lib/mockData';
import { getRandomNeonColor, removeAccents } from '@/lib/utils';
import { COUNTRIES, normalizeCountryName } from '@/lib/countries';
import { isForbidden } from '@/lib/blacklist';
import { translateBatch } from '@/lib/translator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || req.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'en';
  const bypass = searchParams.get('bypass') === 'true';

  let rawVotes: any[] = [];

  if (!isSupabaseConfigured()) {
    rawVotes = globalMockVotes;
  } else {
    try {
      const thirtySixHoursAgo = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();
      
      let query = supabase!.from('votes')
        .select('id, word, country, created_at, lat, lng')
        .gt('created_at', thirtySixHoursAgo)
        .order('created_at', { ascending: false })
        .limit(15000);
        
      const { data, error } = await query;
      if (error) throw error;
      rawVotes = data || [];
    } catch (err) {
      console.error('Supabase Error:', err);
      rawVotes = globalMockVotes;
    }
  }

  const wordCounts: Record<string, { count: number, firstSeen: string, color: string, distribution: Record<string, number> }> = {};
  const countryWordDistribution: Record<string, Record<string, number>> = {};
  const countryTopWordRaw: Record<string, { text: string, count: number, firstSeen: string, color: string, lat: number, lng: number }> = {};

  const now = new Date();

  // Optimisation O(N) : indexation des pays et pré-calcul des dates de minuit local
  const countriesByName = new Map(COUNTRIES.map(c => [c.name, c]));
  const countryMidnightCache = new Map<string, Date>();

  COUNTRIES.forEach(c => {
    let offsetHours = Math.round(c.lng / 15);
    if (c.continent === 'Europe' && offsetHours < 1) offsetHours = 1;

    const countryNow = new Date(now.getTime() + offsetHours * 3600000);
    const y = countryNow.getUTCFullYear();
    const m = countryNow.getUTCMonth();
    const d = countryNow.getUTCDate();

    const countryMidnightUTC = new Date(Date.UTC(y, m, d) - offsetHours * 3600000);
    countryMidnightCache.set(c.name, countryMidnightUTC);
  });

  rawVotes.forEach((v: any) => {
    const countryName = normalizeCountryName(v.country);

    // Vérification minuit local avec cache pré-calculé
    const countryMidnightUTC = countryMidnightCache.get(countryName);
    if (countryMidnightUTC && new Date(v.created_at) < countryMidnightUTC) {
      return;
    }

    const countryInfo = countriesByName.get(countryName);
    
    const wordKey = v.word.normalize('NFC').trim().toLowerCase();
    const isException = ['gp', 'f1', 'ia', 'ai', 'us', 'uk', 'eu'].includes(wordKey);
    if ((wordKey.length < 3 && !isException) || isForbidden(wordKey)) return;

    const displayWord = wordKey.charAt(0).toUpperCase() + wordKey.slice(1);
    
    const color = getRandomNeonColor();

    if (!wordCounts[displayWord]) {
      wordCounts[displayWord] = { count: 0, firstSeen: v.created_at, color, distribution: {} };
    }
    wordCounts[displayWord].count++;
    wordCounts[displayWord].distribution[countryName] = (wordCounts[displayWord].distribution[countryName] || 0) + 1;

    if (!countryWordDistribution[countryName]) countryWordDistribution[countryName] = {};
    countryWordDistribution[countryName][displayWord] = (countryWordDistribution[countryName][displayWord] || 0) + 1;

    if (!countryTopWordRaw[countryName]) {
      countryTopWordRaw[countryName] = { text: displayWord, count: 1, firstSeen: v.created_at, color, lat: v.lat, lng: v.lng };
    } else {
      const currentLocalCount = countryWordDistribution[countryName][displayWord];
      const existing = countryTopWordRaw[countryName];
      if (currentLocalCount > existing.count) {
        countryTopWordRaw[countryName] = { text: displayWord, count: currentLocalCount, firstSeen: v.created_at, color, lat: v.lat, lng: v.lng };
      }
    }
  });

  // Traduction paresseuse : on ne traduit que ce qui sera effectivement renvoyé
  const wordsToTranslate = new Set<string>();

  // 1. Mots du Top 10 global
  const topWordsRaw = Object.entries(wordCounts)
    .sort((a, b) => b[1].count - a[1].count || new Date(a[1].firstSeen).getTime() - new Date(b[1].firstSeen).getTime())
    .slice(0, 10);
  topWordsRaw.forEach(([word]) => wordsToTranslate.add(word));

  // 2. Mots gagnants par pays (globeData)
  Object.values(countryTopWordRaw).forEach(data => wordsToTranslate.add(data.text));

  // 3. Mots récents (Top 10)
  const recentVotesRaw = rawVotes.slice(0, 10);
  recentVotesRaw.forEach((v: any) => {
    const displayWord = v.word.charAt(0).toUpperCase() + v.word.slice(1).toLowerCase();
    wordsToTranslate.add(displayWord);
  });

  // 4. Tendances par pays (Top 10 par pays actif)
  const countryTrendsRaw: Record<string, [string, number][]> = {};
  Object.entries(countryWordDistribution).forEach(([country, words]) => {
    const sorted = Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    countryTrendsRaw[country] = sorted;
    sorted.forEach(([word]) => wordsToTranslate.add(word));
  });

  // 5. Distributions détaillées de mots (Top 50)
  const wordDistributionsRaw = Object.entries(wordCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 50);
  wordDistributionsRaw.forEach(([word]) => wordsToTranslate.add(word));

  // Traduction groupée uniquement pour les mots collectés
  const translationMap = await translateBatch(Array.from(wordsToTranslate), lang);

  const topWords = topWordsRaw.map(([word, data]) => ({
    word: removeAccents(translationMap[word] || word),
    count: data.count,
    color: data.color,
    distribution: data.distribution
  }));

  const maxVotes = Math.max(...Object.values(countryTopWordRaw).map(d => d.count), 1);
  const globeData = Object.entries(countryTopWordRaw).map(([country, data]) => ({
    lat: data.lat,
    lng: data.lng,
    size: 0.5 + (data.count / maxVotes * 1.5),
    text: removeAccents(translationMap[data.text] || data.text),
    color: data.color,
    country
  }));

  const recentVotes = recentVotesRaw.map((v: any) => {
    const displayWord = v.word.charAt(0).toUpperCase() + v.word.slice(1).toLowerCase();
    return {
      id: v.id,
      text: translationMap[displayWord] || displayWord,
      country: v.country,
      color: getRandomNeonColor(),
      created_at: v.created_at
    };
  });

  const translatedCountryTrends: Record<string, any[]> = {};
  Object.entries(countryTrendsRaw).forEach(([country, words]) => {
    translatedCountryTrends[country] = words.map(([word, count]) => ({
      word: removeAccents(translationMap[word] || word),
      count
    }));
  });

  const wordDistributions: Record<string, any> = {};
  wordDistributionsRaw.forEach(([word, data]) => {
    const translated = removeAccents(translationMap[word] || word);
    wordDistributions[translated] = {
      count: data.count,
      color: data.color,
      distribution: data.distribution
    };
  });

  // Définir les headers de cache CDN s'il n'y a pas de bypass
  const responseHeaders: Record<string, string> = {};
  if (bypass) {
    responseHeaders['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
  } else {
    responseHeaders['Cache-Control'] = 'public, s-maxage=15, stale-while-revalidate=30';
  }

  return NextResponse.json({ 
    globeData, 
    topWords, 
    recentVotes,
    countryTrends: translatedCountryTrends,
    wordDistributions
  }, { headers: responseHeaders });
}
