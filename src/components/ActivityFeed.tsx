'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ActivityItem {
  id: string;
  word: string;
  country: string;
  timestamp: number;
}

interface ActivityFeedProps {
  recentVotes: any[];
}

export default function ActivityFeed({ recentVotes }: ActivityFeedProps) {
  // On prend simplement les 3 derniers votes réels
  const activities = recentVotes.slice(0, 3);

  return (
    <div className="fixed bottom-8 left-8 z-20 flex flex-col gap-2 max-w-[250px] pointer-events-none hidden md:flex">
      <h4 className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2 px-2">
        <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" /> Activité Mondiale
      </h4>
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              layout
              initial={{ opacity: 0, y: -40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3 pointer-events-auto"
            >
              <div className="w-8 h-8 rounded-full bg-neon-cyan/10 flex items-center justify-center shrink-0 border border-neon-cyan/20">
                <MapPin size={14} className="text-neon-cyan" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-white/50 truncate uppercase font-medium tracking-tight">{activity.country}</span>
                <span className="text-white text-sm font-bold truncate leading-tight">"{activity.text}"</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
