import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, ArrowLeft, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email from:
  // 1. router location state (passed if coming directly from forgot password pages)
  // 2. URL query parameters (?email=test@example.com)
  // 3. Fallback default account for a flawless preview experience
  const getEmailAddress = (): string => {
    if (location.state && (location.state as any).email) {
      return (location.state as any).email;
    }
    const params = new URLSearchParams(location.search);
    const queryEmail = params.get('email');
    if (queryEmail) {
      return queryEmail;
    }
    return 'theo@legacy.com'; // Default historical archivist account
  };

  const email = getEmailAddress();

  // State Management
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validation criteria
  const hasMinLength = password.length >= 8;

  // Strength computation
  const getStrengthLabelAndColor = () => {
    if (password.length === 0) {
      return { label: 'Empty', color: 'text-[#B18625]' }; // Amber Gold
    }
    if (password.length < 8) {
      return { label: 'Too Short', color: 'text-rose-500 font-semibold' };
    }
    if (password.length < 12) {
      return { label: 'Medium', color: 'text-amber-500 font-semibold' };
    }
    return { label: 'Strong', color: 'text-emerald-500 font-semibold' };
  };

  const strength = getStrengthLabelAndColor();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation checks
    if (!hasMinLength) {
      setError('Please ensure your password is at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords you entered do not match. Please verify your typing.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword({
        email,
        password,
        confirmPassword
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to update credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F8] relative flex flex-col justify-between items-center py-12 px-4 font-sans selection:bg-legacy-gold/30 overflow-hidden">
      {/* Dynamic atmospheric ambient backdrop to match exact soft light blue/sky vignette */}
      <div className="absolute top-[-20%] left-[-10%] w-[550px] h-[550px] rounded-full bg-[#E2EAE7]/50 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#EAF0EE]/70 blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] right-[5%] w-[450px] h-[450px] rounded-full bg-amber-500/[0.03] blur-[100px] pointer-events-none" />

      {/* Elegant minimalist header as shown in screenshots */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center text-center space-y-1 mt-4 z-10"
      >
        <h1 className="font-serif-display text-4xl sm:text-5xl font-medium tracking-wide text-[#0A1128]">
          Xinghuoji
        </h1>
        <p className="text-[10px] font-mono tracking-[0.25em] text-slate-500 font-semibold uppercase">
          THE ETERNAL SPARK
        </p>
      </motion.div>

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-[0_12px_45px_rgba(10,17,40,0.03)] border border-slate-100 p-8 sm:p-10 z-10 flex flex-col my-8 relative"
        id="create-password-card"
      >
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="reset-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header Texts */}
              <div className="space-y-3">
                <h2 className="font-serif-display text-3xl font-semibold text-[#0A1128] tracking-tight leading-tight">
                  Create New Password
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed font-sans">
                  Please enter a strong password to secure your digital legacy and preserve your life's narratives.
                </p>
              </div>

              {/* Target Email Banner for User Context */}
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Account:</span>
                <span className="font-semibold text-slate-700">{email}</span>
              </div>

              {/* Error Handling Banner */}
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2.5 text-xs text-rose-600 font-sans">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Password Fields Form */}
              <form onSubmit={handleResetPassword} className="space-y-6">
                
                {/* 1. New Password Field */}
                <div>
                  <label className="block text-[11px] font-mono tracking-wider uppercase text-slate-400 font-semibold mb-1">
                    New Password
                  </label>
                  <div className="border-b border-slate-200 focus-within:border-slate-800 transition-colors duration-300 py-1 flex items-center justify-between">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent outline-none border-none text-sm text-[#0A1128] placeholder-slate-300 font-sans focus:ring-0 py-1"
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-700 transition-colors focus:outline-none p-1"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength display and checks */}
                <div className="space-y-4 pt-1">
                  <div className="text-xs font-sans text-slate-500 flex items-center gap-1.5">
                    <span>Strength:</span>
                    <span className={strength.color}>{strength.label}</span>
                  </div>

                  {/* Horizontal rule separator before checklist as in screenshot */}
                  <div className="h-px bg-slate-100" />

                  {/* Criteria Checklist - simplified to only show 8 characters limit */}
                  <div className="text-xs text-slate-600 font-sans">
                    {/* Criteria: At least 8 characters */}
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        hasMinLength 
                          ? 'border-emerald-500 bg-emerald-500 text-white' 
                          : 'border-slate-300 text-slate-300'
                      }`}>
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className={hasMinLength ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                        At least 8 characters
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Confirm Password Field */}
                <div className="pt-2">
                  <label className="block text-[11px] font-mono tracking-wider uppercase text-slate-400 font-semibold mb-1">
                    Confirm New Password
                  </label>
                  <div className="border-b border-slate-200 focus-within:border-slate-800 transition-colors duration-300 py-1 flex items-center justify-between">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent outline-none border-none text-sm text-[#0A1128] placeholder-slate-300 font-sans focus:ring-0 py-1"
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-slate-400 hover:text-slate-700 transition-colors focus:outline-none p-1"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FED362] hover:bg-[#FED362]/90 active:scale-[0.99] text-slate-900 py-4 rounded-xl font-sans text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_12px_rgba(254,211,98,0.15)] disabled:opacity-50 mt-8"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4.5 w-4.5 text-slate-900" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      PRESERVING...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-800" />
                      UPDATE PASSWORD
                      <ArrowRight className="w-4 h-4 ml-0.5 text-slate-800" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-6 space-y-6 flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif-display text-3xl font-semibold text-slate-900">
                  Password Restructured
                </h3>
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                  Your safe gateway code has been successfully updated in the archives. You can now access your historical preservation portal using your new credentials.
                </p>
              </div>

              <div className="w-full pt-4">
                <Link
                  to="/login"
                  className="w-full bg-[#FED362] hover:bg-[#FED362]/90 text-slate-900 py-4 rounded-xl font-sans text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
                >
                  Proceed to Login
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-px bg-slate-100 my-6" />

        {/* Back to Login Anchor */}
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-xs font-mono font-semibold text-slate-600 hover:text-slate-900 transition-colors duration-200 cursor-pointer self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>
      </motion.div>

      {/* Centered static footer as requested in the mockup */}
      <div className="text-center z-10 select-none mt-4">
        <p className="text-[10px] sm:text-xs font-sans tracking-wide text-slate-400 font-medium">
          &copy; 2024 Xinghuoji. The Eternal Spark. All rights reserved.
        </p>
      </div>
    </div>
  );
}
