import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Check, Award } from 'lucide-react';

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const SuccessDialog: React.FC<SuccessDialogProps> = ({ isOpen, onClose, userName }) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const displayUser = userName || 'Member';

  return (
    <div id="success-dialog-overlay" className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div id="success-dialog-card" className="w-full max-w-md bg-[#061124] border border-blue-500/20 rounded-2xl shadow-2xl p-6 md:p-8 text-center text-white space-y-6 animate-scaleUp">
        
        {/* Animated Green success icon with pulse ring */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/25 blur-xl animate-pulse scale-150" />
            <div className="relative p-4 bg-[#01140f] border border-[#00b27a]/30 rounded-full shadow-inner flex items-center justify-center">
              <Check className="w-10 h-10 text-[#00b27a] stroke-[3.5]" />
            </div>
          </div>
        </div>

        {/* TADA Collective Response pill */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#011a14] border border-[#00b27a]/20 rounded-full text-[10px] font-black tracking-wider text-[#00b27a] uppercase">
            <Award className="w-3.5 h-3.5 text-[#00b27a]" />
            <span>TADA COLLECTIVE RESPONSE</span>
          </div>
        </div>

        {/* Successful feedback header & personalized para */}
        <div className="space-y-3">
          <h2 id="success-header" className="text-lg md:text-2xl font-black text-white tracking-tight leading-tight">
            {language === 'ta' ? 'கருத்து வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!' : 'Feedback Submitted Successfully!'}
          </h2>
          <p id="success-subheader" className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium px-1">
            {language === 'ta' ? (
              <>
                மிக்க நன்றி, <span className="text-[#00b27a] font-bold text-sm select-all">{displayUser}</span>! உங்கள் கருத்து பதிவு செய்யப்பட்டுள்ளது. பதிவு செய்யப்பட்ட தமிழ்நாடு விவசாய பட்டயதாரி சங்கங்களின் கூட்டமைப்பு (டாடா) மூலம் உங்கள் குரல் அரசுக்கு சமர்ப்பிக்கப்படும்.
              </>
            ) : (
              <>
                Thank you, <span className="text-[#00b27a] font-black text-sm select-all">{displayUser}</span>! Your opinion has been registered. Your voice will be submitted to the Government through the <strong>Tamil Nadu Agriculture Diploma Holders Association (TADA)</strong>.
              </>
            )}
          </p>
        </div>

        {/* Action Button: Styled green capsule pill as in the picture */}
        <div className="flex justify-center pt-2">
          <button
            id="btn-success-ok"
            onClick={onClose}
            className="px-12 py-2.5 bg-[#00966a] hover:bg-[#00805a] active:scale-95 text-white font-extrabold text-xs md:text-sm uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer shadow-[0_4px_15px_rgba(0,150,106,0.35)] min-w-[120px] text-center"
          >
            {language === 'ta' ? 'சரி' : 'OK'}
          </button>
        </div>

      </div>
    </div>
  );
};
