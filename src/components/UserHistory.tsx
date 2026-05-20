'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Vote {
  word: string;
  country: string;
  city: string;
  created_at: string;
}

interface UserHistoryProps {
  user: any;
}

export default function UserHistory({ user }: UserHistoryProps) {
  const [open, setOpen] = useState(false);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fermer en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Charger l'historique quand on ouvre le panneau
  useEffect(() => {
    if (!open || !user || !supabase) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data: session } = await supabase!.auth.getSession();
        const token = session?.session?.access_token;
        if (!token) return;

        const res = await fetch('/api/user/votes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setVotes(data.votes || []);
      } catch (e) {
        console.error('Erreur chargement historique:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [open, user]);

  if (!user) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-72 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-white/60 font-semibold">Mes mots</span>
              <span className="text-[10px] text-white/30">{votes.length} vote{votes.length > 1 ? 's' : ''}</span>
            </div>

            {/* Liste */}
            <div className="max-h-80 overflow-y-auto scrollbar-none">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
                </div>
              ) : votes.length === 0 ? (
                <div className="py-10 text-center text-white/30 text-sm">
                  Aucun mot pour l&apos;instant
                </div>
              ) : (
                <ul>
                  {votes.map((v, i) => (
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

      {/* Bouton flottant */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-white/30 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-lg cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Mes mots
      </motion.button>
    </div>
  );
}
