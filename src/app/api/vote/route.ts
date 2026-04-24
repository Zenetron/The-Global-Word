import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { globalMockVotes } from '@/lib/mockData';
import crypto from 'crypto';

function hashIp(ip: string) {
  return crypto.createHash('sha256').update(ip + process.env.IP_SALT || 'salt').digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { word, clientIp } = await req.json();

    if (!word || word.length > 20) {
      return NextResponse.json({ error: 'Mot invalide' }, { status: 400 });
    }

    // Récupérer l'IP
    let ip = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();
    
    // Si on est en local ou sur un réseau privé, on utilise l'IP envoyée par le client si elle existe
    const isLocal = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.');
    if (isLocal && clientIp) {
      ip = clientIp;
    }
    
    const ipHash = hashIp(ip);

    // Récupérer la géolocalisation
    // En développement local, le serveur voit ::1. On utilise une IP de fallback pour tester si aucune IP client n'est fournie.
    const queryIp = (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) ? '8.8.8.8' : ip;
    
    let geoData = { lat: 48.8566, lon: 2.3522, city: 'Paris', country_name: 'France' }; // Fallback ultime
    
    try {
      // Utiliser ip-api.com avec lang=fr pour correspondre à notre liste COUNTRIES
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

    // Si Supabase n'est pas configuré, on simule le succès en ajoutant au mock
    if (!isSupabaseConfigured()) {
      globalMockVotes.push({
        id: Date.now(),
        word: word.trim(),
        country: geoData.country_name,
        lat: geoData.lat,
        lng: geoData.lon,
        ip_hash: ipHash,
        created_at: new Date().toISOString(),
        color: '#00ffff'
      });
      return NextResponse.json({ 
        success: true, 
        mock: true, 
        country: geoData.country_name,
        detectedIp: queryIp 
      });
    }

    // Vérifier si l'IP a déjà voté dans les dernières 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: existingVote, error: checkError } = await supabase!
      .from('votes')
      .select('id')
      .eq('ip_hash', ipHash)
      .gt('created_at', twentyFourHoursAgo)
      .maybeSingle();

    if (checkError) {
      console.error('Erreur Supabase Check:', checkError.message);
    }

    if (existingVote) {
      console.log('Vote trouvé pour cet IP:', existingVote);
      return NextResponse.json({ error: 'Vous avez déjà voté aujourd\'hui.' }, { status: 429 });
    }

    // 2. Insérer le vote
    const { error: insertError } = await supabase!
      .from('votes')
      .insert([{
        word: word.trim(),
        country: geoData.country_name,
        city: geoData.city,
        lat: geoData.lat,
        lng: geoData.lon,
        ip_hash: ipHash
      }]);

    if (insertError) {
      console.error('Erreur insertion Supabase:', insertError);
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde.' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      country: geoData.country_name,
      detectedIp: queryIp 
    });
  } catch (err) {
    console.error('Erreur API Vote:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
