const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const COUNTRIES = require('./countries.json');

const WC_HOTSPOTS = {
  "France": { top: "Mbappé", secondary: "Bleus" },
  "Argentine": { top: "Messi", secondary: "Albiceleste" },
  "Brésil": { top: "Vinícius", secondary: "Seleção" },
  "Espagne": { top: "Yamal", secondary: "Roja" },
  "Allemagne": { top: "Musiala", secondary: "Nationalelf" },
  "Royaume-Uni": { top: "Bellingham", secondary: "Three Lions" },
  "Italie": { top: "Donnarumma", secondary: "Squadra Azzurra" },
  "Portugal": { top: "Ronaldo", secondary: "Seleção" },
  "Pays-Bas": { top: "Depay", secondary: "Oranje" },
  "Belgique": { top: "De Bruyne", secondary: "Diables Rouges" },
  "Croatie": { top: "Modrić", secondary: "Vatreni" },
  "Uruguay": { top: "Valverde", secondary: "Celeste" },
  "Mexique": { top: "Ochoa", secondary: "El Tri" },
  "Colombie": { top: "Luis Díaz", secondary: "Cafeteros" },
  "Maroc": { top: "Hakimi", secondary: "Lions de l'Atlas" },
  "Sénégal": { top: "Mané", secondary: "Lions de la Téranga" },
  "Algérie": { top: "Mahrez", secondary: "Fennecs" },
  "Tunisie": { top: "Msakni", secondary: "Aigles de Carthage" },
  "Égypte": { top: "Salah", secondary: "Pharaons" },
  "Turquie": { top: "Güler", secondary: "Bizim Çocuklar" },
  "Nigeria": { top: "Osimhen", secondary: "Super Eagles" },
  "Côte d'Ivoire": { top: "Haller", secondary: "Éléphants" },
  "Cameroun": { top: "Anguissa", secondary: "Lions Indomptables" }
};

const TECH_NEWS_COUNTRIES = {
  "États-Unis": ["IA", "ChatGPT", "SpaceX", "Bourse", "Apple Vision Pro", "Taylor Swift", "Bitcoin"],
  "Canada": ["IA", "Climat", "ChatGPT", "Bourse", "Bitcoin"],
  "Japon": ["Samurai Blue", "Robotique", "Semi-conducteurs", "IA", "Gaming"],
  "Corée du Sud": ["Son", "K-Pop", "Semi-conducteurs", "IA", "Gaming"],
  "Chine": ["IA", "Espace", "TikTok", "Semi-conducteurs", "Économie"],
  "Singapour": ["Fintech", "IA", "Bourse", "Bellingham"],
  "Suisse": ["Bourse", "Horlogerie", "Crypto", "Quantum"],
  "Suède": ["Taylor Swift", "Climat", "Spotify", "Eurovision"],
  "Finlande": ["Climat", "Aurores boréales", "Tech", "Nokia"],
  "Australie": ["Climat", "Socceroos", "Espace", "Inflation"],
  "Émirats Arabes Unis": ["Tech", "IA", "Énergie", "Finance"],
  "Qatar": ["Mondial", "Investissements", "Énergie", "Diplomatie"],
  "Arabie Saoudite": ["Ronaldo", "Pro League", "Neom", "Pétrole"]
};

const NEWS_EVENTS = {
  "Europe": ["climat", "eurovision", "inflation", "supercalculateur", "cybersécurité", "grève", "bourse", "technologie", "festival de cannes", "lune", "jazz", "art"],
  "Amérique du Nord": ["bourse", "ia", "tech", "météo", "spatial", "espace", "diplomatie", "taylor swift", "bitcoin", "gta 6", "cinéma"],
  "Amérique du Sud": ["agritech", "manifestation", "forêt", "économie", "sécurité", "culture", "carnaval", "inflation", "sécheresse"],
  "Moyen-Orient": ["hydrogène", "diplomatie", "innovation", "énergie", "pétrole", "technologie", "desalination"],
  "Asie": ["semi-conducteurs", "ia", "robotique", "typhon", "exportations", "démographie", "espace", "exploration", "gaming", "manga"],
  "Afrique": ["développement", "startups", "agritech", "fintech", "infrastructures", "climat", "solaire", "ressources", "safari", "musique"],
  "Océanie": ["corail", "climat", "exploration", "écologie", "pacifique", "technologie", "tourisme"]
};

const FOOTBALL_GENERIC = ["mondial", "coupe du monde", "but", "match", "victoire", "ballon d'or", "buteur", "penalty", "stade", "prolongations", "sélectionneur", "transfert", "supporters"];

const GENERAL_EVENTS = ["activisme", "climat", "économie", "santé", "culture", "innovation", "cinéma", "musique"];

async function seedWorldCup() {
  console.log("Nuking old votes and populating the globe with a realistic mix of World Cup players, teams, and daily news...");

  const { error: deleteError } = await supabase.from('votes').delete().neq('id', 0);
  
  if (deleteError) {
      console.log("Error deleting old votes:", deleteError);
  } else {
      console.log("Old votes deleted.");
  }

  const votes = [];
  
  for (const country of COUNTRIES) {
    let topics = [];
    
    const isWcHotspot = WC_HOTSPOTS[country.name] || WC_HOTSPOTS[country.nameEn];
    const isTechNews = TECH_NEWS_COUNTRIES[country.name] || TECH_NEWS_COUNTRIES[country.nameEn];
    
    if (isWcHotspot) {
        // WC Hotspot: Superstar (3 votes), team/secondary WC term (1 vote), local news (1 vote)
        const hotspot = WC_HOTSPOTS[country.name] || WC_HOTSPOTS[country.nameEn];
        const eventsPool = NEWS_EVENTS[country.continent] || GENERAL_EVENTS;
        const newsWord = eventsPool[Math.floor(Math.random() * eventsPool.length)];
        topics = [
            { word: hotspot.top, count: 3 },
            { word: hotspot.secondary, count: 1 },
            { word: newsWord, count: 1 }
        ];
    } else if (isTechNews) {
        // Tech country: Top is a tech/news topic (3 votes), secondary is another tech/news (1 vote), third is football (1 vote)
        const techPool = TECH_NEWS_COUNTRIES[country.name] || TECH_NEWS_COUNTRIES[country.nameEn];
        const shuffledTech = [...techPool].sort(() => 0.5 - Math.random());
        const fbWord = FOOTBALL_GENERIC[Math.floor(Math.random() * FOOTBALL_GENERIC.length)];
        topics = [
            { word: shuffledTech[0], count: 3 },
            { word: shuffledTech[1] || "Tech", count: 1 },
            { word: fbWord, count: 1 }
        ];
    } else {
        // Normal country: mix of news and general football
        const eventsPool = NEWS_EVENTS[country.continent] || GENERAL_EVENTS;
        const shuffledNews = [...eventsPool].sort(() => 0.5 - Math.random());
        const shuffledFb = [...FOOTBALL_GENERIC].sort(() => 0.5 - Math.random());
        
        const rand = Math.random();
        if (rand < 0.4) {
            topics = [
                { word: shuffledNews[0], count: 2 },
                { word: shuffledFb[0], count: 1 }
            ];
        } else if (rand < 0.8) {
            topics = [
                { word: shuffledFb[0], count: 2 },
                { word: shuffledNews[0], count: 1 }
            ];
        } else {
            topics = [
                { word: shuffledNews[0], count: 2 },
                { word: shuffledNews[1] || "climat", count: 1 }
            ];
        }
    }

    for (const t of topics) {
      for (let i = 0; i < t.count; i++) {
        votes.push({
          word: t.word,
          country: country.name,
          lat: country.lat + (Math.random() - 0.5) * 4,
          lng: country.lng + (Math.random() - 0.5) * 4,
          ip_hash: `seed_${country.name}_${t.word}_${i}_${Date.now()}`,
          created_at: new Date().toISOString()
        });
      }
    }
  }

  console.log(`Inserting ${votes.length} votes...`);

  for (let i = 0; i < votes.length; i += 500) {
    const chunk = votes.slice(i, i + 500);
    const { error } = await supabase.from('votes').insert(chunk);
    if (error) {
        console.error("Error inserting chunk:", error.message);
    } else {
        console.log(`✅ ${i + chunk.length}/${votes.length} votes injectés...`);
    }
  }

  console.log("✨ Globe fully populated with a beautiful mix of players, teams, and daily news!");
}

seedWorldCup();
