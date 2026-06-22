import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Lock, Mail, KeyRound, X, AlertTriangle } from 'lucide-react';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoggingIn(true);
    
    // Simulate a minor API delay for authentic feel
    setTimeout(() => {
      // Strictly match required credentials
      if (email.trim() === 'unitedagros@gmail.com' && password === 'Sukaniha75@') {
        onLoginSuccess();
        // Clear forms
        setEmail('');
        setPassword('');
        onClose();
      } else {
        setError(t.accessDenied);
      }
      setIsLoggingIn(false);
    }, 800);
  };

  return (
    <div id="admin-login-overlay" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn">
      <div id="admin-login-card" className="relative w-full max-w-sm bg-[#061124] border border-emerald-500/25 rounded-2xl shadow-2xl overflow-hidden text-white animate-scaleUp">
        
        {/* Header decoration */}
        <div className="flex items-center justify-between p-4 bg-[#030914]/95 border-b border-emerald-500/15">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h2 id="admin-login-title" className="text-sm md:text-base font-bold text-white tracking-wide uppercase">
              {t.adminTitle}
            </h2>
          </div>
          <button
            id="btn-close-admin-login"
            onClick={onClose}
            className="p-1 rounded-full bg-slate-950 hover:bg-slate-900 text-emerald-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Input Form */}
        <form id="admin-login-form" onSubmit={handleLoginSubmit} className="p-5 md:p-6 space-y-4 text-left">
          
          <div className="text-center pb-2">
            <div className="inline-flex p-3 bg-emerald-950/30 rounded-full border border-emerald-500/20 mb-2">
              <Lock className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Authorized access only. Enter administrative credentials to manage survey responses and perform exports.
            </p>
          </div>

          {/* Email input */}
          <div>
            <label htmlFor="admin-email-input" className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5 font-sans">
              {t.adminEmail}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500/60">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="admin-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="pl-9 w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label htmlFor="admin-password-input" className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5 font-sans">
              {t.adminPassword}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500/60">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                id="admin-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="pl-9 w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Error messages */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-950/45 border border-red-500/25 rounded-lg text-red-100 text-xs animate-shake">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submission Button */}
          <button
            id="btn-admin-submit"
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:bg-slate-900/40 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg border border-emerald-400/20 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
          >
            {isLoggingIn ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : null}
            <span>{t.adminLoginBtn}</span>
          </button>

        </form>

      </div>
    </div>
  );
};
