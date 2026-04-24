'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

interface SubmissionFormProps {
  onSubmit: (word: string) => Promise<boolean>;
}

export default function SubmissionForm({ onSubmit }: SubmissionFormProps) {
  const { t } = useI18n();
  const [word, setWord] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || word.trim().length > 20) return;
    
    setStatus('loading');
    
    try {
      const success = await onSubmit(word.trim());
      if (success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(t('alreadyVoted'));
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(t('error'));
    }
  };

  if (!visible) return null;

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 flex items-center justify-center pointer-events-auto z-10"
      >
        <div className="bg-glass p-8 rounded-2xl text-center backdrop-blur-md flex flex-col items-center">
          <h2 className="text-3xl font-bold text-neon-emerald mb-2">{t('success')}</h2>
          <p className="text-gray-300 mb-6">{t('wordAdded')}</p>
          <button 
            onClick={() => setVisible(false)}
            className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 text-white transition-all text-sm uppercase tracking-widest"
          >
            {t('close')}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        onSubmit={handleSubmit}
        className="relative pointer-events-auto flex flex-col items-center bg-glass p-6 md:p-8 rounded-2xl shadow-2xl backdrop-blur-md border border-white/10 w-[90%] max-w-md mx-auto"
      >
        <button 
          type="button"
          onClick={() => setVisible(false)}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <label htmlFor="word" className="text-xl md:text-2xl font-light text-white mb-4 md:mb-6 tracking-wider text-center">
          {t('yourWordToday')}
        </label>
        <input
          id="word"
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value.substring(0, 20))}
          placeholder={t('exampleWord')}
          className="bg-transparent border-b-2 border-white/30 text-white text-center text-3xl md:text-4xl font-bold py-2 focus:outline-none focus:border-neon-cyan transition-colors w-full placeholder:text-white/20"
          disabled={status === 'loading'}
          autoFocus
        />
        <div className="mt-2 h-4 text-[10px] md:text-sm text-white/50">
          {word.length}/20 {t('characters')}
        </div>
        
        {status === 'error' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-neon-violet text-center text-sm">
            {errorMessage}
          </motion.div>
        )}
        
        <button
          type="submit"
          disabled={!word.trim() || status === 'loading'}
          className="mt-6 md:mt-8 px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs md:text-sm font-bold"
        >
          {status === 'loading' ? t('loading') : t('submit')}
        </button>
      </motion.form>
    </div>
  );
}
