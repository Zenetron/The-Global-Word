export const BLACKLIST = [

  "merde", "con", "connard", "salope", "pute", "encule", "nazi", "raciste", "bite", "couille", "sexe", "porno",

  "fuck", "shit", "asshole", "bitch", "nigger", "dick", "pussy", "sex", "porn", "cock", "cunt",

  "fucker", "shitty", "bastard"
];

export const isForbidden = (word: string): boolean => {
  const normalized = word.trim().toLowerCase();

  return BLACKLIST.some(forbidden => normalized.includes(forbidden));
};
