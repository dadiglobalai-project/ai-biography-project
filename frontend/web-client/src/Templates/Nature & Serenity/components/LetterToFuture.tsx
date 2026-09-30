import React from 'react';
import { BIO_DATA } from '../data';
import { BookOpen, Sparkles, Pencil } from 'lucide-react';

export default function LetterToFuture() {
  return (
    <section id="letter" className="py-10 md:py-12 bg-transparent relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sage/5 to-transparent pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-sage font-bold inline-flex items-center gap-1.5 mb-3">
            <BookOpen className="w-3.5 h-3.5" /> Chapter VI
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-forest font-bold tracking-tight">
            A Letter to the Future
          </h2>
          <p className="text-stone-light text-xs sm:text-sm italic mt-2">
            A message captured in graphite and preserved within a leather-bound notebook.
          </p>
        </div>

        {/* OPEN NOTEBOOK CONTAINER (On frosted table background) */}
        <div className="relative bg-white/20 backdrop-blur-md rounded-[40px] p-4 sm:p-6 md:p-8 shadow-lg border border-white/35 max-w-4xl mx-auto group">
          {/* Leather binder spine ring details */}
          <div className="absolute inset-y-12 left-1/2 -translate-x-1/2 w-8 bg-forest/30 backdrop-blur-sm rounded-full hidden md:flex flex-col justify-between py-6 shadow-inner z-20 border border-white/20">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="w-6 h-1 bg-white/70 rounded-full mx-auto shadow-sm"></span>
            ))}
          </div>

          {/* Left and Right Page Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/20 rounded-[30px] overflow-hidden shadow-inner relative">
            
            {/* Left Page of Notebook */}
            <div className="bg-[#faf5e8]/95 p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[400px]">
              {/* Paper horizontal lines */}
              <div className="absolute inset-0 bg-[linear-gradient(#00000008_1px,transparent_1px)] bg-[size:100%_28px] pointer-events-none opacity-40"></div>
              {/* Vertical red margin line */}
              <div className="absolute top-0 bottom-0 left-8 w-0.5 bg-red-200 pointer-events-none"></div>

              <div className="relative z-10 pl-6">
                <div className="flex items-center gap-1.5 text-stone-light text-[10px] uppercase tracking-widest mb-6 font-mono font-bold">
                  <Pencil className="w-3.5 h-3.5 text-sage" />
                  <span>Woodland Journal</span>
                </div>

                <h3 className="font-serif text-2xl text-forest italic font-bold mb-6">
                  {BIO_DATA.letter.salutation}
                </h3>

                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-forest-dark leading-relaxed font-bold font-serif">
                    {BIO_DATA.letter.paragraphs[0]}
                  </p>
                  <p className="text-xs sm:text-sm text-forest-dark leading-relaxed font-bold font-serif">
                    {BIO_DATA.letter.paragraphs[1]}
                  </p>
                </div>
              </div>

              {/* Page Number */}
              <div className="relative z-10 text-[10px] text-stone-light text-center mt-6 font-mono font-bold">
                PAGE 142
              </div>
            </div>

            {/* Right Page of Notebook */}
            <div className="bg-[#faf5e8]/95 p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[400px] border-t md:border-t-0 md:border-l border-white/20">
              {/* Paper horizontal lines */}
              <div className="absolute inset-0 bg-[linear-gradient(#00000008_1px,transparent_1px)] bg-[size:100%_28px] pointer-events-none opacity-40"></div>
              {/* Vertical red margin line */}
              <div className="absolute top-0 bottom-0 left-8 w-0.5 bg-red-200 pointer-events-none"></div>

              <div className="relative z-10 pl-6">
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-forest-dark leading-relaxed font-bold font-serif">
                    {BIO_DATA.letter.paragraphs[2]}
                  </p>
                  <p className="text-xs sm:text-sm text-forest-dark leading-relaxed font-bold font-serif">
                    {BIO_DATA.letter.paragraphs[3]}
                  </p>
                </div>

                {/* Signature section */}
                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-xs font-serif text-forest-dark mb-1 font-bold">{BIO_DATA.letter.signOff}</p>
                  <p className="font-cursive text-3xl text-sage-dark font-medium rotate-[-4deg] inline-block mt-1">
                    {BIO_DATA.letter.signature}
                  </p>
                </div>
              </div>

              {/* Page Number */}
              <div className="relative z-10 text-[10px] text-stone-light text-center mt-6 font-mono font-bold">
                PAGE 143
              </div>
            </div>

          </div>
        </div>

        {/* Decorative elements under notebook */}
        <div className="mt-12 text-center text-xs text-stone font-bold flex justify-center items-center gap-2">
          <Sparkles className="w-4 h-4 text-sage" />
          <span>Handcrafted on organic linen rag sheets. Preserved in Mendocino.</span>
        </div>

      </div>
    </section>
  );
}
