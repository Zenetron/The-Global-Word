import { NextRequest } from 'next/server';
import { COUNTRIES, normalizeCountryName } from '@/lib/countries';

export async function getLocalMidnightAndDate(req: NextRequest) {
  let ip = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
  if (ip.includes(',')) ip = ip.split(',')[0].trim();

  // Pour le test local
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

  const countryName = normalizeCountryName(geoData.country_name);
  const countryInfo = COUNTRIES.find(c => c.name === countryName);
  const countryLng = geoData.lon || countryInfo?.lng || 0;
  const continent = countryInfo?.continent;

  let offsetHours = Math.round(countryLng / 15);
  if (continent === 'Europe' && offsetHours < 1) offsetHours = 1;

  const now = new Date();
  const countryNow = new Date(now.getTime() + offsetHours * 3600000);
  
  const yStr = countryNow.getUTCFullYear();
  const mStr = String(countryNow.getUTCMonth() + 1).padStart(2, '0');
  const dStr = String(countryNow.getUTCDate()).padStart(2, '0');
  
  // Format YYYY-MM-DD
  const localDateStr = `${yStr}-${mStr}-${dStr}`;

  return { localDateStr, geoData };
}
