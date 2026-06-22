import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Users, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Counter: React.FC = () => {
  const { t, liveCount } = useLanguage();
  const [prevCount, setPrevCount] = useState(liveCount);
  const [shouldPulse, setShouldPulse] = useState(false);

  useEffect(() => {
    if (liveCount !== prevCount) {
      setShouldPulse(true);
      const timer = setTimeout(() => setShouldPulse(false), 800);
      setPrevCount(liveCount);
      return () => clearTimeout(timer);
    }
  }, [liveCount, prevCount]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      id="live-counter-card" 
      className="flex flex-col items-start p-2.5 px-3.5 md:p-3 md:px-4 rounded-xl bg-gradient-to-br from-blue-955/45 to-indigo-955/20 border border-blue-500/20 shadow-2xl max-w-xs w-full my-2 text-left relative overflow-hidden backdrop-blur-md group hover:border-blue-400/40 transition-colors duration-300"
    >
      {/* Visual Ambient glow inside card */}
      <div className="absolute -right-16 -top-16 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/15 transition-colors duration-300"></div>

      <div className="flex items-center gap-1.5 mb-1 z-10">
        <div className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
        </div>
        <p className="text-[9px] uppercase tracking-widest text-blue-400 font-extrabold font-mono flex items-center gap-1">
          <Radio className="w-3 h-3 animate-pulse text-blue-400" />
          {t.peopleSharedTitle}
        </p>
      </div>

      <div className="flex items-center gap-2.5 z-10 w-full mt-1">
        <div className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 shadow-inner">
          <Users className="w-4 h-4 text-blue-450" />
        </div>
        
        {/* Animated digit counter */}
        <div className="flex items-baseline overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.span 
              key={liveCount}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1, scale: shouldPulse ? 1.08 : 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 20
              }}
              id="response-count-number" 
              className="text-2xl md:text-3xl font-black text-white tracking-widest font-mono drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]"
            >
              {liveCount.toLocaleString()}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
