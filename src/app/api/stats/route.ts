import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { globalMockVotes } from '@/lib/mockData';
import { getRandomNeonColor } from '@/lib/utils';
import { normalizeCountryName } from '@/lib/countries';
import { isForbidden } from '@/lib/blacklist';
import { translateBatch } from '@/lib/translator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const since = searchParams.get('since');
  const lang = searchParams.get('lang') || req.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'en';

  let rawVotes: any[] = [];

  if (!isSupabaseConfigured()) {
    rawVotes = globalMockVotes;
  } else {
    try {
      let query = supabase!.from('votes').select('*').order('created_at', { ascending: false });
      if (since) query = query.gt('created_at', since);
      else query = query.limit(1000);
      const { data, error } = await query;
      if (error) throw error;
      rawVotes = data || [];
    } catch (err) {
      console.error('Supabase Error:', err);
      rawVotes = globalMockVotes;
    }
  }

  // --- AGRÉGATION ---
  const wordCounts: Record<string, { count: number, firstSeen: string, color: string }> = {};
  const countryWordDistribution: Record<string, Record<string, number>> = {};
  const countryTopWordRaw: Record<string, { text: string, count: number, firstSeen: string, color: string, lat: number, lng: number }> = {};
  const allUniqueWords = new Set<string>();

  rawVotes.forEach((v: any) => {
    const wordKey = v.word.normalize('NFC').trim().toLowerCase();
    if (wordKey.length < 3 || isForbidden(wordKey)) return;

    const displayWord = wordKey.charAt(0).toUpperCase() + wordKey.slice(1);
    allUniqueWords.add(displayWord);
    
    const country = normalizeCountryName(v.country);
    const color = getRandomNeonColor();

    if (!wordCounts[displayWord]) {
      wordCounts[displayWord] = { count: 0, firstSeen: v.created_at, color };
    }
    wordCounts[displayWord].count++;

    if (!countryWordDistribution[country]) countryWordDistribution[country] = {};
    countryWordDistribution[country][displayWord] = (countryWordDistribution[country][displayWord] || 0) + 1;

    if (!countryTopWordRaw[country]) {
      countryTopWordRaw[country] = { text: displayWord, count: 1, firstSeen: v.created_at, color, lat: v.lat, lng: v.lng };
    } else {
      const currentLocalCount = countryWordDistribution[country][displayWord];
      const existing = countryTopWordRaw[country];
      if (currentLocalCount > existing.count) {
        countryTopWordRaw[country] = { text: displayWord, count: currentLocalCount, firstSeen: v.created_at, color, lat: v.lat, lng: v.lng };
      }
    }
  });

  // --- TRADUCTION MASSIVE ---
  const translationMap = await translateBatch(Array.from(allUniqueWords), lang);
  const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // --- PRÉPARATION DES DONNÉES FINALES ---
  
  // 1. Top Words Globaux
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1].count - a[1].count || new Date(a[1].firstSeen).getTime() - new Date(b[1].firstSeen).getTime())
    .slice(0, 10)
    .map(([word, data]) => ({
      word: translationMap[word] || word,
      count: data.count,
      color: data.color
    }));

  // 2. Globe Data
  const maxVotes = Math.max(...Object.values(countryTopWordRaw).map(d => d.count), 1);
  const globeData = Object.entries(countryTopWordRaw).map(([country, data]) => ({
    lat: data.lat,
    lng: data.lng,
    size: 0.5 + (data.count / maxVotes * 1.5),
    text: removeAccents(translationMap[data.text] || data.text),
    color: data.color,
    country
  }));

  // 3. Recent Votes
  const recentVotes = rawVotes.slice(0, 10).map((v: any) => {
    const displayWord = v.word.charAt(0).toUpperCase() + v.word.slice(1).toLowerCase();
    return {
      id: v.id,
      text: translationMap[displayWord] || displayWord,
      country: v.country,
      color: getRandomNeonColor(),
      created_at: v.created_at
    };
  });

  // 4. Country Trends (Sidebar)
  const translatedCountryTrends: Record<string, any[]> = {};
  Object.entries(countryWordDistribution).forEach(([country, words]) => {
    translatedCountryTrends[country] = Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({
        word: translationMap[word] || word,
        count
      }));
  });

  return NextResponse.json({ 
    globeData, 
    topWords, 
    recentVotes,
    countryTrends: translatedCountryTrends
  });
}
