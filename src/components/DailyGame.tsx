'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { X, Trophy, Timer, Globe2, Loader2, Target, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Round {
  word: string;
  correctCountry: string;
  options: string[];
}

export default function DailyGame({ onClose, onGameComplete }: { onClose: () => void, onGameComplete: () => void }) {
  const [rounds, setRings] = useState<Round[]>([]);
  const [gameState, setGameState] = useState<'loading' | 'start' | 'playing' | 'round_result' | 'game_over' | 'already_played'>('loading');
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10000); // 10 secondes en ms
  const [totalScore, setTotalScore] = useState(0);
  const [totalTimeMs, setTotalTimeMs] = useState(0);
  const [roundResult, setRoundResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    const initGame = async () => {
      try {
        const { data: { session } } = await supabase!.auth.getSession();
        const headers: Record<string, string> = {};
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;

        const r = await fetch('/api/game/daily', { headers });
        const data = await r.json();

        if (data.error === 'already_played') {
          setGameState('already_played');
          return;
        }

        if (data.rounds) {
          setRings(data.rounds);
          setGameState('start');
        } else {
          console.error(data.error);
          onClose();
        }
      } catch (e) {
        console.error('Erreur chargement jeu', e);
        onClose();
      }
    };
    initGame();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            handleTimeOut();
            return 0;
          }
          return prev - 100;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleTimeOut = () => {
    setGameState('round_result');
    setRoundResult('timeout');
    setSelectedOption(null);
    setTotalTimeMs(prev => prev + 10000);
    setTimeout(nextRound, 2500);
  };

  const handleOptionClick = (option: string) => {
    if (gameState !== 'playing') return;
    
    setGameState('round_result');
    setSelectedOption(option);
    
    const currentRound = rounds[currentRoundIndex];
    const timeSpent = 10000 - timeLeft;
    setTotalTimeMs(prev => prev + timeSpent);

    if (option === currentRound.correctCountry) {
      setRoundResult('correct');
      // Score max = 1000, minimum = 100 si trouvé à la dernière seconde
      const roundScore = Math.max(100, Math.floor((timeLeft / 10000) * 1000));
      setTotalScore(prev => prev + roundScore);
    } else {
      setRoundResult('wrong');
    }

    setTimeout(nextRound, 2500);
  };

  const nextRound = () => {
    if (currentRoundIndex < 2) {
      setCurrentRoundIndex(prev => prev + 1);
      setTimeLeft(10000);
      setRoundResult(null);
      setSelectedOption(null);
      setGameState('playing');
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    setGameState('game_over');
    setSaving(true);
    
    if (totalScore > 1000) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    try {
      const { data: { session } } = await supabase!.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        await fetch('/api/game/score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            score: totalScore,
            timeMs: totalTimeMs
          })
        });
      } else {
        setIsLoggedIn(false);
        // Sauvegarder localement pour l'envoyer après connexion
        localStorage.setItem('pending_game_score', JSON.stringify({
          score: totalScore,
          timeMs: totalTimeMs,
          date: new Date().toISOString().split('T')[0]
        }));
      }
    } catch (e) {
      console.error('Erreur sauvegarde score', e);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    const text = `J'ai marqué ${totalScore} pts au Défi du Jour sur The Global Word ! 🌍 Joue toi aussi !`;
    if (navigator.share) {
      navigator.share({ title: 'The Global Word', text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text + " " + window.location.href);
      alert('Score copié dans le presse-papiers !');
    }
  };

  const handleRegisterToSave = async () => {
    // Redirection Google Auth pour sauvegarder
    await supabase!.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <AnimatePresence mode="wait">
          {gameState === 'loading' && (
            <motion.div key="loading" exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="text-neon-cyan animate-spin mb-4" />
              <p className="text-white/50 text-sm tracking-widest uppercase">Génération du défi...</p>
            </motion.div>
          )}

          {gameState === 'already_played' && (
            <motion.div key="already_played" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center py-20">
              <Timer size={48} className="text-yellow-500 mb-4" />
              <h2 className="text-2xl font-black text-white mb-2">Reviens demain !</h2>
              <p className="text-white/60 mb-6">Tu as déjà joué au défi aujourd'hui (selon l'heure de ton pays).</p>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all uppercase tracking-widest text-sm font-bold"
              >
                Fermer
              </button>
            </motion.div>
          )}

          {gameState === 'start' && (
            <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center pt-8 pb-4">
              <div className="w-20 h-20 rounded-full bg-neon-violet/10 border border-neon-violet/30 flex items-center justify-center mb-6 text-neon-violet">
                <Globe2 size={40} />
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Le Défi du Jour</h2>
              <p className="text-white/70 mb-8 max-w-sm leading-relaxed">
                3 mots votés hier dans le monde.<br/>10 secondes par mot pour trouver le bon pays.<br/>
                <span className="text-neon-cyan font-semibold block mt-2">Plus tu es rapide, plus tu marques !</span>
              </p>
              <button
                onClick={() => setGameState('playing')}
                className="px-10 py-4 rounded-full bg-neon-cyan hover:bg-neon-cyan/90 text-black font-black text-lg uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,255,255,0.4)]"
              >
                C'est parti !
              </button>
            </motion.div>
          )}

          {(gameState === 'playing' || gameState === 'round_result') && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col w-full">
              {/* Header Jeu */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-white/50 font-mono">
                  <Target size={16} className="text-neon-violet" />
                  <span>Manche {currentRoundIndex + 1}/3</span>
                </div>
                <div className="flex items-center gap-2 text-white font-mono text-lg">
                  <Trophy size={18} className="text-neon-emerald" />
                  <span className="text-neon-emerald font-bold">{totalScore} pts</span>
                </div>
              </div>

              {/* Mot à deviner */}
              <div className="flex flex-col items-center mb-10">
                <span className="text-xs text-white/40 uppercase tracking-[0.2em] mb-4">D'où vient ce mot ?</span>
                <h3 className="text-5xl md:text-6xl font-black text-white tracking-wider text-center" style={{ textShadow: '0 0 30px rgba(255,255,255,0.2)' }}>
                  {rounds[currentRoundIndex].word}
                </h3>
              </div>

              {/* Timer Bar */}
              <div className="w-full h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden relative">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-cyan to-neon-emerald"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 10000) * 100}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>

              {/* Feedback Résultat */}
              <AnimatePresence>
                {gameState === 'round_result' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 w-full"
                  >
                    {roundResult === 'correct' && (
                      <div className="bg-green-500/20 backdrop-blur-xl border border-green-500/50 rounded-2xl p-6 flex flex-col items-center shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                        <CheckCircle2 size={48} className="text-green-400 mb-2" />
                        <span className="text-2xl font-black text-white">+ {Math.max(100, Math.floor((timeLeft / 10000) * 1000))}</span>
                      </div>
                    )}
                    {roundResult === 'wrong' && (
                      <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/50 rounded-2xl p-6 flex flex-col items-center">
                        <XCircle size={48} className="text-red-400 mb-2" />
                        <span className="text-xl font-bold text-white text-center">Aïe ! C'était<br/><span className="text-red-400">{rounds[currentRoundIndex].correctCountry}</span></span>
                      </div>
                    )}
                    {roundResult === 'timeout' && (
                      <div className="bg-orange-500/20 backdrop-blur-xl border border-orange-500/50 rounded-2xl p-6 flex flex-col items-center">
                        <Timer size={48} className="text-orange-400 mb-2" />
                        <span className="text-xl font-bold text-white text-center">Trop lent ! C'était<br/><span className="text-orange-400">{rounds[currentRoundIndex].correctCountry}</span></span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Boutons Choix */}
              <div className={`grid grid-cols-1 gap-3 ${gameState === 'round_result' ? 'opacity-30 pointer-events-none blur-sm' : ''} transition-all duration-300`}>
                {rounds[currentRoundIndex].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(option)}
                    className={`py-4 px-6 rounded-xl border font-bold text-lg transition-all ${
                      selectedOption === option
                        ? 'bg-white/20 border-white text-white'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/30 text-white/80 hover:text-white'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'game_over' && (
            <motion.div key="game_over" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center pt-8 pb-4">
              <Trophy size={64} className="text-neon-emerald mb-6" style={{ filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.5))' }} />
              <h2 className="text-2xl text-white/70 mb-2 uppercase tracking-widest font-mono">Score Final</h2>
              <div className="text-6xl font-black text-white mb-8 tracking-tighter">
                {totalScore} <span className="text-2xl text-neon-emerald">pts</span>
              </div>
              
              <div className="flex flex-col gap-3 w-full">
                {!isLoggedIn && (
                  <button
                    onClick={handleRegisterToSave}
                    className="w-full py-4 rounded-xl bg-neon-cyan hover:bg-neon-cyan/90 text-black font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)]"
                  >
                    S'enregistrer pour sauvegarder
                  </button>
                )}
                
                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleShare}
                    className="flex-1 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest transition-colors"
                  >
                    Partager
                  </button>
                  <button
                    onClick={() => { onClose(); onGameComplete(); }}
                    className="flex-1 py-4 rounded-xl bg-white hover:bg-white/90 text-black font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 size={20} className="animate-spin" /> : 'Classement'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
