import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div 
      id="lang-toggle-container"
      className="relative flex items-center bg-slate-900/60 p-0.5 rounded-full border border-blue-500/30 w-[96px] h-7 overflow-hidden shadow-inner cursor-pointer"
      onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
    >
      {/* Animated Sliding pill */}
      <motion.div
        layout
        className="absolute h-[20px] rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md border border-blue-400/20"
        initial={false}
        animate={{
          left: language === 'en' ? '3px' : '49px',
          width: '44px'
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />

      <span className={`z-10 flex-1 text-center text-[9px] font-black tracking-wider select-none transition-colors duration-300 ${language === 'en' ? 'text-white' : 'text-slate-400'}`}>
        ENG
      </span>
      <span className={`z-10 flex-1 text-center text-[9px] font-black tracking-wider select-none transition-colors duration-300 ${language === 'ta' ? 'text-white' : 'text-slate-400'}`}>
        தமிழ்
      </span>
    </div>
  );
};
