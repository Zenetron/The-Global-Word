'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import SubmissionForm from '@/components/SubmissionForm';
import SidebarStats from '@/components/SidebarStats';
import ActivityFeed from '@/components/ActivityFeed';
import { COUNTRIES, CONTINENTS } from '@/lib/countries';

import { useI18n } from '@/hooks/useI18n';

const GlobeComponentDynamic = dynamic(() => import('@/components/GlobeComponent'), { ssr: false });

export default function Home() {
  const { t, locale } = useI18n();
  const [globeData, setGlobeData] = useState<any[]>([]);
  const [topWords, setTopWords] = useState<any[]>([]);
  const [recentVotes, setRecentVotes] = useState<any[]>([]);
  const [ringsData, setRingsData] = useState<any[]>([]);
  const [focusCoords, setFocusCoords] = useState<{lat: number, lng: number, distance?: number} | null>(null);
  const [selectedWord, setSelectedWord] = useState<{ word: string, country: string } | null>(null);

  const fetchStats = async () => {
    try {
      // Calculer le minuit local de l'utilisateur en format ISO
      const now = new Date();
      const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sinceParam = localMidnight.toISOString();

      const res = await fetch(`/api/stats?since=${encodeURIComponent(sinceParam)}`);
      const data = await res.json();
      if (data.globeData) setGlobeData(data.globeData);
      if (data.topWords) setTopWords(data.topWords);
      if (data.recentVotes) setRecentVotes(data.recentVotes);
    } catch (e) {
      console.error(t('error'), e);
    }
  };

  useEffect(() => {
    fetchStats();
    // Rafraîchir toutes les 30 secondes pour voir les nouveaux mots des autres
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmission = async (word: string) => {
    try {
      // En développement local, le serveur voit ::1. On récupère l'IP publique côté client pour aider.
      let publicIp = null;
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          publicIp = ipData.ip;
        }
      } catch (e) {
        // Si ipify échoue (bloqué par AdBlock souvent), on tente ipapi
        try {
          const ipRes2 = await fetch('https://ipapi.co/json/');
          if (ipRes2.ok) {
            const ipData2 = await ipRes2.json();
            publicIp = ipData2.ip || ipData2.query;
          }
        } catch (e2) {
          console.warn('Could not fetch public IP from any source', e2);
        }
      }

      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, clientIp: publicIp }),
      });
      
      if (res.ok) {
        const result = await res.json();
        // Rafraîchir les données
        await fetchStats();
        
        // Déclencher un effet visuel (Pulse) sur le globe
        const country = COUNTRIES.find(c => c.name === result.country);
        if (country) {
          const newRing = { lat: country.lat, lng: country.lng, color: '#00ffff' };
          setRingsData([newRing]);
          setTimeout(() => setRingsData([]), 5000);
        }
        
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleSearchCountry = (countryName: string) => {
    const countryGeo = COUNTRIES.find(c => c.name.toLowerCase().includes(countryName.toLowerCase()));
    const continentGeo = CONTINENTS.find(c => c.name.toLowerCase().includes(countryName.toLowerCase()));
    
    if (continentGeo) {
      setFocusCoords({ lat: continentGeo.lat, lng: continentGeo.lng, distance: 300 });
      const localWords = globeData.filter((d: any) => {
        const countriesInContinent = COUNTRIES.filter(c => c.continent === continentGeo.name).map(c => c.name.toLowerCase());
        return d.country && countriesInContinent.includes(d.country.toLowerCase());
      });
      if (localWords.length > 0) {
        setSelectedWord({ word: localWords[0].text, country: continentGeo.name });
      } else {
        setSelectedWord({ word: t('noWordYet'), country: continentGeo.name });
      }
      return;
    }

    if (countryGeo) {
      setFocusCoords({ lat: countryGeo.lat, lng: countryGeo.lng, distance: 180 });
      
      // Simuler le clic : trouver le mot le plus fréquent pour ce pays
      const localWords = globeData.filter((d: any) => d.country && d.country.toLowerCase() === countryName.toLowerCase());
      if (localWords.length > 0) {
        setSelectedWord({ word: localWords[0].text, country: localWords[0].country });
      } else {
        setSelectedWord({ word: t('noWordYet'), country: countryGeo.name });
      }
      return;
    }

    // 2. Fallback sur les mots du globe
    const foundWord = globeData.find((d: any) => d.country && d.country.toLowerCase().includes(countryName.toLowerCase()));
    if (foundWord) {
      setFocusCoords({ lat: foundWord.lat, lng: foundWord.lng });
      setSelectedWord({ word: foundWord.text, country: foundWord.country });
    } else {
      alert(`${t('zoneNotFound')} : ${countryName}`);
    }
  };

  const handleWordClick = (word: string, country: string, lat?: number, lng?: number) => {
    setSelectedWord({ word, country });
    if (lat !== undefined && lng !== undefined) {
      setFocusCoords({ lat, lng, distance: 180 });
    }
  };

    const getDisplayCountry = (name: string) => {
      const country = COUNTRIES.find(c => c.name === name);
      if (country) return locale === 'fr' ? country.name : country.nameEn;
      const continent = CONTINENTS.find(c => c.name === name);
      if (continent) return locale === 'fr' ? continent.name : continent.nameEn;
      return name;
    };

    return (
      <main className="relative w-full h-screen bg-black overflow-hidden">
        {/* Globe en arrière-plan */}
        <GlobeComponentDynamic 
          data={globeData} 
          ringsData={ringsData}
          focusCoords={focusCoords} 
          onWordClick={handleWordClick} 
        />

        <ActivityFeed recentVotes={recentVotes} />
        
        {/* Mot #1 du jour (Haut Gauche) */}
        {topWords.length > 0 && (
          <div className="fixed top-8 left-8 z-20 bg-black/40 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl flex flex-col pointer-events-none shadow-2xl">
            <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {t('dailyTrend')}
            </span>
            <div className="flex items-baseline gap-3">
              <span 
                className="text-5xl font-black tracking-wider uppercase"
                style={{ color: topWords[0].color, textShadow: `0 0 20px ${topWords[0].color}` }}
              >
                {topWords[0].word}
              </span>
              <span className="text-sm text-white/70 font-mono">x{topWords[0].count}</span>
            </div>
          </div>
        )}

        <SubmissionForm onSubmit={handleSubmission} />
        <SidebarStats globeData={globeData} topWords={topWords} onSearchCountry={handleSearchCountry} />

        {/* Affichage du mot sélectionné */}
        {selectedWord && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-md border border-white/20 px-8 py-4 rounded-full shadow-[0_0_30px_rgba(0,255,255,0.2)] flex items-center gap-4 pointer-events-auto relative">
              <button 
                onClick={() => {
                  setSelectedWord(null);
                  setFocusCoords(null);
                }}
                className="absolute -top-3 -right-3 bg-white/10 hover:bg-white/20 text-white rounded-full w-8 h-8 flex items-center justify-center border border-white/20 transition-colors text-xs"
              >
                ✕
              </button>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 tracking-widest uppercase mb-1">{getDisplayCountry(selectedWord.country)}</span>
                <span className="text-2xl font-bold text-white tracking-wide">"{selectedWord.word}"</span>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }
