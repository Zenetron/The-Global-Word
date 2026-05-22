'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
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

const GlobeComponentDynamic = dynamic(() => import('@/components/GlobeComponent'), { ssr: false });

// ─── Header d'authentification persistant ────────────────────────────────────
function UserHeader({ user, onLoginGoogle, onLogout }: { user: any; onLoginGoogle: () => void; onLogout: () => void }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setHistoryOpen(false);
      }
    };
    if (historyOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [historyOpen]);

  useEffect(() => {
    if (!historyOpen || !user || !supabase) return;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data: session } = await supabase!.auth.getSession();
        const token = session?.session?.access_token;
        if (!token) return;
        const res = await fetch('/api/user/votes', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setVotes(data.votes || []);
      } catch (e) {
        console.error('Erreur chargement historique:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [historyOpen, user]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  const username = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || '';

  return (
    <div ref={panelRef} className="fixed top-5 right-6 z-[60] flex items-center gap-2 pointer-events-auto">
      {user ? (
        <>
          {/* Bouton "Mes mots" */}
          <button
            onClick={() => setHistoryOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-white/30 text-white text-[11px] font-semibold uppercase tracking-wider transition-all shadow-lg cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Mes mots
          </button>

          {/* Profil + déconnexion */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[11px] backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="max-w-[120px] truncate">{username}</span>
            <button onClick={onLogout} className="text-white/30 hover:text-white/80 transition-colors cursor-pointer ml-1 text-[10px] uppercase tracking-wider">
              ✕
            </button>
          </div>
        </>
      ) : (
        /* Bouton de connexion Google */
        <button
          onClick={onLoginGoogle}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-white/90 text-black text-[11px] font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer scale-100 hover:scale-105 active:scale-95 duration-200"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Connexion
        </button>
      )}

      {/* Panneau historique */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute top-12 right-0 w-72 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Mes mots</span>
              <span className="text-[10px] text-white/30">{votes.length} vote{votes.length > 1 ? 's' : ''}</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
                </div>
              ) : votes.length === 0 ? (
                <div className="py-10 text-center text-white/30 text-sm">Aucun mot pour l&apos;instant</div>
              ) : (
                <ul>
                  {votes.map((v: any, i: number) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between px-5 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-white font-semibold text-sm capitalize">{v.word}</span>
                        <span className="text-white/40 text-[10px] mt-0.5">
                          {v.city ? `${v.city}, ` : ''}{v.country}
                        </span>
                      </div>
                      <span className="text-white/30 text-[10px] ml-4 shrink-0">{formatDate(v.created_at)}</span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Home() {
  const { t, locale } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [globeData, setGlobeData] = useState<any[]>([]);
  const [topWords, setTopWords] = useState<any[]>([]);
  const [recentVotes, setRecentVotes] = useState<any[]>([]);
  const [countryTrends, setCountryTrends] = useState<Record<string, any[]>>({});
  const [wordDistributions, setWordDistributions] = useState<Record<string, any>>({});
  const [ringsData, setRingsData] = useState<any[]>([]);
  const [focusCoords, setFocusCoords] = useState<{lat: number, lng: number, distance?: number} | null>(null);
  const [selectedWord, setSelectedWord] = useState<{ word: string, country: string, color?: string } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
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

  const fetchStats = async (bypassCache = false) => {
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
      console.error(t('error'), e);
    }
  };

  useEffect(() => {
    const initTimer = setTimeout(() => { fetchStats(); }, 500);
    const interval = setInterval(fetchStats, 30000);
    return () => { clearTimeout(initTimer); clearInterval(interval); };
  }, [locale]);

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

  const handleSubmission = async (word: string) => {
    try {
      let publicIp = null;
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        if (ipRes.ok) { const ipData = await ipRes.json(); publicIp = ipData.ip; }
      } catch (e) {
        try {
          const ipRes2 = await fetch('https://ipapi.co/json/');
          if (ipRes2.ok) { const ipData2 = await ipRes2.json(); publicIp = ipData2.ip || ipData2.query; }
        } catch (e2) { console.warn('Could not fetch public IP', e2); }
      }

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
        body: JSON.stringify({ word, clientIp: publicIp }),
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
      setSelectedWord(localWords.length > 0
        ? { word: localWords[0].text, country: continentGeo.name, color: localWords[0].color }
        : { word: t('noWordYet'), country: continentGeo.name });
      return;
    }

    if (countryGeo) {
      setFocusCoords({ lat: countryGeo.lat, lng: countryGeo.lng, distance: 180 });
      const localWords = globeData.filter((d: any) => d.country && d.country.toLowerCase() === countryName.toLowerCase());
      setSelectedWord(localWords.length > 0
        ? { word: localWords[0].text, country: localWords[0].country, color: localWords[0].color }
        : { word: t('noWordYet'), country: countryGeo.name });
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
    </main>
  );
}
