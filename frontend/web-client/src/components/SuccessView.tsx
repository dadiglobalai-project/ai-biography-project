import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Calendar, Hash, Mail, Award, CheckCircle2 } from 'lucide-react';

interface SuccessViewProps {
  fullName: string;
  email: string;
  onContinue: () => void;
}

export default function SuccessView({ fullName, email, onContinue }: SuccessViewProps) {
  // Let's generate a beautiful mock ledger key and certificate number
  const ledgerKey = `CEL-${Math.floor(100000 + Math.random() * 900000)}`;
  const signatureHash = `0x${Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('').toUpperCase()}`;
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-lg mx-auto p-1 text-center"
    >
      <div className="relative overflow-hidden bg-white border border-legacy-gold/30 rounded-2xl shadow-xl p-8 md:p-10">
        
        {/* Decorative corner borders for archival document vibe */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-legacy-gold/50" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-legacy-gold/50" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-legacy-gold/50" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-legacy-gold/50" />

        {/* Ambient background light */}
        <div className="absolute top-[-100px] left-[-100px] w-52 h-52 bg-legacy-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-100px] w-52 h-52 bg-legacy-gold/5 rounded-full blur-3xl" />

        {/* Centered Success Badge */}
        <div className="relative flex justify-center mb-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 shadow-sm border border-emerald-100"
          >
            <CheckCircle2 className="w-9 h-9" />
          </motion.div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 w-16 h-16 mx-auto rounded-full border border-dashed border-legacy-gold/40 scale-125"
          />
        </div>

        {/* Dynamic headings */}
        <h2 className="font-cinzel text-xl md:text-2xl text-legacy-navy font-bold tracking-wider mb-2">
          LEGACY SPACE PROVISIONED
        </h2>
        <p className="text-gray-500 text-sm font-sans mb-8">
          Your unique digital spark has been permanently cataloged in the constellations repository.
        </p>

        {/* Archival Certificate Display */}
        <div className="bg-legacy-paper border border-legacy-gold/15 rounded-xl p-5 md:p-6 mb-8 text-left space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-legacy-gold/10">
            <span className="font-cinzel text-xs tracking-wider text-legacy-gold font-bold">ARCHIVAL CREDENTIAL</span>
            <span className="font-mono text-xs font-semibold px-2 py-1 bg-legacy-navy/5 text-legacy-navy rounded">
              {ledgerKey}
            </span>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div className="flex">
              <span className="w-24 text-gray-400 font-mono">CUSTODIAN:</span>
              <span className="flex-1 text-gray-800 font-semibold">{fullName}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-400 font-mono">LEDGER MAIL:</span>
              <span className="flex-1 text-gray-800 font-mono break-all">{email}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-400 font-mono">CHARTER DATE:</span>
              <span className="flex-1 text-gray-800 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-legacy-gold" /> {currentDate}
              </span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-400 font-mono">STATUS:</span>
              <span className="flex-1 text-emerald-600 font-bold tracking-wider flex items-center gap-1.5 uppercase">
                <ShieldCheck className="w-3.5 h-3.5" /> SECURED & ACTIVE
              </span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-400 font-mono">SIGNATURE:</span>
              <span className="flex-1 text-gray-400 font-mono break-all font-light text-[10px]">
                {signatureHash}
              </span>
            </div>
          </div>
        </div>

        {/* Continue to Platform Button */}
        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-legacy-navy hover:bg-legacy-navy-light text-white font-cinzel text-xs font-semibold tracking-widest transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          ENTER YOUR MEMORIAL SANCTUARY
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>

        {/* Small motivational footer */}
        <p className="mt-4 text-[11px] text-gray-400 italic">
          "Every story is an artifact of the universal library. Yours is now preserved forever."
        </p>

      </div>
    </motion.div>
  );
}
