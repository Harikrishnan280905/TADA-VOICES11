import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Counter } from './Counter';
import { MessageSquarePlus, Award, ShieldAlert, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onShareThoughtsClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShareThoughtsClick }) => {
  const { t } = useLanguage();

  return (
    <section id="hero-section" className="py-2.5 md:py-6 px-4 md:px-8 max-w-4xl mx-auto space-y-8 flex flex-col items-start text-left">
      
      {/* 1. Introduction Heading and Paragraph kept as a simple paragraph with no surrounding boxes */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        id="intro-paragraph-container" 
        className="w-full text-left space-y-2.5"
      >
        <h2 className="text-xl md:text-3xl font-black text-yellow-400 tracking-tight select-none uppercase drop-shadow-[0_0_12px_rgba(250,204,21,0.15)]">
          {t.introRights}
        </h2>
        <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-semibold">
          {t.introDescription} {t.introGovtInfo}
        </p>
      </motion.div>

      {/* 2. Live response counter directly below paragraph */}
      <div className="w-full">
        <Counter />
      </div>

      {/* 3. Medium sized animated flashy yellow button at the bottom */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-start justify-start w-full pt-2"
      >
        <motion.button
          id="btn-share-thoughts"
          onClick={onShareThoughtsClick}
          whileHover={{ 
            scale: 1.04,
            boxShadow: "0 0 35px rgba(250, 204, 21, 0.75), inset 0 2px 0 rgba(255,255,255,0.7)",
          }}
          whileTap={{ 
            scale: 0.96,
            boxShadow: "0 0 15px rgba(250, 204, 21, 0.4)",
          }}
          transition={{ type: "spring", stiffness: 450, damping: 15 }}
          className="group relative flex items-center gap-2.5 px-6 py-3.5 md:px-10 md:py-4.5 bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 hover:from-yellow-250 hover:to-yellow-450 text-slate-950 font-black text-xs md:text-base uppercase tracking-wider rounded-full transition-all duration-200 shadow-[0_8px_25px_-4px_rgba(250,204,21,0.55),inset_0_1.5px_0_rgba(255,255,255,0.6)] cursor-pointer select-none overflow-hidden border border-yellow-500/20"
        >
          {/* Intense shiny sweeping motion effect */}
          <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shine_1.2s_ease-in-out_infinite]" />
          
          <MessageSquarePlus className="w-5 h-5 md:w-6 md:h-6 stroke-[3px] text-slate-950" />
          <span>{t.clickToShare}</span>
          <ArrowRight className="w-4 h-4 md:w-5 md:h-5 stroke-[3px] text-slate-950 group-hover:translate-x-1.5 transition-transform" />
        </motion.button>
      </motion.div>

    </section>
  );
};
