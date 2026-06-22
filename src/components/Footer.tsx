import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer id="app-footer" className="bg-[#020813] border-t border-slate-900 text-slate-300 py-10 px-6 mt-auto font-sans">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between gap-8 md:gap-12 items-start text-left">
        
        {/* Left column: Name, status and registration */}
        <div className="space-y-3 max-w-md text-left">
          <div className="flex items-center gap-2 justify-start">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
            <h3 className="font-bold text-white tracking-wide text-sm md:text-base uppercase font-sans">
              {t.footerLine1}
            </h3>
          </div>
          <p className="text-blue-400 font-medium text-xs md:text-sm">
            {t.footerLine2}
          </p>
          <div className="inline-block bg-blue-950/40 border border-blue-500/20 rounded px-2.5 py-1 text-[10px] text-blue-300 font-mono">
            {t.footerReg}
          </div>
        </div>

        {/* Right column: Address, Email & Contacts */}
        <div className="space-y-4 text-xs md:text-sm text-slate-400 max-w-sm text-left">
          <div className="flex items-start gap-3 justify-start">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-left">
              <p>114, First Floor</p>
              <p>5th Cross, EB Colony</p>
              <p>Khajamalai</p>
              <p>Trichy – 620023</p>
            </div>
          </div>
          
          <div className="h-px bg-slate-800"></div>

          <div className="space-y-2 text-left">
            <div className="flex items-center gap-3 justify-start">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <a href="mailto:tada.agri@gmail.com" className="hover:text-blue-300 hover:underline transition-colors">
                tada.agri@gmail.com
              </a>
            </div>
            <div className="flex items-start gap-3 justify-start">
              <Phone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="flex flex-col text-left">
                <a href="tel:7010050013" className="hover:text-blue-300 transition-colors">
                  7010050013
                </a>
                <a href="tel:7598845267" className="hover:text-blue-300 transition-colors">
                  7598845267
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      <div className="max-w-4xl mx-auto mt-8 pt-6 border-t border-slate-900 text-left text-[10px] text-slate-500">
        &copy; {new Date().getFullYear()} {t.footerLine1}. All Rights Reserved.
      </div>
    </footer>
  );
};
