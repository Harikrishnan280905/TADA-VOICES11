import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations } from '../types';
import { translations } from '../utils/translations';
import { firebaseService } from '../services/firebase';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  liveCount: number;
  incrementLiveCount: () => void;
  refreshLiveCount: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('uatt_pref_lang');
    return (saved === 'ta' || saved === 'en') ? saved : 'en';
  });

  const [liveCount, setLiveCount] = useState<number>(0);

  useEffect(() => {
    // Subscribe to live count updates from Firebase service
    const unsubscribe = firebaseService.subscribeToLiveCount((count) => {
      setLiveCount(count);
    });
    return () => unsubscribe();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('uatt_pref_lang', lang);
  };

  const incrementLiveCount = async () => {
    const current = await firebaseService.getLiveCount();
    setLiveCount(current);
  };

  const refreshLiveCount = async () => {
    const current = await firebaseService.getLiveCount();
    setLiveCount(current);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        liveCount,
        incrementLiveCount,
        refreshLiveCount,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
