import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

export default function CheckEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'user@example.com';

  const [isResending, setIsResending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleResend = async () => {
    setIsResending(true);
    setToastMessage(null);
    setErrorMessage(null);
    try {
      await authService.forgotPassword(email);
      setToastMessage("A fresh authentic reset link has been dispatched to your inbox.");
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failure in triggering secondary reset sequence.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col justify-between items-center py-12 px-4 font-sans selection:bg-legacy-gold/30 overflow-hidden">
      {/* Soft gorgeous background gradient blur vectors matching Screenshot 2 */}
      <div className="absolute top-[-20%] left-[-10%] w-[550px] h-[550px] rounded-full bg-[#E2EAE7]/50 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#EAF0EE]/70 blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] right-[5%] w-[450px] h-[450px] rounded-full bg-amber-500/[0.03] blur-[100px] pointer-events-none" />

      {/* Elegant Header with only "Xinghuoji" text matching Screenshot 2 */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center text-center mt-6 z-10"
      >
        <h1 className="font-serif-display text-4xl sm:text-5xl font-medium tracking-wide text-[#0A1128]">
          Xinghuoji
        </h1>
      </motion.div>

      {/* Center Check Box Content Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-[0_12px_45px_rgba(10,17,40,0.04)] border border-slate-100/80 p-8 sm:p-10 z-10 flex flex-col text-center my-8"
        id="check-email-card"
      >
        {/* Envelope container frame exactly mirroring Picture 2 */}
        <div className="relative w-24 h-24 mx-auto bg-[#FBFDFD] border border-slate-100 rounded-3xl flex items-center justify-center shadow-sm mb-6">
          {/* Subtle concentric inner border frame */}
          <div className="absolute inset-1.5 border border-amber-100/30 rounded-2xl" />
          
          <Mail className="w-10 h-10 text-legacy-gold" strokeWidth={1.5} />
          
          {/* Mini Gold Tick badge at the bottom right */}
          <div className="absolute -bottom-1 -right-1 bg-emerald-550 bg-emerald-500 rounded-full p-1.5 border-2 border-white shadow-sm flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="font-serif-display text-3xl font-semibold text-[#0A1128] tracking-tight mt-6">
          Check Your Email
        </h2>

        <p className="text-sm text-slate-500 leading-relaxed font-sans max-w-sm mx-auto mt-4 px-1">
          We&apos;ve sent a password reset link to <strong className="font-semibold text-slate-800 break-all">{email}</strong>. Please check your inbox and follow the instructions to reset your password.
        </p>

        {/* Resend Confirmation Toasts */}
        <AnimatePresence mode="wait">
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs text-left flex items-start gap-2 mt-5 font-sans"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{toastMessage}</span>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs text-left flex items-start gap-2 mt-5 font-sans"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action button Return to Login mirroring Picture 2 */}
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-slate-950 hover:bg-slate-900 text-white py-4 rounded-lg font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-300 text-center block max-w-sm mx-auto mt-8 cursor-pointer shadow-md hover:shadow-lg"
        >
          Return to Login
        </button>

        <div className="text-xs text-slate-400 font-sans text-center mt-8">
          Didn&apos;t receive the email? Check your spam folder or
        </div>
        
        <button
          onClick={handleResend}
          disabled={isResending}
          className="text-xs font-mono font-bold text-legacy-gold hover:text-legacy-gold-dark select-none cursor-pointer text-center block transition-colors duration-200 mt-2 hover:underline disabled:text-slate-400"
        >
          {isResending ? "RESENDING REQUEST..." : "Resend Link"}
        </button>
      </motion.div>

      {/* Double line dynamic footer matching bottom of Picture 2 */}
      <div className="text-center z-10 select-none space-y-2.5 mt-4">
        <p className="text-[10px] sm:text-xs font-mono tracking-wider text-slate-400 font-medium">
          &copy; 2024 Xinghuoji. Preserving the Eternal Spark.
        </p>
        <div className="flex items-center justify-center gap-4 text-[10px] sm:text-xs font-mono tracking-wider text-slate-400 font-medium">
          <span className="hover:text-legacy-gold cursor-pointer transition-colors">Privacy Policy</span>
          <span className="text-slate-300">•</span>
          <span className="hover:text-legacy-gold cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </div>
    </div>
  );
}
