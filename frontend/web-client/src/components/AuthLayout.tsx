import React from 'react';
import { AnimatePresence } from 'motion/react';

import BrandLogo from './BrandLogo';
import LegalModal from './LegalModal';
import { LegalDocument } from '../types';

interface AuthLayoutProps {
  children: React.ReactNode;
  selectedLegalDoc: LegalDocument | null;
  onCloseLegalDoc: () => void;
}

export default function AuthLayout({ children, selectedLegalDoc, onCloseLegalDoc }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans select-none selection:bg-legacy-gold/30">
      <div
        id="archival-heritage-hero"
        className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative items-stretch overflow-hidden select-none"
      >
        <img
          src="/src/assets/images/celestial_library_1781657848291.jpg"
          alt="Xinghuoji Archival Sanctuary"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[12000ms] hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-legacy-navy/95 via-legacy-navy/60 to-legacy-navy/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/40 via-transparent to-legacy-navy/20" />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[25%] left-[20%] w-20 h-20 bg-legacy-gold/20 rounded-full blur-2xl animate-ambient-pulse" />
          <div className="absolute bottom-[35%] right-[15%] w-32 h-32 bg-amber-500/10 rounded-full blur-3xl animate-ambient-pulse [animation-delay:3s]" />
        </div>

        <div className="relative w-full flex flex-col justify-between p-12 select-text text-white">
          <BrandLogo variant="hero" />

          <div className="max-w-md my-auto space-y-8 pr-4">
            <h1 className="font-serif-display text-4xl xl:text-5xl font-medium tracking-tight text-white leading-tight">
              Every life is a star in the constellation of history.
            </h1>

            <div className="flex gap-4">
              <div className="w-[3px] bg-gradient-to-b from-legacy-gold via-legacy-gold/60 to-transparent self-stretch rounded-full" />
              <blockquote className="italic font-serif-display text-xl text-legacy-gold-light/90 leading-relaxed">
                "To be forgotten is to die twice. We are here to ensure your spark never fades."
              </blockquote>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-mono tracking-[0.25em] text-gray-400 select-none">
            <span>EST. 2024</span>
            <span className="h-px bg-legacy-gold/35 flex-1 max-w-[80px]" />
            <span className="text-legacy-gold-light/70 uppercase">Digital Archive of Humanity</span>
          </div>
        </div>
      </div>

      <div
        id="registration-portal-panel"
        className="w-full lg:w-[55%] xl:w-[50%] bg-white flex flex-col justify-center relative p-6 sm:p-10 md:p-16 overflow-y-auto"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-legacy-gold/[0.02] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-sky-200/[0.02] rounded-full blur-3xl pointer-events-none" />
        {children}
      </div>

      <AnimatePresence>
        {selectedLegalDoc && (
          <LegalModal
            document={selectedLegalDoc}
            onClose={onCloseLegalDoc}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
