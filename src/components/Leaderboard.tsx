'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Loader2, Medal, Share2 } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  time: number;
}

export default function Leaderboard({ onClose, currentUsername }: { onClose: () => void, currentUsername?: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/game/leaderboard')
      .then(r => r.json())
      .then(data => {
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      })
      .catch(e => console.error('Erreur chargement classement', e))
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(1) + 's';
  };

  const handleShare = () => {
    const myRank = leaderboard.find(e => e.username === currentUsername)?.rank;
    const text = myRank 
      ? `Je suis Top ${myRank} mondial au défi The Global Word ! 🌍🏆 Viens battre mon score !`
      : `Rejoins le classement mondial du défi The Global Word ! 🌍🏆`;
    
    if (navigator.share) {
      navigator.share({ title: 'The Global Word Leaderboard', text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text + " " + window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col h-[80vh] max-h-[600px]"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-8 shrink-0">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-4 text-yellow-500">
            <Trophy size={32} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest text-center">
            Classement<br/>Mondial
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 size={32} className="text-neon-cyan animate-spin" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center text-white/50 py-10">
              Aucun score pour le moment.<br/>Sois le premier !
            </div>
          ) : (
            leaderboard.map((entry, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                  entry.username === currentUsername
                    ? 'bg-neon-cyan/10 border-neon-cyan/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 shrink-0">
                  {entry.rank === 1 ? <Medal className="text-yellow-400" size={28} /> :
                   entry.rank === 2 ? <Medal className="text-slate-300" size={24} /> :
                   entry.rank === 3 ? <Medal className="text-amber-600" size={24} /> :
                   <span className="text-white/40 font-bold font-mono">{entry.rank}</span>}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-bold truncate ${entry.username === currentUsername ? 'text-neon-cyan' : 'text-white'}`}>
                    {entry.username}
                  </div>
                  <div className="text-[10px] text-white/40 font-mono">
                    Temps cumulé: {formatTime(entry.time)}
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-neon-emerald">
                    {entry.score}
                  </div>
                  <div className="text-[10px] text-neon-emerald/50 uppercase tracking-wider">
                    pts
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
        
        <div className="mt-4 shrink-0">
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
          >
            <Share2 size={16} /> Partager le classement
          </button>
        </div>
      </motion.div>
    </div>
  );
}
