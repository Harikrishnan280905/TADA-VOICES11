import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface Slide {
  url: string;
  enLabel: string;
  taLabel: string;
}

const SLIDES: Slide[] = [
  {
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=1200',
    enLabel: 'Lush Rice Fields of Tamil Nadu',
    taLabel: 'விளைச்சல் தரும் நெல் வயல்கள் '
  },
  {
    url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=1200',
    enLabel: 'Sweet Sugarcane Farming',
    taLabel: 'செழித்து வளரும் கரும்பு விவசாயம்'
  },
  {
    url: 'https://images.unsplash.com/photo-1563861826100-9cb868fdcd1d?auto=format&fit=crop&q=80&w=1200',
    enLabel: 'Bountiful Banana Plantations',
    taLabel: 'அடிவாழை தேட்டங்களின் பசுமை'
  },
  {
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1200',
    enLabel: 'Resilient and Dedicated Farmers',
    taLabel: 'உழைப்பின் சின்னமாம் நமது விவசாயிகள்'
  },
  {
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200',
    enLabel: 'Sustainable Agriculture Practices',
    taLabel: 'இயற்கை சார்ந்த நிலையான விவசாயம்'
  },
  {
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
    enLabel: 'Scenic Green Fields',
    taLabel: 'கண் கவர் பசுமை வயல் வெளிகள்'
  },
  {
    url: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=1200',
    enLabel: 'Rural Tamil Nadu Agriculture Horizon',
    taLabel: 'தமிழ்நாட்டு வேளாண்மைப் பாரம்பரியம்'
  }
];

export const Slideshow: React.FC = () => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div id="slideshow-container" className="relative w-full h-[250px] md:h-[450px] overflow-hidden rounded-2xl border border-emerald-500/15 shadow-2xl bg-emerald-950/40">
      {SLIDES.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            id={`slide-item-${index}`}
            key={slide.url}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Dark tint Overlay for high contrast text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 z-10" />
            
            <img
              src={slide.url}
              alt={language === 'en' ? slide.enLabel : slide.taLabel}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transform scale-105 hover:scale-100 transition-transform duration-[5s]"
            />

            {/* Overlay Info Header */}
            <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 z-20 flex flex-col justify-end text-left pointer-events-none">
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-950/70 border border-emerald-500/20 px-2.5 py-1 rounded w-fit mb-2">
                {language === 'en' ? 'TADA Slideshow' : 'டாடா விவசாயக் காட்சி'}
              </span>
              <h4 className="text-sm md:text-2xl font-bold text-white drop-shadow-md">
                {language === 'en' ? slide.enLabel : slide.taLabel}
              </h4>
            </div>
          </div>
        );
      })}

      {/* Manual Indicators */}
      <div className="absolute bottom-3 right-4 z-20 flex gap-1.5 bg-black/40 px-2 py-1 rounded-full border border-white/5">
        {SLIDES.map((_, index) => (
          <button
            id={`slide-dot-${index}`}
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentIndex ? 'bg-emerald-400 w-4' : 'bg-white/40 hover:bg-white/70'
            }`}
            title={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
