'use client';

import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Share2, X } from 'lucide-react';

interface CountryCardProps {
  word: string;
  country: string;
  onClose: () => void;
  color?: string;
}

export default function CountryCard({ word, country, onClose, color = '#00ffff' }: CountryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `theglobalword-${country.toLowerCase().replace(/\s+/g, '-')}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `The Global Word - ${country}`,
          text: `Le mot du jour (${country}) est : "${word}". Quel est le vôtre ?`,
          url: 'https://theglobalword.org',
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.download = `theglobalword-${country.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getWordSizeClass = (w: string) => {
    if (w.length > 16) return "text-3xl sm:text-4xl";
    if (w.length > 10) return "text-4xl sm:text-5xl";
    if (w.length > 6) return "text-5xl sm:text-6xl";
    return "text-6xl sm:text-7xl";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="relative max-w-sm w-full">
        {/* The Card to be captured */}
        <div 
          ref={cardRef} 
          className="relative bg-[#050505] rounded-[2rem] overflow-hidden shadow-2xl p-8 aspect-[4/5] flex flex-col justify-between border border-white/10"
          style={{
            background: `radial-gradient(120% 120% at top right, ${color}44 0%, #050505 60%)`
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-white/50 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Aujourd'hui</p>
              <h2 className="text-2xl font-black text-white tracking-tight leading-none">{country}</h2>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-sm">
              <span className="text-sm">📍</span>
            </div>
          </div>

          {/* Center Word */}
          <div className="flex-1 flex items-center justify-center z-10 py-4 w-full">
            <h1 
              className={`${getWordSizeClass(word)} font-black text-center uppercase tracking-tighter break-words w-full leading-tight`}
              style={{
                color: '#fff',
                textShadow: `0 0 60px ${color}, 0 0 20px ${color}`
              }}
            >
              {word}
            </h1>
          </div>

          {/* Footer Branding */}
          <div className="flex items-end justify-between border-t border-white/10 pt-6 z-10">
            <div>
              <p className="text-white font-bold text-sm tracking-wide">The Global Word</p>
              <p className="text-white/40 text-xs font-mono mt-1">theglobalword.org</p>
            </div>
            <div className="w-10 h-10 bg-black rounded-xl border border-white/10 p-1.5 shadow-lg">
              <img src="/icon.png" alt="Logo" className="w-full h-full object-contain opacity-90" />
            </div>
          </div>
          
          {/* Decorative background blur element */}
          <div 
            className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* Floating Controls (not captured in image) */}
        <div className="absolute -right-3 -top-3 flex flex-col gap-2 z-20">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-xl"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <button 
            onClick={handleShare}
            disabled={isGenerating}
            className="flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-black uppercase tracking-wider text-sm hover:scale-105 transition-transform disabled:opacity-50"
            style={{
              boxShadow: `0 0 30px ${color}55`
            }}
          >
            {isGenerating ? (
              <span className="animate-pulse">Création...</span>
            ) : (
              <>
                <Share2 size={18} />
                Partager cette carte
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
