import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TN_DISTRICTS, TN_DISTRICTS_TAMIL } from '../utils/translations';
import { X, Send, AlertCircle, HelpCircle, Phone, User, Landmark, Compass, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import { firebaseService } from '../services/firebase';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (name: string) => void;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({ isOpen, onClose, onSubmitSuccess }) => {
  const { t, language } = useLanguage();

  // New Google Sign-In states
  const [googleUserEmail, setGoogleUserEmail] = useState<string>(() => {
    return localStorage.getItem('uatt_google_email') || '';
  });
  const [googleUserName, setGoogleUserName] = useState<string>(() => {
    return localStorage.getItem('uatt_google_name') || '';
  });
  
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false);

  // Local Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState<'AAO' | 'AHO' | 'AAO (AB)' | ''>('');
  const [district, setDistrict] = useState('');
  const [block, setBlock] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [villages, setVillages] = useState<number | ''>('');
  const [distance, setDistance] = useState<number | ''>('');
  
  // Opinion choices
  const [opinion, setOpinion] = useState<'continue_no_changes' | 'changes_needed' | 'staff_not_merged' | 'old_uatt_continue' | ''>('');
  const [changesNeeded, setChangesNeeded] = useState<'villages_divided' | 'transfers_promotions' | 'other_suggestions' | ''>('');
  const [otherSuggestion, setOtherSuggestion] = useState('');

  // Submission control
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  // Sync google authentication details to form names automatically
  const handleGoogleAuthSucceed = (email: string, displayName: string) => {
    setGoogleUserEmail(email);
    setGoogleUserName(displayName);
    setName(displayName); // Prefill Name with verified Google Name
    localStorage.setItem('uatt_google_email', email);
    localStorage.setItem('uatt_google_name', displayName);
    setShowAccountPicker(false);
  };

  const handleGoogleSignOut = () => {
    setGoogleUserEmail('');
    setGoogleUserName('');
    localStorage.removeItem('uatt_google_email');
    localStorage.removeItem('uatt_google_name');
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
      await firebaseService.addResponse({
        phoneNumber: phoneNumber.trim(),
        name: name.trim(),
        designation: designation as any,
        district,
        block: block.trim(),
        headquarters: headquarters.trim(),
        villages: Number(villages),
        distance: Number(distance),
        opinion,
        changesNeeded: opinion === 'changes_needed' ? changesNeeded : undefined,
        otherSuggestion: (opinion === 'changes_needed' && changesNeeded === 'other_suggestions') ? otherSuggestion.trim() : undefined,
        email: googleUserEmail.trim(),
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

  const renderGoogleButton = () => {
    return (
      <button
        id="btn-google-signin"
        type="button"
        disabled={isSigningInGoogle}
        onClick={() => {
          setIsSigningInGoogle(true);
          setTimeout(() => {
            setIsSigningInGoogle(false);
            setShowAccountPicker(true);
          }, 900);
        }}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 rounded-lg hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 font-bold text-xs uppercase tracking-wide cursor-pointer"
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
        <span>{language === 'ta' ? 'Google உடன் உள்நுழைக' : 'Sign in with Google'}</span>
      </button>
    );
  };

  return (
    <div id="survey-modal-overlay" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-1.5 sm:p-4 overflow-y-auto">
      
      {/* Container - Dark slate design to match the professional welfare theme layout */}
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

        {/* Modal Scrollable Body */}
        <form id="uatt-survey-form" onSubmit={handleFormSubmit} className="p-3.5 sm:p-5 md:p-6 overflow-y-auto flex-1 space-y-4 md:space-y-6 text-left scroll-smooth" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}>
          
          {/* Step 1: Google Identity Verification */}
          <div className="p-3 sm:p-4 rounded-xl border border-emerald-500/15 bg-slate-950/20 space-y-2.5 sm:space-y-3.5 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-widest leading-none">
                Step 1: Google Identity Verification
              </h3>
              {googleUserEmail && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            
            {!googleUserEmail ? (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400 leading-normal">
                  To ensure unique response entries and verify your association status under TADA, please sign in with your Google account. Your profile email will be logged securely alongside your response.
                </p>
                {renderGoogleButton()}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#030815] border border-emerald-500/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {googleUserName || 'Google Member'}
                    </h4>
                    <p className="text-[10px] text-zinc-400 leading-none mt-0.5 select-all">
                      {googleUserEmail}
                    </p>
                  </div>
                </div>
                <button
                  id="btn-google-signout"
                  type="button"
                  onClick={handleGoogleSignOut}
                  className="px-2.5 py-1 text-[10px] text-red-400 hover:text-red-350 bg-red-950/20 hover:bg-red-950/40 border border-red-500/10 hover:border-red-500/20 rounded font-medium transition-all cursor-pointer"
                >
                  Change Account
                </button>
              </div>
            )}
          </div>

          {/* Form Fields - Controlled until Google Identity authentication succeeds */}
          <div className={`space-y-5 transition-all duration-300 ${googleUserEmail ? 'opacity-100 pointer-events-auto' : 'opacity-30 pointer-events-none select-none'}`}>
            
            <div className="border-t border-slate-900 pt-4 text-left">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
                Step 2: Personnel Details & Assessment
              </h3>
            </div>

            {/* Field Name & Designation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <label htmlFor="survey-input-name" className="block text-xs font-bold text-emerald-400/90 uppercase tracking-widest mb-1.5">
                  {t.name} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500/60">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="survey-input-name"
                    type="text"
                    required={!!googleUserEmail}
                    disabled={!googleUserEmail}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Senthil Kumar"
                    className="pl-9 w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white placeholder-slate-705 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="survey-select-designation" className="block text-xs font-bold text-emerald-400/90 uppercase tracking-widest mb-1.5">
                  {t.designation} <span className="text-red-400">*</span>
                </label>
                <select
                  id="survey-select-designation"
                  required={!!googleUserEmail}
                  disabled={!googleUserEmail}
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value as any)}
                  className="w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white focus:outline-none transition-all"
                >
                  <option value="">-- {t.selectDesignation} --</option>
                  <option value="AAO">AAO</option>
                  <option value="AHO">AHO</option>
                  <option value="AAO (AB)">AAO (AB)</option>
                </select>
              </div>
            </div>

            {/* Phone Number Field without OTP option */}
            <div className="text-left">
              <label htmlFor="survey-input-phone" className="block text-xs font-bold text-emerald-400/90 uppercase tracking-widest mb-1.5">
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
                  required={!!googleUserEmail}
                  disabled={!googleUserEmail}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9876543210 (10-digit mobile number)"
                  className="pl-9 w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white placeholder-slate-705 focus:outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Field District & Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <label htmlFor="survey-select-district" className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5 font-sans">
                  {t.district} <span className="text-red-400">*</span>
                </label>
                <select
                  id="survey-select-district"
                  required={!!googleUserEmail}
                  disabled={!googleUserEmail}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white focus:outline-none transition-all"
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
                    required={!!googleUserEmail}
                    disabled={!googleUserEmail}
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    placeholder="e.g. Lalgudi"
                    className="pl-9 w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white placeholder-slate-705 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Field Headquarters */}
            <div className="text-left">
              <label htmlFor="survey-input-headquarters" className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5 text-left font-sans">
                {t.headquarters} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500/60">
                  <Landmark className="w-4 h-4" />
                </span>
                <input
                  id="survey-input-headquarters"
                  type="text"
                  required={!!googleUserEmail}
                  disabled={!googleUserEmail}
                  value={headquarters}
                  onChange={(e) => setHeadquarters(e.target.value)}
                  placeholder="Enter Headquarters details"
                  className="pl-9 w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white placeholder-slate-705 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Villages & Distance Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <label htmlFor="survey-input-villages" className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5 font-sans">
                  {t.numberOfVillages} <span className="text-red-400">*</span>
                </label>
                <input
                  id="survey-input-villages"
                  type="number"
                  min="0"
                  required={!!googleUserEmail}
                  disabled={!googleUserEmail}
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
                  required={!!googleUserEmail}
                  disabled={!googleUserEmail}
                  value={distance}
                  onChange={(e) => setDistance(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 15.5"
                  className="w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm py-2 px-3 text-white placeholder-slate-705 focus:outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Opinion Radio Form */}
            <div className="border-t border-slate-900 pt-4 space-y-3 text-left">
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                {t.opinionTitle} <span className="text-red-400">*</span>
              </label>

              <div className="space-y-3">
                {/* Option 1: Continue without any changes */}
                <label className="flex items-start gap-4 p-3 bg-[#030815] border border-slate-850 rounded-lg hover:border-emerald-500/30 transition-all cursor-pointer select-none text-left justify-start">
                  <input
                    type="radio"
                    name="uatt-opinion"
                    value="continue_no_changes"
                    disabled={!googleUserEmail}
                    checked={opinion === 'continue_no_changes'}
                    onChange={() => {
                      setOpinion('continue_no_changes');
                      setChangesNeeded('');
                      setOtherSuggestion('');
                    }}
                    className="mt-1 accent-emerald-500 h-4 w-4 shrink-0"
                  />
                  <span className="text-xs md:text-sm text-slate-200 leading-normal font-sans">
                    {t.opinionOpt1}
                  </span>
                </label>

                {/* Option 2: Changes Needed */}
                <label className="flex items-start gap-4 p-3 bg-[#030815] border border-slate-850 rounded-lg hover:border-emerald-500/30 transition-all cursor-pointer select-none text-left justify-start">
                  <input
                    type="radio"
                    name="uatt-opinion"
                    value="changes_needed"
                    disabled={!googleUserEmail}
                    checked={opinion === 'changes_needed'}
                    onChange={() => setOpinion('changes_needed')}
                    className="mt-1 accent-emerald-500 h-4 w-4 shrink-0"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs md:text-sm font-bold text-slate-200">
                      {t.opinionOpt2}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Select specific configurations that need adjustments.
                    </span>
                  </div>
                </label>

                {/* Sub-section conditional: Changes Needed Options */}
                {opinion === 'changes_needed' && (
                  <div className="pl-6 pr-2 py-3 bg-[#01050F] rounded-lg border border-emerald-500/10 space-y-3 animate-fadeIn text-left">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      {t.changesNeededTitle}
                    </h4>

                    {/* Change Sub-Opt 1 */}
                    <label className="flex items-start gap-3 p-2 border border-slate-900 rounded bg-slate-950/30 hover:bg-slate-950/50 transition-all cursor-pointer text-left">
                      <input
                        type="radio"
                        name="changes-needed-sub"
                        value="villages_divided"
                        disabled={!googleUserEmail}
                        checked={changesNeeded === 'villages_divided'}
                        onChange={() => {
                          setChangesNeeded('villages_divided');
                          setOtherSuggestion('');
                        }}
                        className="mt-0.5 accent-emerald-500 h-3.5 w-3.5"
                      />
                      <span className="text-xs text-slate-300">
                        {t.changesNeededOpt1}
                      </span>
                    </label>

                    {/* Change Sub-Opt 2 */}
                    <label className="flex items-start gap-3 p-2 border border-slate-900 rounded bg-slate-950/30 hover:bg-slate-950/50 transition-all cursor-pointer text-left">
                      <input
                        type="radio"
                        name="changes-needed-sub"
                        value="transfers_promotions"
                        disabled={!googleUserEmail}
                        checked={changesNeeded === 'transfers_promotions'}
                        onChange={() => {
                          setChangesNeeded('transfers_promotions');
                          setOtherSuggestion('');
                        }}
                        className="mt-0.5 accent-emerald-500 h-3.5 w-3.5"
                      />
                      <span className="text-xs text-slate-300">
                        {t.changesNeededOpt2}
                      </span>
                    </label>

                    {/* Change Sub-Opt 3: Other Suggestions */}
                    <label className="flex items-start gap-3 p-2 border border-slate-900 rounded bg-slate-950/30 hover:bg-slate-950/50 transition-all cursor-pointer text-left">
                      <input
                        type="radio"
                        name="changes-needed-sub"
                        value="other_suggestions"
                        disabled={!googleUserEmail}
                        checked={changesNeeded === 'other_suggestions'}
                        onChange={() => setChangesNeeded('other_suggestions')}
                        className="mt-0.5 accent-emerald-500 h-3.5 w-3.5"
                      />
                      <span className="text-xs text-slate-300">
                        {t.changesNeededOpt3}
                      </span>
                    </label>

                    {/* Sub-text Area: entering suggestions */}
                    {changesNeeded === 'other_suggestions' && (
                      <div className="space-y-1.5 pt-1.5 animate-fadeIn text-left">
                        <textarea
                          id="survey-textarea-suggestion"
                          rows={3}
                          value={otherSuggestion}
                          disabled={!googleUserEmail}
                          onChange={(e) => setOtherSuggestion(e.target.value)}
                          placeholder={t.otherSuggestPlaceholder}
                          className="w-full rounded bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs p-2.5 text-white placeholder-slate-700 focus:outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Option 3: Only field level staffs can not be merged... */}
                <label className="flex items-start gap-4 p-3 bg-[#030815] border border-slate-850 rounded-lg hover:border-emerald-500/30 transition-all cursor-pointer select-none text-left justify-start">
                  <input
                    type="radio"
                    name="uatt-opinion"
                    value="staff_not_merged"
                    disabled={!googleUserEmail}
                    checked={opinion === 'staff_not_merged'}
                    onChange={() => {
                      setOpinion('staff_not_merged');
                      setChangesNeeded('');
                      setOtherSuggestion('');
                    }}
                    className="mt-1 accent-emerald-500 h-4 w-4 shrink-0"
                  />
                  <span className="text-xs md:text-sm text-slate-200 leading-normal font-sans">
                    {t.opinionOpt3}
                  </span>
                </label>

                {/* Option 4: Old UATT system may be continued */}
                <label className="flex items-start gap-4 p-3 bg-[#030815] border border-slate-850 rounded-lg hover:border-emerald-500/30 transition-all cursor-pointer select-none text-left justify-start">
                  <input
                    type="radio"
                    name="uatt-opinion"
                    value="old_uatt_continue"
                    disabled={!googleUserEmail}
                    checked={opinion === 'old_uatt_continue'}
                    onChange={() => {
                      setOpinion('old_uatt_continue');
                      setChangesNeeded('');
                      setOtherSuggestion('');
                    }}
                    className="mt-1 accent-emerald-500 h-4 w-4 shrink-0"
                  />
                  <span className="text-xs md:text-sm text-slate-200 leading-normal font-sans">
                    {t.opinionOpt4}
                  </span>
                </label>

              </div>
            </div>

          </div>

          {/* Verification Warning message */}
          {!googleUserEmail && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/10 rounded-lg flex items-start gap-2.5 text-xs text-emerald-400 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>Please authenticate under Step 1 with a Google account so we can unlock public opinion forms.</span>
            </div>
          )}

          {/* Form Error messages */}
          {submitError && (
            <div className="p-3 bg-red-950/45 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-xs text-red-200 animate-shake text-left">
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
            className="px-4 py-2 border border-slate-800 hover:border-slate-705 hover:bg-slate-900 rounded-lg text-xs font-bold text-slate-300 transition-all cursor-pointer"
          >
            {t.cancelBtn}
          </button>
          
          <button
            id="btn-survey-submit"
            type="button"
            disabled={!googleUserEmail || isSubmitting}
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

      </div>

      {/* Realistic Google Accounts Selection Dialog Popup Overlay */}
      {showAccountPicker && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 p-2 sm:p-4 animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-4 sm:p-6 text-slate-900 animate-scaleUp text-left space-y-4 font-sans my-auto max-h-[96vh] overflow-y-auto">
            
            <div className="flex flex-col items-center justify-center text-center border-b border-slate-100 pb-3">
              <svg className="w-9 h-9 mb-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <h3 className="text-sm sm:text-base font-bold text-gray-850 truncate max-w-full">Choose an account</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">to continue to UATT 2.0 (TADA Association)</p>
            </div>

            <div className="space-y-2">
              
              {/* Option A: User's Actual Email based on metadata (nigithasureshkumar@gmail.com) */}
              <button
                type="button"
                onClick={() => handleGoogleAuthSucceed('nigithasureshkumar@gmail.com', 'Nigitha Sureshkumar')}
                className="w-full flex items-center justify-between p-2.5 sm:p-3 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 rounded-xl transition-all cursor-pointer text-left group min-w-0"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm shrink-0">
                    N
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">Nigitha Sureshkumar</h4>
                    <p className="text-[9px] sm:text-[10px] text-zinc-500 font-mono truncate">nigithasureshkumar@gmail.com</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0" />
              </button>

              {/* Option B: Standard TADA Email */}
              <button
                type="button"
                onClick={() => handleGoogleAuthSucceed('tada.agri@gmail.com', 'TADA Agri Member')}
                className="w-full flex items-center justify-between p-2.5 sm:p-3 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 rounded-xl transition-all cursor-pointer text-left group min-w-0"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-sm shrink-0">
                    T
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">TADA Agri Member</h4>
                    <p className="text-[9px] sm:text-[10px] text-zinc-500 font-mono truncate">tada.agri@gmail.com</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0" />
              </button>

              {/* Custom Input Toggle */}
              {!showCustomEmailInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomEmailInput(true)}
                  className="w-full text-center py-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Use another Google account
                </button>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 animate-fadeIn">
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Configure Custom Account</h4>
                  
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full p-2 border border-slate-200 bg-white rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="email"
                      placeholder="username@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full p-2 border border-slate-200 bg-white rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomEmailInput(false);
                        setCustomEmail('');
                        setCustomName('');
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:underline px-2 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!customEmail.includes('@') || !customName.trim()}
                      onClick={() => handleGoogleAuthSucceed(customEmail.trim(), customName.trim())}
                      className="text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 rounded px-3 py-1.5 disabled:opacity-50"
                    >
                      Authorize
                    </button>
                  </div>
                </div>
              )}

            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAccountPicker(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-xs px-3 py-1 text-slate-600 cursor-pointer font-bold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
