export interface Continent {
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

export const COUNTRIES: Country[] = [
  { name: 'Afghanistan', nameEn: 'Afghanistan', lat: 33.9391, lng: 67.7099, continent: 'Asie' },
  { name: 'Afrique du Sud', nameEn: 'South Africa', lat: -30.5595, lng: 22.9375, continent: 'Afrique' },
  { name: 'Algérie', nameEn: 'Algeria', lat: 28.0339, lng: 1.6596, continent: 'Afrique' },
  { name: 'Allemagne', nameEn: 'Germany', lat: 51.1657, lng: 10.4515, continent: 'Europe' },
  { name: 'Arabie Saoudite', nameEn: 'Saudi Arabia', lat: 23.8859, lng: 45.0792, continent: 'Asie' },
  { name: 'Argentine', nameEn: 'Argentina', lat: -38.4161, lng: -63.6167, continent: 'Amérique du Sud' },
  { name: 'Australie', nameEn: 'Australia', lat: -25.2744, lng: 133.7751, continent: 'Océanie' },
  { name: 'Belgique', nameEn: 'Belgium', lat: 50.5039, lng: 4.4699, continent: 'Europe' },
  { name: 'Brésil', nameEn: 'Brazil', lat: -14.235, lng: -51.9253, continent: 'Amérique du Sud' },
  { name: 'Canada', nameEn: 'Canada', lat: 56.1304, lng: -106.3468, continent: 'Amérique du Nord' },
  { name: 'Chili', nameEn: 'Chile', lat: -35.6751, lng: -71.543, continent: 'Amérique du Sud' },
  { name: 'Chine', nameEn: 'China', lat: 35.8617, lng: 104.1954, continent: 'Asie' },
  { name: 'Colombie', nameEn: 'Colombia', lat: 4.5709, lng: -74.2973, continent: 'Amérique du Sud' },
  { name: 'Corée du Sud', nameEn: 'South Korea', lat: 35.9078, lng: 127.7669, continent: 'Asie' },
  { name: 'Congo', nameEn: 'Congo', lat: -0.228, lng: 15.8277, continent: 'Afrique' },
  { name: 'Égypte', nameEn: 'Egypt', lat: 26.8206, lng: 30.8025, continent: 'Afrique' },
  { name: 'Espagne', nameEn: 'Spain', lat: 40.4637, lng: -3.7492, continent: 'Europe' },
  { name: 'États-Unis', nameEn: 'United States', lat: 37.0902, lng: -95.7129, continent: 'Amérique du Nord' },
  { name: 'France', nameEn: 'France', lat: 46.2276, lng: 2.2137, continent: 'Europe' },
  { name: 'Grèce', nameEn: 'Greece', lat: 39.0742, lng: 21.8243, continent: 'Europe' },
  { name: 'Inde', nameEn: 'India', lat: 20.5937, lng: 78.9629, continent: 'Asie' },
  { name: 'Indonésie', nameEn: 'Indonesia', lat: -0.7893, lng: 113.9213, continent: 'Asie' },
  { name: 'Iran', nameEn: 'Iran', lat: 32.4279, lng: 53.688, continent: 'Asie' },
  { name: 'Irlande', nameEn: 'Ireland', lat: 53.1424, lng: -7.6921, continent: 'Europe' },
  { name: 'Israël', nameEn: 'Israel', lat: 31.0461, lng: 34.8516, continent: 'Asie' },
  { name: 'Italie', nameEn: 'Italy', lat: 41.8719, lng: 12.5674, continent: 'Europe' },
  { name: 'Japon', nameEn: 'Japan', lat: 36.2048, lng: 138.2529, continent: 'Asie' },
  { name: 'Madagascar', nameEn: 'Madagascar', lat: -18.7669, lng: 46.8691, continent: 'Afrique' },
  { name: 'Mali', nameEn: 'Mali', lat: 17.5707, lng: -3.9962, continent: 'Afrique' },
  { name: 'Maroc', nameEn: 'Morocco', lat: 31.7917, lng: -7.0926, continent: 'Afrique' },
  { name: 'Mexique', nameEn: 'Mexico', lat: 23.6345, lng: -102.5528, continent: 'Amérique du Nord' },
  { name: 'Nigeria', nameEn: 'Nigeria', lat: 9.082, lng: 8.6753, continent: 'Afrique' },
  { name: 'Norvège', nameEn: 'Norway', lat: 60.472, lng: 8.4689, continent: 'Europe' },
  { name: 'Pays-Bas', nameEn: 'Netherlands', lat: 52.1326, lng: 5.2913, continent: 'Europe' },
  { name: 'Pérou', nameEn: 'Peru', lat: -9.19, lng: -75.0152, continent: 'Amérique du Sud' },
  { name: 'Philippines', nameEn: 'Philippines', lat: 12.8797, lng: 121.774, continent: 'Asie' },
  { name: 'Pologne', nameEn: 'Poland', lat: 51.9194, lng: 19.1451, continent: 'Europe' },
  { name: 'Portugal', nameEn: 'Portugal', lat: 39.3999, lng: -8.2245, continent: 'Europe' },
  { name: 'Angleterre', nameEn: 'England', lat: 52.3555, lng: -1.1743, continent: 'Europe' },
  { name: 'Écosse', nameEn: 'Scotland', lat: 56.4907, lng: -4.2026, continent: 'Europe' },
  { name: 'Pays de Galles', nameEn: 'Wales', lat: 52.1307, lng: -3.7837, continent: 'Europe' },
  { name: 'Irlande du Nord', nameEn: 'Northern Ireland', lat: 54.7877, lng: -6.4923, continent: 'Europe' },
  { name: 'Russie', nameEn: 'Russia', lat: 61.524, lng: 105.3188, continent: 'Europe' },
  { name: 'Sénégal', nameEn: 'Senegal', lat: 14.4974, lng: -14.4524, continent: 'Afrique' },
  { name: 'Suède', nameEn: 'Sweden', lat: 60.1282, lng: 18.6435, continent: 'Europe' },
  { name: 'Suisse', nameEn: 'Switzerland', lat: 46.8182, lng: 8.2275, continent: 'Europe' },
  { name: 'Thaïlande', nameEn: 'Thailand', lat: 15.87, lng: 100.9925, continent: 'Asie' },
  { name: 'Tunisie', nameEn: 'Tunisia', lat: 33.8869, lng: 9.5375, continent: 'Afrique' },
  { name: 'Turquie', nameEn: 'Turkey', lat: 38.9637, lng: 35.2433, continent: 'Asie' },
  { name: 'Ukraine', nameEn: 'Ukraine', lat: 48.3794, lng: 31.1656, continent: 'Europe' },
  { name: 'Venezuela', nameEn: 'Venezuela', lat: 9.1899, lng: -64.6066, continent: 'Amérique du Sud' },
  { name: 'Vietnam', nameEn: 'Vietnam', lat: 14.0583, lng: 108.2772, continent: 'Asie' }
];

export const normalizeCountryName = (name: string): string => {
  if (!name) return 'Inconnu';
  
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
