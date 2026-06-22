import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Counter } from './components/Counter';
import { Hero } from './components/Hero';
import { SurveyModal } from './components/SurveyModal';
import { SuccessDialog } from './components/SuccessDialog';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

function AppContent() {
  const { t } = useLanguage();
  
  // App UI modals and controls
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('uatt_admin_session') === 'active';
  });

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('uatt_admin_session', 'active');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('uatt_admin_session');
  };

  return (
    <div id="app-root-container" className="min-h-screen flex flex-col bg-gradient-to-br from-[#051124] via-[#030B18] to-[#01050F] text-slate-100 font-sans">
      
      {/* Official Header */}
      <Header
        isAdmin={isAdminLoggedIn}
        onAdminClick={() => setIsAdminLoginOpen(true)}
        onLogoutClick={handleAdminLogout}
      />

      {/* Main Content Stage */}
      <main className="flex-1 w-full flex flex-col justify-start">
        {isAdminLoggedIn ? (
          /* ADMIN PORTAL */
          <div className="animate-fadeIn py-6">
            
            {/* Simple Sub-bar to let Admin toggle back to view frontpage cleanly */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mb-4">
              <button
                id="btn-back-to-public-view"
                onClick={handleAdminLogout}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs text-blue-300 bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/20 rounded-lg hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Switch to Public Frontpage</span>
              </button>
            </div>

            <AdminDashboard onLogout={handleAdminLogout} />
          </div>
        ) : (
          /* PUBLIC PORTAL: Clean, simple, beautiful, government survey design layout */
          <div className="animate-fadeIn py-8">
            
            {/* Core Hero Component containing intro, live counter & action button */}
            <Hero onShareThoughtsClick={() => setIsSurveyOpen(true)} />

          </div>
        )}
      </main>

      {/* Official Welfare Footer details */}
      <Footer />

      {/* Survey Modal */}
      <SurveyModal
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        onSubmitSuccess={(name) => {
          setUserName(name);
          setIsSuccessOpen(true);
        }}
      />

      {/* Success Popup */}
      <SuccessDialog
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        userName={userName}
      />

      {/* Admin Login Modal popup */}
      <AdminLogin
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
