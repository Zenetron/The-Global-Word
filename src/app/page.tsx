'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import SubmissionForm from '@/components/SubmissionForm';
import SidebarStats from '@/components/SidebarStats';
import ActivityFeed from '@/components/ActivityFeed';
import { COUNTRIES, CONTINENTS } from '@/lib/countries';
import { createClient } from '@supabase/supabase-js';
import CountryCard from '@/components/CountryCard';

import { useI18n } from '@/hooks/useI18n';

const GlobeComponentDynamic = dynamic(() => import('@/components/GlobeComponent'), { ssr: false });

export default function Home() {
  const { t, locale } = useI18n();
  const [globeData, setGlobeData] = useState<any[]>([]);
  const [topWords, setTopWords] = useState<any[]>([]);
  const [recentVotes, setRecentVotes] = useState<any[]>([]);
  const [countryTrends, setCountryTrends] = useState<Record<string, any[]>>({});
  const [wordDistributions, setWordDistributions] = useState<Record<string, any>>({});
  const [ringsData, setRingsData] = useState<any[]>([]);
  const [focusCoords, setFocusCoords] = useState<{lat: number, lng: number, distance?: number} | null>(null);
  const [selectedWord, setSelectedWord] = useState<{ word: string, country: string, color?: string } | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/stats?t=${Date.now()}&lang=${locale}`);
      const data = await res.json();
      if (data.globeData) setGlobeData(data.globeData);
      if (data.topWords) setTopWords(data.topWords);
      if (data.recentVotes) setRecentVotes(data.recentVotes);
      if (data.countryTrends) setCountryTrends(data.countryTrends);
      if (data.wordDistributions) setWordDistributions(data.wordDistributions);
    } catch (e) {
      console.error(t('error'), e);
    }
  };

  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [locale]);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const channel = supabase
      .channel('public:votes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, (payload) => {
        const vote = payload.new;
        const countryInfo = COUNTRIES.find(c => c.name === vote.country);
        if (countryInfo) {
          const lat = vote.lat || countryInfo.lat;
          const lng = vote.lng || countryInfo.lng;
          const newRing = { lat, lng, color: '#ff00ff' }; // Spark magenta pour les live votes
          
          setRingsData(prev => [...prev, newRing]);
          setTimeout(() => {
            setRingsData(prev => prev.filter(r => r !== newRing));
          }, 4000);
          
          // Rafraîchir doucement les stats si besoin
          fetchStats();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [locale]);

  const handleSubmission = async (word: string) => {
    try {

      let publicIp = null;
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          publicIp = ipData.ip;
        }
      } catch (e) {

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

        await fetchStats();

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
        setSelectedWord({ word: localWords[0].text, country: continentGeo.name, color: localWords[0].color });
      } else {
        setSelectedWord({ word: t('noWordYet'), country: continentGeo.name });
      }
      return;
    }

    if (countryGeo) {
      setFocusCoords({ lat: countryGeo.lat, lng: countryGeo.lng, distance: 180 });

      const localWords = globeData.filter((d: any) => d.country && d.country.toLowerCase() === countryName.toLowerCase());
      if (localWords.length > 0) {
        setSelectedWord({ word: localWords[0].text, country: localWords[0].country, color: localWords[0].color });
      } else {
        setSelectedWord({ word: t('noWordYet'), country: countryGeo.name });
      }
      return;
    }

    const foundWord = globeData.find((d: any) => d.country && d.country.toLowerCase().includes(countryName.toLowerCase()));
    if (foundWord) {
      setFocusCoords({ lat: foundWord.lat, lng: foundWord.lng });
      setSelectedWord({ word: foundWord.text, country: foundWord.country, color: foundWord.color });
    } else {
      alert(`${t('zoneNotFound')} : ${countryName}`);
    }
  };

  const handleWordClick = (word: string, country: string, lat?: number, lng?: number) => {
    // Trouver la couleur du mot sélectionné
    const foundWord = globeData.find((d: any) => d.country === country && d.text === word);
    setSelectedWord({ word, country, color: foundWord?.color });
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
        
        <GlobeComponentDynamic 
          data={globeData} 
          ringsData={ringsData}
          focusCoords={focusCoords} 
          onWordClick={handleWordClick} 
        />

        <ActivityFeed recentVotes={recentVotes} />

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
        <SidebarStats 
          globeData={globeData} 
          topWords={topWords} 
          wordDistributions={wordDistributions}
          countryTrends={countryTrends}
          onSearchCountry={handleSearchCountry} 
        />

        {selectedWord && (
          <CountryCard
            word={selectedWord.word}
            country={getDisplayCountry(selectedWord.country)}
            color={selectedWord.color}
            onClose={() => {
              setSelectedWord(null);
              setFocusCoords(null);
            }}
          />
        )}
      </main>
    );
  }
