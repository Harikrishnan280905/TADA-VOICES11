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
      className="flex flex-col items-start p-5 px-6 md:p-6 md:px-8 rounded-2xl bg-gradient-to-br from-blue-955/60 to-indigo-955/35 border border-blue-500/30 shadow-2xl max-w-sm w-full my-4 text-left relative overflow-hidden backdrop-blur-md group hover:border-blue-400/50 transition-colors duration-300"
    >
      {/* Visual Ambient glow inside card */}
      <div className="absolute -right-16 -top-16 w-36 h-36 bg-blue-500/15 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors duration-300"></div>

      <div className="flex items-center gap-2 mb-1.5 z-10">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </div>
        <p className="text-xs uppercase tracking-widest text-blue-400 font-extrabold font-mono flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 animate-pulse text-blue-400" />
          {t.peopleSharedTitle}
        </p>
      </div>

      <div className="flex items-center gap-4 z-10 w-full mt-1.5">
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
          <Users className="w-6 h-6 text-blue-455" />
        </div>
        
        {/* Animated digit counter */}
        <div className="flex items-baseline overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.span 
              key={liveCount}
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1, scale: shouldPulse ? 1.08 : 1 }}
              exit={{ y: -25, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 20
              }}
              id="response-count-number" 
              className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-widest font-mono drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]"
            >
              {liveCount.toLocaleString()}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
