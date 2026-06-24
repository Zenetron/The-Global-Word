'use client';

import { useEffect, useState, useTransition, useCallback } from 'react';
import dynamic from 'next/dynamic';
import SubmissionForm from '@/components/SubmissionForm';
import SidebarStats from '@/components/SidebarStats';
import ActivityFeed from '@/components/ActivityFeed';
import UsernamePrompt from '@/components/UsernamePrompt';
import DailyGame from '@/components/DailyGame';
import Leaderboard from '@/components/Leaderboard';
import { COUNTRIES, CONTINENTS } from '@/lib/countries';
import { supabase } from '@/lib/supabase';
import CountryCard from '@/components/CountryCard';
import { useI18n } from '@/hooks/useI18n';
import type { GlobeDataPoint, TopWord, RecentVote, Profile, AuthUser } from '@/types';

const GlobeComponentDynamic = dynamic(() => import('@/components/GlobeComponent'), { ssr: false });

export default function Home() {
  const { t, locale } = useI18n();
  const [, startTransition] = useTransition();
  const [globeData, setGlobeData] = useState<GlobeDataPoint[]>([]);
  const [topWords, setTopWords] = useState<TopWord[]>([]);
  const [recentVotes, setRecentVotes] = useState<RecentVote[]>([]);
  const [countryTrends, setCountryTrends] = useState<Record<string, { word: string; count: number }[]>>({});
  const [wordDistributions, setWordDistributions] = useState<Record<string, { count: number; color: string; distribution: Record<string, number> }>>({});
  const [ringsData, setRingsData] = useState<{ lat: number; lng: number; color: string }[]>([]);
  const [focusCoords, setFocusCoords] = useState<{ lat: number; lng: number; distance?: number } | null>(null);
  const [selectedWord, setSelectedWord] = useState<{ word: string; country: string; color?: string } | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const initSession = async () => {
      try {
        const { data }: any = await supabase.auth.getSession();
        setUser(data?.session?.user ?? null);
      } catch (e) {
        console.error(e);
      }
    };
    initSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user: AuthUser } | null) => {
      setUser(session?.user ?? null);
    });
    return () => { subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setIsProfileLoaded(true);
        return;
      }
      try {
        const { data: { session } } = await supabase!.auth.getSession();
        if (!session) return;
        const res = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          
          // Vérifier si un score est en attente
          const pendingScoreStr = localStorage.getItem('pending_game_score');
          if (pendingScoreStr) {
            try {
              const pendingScore = JSON.parse(pendingScoreStr);
              // On l'envoie en arrière-plan
              fetch('/api/game/score', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                  score: pendingScore.score,
                  timeMs: pendingScore.timeMs
                })
              }).then(() => {
                localStorage.removeItem('pending_game_score');
                // Optionnel : on pourrait recharger le profil pour mettre à jour le total
              }).catch(console.error);
            } catch (e) {
              console.error('Erreur lecture score local', e);
            }
          }
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error('Erreur chargement profil', e);
      } finally {
        setIsProfileLoaded(true);
      }
    };
    fetchProfile();
  }, [user]);

  const handleLoginGoogle = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
    } catch (e) {
      console.error('Error logging in with Google:', e);
    }
  };

  const handleLoginMagicLink = async (email: string): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) { console.error('Magic link error:', error); return false; }
      return true;
    } catch (e) {
      console.error('Magic link error:', e);
      return false;
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (e) {
      console.error('Error logging out:', e);
    }
  };

  const fetchStats = useCallback(async (bypassCache = false) => {
    try {
      const url = bypassCache
        ? `/api/stats?lang=${locale}&bypass=true`
        : `/api/stats?lang=${locale}`;
      const res = await fetch(url);
      const data = await res.json();
      startTransition(() => {
        if (data.globeData) setGlobeData(data.globeData);
        if (data.topWords) setTopWords(data.topWords);
        if (data.recentVotes) setRecentVotes(data.recentVotes);
        if (data.countryTrends) setCountryTrends(data.countryTrends);
        if (data.wordDistributions) setWordDistributions(data.wordDistributions);
      });
    } catch (e) {
      console.error(e);
    }
  }, [locale]);

  useEffect(() => {
    const initTimer = setTimeout(() => { fetchStats(); }, 500);
    const interval = setInterval(fetchStats, 30000);
    return () => { clearTimeout(initTimer); clearInterval(interval); };
  }, [fetchStats]);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('public:votes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, (payload: any) => {
        const vote = payload.new;
        const countryInfo = COUNTRIES.find(c => c.name === vote.country);
        if (countryInfo) {
          const lat = vote.lat || countryInfo.lat;
          const lng = vote.lng || countryInfo.lng;
          const newRing = { lat, lng, color: '#ff00ff' };
          setRingsData(prev => [...prev, newRing]);
          setTimeout(() => { setRingsData(prev => prev.filter(r => r !== newRing)); }, 4000);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [locale]);

  const handleSubmission = async (word: string): Promise<string | null> => {
    try {
      let session = null;
      if (supabase) {
        const result = await supabase.auth.getSession();
        session = result.data?.session;
      }
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session) { headers['Authorization'] = `Bearer ${session.access_token}`; }

      const res = await fetch('/api/vote', {
        method: 'POST',
        headers,
        body: JSON.stringify({ word }),
      });

      if (res.ok) {
        const result = await res.json();
        await fetchStats(true);
        const country = COUNTRIES.find(c => c.name === result.country);
        if (country) {
          const newRing = { lat: country.lat, lng: country.lng, color: '#00ffff' };
          setRingsData([newRing]);
          setTimeout(() => setRingsData([]), 5000);
        }
        return null;
      }
      const errData = await res.json().catch(() => ({}));
      return errData.error || t('error');
    } catch (e) {
      console.error(e);
      return t('error');
    }
  };

  const handleSearchCountry = (countryName: string) => {
    const countryGeo = COUNTRIES.find(c => c.name.toLowerCase().includes(countryName.toLowerCase()));
    const continentGeo = CONTINENTS.find(c => c.name.toLowerCase().includes(countryName.toLowerCase()));

    if (continentGeo) {
      setFocusCoords({ lat: continentGeo.lat, lng: continentGeo.lng, distance: 300 });
      const countriesInContinent = COUNTRIES.filter(c => c.continent === continentGeo.name).map(c => c.name.toLowerCase());
      const localWords = globeData.filter((d) => d.country && countriesInContinent.includes(d.country.toLowerCase()));
      setSelectedWord(localWords.length > 0
        ? { word: localWords[0].text, country: continentGeo.name, color: localWords[0].color }
        : { word: t('noWordYet'), country: continentGeo.name });
      return;
    }

    if (countryGeo) {
      setFocusCoords({ lat: countryGeo.lat, lng: countryGeo.lng, distance: 180 });
      const localWords = globeData.filter((d) => d.country && d.country.toLowerCase() === countryName.toLowerCase());
      setSelectedWord(localWords.length > 0
        ? { word: localWords[0].text, country: localWords[0].country, color: localWords[0].color }
        : { word: t('noWordYet'), country: countryGeo.name });
      return;
    }

    const foundWord = globeData.find((d) => d.country && d.country.toLowerCase().includes(countryName.toLowerCase()));
    if (foundWord) {
      setFocusCoords({ lat: foundWord.lat, lng: foundWord.lng });
      setSelectedWord({ word: foundWord.text, country: foundWord.country, color: foundWord.color });
    } else {
      setToast(`${t('zoneNotFound')} : ${countryName}`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleWordClick = (word: string, country: string, lat?: number, lng?: number) => {
    const foundWord = globeData.find((d) => d.country === country && d.text === word);
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

      {/* Tendance du jour */}
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

      <SubmissionForm
        onSubmit={handleSubmission}
        user={user}
        profile={profile}
        onLoginGoogle={handleLoginGoogle}
        onLoginMagicLink={handleLoginMagicLink}
        onLogout={handleLogout}
        onPlayRequest={() => setShowGame(true)}
      />

      <SidebarStats
        globeData={globeData}
        topWords={topWords}
        wordDistributions={wordDistributions}
        countryTrends={countryTrends}
        onSearchCountry={handleSearchCountry}
        user={user}
        profile={profile}
        onLoginGoogle={handleLoginGoogle}
        onLoginMagicLink={handleLoginMagicLink}
        onLogout={handleLogout}
        onPlayGame={() => setShowGame(true)}
        onViewLeaderboard={() => setShowLeaderboard(true)}
      />

      {user && isProfileLoaded && !profile && (
        <UsernamePrompt onProfileCreated={(p) => setProfile(p)} />
      )}

      {showGame && (
        <DailyGame 
          onClose={() => setShowGame(false)} 
          onGameComplete={() => setShowLeaderboard(true)} 
        />
      )}

      {showLeaderboard && (
        <Leaderboard 
          onClose={() => setShowLeaderboard(false)} 
          currentUsername={profile?.username} 
        />
      )}

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

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-white/80 text-sm shadow-2xl pointer-events-none">
          {toast}
        </div>
      )}
    </main>
  );
}
