'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Globe, MapPin, Map, Search, ChevronDown } from 'lucide-react';
import { COUNTRIES, CONTINENTS } from '@/lib/countries';
import { removeAccents } from '@/lib/utils';

interface SidebarStatsProps {
  globeData: any[];
  topWords: { word: string; count: number; color: string; distribution?: Record<string, number> }[];
  wordDistributions?: Record<string, { count: number; color: string; distribution: Record<string, number> }>;
  countryTrends?: Record<string, any[]>;
  onSearchCountry?: (country: string) => void;
  user?: any;
  profile?: any;
  onLoginGoogle?: () => void;
  onLoginMagicLink?: (email: string) => Promise<boolean>;
  onLogout?: () => void;
  onPlayGame?: () => void;
  onViewLeaderboard?: () => void;
}

type Period = 'today' | 'month' | 'year';
type Zone = 'world' | 'continent' | 'country';

import { useI18n } from '@/hooks/useI18n';

export default function SidebarStats({ globeData, topWords, wordDistributions, countryTrends, onSearchCountry, user, profile, onLoginGoogle, onLoginMagicLink, onLogout, onPlayGame, onViewLeaderboard }: SidebarStatsProps) {
  const { t, locale } = useI18n();
  const [period, setPeriod] = useState<Period>('today');
  const [zone, setZone] = useState<Zone>('world');
  const [search, setSearch] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedSubZone, setSelectedSubZone] = useState<string | null>(null);
  const [selectedWordFilter, setSelectedWordFilter] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (val.trim().length > 0) {
      const filtered = COUNTRIES
        .filter(c => 
          c.name.toLowerCase().includes(val.toLowerCase()) || 
          c.nameEn.toLowerCase().includes(val.toLowerCase())
        )
        .slice(0, 5)
        .map(c => locale === 'fr' ? c.name : c.nameEn);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const foundCountry = COUNTRIES.find(c => 
      c.name.toLowerCase() === search.trim().toLowerCase() || 
      c.nameEn.toLowerCase() === search.trim().toLowerCase()
    );
    if (foundCountry && onSearchCountry) {
      onSearchCountry(foundCountry.name);
      setSelectedSubZone(foundCountry.name);
      setZone('country');
      setSuggestions([]);
      setSearch(locale === 'fr' ? foundCountry.name : foundCountry.nameEn);
    }
  };

  const handleSuggestionClick = (countryName: string) => {
    const country = COUNTRIES.find(c => c.name === countryName || c.nameEn === countryName);
    const realName = country ? country.name : countryName;
    
    setSearch(countryName);
    setSuggestions([]);
    setSelectedSubZone(realName);
    setZone('country');
    setSelectedWordFilter(null);
    if (onSearchCountry) {
      onSearchCountry(realName);
    }
  };

  const handleZoneChange = (z: Zone) => {
    setZone(z);
    setSelectedSubZone(null);
    setSelectedWordFilter(null);
    setSearch('');
    if (z === 'world') {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };

  // Pre-calculate active countries set for O(1) lookup in sorting
  const sortedCountries = useMemo(() => {
    const activeCountries = new Set(
      globeData.filter(d => d.country).map(d => d.country.toLowerCase())
    );
    return [...COUNTRIES].sort((a, b) => {
      const hasA = activeCountries.has(a.name.toLowerCase());
      const hasB = activeCountries.has(b.name.toLowerCase());
      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;
      return 0;
    });
  }, [globeData]);

  // Group globeData by country for O(1) lookup during zone computations
  const wordsByCountry = useMemo(() => {
    const cache: Record<string, any[]> = {};
    globeData.forEach(d => {
      if (d.country) {
        const key = d.country.toLowerCase();
        if (!cache[key]) cache[key] = [];
        cache[key].push(d);
      }
    });
    return cache;
  }, [globeData]);

  // Pre-calculate top words for all zones to avoid doing it on key press rerenders
  const topWordsByZone = useMemo(() => {
    const cache: Record<string, { word: string; color: string } | null> = {};

    const computeTopWord = (name: string, isContinent: boolean) => {
      let zoneWords: any[] = [];
      if (!isContinent) {
        zoneWords = wordsByCountry[name.toLowerCase()] || [];
      } else {
        const countriesInContinent = COUNTRIES.filter(c => c.continent === name).map(c => c.name.toLowerCase());
        countriesInContinent.forEach(cName => {
          if (wordsByCountry[cName]) {
            zoneWords.push(...wordsByCountry[cName]);
          }
        });
      }

      if (zoneWords.length === 0) return null;

      const counts: Record<string, { count: number; color: string; firstSeen: number }> = {};
      zoneWords.forEach(w => {
        if (!counts[w.text]) {
          counts[w.text] = { 
            count: 0, 
            color: w.color, 
            firstSeen: w.created_at ? new Date(w.created_at).getTime() : Date.now() 
          };
        }
        counts[w.text].count++;
      });

      const top = Object.entries(counts).sort((a, b) => {
        if (b[1].count !== a[1].count) return b[1].count - a[1].count;
        return a[1].firstSeen - b[1].firstSeen;
      })[0];
      return { word: top[0], color: top[1].color };
    };

    CONTINENTS.forEach(c => {
      cache[c.name] = computeTopWord(c.name, true);
    });

    sortedCountries.slice(0, 20).forEach(c => {
      cache[c.name] = computeTopWord(c.name, false);
    });

    return cache;
  }, [wordsByCountry, sortedCountries]);

  const getTopWordForZone = (name: string) => {
    return topWordsByZone[name] || null;
  };

  const getTopTenForZone = (name: string) => {
    const isContinent = CONTINENTS.some(c => c.name === name);
    const countryInfo = !isContinent ? COUNTRIES.find(c => c.name === name || c.nameEn === name) : null;

    if (countryInfo && countryTrends) {
      const trends = countryTrends[countryInfo.name] || countryTrends[countryInfo.nameEn] || [];
      if (trends.length > 0) return trends;
    }

    let zoneWords: any[] = [];
    if (isContinent) {
      const countriesInContinent = COUNTRIES.filter(c => c.continent === name).map(c => c.name.toLowerCase());
      countriesInContinent.forEach(cName => {
        if (wordsByCountry[cName]) {
          zoneWords.push(...wordsByCountry[cName]);
        }
      });
    } else {
      const cName = name.toLowerCase();
      if (wordsByCountry[cName]) {
        zoneWords.push(...wordsByCountry[cName]);
      }
      if (countryInfo) {
        const cNameAlt1 = countryInfo.name.toLowerCase();
        const cNameAlt2 = countryInfo.nameEn.toLowerCase();
        if (cNameAlt1 !== cName && wordsByCountry[cNameAlt1]) {
          zoneWords.push(...wordsByCountry[cNameAlt1]);
        }
        if (cNameAlt2 !== cName && cNameAlt2 !== cNameAlt1 && wordsByCountry[cNameAlt2]) {
          zoneWords.push(...wordsByCountry[cNameAlt2]);
        }
      }
    }

    const counts: Record<string, { count: number; color: string; firstSeen: number }> = {};
    zoneWords.forEach(w => {
      if (!counts[w.text]) {
        counts[w.text] = { 
          count: 0, 
          color: w.color, 
          firstSeen: w.created_at ? new Date(w.created_at).getTime() : Date.now() 
        };
      }
      counts[w.text].count++;
    });

    return Object.entries(counts)
      .sort((a, b) => {
        if (b[1].count !== a[1].count) return b[1].count - a[1].count;
        return a[1].firstSeen - b[1].firstSeen;
      })
      .slice(0, 10)
      .map(([word, data]) => ({ word, ...data }));
  };

  const getDisplayCountry = (name: string) => {
    const country = COUNTRIES.find(c => c.name === name || c.nameEn === name);
    if (country) return locale === 'fr' ? country.name : country.nameEn;
    return name;
  };

  const getTopCountriesForWord = (word: string) => {
    const normalized = removeAccents(word);

    const wordInfo = (wordDistributions && wordDistributions[normalized]) || topWords.find(w => w.word === normalized);
    if (!wordInfo || !wordInfo.distribution) return [];

    return Object.entries(wordInfo.distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count, color: wordInfo.color }));
  };

  const displayWords = useMemo(() => {
    if (selectedWordFilter) {
      return getTopCountriesForWord(selectedWordFilter);
    }
    if (selectedSubZone) {
      return getTopTenForZone(selectedSubZone);
    }
    return zone === 'world' ? topWords : [];
  }, [selectedWordFilter, selectedSubZone, zone, topWords, wordsByCountry, countryTrends, wordDistributions]);

  const topTitle = selectedWordFilter
    ? `${t('country')} - "${selectedWordFilter}"`
    : (selectedSubZone ? `Top 10 - ${selectedSubZone}` : (zone === 'world' ? t('topTenWorld') : t('trends')));

  return (
    <>
      
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-20 right-6 z-50 p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white md:hidden shadow-2xl"
      >
        <Search size={20} className={isMobileOpen ? 'text-neon-cyan' : ''} />
      </button>

      <motion.div
        initial={false}
        className={`fixed right-0 top-0 bottom-0 w-full md:w-80 bg-black/60 backdrop-blur-xl border-l border-white/10 p-6 flex flex-col z-40 pointer-events-auto overflow-y-auto transition-all duration-300 ${isMobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Globe className="text-neon-cyan" size={18} /> The Global Word
          </h2>
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-white/50 hover:text-white">
            ✕
          </button>
        </div>

        {/* Auth : Magic Link + Google */}
        <div className="mb-5">
          {user ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[11px] text-white/50 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                <span className="truncate">
                  {profile?.username || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email}
                  {profile?.score !== undefined && (
                    <span className="text-neon-emerald font-bold ml-2">({profile.score} pts)</span>
                  )}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="shrink-0 text-[10px] text-white/30 hover:text-white/70 border border-white/10 hover:border-white/30 rounded-full px-2 py-1 transition-all cursor-pointer"
              >
                Déconnexion
              </button>
            </div>
          ) : emailSent ? (
            <div className="flex flex-col items-center gap-2 py-3 px-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <span className="text-green-400 text-lg">✉️</span>
              <p className="text-[11px] text-green-300 text-center leading-relaxed">
                Lien envoyé ! Vérifie ta boîte mail et clique sur le lien pour te connecter.
              </p>
              <button
                onClick={() => { setEmailSent(false); setEmailInput(''); }}
                className="text-[10px] text-white/30 hover:text-white/60 transition-colors cursor-pointer mt-1"
              >
                Renvoyer
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!emailInput.trim() || !onLoginMagicLink) return;
                  setEmailLoading(true);
                  const ok = await onLoginMagicLink(emailInput.trim());
                  setEmailLoading(false);
                  if (ok) setEmailSent(true);
                }}
                className="flex flex-col gap-2"
              >
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ton@email.com"
                  className="w-full bg-white/5 border border-white/10 focus:border-neon-cyan rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-white/25 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={emailLoading || !emailInput.trim()}
                  className="w-full py-2 rounded-lg bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/30 hover:border-neon-cyan/60 text-neon-cyan text-[11px] font-semibold tracking-wider uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {emailLoading ? 'Envoi...' : '✉ Envoyer le lien'}
                </button>
              </form>

              <div className="flex items-center gap-2 my-1">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] text-white/25 uppercase tracking-widest">ou</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <button
                onClick={onLoginGoogle}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-[11px] font-medium transition-all cursor-pointer"
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Continuer avec Google
              </button>
            </div>
          )}
        </div>

        <div className="mb-6 relative z-50">
          <div className="flex gap-2 mb-4">
            <button
              onClick={onPlayGame}
              className="flex-1 py-2 rounded-xl bg-neon-emerald/20 hover:bg-neon-emerald/30 border border-neon-emerald/40 text-neon-emerald font-bold text-[11px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              🎮 Jouer
            </button>
            <button
              onClick={onViewLeaderboard}
              className="flex-1 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 font-bold text-[11px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              🏆 Classement
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder={t('searchCountry')}
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-white/5 border border-white/10 rounded-md py-2 pl-3 pr-10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan transition-colors"
            />
            <button type="submit" className="absolute right-2 top-2.5 text-white/50 hover:text-white transition-colors">
              <Search size={16} />
            </button>
          </form>

          {suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/10 rounded-md overflow-hidden backdrop-blur-md shadow-2xl">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex bg-white/5 rounded-lg p-1 mb-6">
          <button
            onClick={() => handleZoneChange('world')}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium rounded-md transition-all ${zone === 'world' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white'
              }`}
          >
            <Globe size={14} /> {t('world')}
          </button>
          <button
            onClick={() => handleZoneChange('continent')}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium rounded-md transition-all ${zone === 'continent' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white'
              }`}
          >
            <Map size={14} /> {t('continent')}
          </button>
          <button
            onClick={() => handleZoneChange('country')}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium rounded-md transition-all ${zone === 'country' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white'
              }`}
          >
            <MapPin size={14} /> {t('country')}
          </button>
        </div>

        {(zone === 'continent' || zone === 'country') && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                {t('selectZone')} {zone === 'continent' ? t('selectContinent') : t('selectCountry')}
              </span>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <ChevronDown size={12} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className={`grid grid-cols-2 gap-2 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-60 overflow-y-auto' : 'max-h-24'}`}>
              {zone === 'continent' ? (
                CONTINENTS.map((c) => {
                  const displayName = locale === 'fr' ? c.name : c.nameEn;
                  const top = getTopWordForZone(c.name);
                  return (
                    <button
                      key={c.name}
                      onClick={() => handleSuggestionClick(c.name)}
                      className="bg-white/5 hover:bg-white/10 border border-white/5 py-1.5 px-2 rounded text-[10px] text-white/70 hover:text-white text-left transition-all flex flex-col gap-0.5"
                    >
                      <span className="font-bold truncate">{displayName}</span>
                      {top && (
                        <span className="text-[9px] font-medium" style={{ color: top.color }}>
                          {top.word}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                sortedCountries.slice(0, 20).map((c) => {
                  const displayName = locale === 'fr' ? c.name : c.nameEn;
                  const top = getTopWordForZone(c.name);
                  return (
                    <button
                      key={c.name}
                      onClick={() => handleSuggestionClick(c.name)}
                      className="bg-white/5 hover:bg-white/10 border border-white/5 py-1.5 px-2 rounded text-[10px] text-white/70 hover:text-white text-left transition-all flex flex-col gap-0.5"
                    >
                      <span className="font-bold truncate">{displayName}</span>
                      {top && (
                        <span className="text-[9px] font-medium" style={{ color: top.color }}>
                          {top.word}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
              {zone === 'country' && COUNTRIES.length > 20 && (
                <div className="col-span-2 text-[9px] text-white/20 text-center mt-1">
                  {t('useSearchMore')}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4 border-b border-white/10 mb-6 pb-2">
          {(['today', 'month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-sm pb-2 border-b-2 transition-all ${period === p ? 'border-neon-cyan text-white' : 'border-transparent text-white/40 hover:text-white/70'
                }`}
            >
              {p === 'today' ? t('today') : p === 'month' ? t('thisMonth') : t('thisYear')}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest">
            {topTitle}
          </h3>
          {(selectedSubZone || selectedWordFilter) && (
            <button
              onClick={() => { setSelectedSubZone(null); setSelectedWordFilter(null); }}
              className="text-[10px] text-neon-cyan hover:underline"
            >
              {t('back')}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 flex-1">
          {displayWords.length === 0 ? (
            <div className="text-white/30 text-center text-sm py-10 italic">
              {zone === 'world' ? t('noData') : (selectedSubZone ? t('noWordZone') : t('chooseZone'))}
            </div>
          ) : (
            displayWords.map((item: any, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  if (!selectedWordFilter && item.word) {
                    setSelectedWordFilter(item.word);
                  } else if (item.country) {
                    handleSuggestionClick(item.country);
                  }
                }}
                className={`flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 ${!selectedWordFilter ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-white/30 text-xs w-4">{index + 1}</span>
                  <span className="font-medium text-lg" style={{ color: item.color || '#fff', textShadow: item.color ? `0 0 5px ${item.color}80` : 'none' }}>
                    {item.word || getDisplayCountry(item.country)}
                  </span>
                </div>
                <span className="text-white/70 font-mono text-sm">{item.count}</span>
              </motion.div>
            ))
          )}
        </div>

        <div className="mt-8 text-center text-[10px] text-white/20 pb-4">
          The Global Word © 2026<br />
          {t('globalVision')}
        </div>
      </motion.div>
    </>
  );
}
