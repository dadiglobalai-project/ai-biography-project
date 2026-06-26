import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, CheckCircle2, UserCheck, Sparkles } from 'lucide-react';

interface SuccessViewProps {
  fullName: string;
  email: string;
  onContinue: () => void;
  type?: 'login' | 'register';
}

export default function SuccessView({ fullName, email, onContinue, type = 'login' }: SuccessViewProps) {
  const isLogin = type === 'login';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto p-1 text-center"
    >
      <div className="relative overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(10,17,40,0.04)] p-8 md:p-10">
        
        {/* Subtle top brand sparkle line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#FED362] to-amber-500" />

        {/* Ambient background light */}
        <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-50px] right-[-50px] w-40 h-40 bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />

        {/* Centered Success Icon with micro-animation */}
        <div className="relative flex justify-center mb-6 mt-2">
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 shadow-sm"
          >
            {isLogin ? <UserCheck className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
          </motion.div>
          
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 w-16 h-16 mx-auto rounded-full border border-dashed border-emerald-400/30 scale-125 pointer-events-none"
          />
        </div>

        {/* Success Header Titles */}
        <h2 className="font-serif-display text-3xl font-semibold text-[#0A1128] tracking-tight mb-2">
          {isLogin ? 'Login Successful' : 'Account Created'}
        </h2>
        
        <p className="text-slate-500 text-sm font-sans px-2 leading-relaxed mb-8">
          {isLogin ? (
            <>
              Welcome back, <span className="font-semibold text-slate-800">{fullName}</span>! You have successfully established a secure gateway session.
            </>
          ) : (
            <>
              Welcome, <span className="font-semibold text-slate-800">{fullName}</span>! Your unique digital legacy spark has been safely archived in the constellations repository.
            </>
          )}
        </p>

        {/* Simplified Auth Session Meta Block */}
        <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-4 mb-8 text-left space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono">AUTHORIZED AS</span>
            <span className="font-mono text-[#0A1128] font-semibold truncate max-w-[200px]">{email}</span>
          </div>
          <div className="h-px bg-slate-200/60" />
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono">SESSION STATUS</span>
            <span className="font-sans text-emerald-600 font-bold tracking-wide flex items-center gap-1 uppercase">
              <ShieldCheck className="w-3.5 h-3.5" /> SECURED & ACTIVE
            </span>
          </div>
        </div>

        {/* Enter Sanctuary Button */}
        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#FED362] hover:bg-[#FED362]/90 active:scale-[0.99] text-slate-900 font-sans text-xs font-bold tracking-wider uppercase transition-all duration-200 shadow-[0_4px_12px_rgba(254,211,98,0.15)] cursor-pointer"
        >
          {isLogin ? 'ENTER YOUR MEMORIAL SANCTUARY' : 'PROCEED TO MEMORIAL GATE'}
          <ArrowRight className="w-4 h-4 ml-0.5 text-slate-900" />
        </button>

        {/* Small thematic caption footer */}
        <p className="mt-5 text-[11px] text-slate-400 italic">
          "Every story is an artifact of the universal library."
        </p>

      </div>
    </motion.div>
  );
}
