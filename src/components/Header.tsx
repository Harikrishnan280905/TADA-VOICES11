import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { Lock, LogOut } from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  onAdminClick: () => void;
  onLogoutClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isAdmin, onAdminClick, onLogoutClick }) => {
  const { t } = useLanguage();

  return (
    <header id="app-header" className="relative z-50 bg-[#051124]/95 border-b border-blue-900/40 shadow-lg px-2.5 py-2 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
        
        {/* Left Side: High-fidelity Agricultural Logo & Website Title */}
        <div className="flex items-center gap-1.5 md:gap-3 min-w-0">
          <div id="header-logo-container" className="flex-shrink-0">
            {/* Custom vector representation of the agricultural rising sun & laurel wheat logo */}
            <svg className="w-9 h-9 md:w-11 md:h-11 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Sun in the background */}
              <circle cx="50" cy="48" r="14" fill="#f97316" />
              
              {/* Symmetrical Sun Rays */}
              <path d="M50 24 L50 30" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
              <path d="M33 31 L37.5 35" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
              <path d="M67 31 L62.5 35" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 45 L28 46.5" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
              <path d="M78 45 L72 46.5" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
              <path d="M26 60 L31.5 57" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
              <path d="M74 60 L68.5 57" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />

              {/* Central landscape / curved crop fields & soil contours */}
              <path d="M24 48 C36 43, 64 43, 76 48 C76 48, 73 78, 50 80 C27 78, 24 48, 24 48 Z" fill="#2d3714" stroke="#ffffff" strokeWidth="1" />
              <path d="M24 48 C36 43, 48 55, 50 80" stroke="#ffffff" strokeWidth="1.2" fill="none" />
              <path d="M76 48 C64 43, 52 55, 50 80" stroke="#ffffff" strokeWidth="1.2" fill="none" />
              {/* Color accents for field stripes */}
              <path d="M24.5 48.5 C34 44.5, 41 52, 43 65 C34 65, 27 58, 24.5 48.5 Z" fill="#4d7c0f" opacity="0.8" />
              <path d="M75.5 48.5 C66 44.5, 59 52, 57 65 C66 65, 73 58, 75.5 48.5 Z" fill="#4d7c0f" opacity="0.8" />
              <path d="M43 65 C45 72, 48 78, 50 80 C48 78, 45 74, 43 65 Z" fill="#eab308" opacity="0.9" />
              <path d="M57 65 C55 72, 52 78, 50 80 C52 78, 55 74, 57 65 Z" fill="#eab308" opacity="0.9" />

              {/* Symmetrical Left Leaf Branch Wreath curling up */}
              <path d="M12 55 C12 35, 25 18, 40 12" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 1" opacity="0" />
              <path d="M42 12 C35 15, 30 22, 26 28 C22 34, 18 43, 16 52 C14 62, 17 73, 26 80 C29 82, 34 85, 38 88" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
              {/* Left Leaves */}
              <path d="M38 88 Q31 82 23 80 C23 80 27 86 38 88 Z" fill="#22c55e" />
              <path d="M26 80 Q18 73 14 66 C14 66 18 74 26 80 Z" fill="#22c55e" />
              <path d="M18 68 Q10 59 10 50 C10 50 14 59 18 68 Z" fill="#22c55e" />
              <path d="M14 54 Q10 43 14 34 C14 34 16 43 14 54 Z" fill="#22c55e" />
              <path d="M16 40 Q16 29 23 20 C23 20 22 30 16 40 Z" fill="#22c55e" />
              <path d="M22 26 Q27 18 36 12 C36 12 32 20 22 26 Z" fill="#22c55e" />

              {/* Symmetrical Right Leaf Branch Wreath curling up */}
              <path d="M58 12 C65 15, 70 22, 74 28 C78 34, 82 43, 84 52 C86 62, 83 73, 74 80 C71 82, 66 85, 62 88" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
              {/* Right Leaves */}
              <path d="M62 88 Q69 82 77 80 C77 80 73 86 62 88 Z" fill="#22c55e" />
              <path d="M74 80 Q82 73 86 66 C86 66 82 74 74 80 Z" fill="#22c55e" />
              <path d="M82 68 Q90 59 90 50 C90 50 86 59 82 68 Z" fill="#22c55e" />
              <path d="M86 54 Q90 43 86 34 C86 34 84 43 86 54 Z" fill="#22c55e" />
              <path d="M84 40 Q84 29 77 20 C77 20 78 30 84 40 Z" fill="#22c55e" />
              <path d="M78 26 Q73 18 64 12 C64 12 68 20 78 26 Z" fill="#22c55e" />
            </svg>
          </div>
          <div className="flex flex-col text-left min-w-0">
            <h1 id="header-app-title" className="text-sm md:text-xl font-black text-white tracking-tight leading-none">
              {t.title}
            </h1>
            <p className="text-[9px] md:text-[11px] text-blue-300 font-bold tracking-wide mt-0.5 leading-tight uppercase xs:whitespace-nowrap whitespace-normal">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Language Switcher and Admin Panel access (compact and responsive) */}
        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
          <LanguageToggle />
          
          {isAdmin ? (
            <button
              id="btn-admin-logout"
              onClick={onLogoutClick}
              className="flex items-center gap-1.5 px-2 py-1.5 md:px-3 md:py-2 text-[10px] md:text-xs font-bold bg-red-950/30 hover:bg-red-800/40 border border-red-500/30 text-red-200 rounded-lg transition-all duration-200 cursor-pointer shadow-md shrink-0"
              title={t.logout}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          ) : (
            <button
              id="btn-admin-login-trigger"
              onClick={onAdminClick}
              className="flex items-center gap-1.5 px-2 py-1.5 md:px-3 md:py-2 text-[10px] md:text-xs font-bold bg-blue-600 hover:bg-blue-500 border border-blue-400/25 text-white rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md shrink-0"
              title={t.adminLogin}
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.adminLogin}</span>
              {/* Show compact label on mobile so it never overlaps on tiny screens like 320px */}
              <span className="inline sm:hidden text-[9px] font-black">Admin</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
