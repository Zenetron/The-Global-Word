'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { User, AlertCircle, Loader2 } from 'lucide-react';

export default function UsernamePrompt({ onProfileCreated }: { onProfileCreated: (profile: any) => void }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      setError('Ton pseudo doit faire au moins 3 caractères.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase!.auth.getSession();
      if (!session) throw new Error('Non connecté');

      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ username: username.trim() })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur inconnue');
      }

      onProfileCreated({ username: username.trim() });
    } catch (err: any) {
      setError(err.message || 'Impossible de sauvegarder le pseudo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-emerald"></div>
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-neon-cyan">
            <User size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Choisis ton pseudo</h2>
          <p className="text-sm text-white/60 leading-relaxed">
            Pour apparaître dans le classement mondial et garder ton anonymat, choisis un pseudo unique. Tu ne pourras plus le changer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              required
              maxLength={30}
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="Ton pseudo..."
              className="w-full bg-black/50 border border-white/10 focus:border-neon-cyan rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors text-center font-bold tracking-wide"
              autoFocus
            />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 text-red-400 text-xs bg-red-400/10 py-2 rounded-lg">
              <AlertCircle size={14} />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || username.trim().length < 3}
            className="w-full py-3 rounded-xl bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/40 text-neon-cyan font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Valider'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
