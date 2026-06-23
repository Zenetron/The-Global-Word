const NEON_COLORS = ['#00ffff', '#8000ff', '#00ff00', '#ff00ff', '#0088ff'];

export function getRandomNeonColor() {
  return NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
}

export function wordToColor(word: string): string {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = (hash * 31 + word.charCodeAt(i)) | 0;
  }
  return NEON_COLORS[Math.abs(hash) % NEON_COLORS.length];
}

export function removeAccents(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
