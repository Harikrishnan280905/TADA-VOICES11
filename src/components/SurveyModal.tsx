import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TN_DISTRICTS, TN_DISTRICTS_TAMIL } from '../utils/translations';
import { X, Send, AlertCircle, HelpCircle, Phone, User, Landmark, Compass, CheckCircle2, Check } from 'lucide-react';
import { firebaseService, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (name: string) => void;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({ isOpen, onClose, onSubmitSuccess }) => {
  const { t, language } = useLanguage();

  // Google User authenticated states directly from Firebase
  const [googleUserEmail, setGoogleUserEmail] = useState<string>('');
  const [googleUserName, setGoogleUserName] = useState<string>('');
  const [googleUserUid, setGoogleUserUid] = useState<string>('');

  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [authError, setAuthError] = useState('');

  // Local Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState<'AAO' | 'AHO' | 'AAO (AB)' | ''>('');
  const [district, setDistrict] = useState('');
  const [block, setBlock] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [villages, setVillages] = useState<number | ''>('');
  const [distance, setDistance] = useState<number | ''>('');
  
  // Opinion choices (Options 3 is deleted, option 4 renamed/shifted)
  const [opinion, setOpinion] = useState<'continue_no_changes' | 'changes_needed' | 'old_uatt_continue' | ''>('');
  const [changesNeeded, setChangesNeeded] = useState<'villages_divided' | 'transfers_promotions' | 'other_suggestions' | ''>('');
  const [otherSuggestion, setOtherSuggestion] = useState('');

  // Submission control
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Duplicate submission status
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);
  const [isCheckingSubmission, setIsCheckingSubmission] = useState(false);

  // Sync with real Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const email = user.email || '';
        const nameVal = user.displayName || email.split('@')[0] || 'Google User';
        setGoogleUserEmail(email);
        setGoogleUserName(nameVal);
        setGoogleUserUid(user.uid);
        setName(nameVal); // prefill with Google Name
      } else {
        setGoogleUserEmail('');
        setGoogleUserName('');
        setGoogleUserUid('');
        setName('');
      }
    });
    return () => unsubscribe();
  }, []);

  // Check duplicate submission reactively against Google email
  useEffect(() => {
    if (googleUserEmail) {
      setIsCheckingSubmission(true);
      firebaseService.getResponses()
        .then((responses) => {
          const targetEmail = googleUserEmail.toLowerCase().trim();
          const found = responses.some(
            (r) => r.email && r.email.toLowerCase().trim() === targetEmail
          );
          setHasAlreadySubmitted(found);
        })
        .catch((err) => {
          console.error("Error checking submission status:", err);
        })
        .finally(() => {
          setIsCheckingSubmission(false);
        });
    } else {
      setHasAlreadySubmitted(false);
    }
  }, [googleUserEmail]);

  if (!isOpen) return null;

  const handleGoogleSignOut = async () => {
    await firebaseService.signOutUser();
    setGoogleUserEmail('');
    setGoogleUserName('');
    setGoogleUserUid('');
    setHasAlreadySubmitted(false);
  };

  const handleRealGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
    setAuthError('');
    try {
      await firebaseService.signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Google Sign-In failed.';
      if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('auth/unauthorized-domain'))) {
        if (language === 'ta') {
          msg = `கூகுள் உள்நுழைவு பிழை: இந்த டொமைன் (${window.location.hostname}) உங்கள் ஃபயர்பேஸ் திட்டத்தில் அங்கீகரிக்கப்படவில்லை.

இதை சரிசெய்ய:
1. உங்கள் ஃபயர்பேஸ் கன்சோலை (Firebase Console) திறக்கவும்.
2. Authentication -> Settings -> Authorized Domains பகுதிக்குச் செல்லவும்.
3. "Add domain" என்பதை கிளிக் செய்து இந்த முகவரியைச் சேர்க்கவும்:
   👉 ${window.location.hostname}`;
        } else {
          msg = `Google Sign-In Error: This domain (${window.location.hostname}) is not authorized in your Firebase Project.

To fix this:
1. Open your Firebase Console.
2. Go to Authentication -> Settings -> Authorized Domains.
3. Click "Add domain" and add this exact hostname:
   👉 ${window.location.hostname}`;
        }
      } else if (err.code === 'auth/popup-blocked') {
        msg = 'Google login popup was blocked. Please enable popups or try again.';
      }
      setAuthError(msg);
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDesignation('');
    setDistrict('');
    setBlock('');
    setHeadquarters('');
    setVillages('');
    setDistance('');
    setOpinion('');
    setChangesNeeded('');
    setOtherSuggestion('');
    setPhoneNumber('');
    setSubmitError('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Pre-validations
    if (!googleUserEmail) {
      setSubmitError('Authentication via Google Sign-In is required.');
      return;
    }
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      setSubmitError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!name.trim()) {
      setSubmitError('Name is required.');
      return;
    }
    if (!designation) {
      setSubmitError('Designation selection is required.');
      return;
    }
    if (!district) {
      setSubmitError('District selection is required.');
      return;
    }
    if (!block.trim()) {
      setSubmitError('Block name is required.');
      return;
    }
    if (!headquarters.trim()) {
      setSubmitError('Headquarters is required.');
      return;
    }
    if (villages === '' || villages < 0) {
      setSubmitError('Valid number of villages is required.');
      return;
    }
    if (distance === '' || distance < 0) {
      setSubmitError('Valid distance calculation from headquarters is required.');
      return;
    }
    if (!opinion) {
      setSubmitError('Please select your opinion regarding UATT 2.0.');
      return;
    }
    if (opinion === 'changes_needed' && !changesNeeded) {
      setSubmitError('Please clarify the specific changes needed.');
      return;
    }
    if (opinion === 'changes_needed' && changesNeeded === 'other_suggestions' && !otherSuggestion.trim()) {
      setSubmitError('Please enter your suggestions.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate unique phone number
      const responses = await firebaseService.getResponses();
      const phoneInput = phoneNumber.trim();
      const isPhoneDuplicate = responses.some(
        (r) => r.phoneNumber && r.phoneNumber.trim() === phoneInput
      );

      if (isPhoneDuplicate) {
        setSubmitError(
          language === 'ta'
            ? 'இந்த கைபேசி எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது. ஒரு கைபேசி எண்ணிற்கு ஒரு முறை மட்டுமே கருத்துப் பதிய முடியும்.'
            : 'This phone number has already been registered. One phone number is allowed only one survey submission.'
        );
        setIsSubmitting(false);
        return;
      }

      await firebaseService.addResponse({
        phoneNumber: phoneNumber.trim(),
        name: name.trim(),
        designation: designation as any,
        district,
        block: block.trim(),
        headquarters: headquarters.trim(),
        villages: Number(villages),
        distance: Number(distance),
        opinion: opinion as any,
        changesNeeded: opinion === 'changes_needed' ? changesNeeded : undefined,
        otherSuggestion: (opinion === 'changes_needed' && changesNeeded === 'other_suggestions') ? otherSuggestion.trim() : undefined,
        email: googleUserEmail.trim(),
        uid: googleUserUid.trim(),
        googleDisplayName: googleUserName.trim()
      });

      const submittedName = name.trim();
      resetForm();
      onSubmitSuccess(submittedName);
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="survey-modal-overlay" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-1.5 sm:p-4 overflow-y-auto">
      
      {/* Container - Dark slate design */}
      <div id="survey-modal-card" className="relative w-full max-w-2xl bg-[#061124] border border-emerald-500/20 rounded-2xl shadow-2xl overflow-hidden max-h-[96vh] sm:max-h-[92vh] flex flex-col text-white animate-scaleUp">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 md:p-5 border-b border-emerald-500/10 bg-[#030914]/95">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h2 id="modal-title" className="text-xs sm:text-sm md:text-lg font-bold text-white tracking-tight">
              {t.modalTitle}
            </h2>
          </div>
          <button
            id="btn-close-survey-modal"
            onClick={onClose}
            className="p-1 rounded-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-emerald-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Checked/Already Submitted View */}
        {googleUserEmail && hasAlreadySubmitted ? (
          <div className="p-6 sm:p-8 md:p-12 flex flex-col items-center text-center space-y-6 flex-1 justify-center max-w-md mx-auto my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
              <Check className="w-8 h-8" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                Opinion Recorded
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-semibold px-2">
                You have already submitted your opinion. Thank you for your participation.
              </p>
            </div>

            <div className="text-xs text-slate-400 bg-slate-950/40 py-1.5 px-3.5 rounded border border-slate-900">
              Verified: <span className="font-mono text-emerald-400">{googleUserEmail}</span>
            </div>

            <div className="flex gap-3 w-full pt-4">
              <button
                id="btn-already-signout"
                type="button"
                onClick={handleGoogleSignOut}
                className="flex-1 py-2.5 px-4 bg-red-955/10 hover:bg-red-955/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-all cursor-pointer hover:shadow-lg active:scale-95"
              >
                Sign Out
              </button>
              <button
                id="btn-already-close"
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        ) : !googleUserEmail ? (
          /* Sign In View (Fallback / Popup Blocked / Initial Error state) */
          <div className="p-6 sm:p-8 md:p-12 flex flex-col items-center text-center space-y-6 flex-1 justify-center max-w-md mx-auto my-auto">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center text-blue-400">
              <User className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Google Authentication Required
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed px-4">
                To submit public assessments under TADA guidelines, please authenticate with an authorized Google Account.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/40 border border-red-500/25 rounded-lg text-red-400 text-xs text-left w-full animate-fadeIn max-h-48 overflow-y-auto">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span className="font-medium leading-relaxed whitespace-pre-line">{authError}</span>
                </div>
              </div>
            )}

            <button
              id="btn-google-signin-fallback"
              type="button"
              disabled={isSigningInGoogle}
              onClick={handleRealGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 rounded-lg hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 font-bold text-xs uppercase tracking-wide cursor-pointer disabled:opacity-50"
            >
              {isSigningInGoogle ? (
                <div className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
              ) : (
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              <span>{language === 'ta' ? 'Google இன்-பில்ட் உள்நுழைவு' : 'Sign in with Google'}</span>
            </button>
          </div>
        ) : (
          /* Active Survey Form */
          <>
            <form id="uatt-survey-form" onSubmit={handleFormSubmit} className="p-3.5 sm:p-5 md:p-6 overflow-y-auto flex-1 space-y-4 md:space-y-6 text-left scroll-smooth" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}>
              
              {/* Profile Card / Signout bar */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#030815] border border-emerald-500/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {googleUserName}
                    </h4>
                    <p className="text-[10px] text-zinc-400 leading-none mt-0.5 select-all">
                      {googleUserEmail}
                    </p>
                  </div>
                </div>
                <button
                  id="btn-google-signout-form"
                  type="button"
                  onClick={handleGoogleSignOut}
                  className="px-2.5 py-1 text-[10px] text-red-400 hover:text-red-350 bg-red-955/10 hover:bg-red-955/20 border border-red-500/15 hover:border-red-500/30 rounded font-medium transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                
                <div className="text-left">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                    Personnel Details &amp; Assessment
                  </h3>
                </div>

                {/* Field Name & Designation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-sans">
                  <div>
                    <label htmlFor="survey-input-name" className="block text-xs font-bold text-emerald-400/90 uppercase tracking-widest mb-1.5 font-sans">
                      {t.name} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500/60">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        id="survey-input-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Senthil Kumar"
                        className="pl-9 w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white placeholder-slate-705 focus:outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="survey-select-designation" className="block text-xs font-bold text-emerald-400/90 uppercase tracking-widest mb-1.5 font-sans">
                      {t.designation} <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="survey-select-designation"
                      required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value as any)}
                      className="w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white focus:outline-none transition-all font-sans"
                    >
                      <option value="">-- {t.selectDesignation} --</option>
                      <option value="AAO">AAO</option>
                      <option value="AHO">AHO</option>
                      <option value="AAO (AB)">AAO (AB)</option>
                    </select>
                  </div>
                </div>

                {/* Phone Number Field */}
                <div className="text-left font-sans">
                  <label htmlFor="survey-input-phone" className="block text-xs font-bold text-emerald-400/90 uppercase tracking-widest mb-1.5 font-sans">
                    {t.phoneNumber} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500/60">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      id="survey-input-phone"
                      type="tel"
                      maxLength={10}
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 9876543210"
                      className="pl-9 w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white placeholder-slate-705 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Field District & Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-sans">
                  <div>
                    <label htmlFor="survey-select-district" className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5 font-sans">
                      {t.district} <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="survey-select-district"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white focus:outline-none transition-all font-sans"
                    >
                      <option value="">-- {t.selectDistrict} --</option>
                      {TN_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>
                          {language === 'ta' && TN_DISTRICTS_TAMIL[dist] ? TN_DISTRICTS_TAMIL[dist] : dist}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="survey-input-block" className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5 font-sans">
                      {t.block} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500/60">
                        <Compass className="w-4 h-4" />
                      </span>
                      <input
                        id="survey-input-block"
                        type="text"
                        required
                        value={block}
                        onChange={(e) => setBlock(e.target.value)}
                        placeholder="e.g. Lalgudi"
                        className="pl-9 w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white placeholder-slate-705 focus:outline-none transition-all font-sans"
                      />
                    </div>
                  </div>
                </div>

                {/* Field Headquarters */}
                <div className="text-left font-sans">
                  <label htmlFor="survey-input-headquarters" className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5 font-sans">
                    {t.headquarters} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500/60">
                      <Landmark className="w-4 h-4" />
                    </span>
                    <input
                      id="survey-input-headquarters"
                      type="text"
                      required
                      value={headquarters}
                      onChange={(e) => setHeadquarters(e.target.value)}
                      placeholder="Enter Headquarters details"
                      className="pl-9 w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white placeholder-slate-705 focus:outline-none transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Villages & Distance Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-sans">
                  <div>
                    <label htmlFor="survey-input-villages" className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5 font-sans">
                      {t.numberOfVillages} <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="survey-input-villages"
                      type="number"
                      min="0"
                      required
                      value={villages}
                      onChange={(e) => setVillages(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 10"
                      className="w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white placeholder-slate-705 focus:outline-none transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="survey-input-distance" className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5 font-sans">
                      {t.farthestDistance} <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="survey-input-distance"
                      type="number"
                      min="0"
                      step="0.1"
                      required
                      value={distance}
                      onChange={(e) => setDistance(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 15.5"
                      className="w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white placeholder-slate-705 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Opinion Radio Form */}
                <div className="border-t border-slate-900 pt-4 space-y-3 text-left font-sans">
                  <label className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1 font-sans">
                    {t.opinionTitle} <span className="text-red-400">*</span>
                  </label>

                  <div className="space-y-3 font-sans">
                    {/* Option 1: Continue without any changes */}
                    <label className="flex items-start gap-4 p-3 bg-[#030815] border border-slate-850 rounded-lg hover:border-emerald-500/30 transition-all cursor-pointer select-none text-left justify-start">
                      <input
                        type="radio"
                        name="uatt-opinion"
                        value="continue_no_changes"
                        checked={opinion === 'continue_no_changes'}
                        onChange={() => {
                          setOpinion('continue_no_changes');
                          setChangesNeeded('');
                          setOtherSuggestion('');
                        }}
                        className="mt-1 accent-emerald-500 h-4 w-4 shrink-0"
                      />
                      <span className="text-xs md:text-sm text-slate-200 leading-normal font-sans font-medium">
                        {t.opinionOpt1}
                      </span>
                    </label>

                    {/* Option 2: Changes Needed in UATT 2.0 */}
                    <label className="flex items-start gap-4 p-3 bg-[#030815] border border-slate-850 rounded-lg hover:border-emerald-500/30 transition-all cursor-pointer select-none text-left justify-start font-sans">
                      <input
                        type="radio"
                        name="uatt-opinion"
                        value="changes_needed"
                        checked={opinion === 'changes_needed'}
                        onChange={() => setOpinion('changes_needed')}
                        className="mt-1 accent-emerald-500 h-4 w-4 shrink-0 font-sans"
                      />
                      <div className="flex flex-col text-left font-sans">
                        <span className="text-xs md:text-sm font-bold text-slate-200 font-sans">
                          {t.opinionOpt2}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5 font-sans">
                          Select specific configurations that need adjustments.
                        </span>
                      </div>
                    </label>

                    {/* Sub-section conditional: Changes Needed Options */}
                    {opinion === 'changes_needed' && (
                      <div className="pl-6 pr-2 py-3 bg-[#01050F] rounded-lg border border-emerald-500/10 space-y-3 animate-fadeIn text-left font-sans">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-sans">
                          {t.changesNeededTitle}
                        </h4>

                        {/* Change Sub-Opt 1 */}
                        <label className="flex items-start gap-3 p-2 border border-slate-900 rounded bg-slate-950/30 hover:bg-slate-950/50 transition-all cursor-pointer text-left font-sans">
                          <input
                            type="radio"
                            name="changes-needed-sub"
                            value="villages_divided"
                            checked={changesNeeded === 'villages_divided'}
                            onChange={() => {
                              setChangesNeeded('villages_divided');
                              setOtherSuggestion('');
                            }}
                            className="mt-0.5 accent-emerald-500 h-3.5 w-3.5 font-sans"
                          />
                          <span className="text-xs text-slate-300 font-sans">
                            {t.changesNeededOpt1}
                          </span>
                        </label>

                        {/* Change Sub-Opt 2 */}
                        <label className="flex items-start gap-3 p-2 border border-slate-900 rounded bg-slate-950/30 hover:bg-slate-950/50 transition-all cursor-pointer text-left font-sans">
                          <input
                            type="radio"
                            name="changes-needed-sub"
                            value="transfers_promotions"
                            checked={changesNeeded === 'transfers_promotions'}
                            onChange={() => {
                              setChangesNeeded('transfers_promotions');
                              setOtherSuggestion('');
                            }}
                            className="mt-0.5 accent-emerald-500 h-3.5 w-3.5 font-sans"
                          />
                          <span className="text-xs text-slate-300 font-sans">
                            {t.changesNeededOpt2}
                          </span>
                        </label>

                        {/* Change Sub-Opt 3: Other Suggestions */}
                        <label className="flex items-start gap-3 p-2 border border-slate-900 rounded bg-slate-950/30 hover:bg-slate-950/50 transition-all cursor-pointer text-left font-sans">
                          <input
                            type="radio"
                            name="changes-needed-sub"
                            value="other_suggestions"
                            checked={changesNeeded === 'other_suggestions'}
                            onChange={() => setChangesNeeded('other_suggestions')}
                            className="mt-0.5 accent-emerald-500 h-3.5 w-3.5 font-sans"
                          />
                          <span className="text-xs text-slate-300 font-sans">
                            {t.changesNeededOpt3}
                          </span>
                        </label>

                        {/* Sub-text Area: entering suggestions */}
                        {changesNeeded === 'other_suggestions' && (
                          <div className="space-y-1.5 pt-1.5 animate-fadeIn text-left font-sans">
                            <textarea
                              id="survey-textarea-suggestion"
                              rows={3}
                              value={otherSuggestion}
                              onChange={(e) => setOtherSuggestion(e.target.value)}
                              placeholder={t.otherSuggestPlaceholder}
                              className="w-full rounded bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs p-2.5 text-white placeholder-slate-700 focus:outline-none transition-all font-sans"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Option 3: Old UATT system may be continued */}
                    <label className="flex items-start gap-4 p-3 bg-[#030815] border border-slate-850 rounded-lg hover:border-emerald-500/30 transition-all cursor-pointer select-none text-left justify-start font-sans">
                      <input
                        type="radio"
                        name="uatt-opinion"
                        value="old_uatt_continue"
                        checked={opinion === 'old_uatt_continue'}
                        onChange={() => {
                          setOpinion('old_uatt_continue');
                          setChangesNeeded('');
                          setOtherSuggestion('');
                        }}
                        className="mt-1 accent-emerald-500 h-4 w-4 shrink-0 font-sans"
                      />
                      <span className="text-xs md:text-sm text-slate-200 leading-normal font-sans font-medium">
                        {t.opinionOpt4}
                      </span>
                    </label>

                  </div>
                </div>

              </div>

              {/* Form Error messages */}
              {submitError && (
                <div className="p-3 bg-red-950/45 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-xs text-red-200 animate-shake text-left font-sans">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{submitError}</span>
                </div>
              )}

            </form>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-[#030914] border-t border-slate-900 flex justify-end gap-3 shrink-0">
              <button
                id="btn-survey-cancel"
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-800 hover:border-slate-705 hover:bg-slate-900 rounded-lg text-xs font-bold text-slate-300 transition-all cursor-pointer active:scale-95 font-sans"
              >
                {t.cancelBtn}
              </button>
              
              <button
                id="btn-survey-submit"
                type="button"
                disabled={isSubmitting}
                onClick={handleFormSubmit}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-450 disabled:bg-slate-950/20 disabled:text-emerald-950/30 disabled:border-transparent text-slate-950 hover:scale-[1.02] active:scale-95 text-xs font-black uppercase tracking-wider rounded-lg border border-emerald-400/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-sans"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{t.submitBtn}</span>
              </button>
            </div>
          </>
        )}

      </div>

    </div>
  );
};
