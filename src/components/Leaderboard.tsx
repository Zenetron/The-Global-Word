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

  const handleShare = (platform: 'x' | 'reddit' | 'insta') => {
    const myRank = leaderboard.find(e => e.username === currentUsername)?.rank;
    const text = myRank 
      ? `Je suis Top ${myRank} mondial au défi The Global Word ! 🌍🏆 Viens battre mon score !`
      : `Rejoins le classement mondial du défi The Global Word ! 🌍🏆`;
    const url = window.location.href;
    
    if (platform === 'x') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'reddit') {
      window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'insta') {
      // Pas de lien direct pour insta web, on copie dans le presse-papier
      navigator.clipboard.writeText(text + " " + url);
      alert('Texte copié ! Ouvre Instagram pour partager ton score 📸');
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
        
        <div className="mt-4 shrink-0 flex flex-col gap-2">
          <span className="text-xs text-white/50 text-center uppercase tracking-widest font-bold mb-1">Partager sur</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleShare('x')}
              className="flex-1 py-3 rounded-xl bg-black hover:bg-zinc-900 border border-white/20 text-white font-bold transition-all cursor-pointer flex items-center justify-center"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
            <button
              onClick={() => handleShare('reddit')}
              className="flex-1 py-3 rounded-xl bg-[#FF4500] hover:bg-[#FF4500]/80 text-white font-bold transition-all cursor-pointer flex items-center justify-center"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.561-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
            </button>
            <button
              onClick={() => handleShare('insta')}
              className="flex-1 py-3 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white font-bold transition-all cursor-pointer flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
