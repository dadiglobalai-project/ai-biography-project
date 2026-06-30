import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Star, ArrowRight, PenTool, LogOut, Award, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService, ServiceType } from '../services/authService';
import BrandLogo from '../components/BrandLogo';

type StoryOption = 'diy' | 'pro';

const SERVICE_TYPE_BY_OPTION: Record<StoryOption, ServiceType> = {
  diy: 'DIY',
  pro: 'PROFESSIONAL',
};

export default function PreserveStoryPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ fullName?: string; email: string } | null>(null);
  const [selectedOption, setSelectedOption] = useState<StoryOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    authService.getCurrentUser()
      .then((res) => {
        if (active && res.user) {
          setCurrentUser(res.user);
        }
      })
      .catch(() => {
        if (active) {
          navigate('/login', { replace: true });
        }
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleSelect = (option: StoryOption) => {
    setSelectedOption(option);
    setError(null);
    setSuccessMessage(null);
  };

  const handleProceed = async () => {
    if (!selectedOption) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await authService.saveServiceType(SERVICE_TYPE_BY_OPTION[selectedOption]);
      setSuccessMessage(response.message);
    } catch (err: any) {
      setError(err?.message || 'Unable to save your service type. Please try again.');
      if (/unauthorized|forbidden|session|token/i.test(err?.message || '')) {
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Unable to clear secure session:", err);
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans selection:bg-amber-200">
      
      {/* 1. Header Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer max-w-[150px] sm:max-w-[190px]" 
            onClick={() => navigate('/preserve-story')}
          >
            <BrandLogo variant="mobile" className="w-full h-auto" />
          </div>

          {/* Navigation Links - Desktop Only */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <button 
              onClick={() => navigate('/preserve-story')}
              className="text-[#0A1128] font-bold border-b-2 border-[#FED362] pb-1 transition-all cursor-pointer"
            >
              Home
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="hidden sm:flex items-center max-w-[190px] rounded-full border border-slate-100 bg-white/70 px-3 py-2 text-xs text-slate-500 shadow-sm">
                <span className="truncate font-medium text-slate-700">
                  {currentUser.fullName || currentUser.email}
                </span>
              </div>
            )}

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2 border border-slate-200 hover:border-slate-800 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-full text-xs font-bold tracking-wide transition-all duration-200 shadow-sm cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Onboarding Content */}
      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center">
        
        {/* Subtitle & Title Intro */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 max-w-3xl mb-12 md:mb-16"
        >
          <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#B18625] uppercase">
            WELCOME TO XINGHUOJI
          </span>
          <h2 className="font-serif-display text-4xl sm:text-5xl font-semibold text-[#0A1128] tracking-tight leading-tight">
            How Would You Like to Preserve Your Story?
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Choose the experience that best fits your needs. You can change this later from your account settings.
          </p>
        </motion.div>

        {/* The Two Experience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          
          {/* Card 1: Do It Yourself (DIY) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onClick={() => handleSelect('diy')}
            className={`bg-white rounded-2xl border-2 p-8 flex flex-col justify-between relative cursor-pointer transition-all duration-300 ${
              selectedOption === 'diy' 
                ? 'border-[#FED362] shadow-[0_12px_30px_rgba(254,211,98,0.12)]' 
                : 'border-slate-100 hover:border-slate-200 hover:shadow-lg'
            }`}
          >
            <div className="space-y-6">
              {/* Header Icon & Title */}
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-sm ${
                  selectedOption === 'diy'
                    ? 'bg-amber-500/15 border-amber-300 text-[#B18625]'
                    : 'bg-slate-50 border-slate-200/80 text-slate-500'
                }`}>
                  <PenTool className="w-5 h-5 stroke-[2]" />
                </div>
                {selectedOption === 'diy' && (
                  <span className="text-[10px] font-mono tracking-wider font-bold bg-[#FED362]/20 text-[#B18625] px-2.5 py-1 rounded-full uppercase">
                    Selected
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-serif-display text-2xl font-bold text-[#0A1128]">
                  Do It Yourself (DIY)
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Create your biography at your own pace using templates, media uploads, and guided tools.
                </p>
              </div>

              {/* Checklist */}
              <ul className="space-y-3.5 pt-2">
                {[
                  'Templates',
                  'Media Library',
                  'Editor',
                  'Publish Website',
                  'Creative Control'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-amber-50 text-[#B18625] flex items-center justify-center border border-amber-100 shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Footer Description */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500 italic leading-relaxed">
                <span className="font-semibold text-slate-700 not-italic">Ideal for:</span> Users who want to create and manage their own biography.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Professional Biography Service */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => handleSelect('pro')}
            className={`bg-white rounded-2xl border-2 p-8 flex flex-col justify-between relative cursor-pointer transition-all duration-300 ${
              selectedOption === 'pro' 
                ? 'border-[#FED362] shadow-[0_12px_30px_rgba(254,211,98,0.12)]' 
                : 'border-slate-100 hover:border-slate-200 hover:shadow-lg'
            }`}
          >
            {/* RECOMMENDED badge */}
            <div className="absolute -top-3.5 right-6 bg-[#FED362] text-slate-900 text-[9px] font-mono font-bold tracking-wider px-3 py-1 rounded-full uppercase shadow-sm">
              RECOMMENDED
            </div>

            <div className="space-y-6">
              {/* Header Icon & Title */}
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-sm ${
                  selectedOption === 'pro'
                    ? 'bg-amber-500/15 border-amber-300 text-[#B18625]'
                    : 'bg-slate-50 border-slate-200/80 text-slate-500'
                }`}>
                  <Award className="w-5 h-5 stroke-[2]" />
                </div>
                {selectedOption === 'pro' && (
                  <span className="text-[10px] font-mono tracking-wider font-bold bg-[#FED362]/20 text-[#B18625] px-2.5 py-1 rounded-full uppercase">
                    Selected
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-serif-display text-2xl font-bold text-[#0A1128]">
                  Professional Biography Service
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Work with our team to transform your memories and life experiences into a professionally crafted biography.
                </p>
              </div>

              {/* Checklist with Star Icons inside circles */}
              <ul className="space-y-3.5 pt-2">
                {[
                  'Dedicated Consultant',
                  'Planning',
                  'Writing Support',
                  'Content Review',
                  'Publishing Assistance'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-amber-50 text-[#B18625] flex items-center justify-center border border-amber-100 shrink-0">
                      <Star className="w-2.5 h-2.5 fill-current stroke-[1.5]" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Footer Description */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500 italic leading-relaxed">
                <span className="font-semibold text-slate-700 not-italic">Ideal for:</span> Users who prefer expert guidance throughout the process.
              </p>
            </div>
          </motion.div>

        </div>

        {(error || successMessage) && (
          <div
            className={`mt-10 w-full max-w-4xl rounded-xl border px-4 py-3 text-sm flex items-start gap-3 ${
              error
                ? 'bg-rose-50 border-rose-100 text-rose-700'
                : 'bg-emerald-50 border-emerald-100 text-emerald-700'
            }`}
          >
            {error ? (
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            )}
            <span>{error || successMessage}</span>
          </div>
        )}

        {/* Dynamic Action Trigger to proceed with the selected experience */}
        {selectedOption && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 w-full max-w-sm"
          >
            <button
              onClick={handleProceed}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#FED362] hover:bg-[#FED362]/90 active:scale-[0.99] text-slate-900 font-sans text-xs font-bold tracking-wider uppercase transition-all duration-200 shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-slate-900" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  SAVING SELECTION...
                </>
              ) : (
                <>
                  PROCEED WITH {selectedOption === 'diy' ? 'DIY PLAN' : 'PROFESSIONAL PLAN'}
                  <ArrowRight className="w-4 h-4 ml-0.5 text-slate-900" />
                </>
              )}
            </button>
          </motion.div>
        )}

      </main>

      {/* 3. Footer */}
      <footer className="border-t border-slate-100 py-6 text-center select-none bg-white">
        <p className="text-[11px] text-slate-400 font-medium">
          &copy; 2026 Xinghuoji. The Eternal Spark. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
