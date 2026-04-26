const fs = require('fs');
const https = require('https');

const REGION_MAPPING = {
  'Africa': 'Afrique',
  'Americas': 'Amérique du Nord', // Will refine below
  'Asia': 'Asie',
  'Europe': 'Europe',
  'Oceania': 'Océanie',
  'Antarctic': 'Océanie'
};

const FIELDS = 'name,translations,latlng,region,subregion';

https.get(`https://restcountries.com/v3.1/all?fields=${FIELDS}`, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const countries = JSON.parse(data);
    const result = countries.map(c => {
      let continent = REGION_MAPPING[c.region] || 'Asie';
      if (c.region === 'Americas') {
        // Simple heuristic for North/South America
        continent = (c.subregion && (c.subregion.includes('South') || c.subregion.includes('Latin'))) ? 'Amérique du Sud' : 'Amérique du Nord';
      }
      
      return {
        name: c.translations.fra?.common || c.name.common,
        nameEn: c.name.common,
        lat: c.latlng ? c.latlng[0] : 0,
        lng: c.latlng ? c.latlng[1] : 0,
        continent: continent
      };
    }).sort((a, b) => a.name.localeCompare(b.name));

    const content = `export interface Continent {
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
}

export interface Country {
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  continent: string;
}

export const CONTINENTS: Continent[] = [
  { name: 'Afrique', nameEn: 'Africa', lat: 5.0, lng: 20.0 },
  { name: 'Amérique du Nord', nameEn: 'North America', lat: 40.0, lng: -100.0 },
  { name: 'Amérique du Sud', nameEn: 'South America', lat: -15.0, lng: -60.0 },
  { name: 'Asie', nameEn: 'Asia', lat: 45.0, lng: 90.0 },
  { name: 'Europe', nameEn: 'Europe', lat: 50.0, lng: 15.0 },
  { name: 'Océanie', nameEn: 'Oceania', lat: -25.0, lng: 135.0 }
];

export const COUNTRIES: Country[] = ${JSON.stringify(result, null, 2)};

export const normalizeCountryName = (name: string): string => {
  if (!name) return 'Inconnu';
  
  // Mapping pour les noms courants vers le nom français utilisé dans COUNTRIES
  const mapping: Record<string, string> = {
    'Netherlands': 'Pays-Bas',
    'The Netherlands': 'Pays-Bas',
    'United States': 'États-Unis',
    'United States of America': 'États-Unis',
    'USA': 'États-Unis',
    'United Kingdom': 'Angleterre',
    'UK': 'Angleterre',
    'Germany': 'Allemagne',
    'Spain': 'Espagne',
    'Italy': 'Italie',
    'Belgium': 'Belgique',
    'Switzerland': 'Suisse',
    'Brazil': 'Brésil',
    'Mexico': 'Mexique',
    'Japan': 'Japon',
    'China': 'Chine',
    'Russia': 'Russie',
    'South Korea': 'Corée du Sud',
    'Egypt': 'Égypte',
    'Morocco': 'Maroc',
    'Algeria': 'Algérie',
    'Tunisia': 'Tunisie'
  };

  return mapping[name] || name;
};
`;
    fs.writeFileSync('src/lib/countries.ts', content);
    fs.writeFileSync('countries.json', JSON.stringify(result, null, 2));
    console.log(`Successfully imported ${result.length} countries.`);
  });
});
