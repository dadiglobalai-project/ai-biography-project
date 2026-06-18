import React from 'react';
import { LegalDocument } from '../types';
import { Shield, X } from 'lucide-react';

interface LegalModalProps {
  document: LegalDocument | null;
  onClose: () => void;
}

export default function LegalModal({ document, onClose }: LegalModalProps) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-legacy-navy/70 backdrop-blur-md transition-opacity duration-300">
      <div 
        className="relative w-full max-w-2xl bg-white border border-legacy-gold/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-legacy-gold to-legacy-navy" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-legacy-gold/10 text-legacy-gold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg text-legacy-navy font-semibold tracking-wider">
                {document.title}
              </h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                LAST REVISED: {document.lastUpdated.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-legacy-navy transition-all duration-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto space-y-6 text-gray-600 leading-relaxed font-sans text-sm scrollbar-thin scrollbar-thumb-legacy-gold">
          {document.content.map((paragraph, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-legacy-gold/5 text-legacy-gold font-mono text-xs font-semibold mt-0.5">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <p className="flex-1 text-gray-700">{paragraph}</p>
            </div>
          ))}
          <div className="p-4 rounded-xl bg-legacy-paper border border-legacy-gold/10 text-xs text-legacy-navy/80 italic mt-4 font-serif-display text-base">
            "We believe that the stories of our human families constitute the primary star-map of history, and must be guarded from revision or erasure forever."
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-6 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-legacy-navy hover:bg-legacy-navy-light text-white font-cinzel text-xs tracking-wider font-semibold shadow transition-all duration-200 hover:-translate-y-0.5"
          >
            ACKNOWLEDGE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
