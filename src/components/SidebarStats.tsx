'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, MapPin, Map, Search, ChevronDown } from 'lucide-react';
import { COUNTRIES, CONTINENTS } from '@/lib/countries';

interface SidebarStatsProps {
  globeData: any[];
  topWords: { word: string; count: number; color: string; distribution?: Record<string, number> }[];
  onSearchCountry?: (country: string) => void;
}

type Period = 'today' | 'month' | 'year';
type Zone = 'world' | 'continent' | 'country';

import { useI18n } from '@/hooks/useI18n';

export default function SidebarStats({ globeData, topWords, onSearchCountry }: SidebarStatsProps) {
  const { t, locale } = useI18n();
  const [period, setPeriod] = useState<Period>('today');
  const [zone, setZone] = useState<Zone>('world');
  const [search, setSearch] = useState('');
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
  // Helper pour obtenir le mot top d'une zone
  const getTopWordForZone = (name: string) => {
    const isContinent = CONTINENTS.some(c => c.name === name);

    const zoneWords = globeData.filter(d => {
      if (!isContinent) {
        return d.country && d.country.toLowerCase() === name.toLowerCase();
      } else {
        const countriesInContinent = COUNTRIES.filter(c => c.continent === name).map(c => c.name.toLowerCase());
        return d.country && countriesInContinent.includes(d.country.toLowerCase());
      }
    });

    if (zoneWords.length === 0) return null;

    const counts: Record<string, { count: number, color: string, firstSeen: string }> = {};
    zoneWords.forEach(w => {
      if (!counts[w.text]) {
        counts[w.text] = { count: 0, color: w.color, firstSeen: w.created_at || new Date().toISOString() };
      }
      counts[w.text].count++;
    });

    const top = Object.entries(counts).sort((a, b) => {
      if (b[1].count !== a[1].count) return b[1].count - a[1].count;
      return new Date(a[1].firstSeen).getTime() - new Date(b[1].firstSeen).getTime();
    })[0];
    return { word: top[0], color: top[1].color };
  };

  // Helper pour obtenir le Top 10 d'une zone spécifique
  const getTopTenForZone = (name: string) => {
    const isContinent = CONTINENTS.some(c => c.name === name);
    const countryInfo = !isContinent ? COUNTRIES.find(c => c.name === name || c.nameEn === name) : null;
    
    const zoneWords = globeData.filter(d => {
      if (isContinent) {
        const countriesInContinent = COUNTRIES.filter(c => c.continent === name).map(c => c.name.toLowerCase());
        return d.country && countriesInContinent.includes(d.country.toLowerCase());
      } else {
        // Chercher par nom FR ou EN
        return d.country && (
          d.country.toLowerCase() === name.toLowerCase() || 
          (countryInfo && d.country.toLowerCase() === countryInfo.name.toLowerCase()) ||
          (countryInfo && d.country.toLowerCase() === countryInfo.nameEn.toLowerCase())
        );
      }
    });

    const counts: Record<string, { count: number, color: string, firstSeen: string }> = {};
    zoneWords.forEach(w => {
      if (!counts[w.text]) {
        counts[w.text] = { count: 0, color: w.color, firstSeen: w.created_at || new Date().toISOString() };
      }
      counts[w.text].count++;
    });

    return Object.entries(counts)
      .sort((a, b) => {
        if (b[1].count !== a[1].count) return b[1].count - a[1].count;
        return new Date(a[1].firstSeen).getTime() - new Date(b[1].firstSeen).getTime();
      })
      .slice(0, 10)
      .map(([word, data]) => ({ word, ...data }));
  };

  // Trier les pays : ceux qui ont des mots en premier
  const sortedCountries = [...COUNTRIES].sort((a, b) => {
    const hasA = globeData.some(d => d.country?.toLowerCase() === a.name.toLowerCase());
    const hasB = globeData.some(d => d.country?.toLowerCase() === b.name.toLowerCase());
    if (hasA && !hasB) return -1;
    if (!hasA && hasB) return 1;
    return 0;
  });

  // Helper pour obtenir les pays où un mot est le plus présent
  const getTopCountriesForWord = (word: string) => {
    const wordInfo = topWords.find(w => w.word === word);
    if (!wordInfo || !wordInfo.distribution) return [];

    return Object.entries(wordInfo.distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }));
  };

  const displayWords = selectedWordFilter
    ? getTopCountriesForWord(selectedWordFilter)
    : (selectedSubZone ? getTopTenForZone(selectedSubZone) : (zone === 'world' ? topWords : []));

  const topTitle = selectedWordFilter
    ? `${t('country')} - "${selectedWordFilter}"`
    : (selectedSubZone ? `Top 10 - ${selectedSubZone}` : (zone === 'world' ? t('topTenWorld') : t('trends')));

  return (
    <>
      {/* Bouton Toggle Mobile */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-6 right-6 z-50 p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white md:hidden shadow-2xl"
      >
        <Search size={20} className={isMobileOpen ? 'text-neon-cyan' : ''} />
      </button>

      <motion.div
        initial={false}
        className={`fixed right-0 top-0 bottom-0 w-full md:w-80 bg-black/60 backdrop-blur-xl border-l border-white/10 p-6 flex flex-col z-40 pointer-events-auto overflow-y-auto transition-all duration-300 ${isMobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Globe className="text-neon-cyan" /> The Global Word
          </h2>
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-white/50 hover:text-white">
            ✕
          </button>
        </div>

        {/* Barre de recherche pays avec autocomplétion */}
        <div className="mb-6 relative z-50">
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

        {/* Zone Selector */}
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

        {/* Listes de sélection Continents / Pays */}
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

        {/* Period Selector */}
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
                    {item.word || item.country}
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
