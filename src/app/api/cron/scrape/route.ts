import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { COUNTRIES } from '@/lib/countries';
import { isForbidden } from '@/lib/blacklist';

export const dynamic = 'force-dynamic';

const GEO_MAPPINGS: Record<string, { name: string; nameEn: string }> = {
  US: { name: "États-Unis", nameEn: "United States" },
  FR: { name: "France", nameEn: "France" },
  DE: { name: "Allemagne", nameEn: "Germany" },
  GB: { name: "Royaume-Uni", nameEn: "United Kingdom" },
  ES: { name: "Espagne", nameEn: "Spain" },
  BR: { name: "Brésil", nameEn: "Brazil" },
  JP: { name: "Japon", nameEn: "Japan" },
  IN: { name: "Inde", nameEn: "India" },
  AU: { name: "Australie", nameEn: "Australia" },
  CA: { name: "Canada", nameEn: "Canada" },
  MX: { name: "Mexique", nameEn: "Mexico" },
  AR: { name: "Argentine", nameEn: "Argentina" },
  ZA: { name: "Afrique du Sud", nameEn: "South Africa" },
  KR: { name: "Corée du Sud", nameEn: "South Korea" },
  TR: { name: "Turquie", nameEn: "Turkey" },
  NL: { name: "Pays-Bas", nameEn: "Netherlands" },
  BE: { name: "Belgique", nameEn: "Belgium" },
  CH: { name: "Suisse", nameEn: "Switzerland" },
  SE: { name: "Suède", nameEn: "Sweden" },
  PL: { name: "Pologne", nameEn: "Poland" },
  DK: { name: "Danemark", nameEn: "Denmark" },
  NO: { name: "Norvège", nameEn: "Norway" },
  FI: { name: "Finlande", nameEn: "Finland" },
  IE: { name: "Irlande", nameEn: "Ireland" },
  NZ: { name: "Nouvelle-Zélande", nameEn: "New Zealand" },
  SG: { name: "Singapour", nameEn: "Singapore" },
  MY: { name: "Malaisie", nameEn: "Malaysia" },
  TH: { name: "Thaïlande", nameEn: "Thailand" },
  ID: { name: "Indonésie", nameEn: "Indonesia" },
  VN: { name: "Viêt Nam", nameEn: "Vietnam" },
  PH: { name: "Philippines", nameEn: "Philippines" },
  UA: { name: "Ukraine", nameEn: "Ukraine" },
  RO: { name: "Roumanie", nameEn: "Romania" },
  GR: { name: "Grèce", nameEn: "Greece" },
  PT: { name: "Portugal", nameEn: "Portugal" },
  CL: { name: "Chili", nameEn: "Chile" },
  CO: { name: "Colombie", nameEn: "Colombia" },
  PE: { name: "Pérou", nameEn: "Peru" },
  VE: { name: "Venezuela", nameEn: "Venezuela" },
  EG: { name: "Égypte", nameEn: "Egypt" },
  NG: { name: "Nigeria", nameEn: "Nigeria" },
  KE: { name: "Kenya", nameEn: "Kenya" },
};

function cleanQueryToWord(query: string): string | null {
  // Remove basic punctuation
  let cleaned = query.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
  const words = cleaned.split(/\s+/).filter(w => w.length > 2);
  
  if (words.length === 0) return null;
  
  // Extract first word as main trending term
  const mainWord = words[0];
  
  // Keep abbreviations capitalized (e.g. PSG, NBA)
  if (mainWord === mainWord.toUpperCase() && mainWord.length >= 3) {
    return mainWord;
  }
  
  return mainWord.toLowerCase();
}

async function translateWord(word: string): Promise<string> {
  // Do not translate specific isolated keywords we want to keep
  const keepAsIs = ['sinner', 'macron', 'monday', 'coffee'];
  if (keepAsIs.includes(word.toLowerCase())) {
    return word;
  }

  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(word)}`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const data = await res.json();
      return data[0][0][0];
    }
  } catch (e) {
    console.warn(`Translation failed for: ${word}`, e);
  }
  return word;
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
  }

  const results: any[] = [];
  const rowsToInsert: any[] = [];

  // Scrape each country's Google Trends daily RSS feed
  for (const [geo, targetCountry] of Object.entries(GEO_MAPPINGS)) {
    try {
      // Keep Jannik Sinner in Italy as explicitly required by the editorial curation
      if (geo === 'IT') continue;

      const url = `https://trends.google.com/trending/rss?geo=${geo}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/xml, text/xml, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
        signal: AbortSignal.timeout(4000)
      });
      if (!response.ok) {
        console.warn(`Skipping geo: ${geo}, response status: ${response.status}`);
        continue;
      }

      const xmlText = await response.text();
      const items = xmlText.match(/<item>[\s\S]*?<\/item>/g);
      if (!items || items.length === 0 || !items[0]) continue;

      // Extract the first (top) trending topic
      const topItem = items[0];
      const titleMatch = topItem.match(/<title>([^<]+)<\/title>/);
      if (!titleMatch) continue;

      const rawTitle = titleMatch[1].trim();
      const cleanTerm = cleanQueryToWord(rawTitle);
      if (!cleanTerm || isForbidden(cleanTerm)) continue;

      // Translate term to English
      const englishWord = await translateWord(cleanTerm);
      const finalWord = englishWord.toLowerCase().trim();

      if (!finalWord || isForbidden(finalWord) || finalWord.length > 20) continue;

      // Find geographical details in our library
      const countryInfo = COUNTRIES.find(
        c => c.name.toLowerCase() === targetCountry.name.toLowerCase() ||
             c.nameEn.toLowerCase() === targetCountry.nameEn.toLowerCase()
      );

      const lat = countryInfo?.lat || 0;
      const lng = countryInfo?.lng || 0;
      const countryName = countryInfo?.name || targetCountry.name;

      // Add 3 identical votes to secure a stable Top 1 position for the day
      for (let i = 0; i < 3; i++) {
        rowsToInsert.push({
          word: finalWord,
          country: countryName,
          city: "Google Trends",
          lat: lat,
          lng: lng,
          ip_hash: "google_trends_scrape",
          created_at: new Date().toISOString()
        });
      }

      results.push({ geo, country: countryName, word: finalWord });
    } catch (e) {
      console.error(`Error scraping daily RSS for ${geo}:`, e);
    }
  }

  if (rowsToInsert.length > 0) {
    try {
      // 1. Delete previous scraped rows to stay well under the 1000-row limit
      const { error: deleteError } = await supabase!
        .from('votes')
        .delete()
        .eq('ip_hash', 'google_trends_scrape');

      if (deleteError) {
        throw new Error(`Delete failed: ${deleteError.message}`);
      }

      // 2. Bulk-insert the brand new scraped trends
      const { error: insertError } = await supabase!
        .from('votes')
        .insert(rowsToInsert);

      if (insertError) {
        throw new Error(`Insert failed: ${insertError.message}`);
      }

      return NextResponse.json({
        success: true,
        insertedCount: rowsToInsert.length,
        countriesCount: results.length,
        results
      });
    } catch (dbErr: any) {
      console.error("Supabase operation failed inside scrape cron:", dbErr);
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, message: "No new rows to insert" });
}
