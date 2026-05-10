import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { globalMockVotes } from '@/lib/mockData';
import crypto from 'crypto';

function hashIp(ip: string) {
  return crypto.createHash('sha256').update(ip + process.env.IP_SALT || 'salt').digest('hex');
}

import { isForbidden } from '@/lib/blacklist';
import { COUNTRIES, normalizeCountryName } from '@/lib/countries';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { word, clientIp, localMidnight } = await req.json();

    if (!word || word.length > 20 || isForbidden(word)) {
      return NextResponse.json({ error: 'Mot invalide ou inapproprié' }, { status: 400 });
    }

    let ip = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();

    const isLocal = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.');
    if (isLocal && clientIp) {
      ip = clientIp;
    }

    let translatedWord = word.trim();
    try {
      const translateRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(translatedWord)}`);
      if (translateRes.ok) {
        const data = await translateRes.json();
        translatedWord = data[0][0][0];
      }
    } catch (e) {
      console.warn('Traduction échouée, on garde le mot original', e);
    }

    const ipHash = hashIp(ip);

    const queryIp = (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) ? '8.8.8.8' : ip;
    
    let geoData = { lat: 48.8566, lon: 2.3522, city: 'Paris', country_name: 'France' }; 
    
    try {
      const geoResponse = await fetch(`http://ip-api.com/json/${queryIp}?lang=fr`);
      if (geoResponse.ok) {
        const data = await geoResponse.json();
        if (data.status === 'success') {
          geoData = {
            lat: data.lat,
            lon: data.lon,
            city: data.city,
            country_name: data.country
          };
        }
      }
    } catch (e) {
      console.error('Erreur Géolocalisation', e);
    }

    if (!isSupabaseConfigured()) {
      globalMockVotes.push({
        id: Date.now(),
        word: translatedWord.toLowerCase(),
        country: geoData.country_name,
        lat: geoData.lat,
        lng: geoData.lon,
        ip_hash: ipHash,
        created_at: new Date().toISOString(),
        color: '#00ffff'
      });
      return NextResponse.json({ success: true, mock: true, country: geoData.country_name });
    }

    const countryName = normalizeCountryName(geoData.country_name);
    const countryInfo = COUNTRIES.find(c => c.name === countryName);
    const lng = geoData.lon || countryInfo?.lng || 0;
    const continent = countryInfo?.continent;

    let offsetHours = Math.round(lng / 15);
    if (continent === 'Europe' && offsetHours < 1) offsetHours = 1;
    
    const now = new Date();
    const countryNow = new Date(now.getTime() + offsetHours * 3600000);
    const y = countryNow.getUTCFullYear();
    const m = countryNow.getUTCMonth();
    const d = countryNow.getUTCDate();
    
    const countryMidnightUTC = new Date(Date.UTC(y, m, d) - offsetHours * 3600000);
    const sinceDate = countryMidnightUTC.toISOString();
    
    const { data: existingVote, error: checkError } = await supabase!
      .from('votes')
      .select('id')
      .eq('ip_hash', ipHash)
      .gt('created_at', sinceDate)
      .maybeSingle();

    if (checkError) {
      console.error('Erreur Supabase Check:', checkError.message);
    }

    if (existingVote) {
      return NextResponse.json({ error: 'Vous avez déjà voté aujourd\'hui.' }, { status: 429 });
    }

    const { error: insertError } = await supabase!
      .from('votes')
      .insert({
        word: translatedWord.toLowerCase(),
        country: geoData.country_name,
        city: geoData.city,
        lat: geoData.lat,
        lng: geoData.lon,
        ip_hash: ipHash
      });

    if (insertError) {
      console.error('Erreur insertion Supabase:', insertError);
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, country: geoData.country_name });
  } catch (err) {
    console.error('Erreur API Vote:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
