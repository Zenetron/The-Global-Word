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
  const since = searchParams.get('since');
  const lang = searchParams.get('lang') || req.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'en';

  let rawVotes: any[] = [];

  if (!isSupabaseConfigured()) {
    rawVotes = globalMockVotes;
  } else {
    try {

      const thirtySixHoursAgo = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();
      
      let query = supabase!.from('votes')
        .select('*')
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
  const allUniqueWords = new Set<string>();

  const now = new Date();

  rawVotes.forEach((v: any) => {
    const countryName = normalizeCountryName(v.country);

    const countryInfo = COUNTRIES.find(c => c.name === countryName);
    const lng = countryInfo?.lng ?? v.lng ?? 0;
    const continent = countryInfo?.continent;

    let offsetHours = Math.round(lng / 15);
    if (continent === 'Europe' && offsetHours < 1) offsetHours = 1;

    const countryNow = new Date(now.getTime() + offsetHours * 3600000);
    const y = countryNow.getUTCFullYear();
    const m = countryNow.getUTCMonth();
    const d = countryNow.getUTCDate();

    const countryMidnightUTC = new Date(Date.UTC(y, m, d) - offsetHours * 3600000);

    if (new Date(v.created_at) < countryMidnightUTC) {
      return;
    }

    const wordKey = v.word.normalize('NFC').trim().toLowerCase();
    const isException = ['gp', 'f1', 'ia', 'ai', 'us', 'uk', 'eu'].includes(wordKey);
    if ((wordKey.length < 3 && !isException) || isForbidden(wordKey)) return;

    const displayWord = wordKey.charAt(0).toUpperCase() + wordKey.slice(1);
    allUniqueWords.add(displayWord);
    
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

  const translationMap = await translateBatch(Array.from(allUniqueWords), lang);

  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1].count - a[1].count || new Date(a[1].firstSeen).getTime() - new Date(b[1].firstSeen).getTime())
    .slice(0, 10)
    .map(([word, data]) => ({
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

  const translatedCountryTrends: Record<string, any[]> = {};
  Object.entries(countryWordDistribution).forEach(([country, words]) => {
    translatedCountryTrends[country] = Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({
        word: removeAccents(translationMap[word] || word),
        count
      }));
  });

  const wordDistributions: Record<string, any> = {};
  Object.entries(wordCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 50)
    .forEach(([word, data]) => {
      const translated = removeAccents(translationMap[word] || word);
      wordDistributions[translated] = {
        count: data.count,
        color: data.color,
        distribution: data.distribution
      };
    });

  return NextResponse.json({ 
    globeData, 
    topWords, 
    recentVotes,
    countryTrends: translatedCountryTrends,
    wordDistributions
  });
}
