export const BLACKLIST = [
  // Français (insultes et termes inappropriés)
  "merde", "con", "connard", "salope", "pute", "encule", "nazi", "raciste", "bite", "couille", "sexe", "porno",
  // Anglais (profanities)
  "fuck", "shit", "asshole", "bitch", "nigger", "dick", "pussy", "sex", "porn", "cock", "cunt",
  // Autres (variations courantes)
  "fucker", "shitty", "bastard"
];

export const isForbidden = (word: string): boolean => {
  const normalized = word.trim().toLowerCase();
  // Vérification directe et vérification de "sous-mot" pour les insultes composées
  return BLACKLIST.some(forbidden => normalized.includes(forbidden));
};
