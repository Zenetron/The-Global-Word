// Un stockage en mémoire très simple pour le mode MOCK
// Permet de tester l'ajout de mots sans base de données

import { COUNTRIES } from './countries';

export const globalMockVotes: any[] = [];

if (globalMockVotes.length === 0) {
  const words = ['Joie', 'Espoir', 'Paix', 'Amour', 'Tristesse', 'Zen', 'Chaos'];
  const colors = ['#00ffff', '#8000ff', '#00ff00', '#ff00ff', '#0088ff'];
  
  // Mélanger les pays pour en avoir des uniques
  const shuffledCountries = [...COUNTRIES].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < 30; i++) {
    const country = shuffledCountries[i % shuffledCountries.length];
    // Ajouter un petit décalage aléatoire (±2 degrés) pour ne pas empiler
    const latOffset = (Math.random() - 0.5) * 4;
    const lngOffset = (Math.random() - 0.5) * 4;

    globalMockVotes.push({
      id: i,
      word: words[Math.floor(Math.random() * words.length)],
      lat: country.lat + latOffset,
      lng: country.lng + lngOffset,
      country: country.name,
      color: colors[Math.floor(Math.random() * colors.length)],
      created_at: new Date().toISOString(),
      ip_hash: 'mock-ip-' + i
    });
  }
}
