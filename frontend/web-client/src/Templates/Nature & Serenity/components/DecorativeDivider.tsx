import React from 'react';

interface DividerProps {
  variant?: 'leaves' | 'river' | 'mountains' | 'pebbles' | 'branch';
  className?: string;
}

export default function DecorativeDivider({ variant = 'leaves', className = '' }: DividerProps) {
  return (
    <div className={`flex justify-center items-center py-4 md:py-6 ${className}`} id={`divider-${variant}`}>
      {variant === 'leaves' && (
        <svg
          className="w-48 h-12 text-[#97a97c]/60"
          viewBox="0 0 200 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Central stem */}
          <path d="M10 25 Q100 25 190 25" />
          {/* Leaf pairs */}
          <path d="M40 25 Q50 10 60 25 Q50 40 40 25" fill="currentColor" fillOpacity="0.1" />
          <path d="M80 25 Q90 10 100 25 Q90 40 80 25" fill="currentColor" fillOpacity="0.1" />
          <path d="M120 25 Q130 10 140 25 Q130 40 120 25" fill="currentColor" fillOpacity="0.1" />
          <path d="M160 25 Q170 10 180 25 Q170 40 160 25" fill="currentColor" fillOpacity="0.1" />
          {/* Tiny side twigs */}
          <path d="M50 25 L45 32" />
          <path d="M90 25 L85 32" />
          <path d="M130 25 L125 32" />
          <path d="M170 25 L165 32" />
        </svg>
      )}

      {variant === 'river' && (
        <svg
          className="w-full max-w-md h-8 text-[#97a97c]/50"
          viewBox="0 0 500 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          <path d="M0 15 Q125 0, 250 15 T500 15" />
          <path d="M15 20 Q135 10, 260 20 T485 20" strokeDasharray="5,10" />
          <path d="M40 10 Q160 20, 285 10 T460 10" strokeDasharray="30,15" />
        </svg>
      )}

      {variant === 'mountains' && (
        <svg
          className="w-32 h-10 text-[#d4a373]/60"
          viewBox="0 0 120 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Back mountain */}
          <path d="M10 28 L40 10 L70 28" />
          {/* Front mountain left */}
          <path d="M25 28 L55 5 L85 28" fill="currentColor" fillOpacity="0.05" />
          {/* Front mountain right */}
          <path d="M60 28 L80 15 L110 28" />
          {/* Sun/Moon */}
          <circle cx="95" cy="8" r="3" strokeWidth="1" strokeDasharray="1,2" />
        </svg>
      )}

      {variant === 'pebbles' && (
        <div className="flex gap-4 items-center justify-center">
          <span className="w-3 h-2 bg-[#97a97c]/50 rounded-full transform rotate-12"></span>
          <span className="w-5 h-3 bg-[#97a97c]/30 rounded-full transform -rotate-45"></span>
          <span className="w-4 h-4 bg-stone/30 rounded-full transform rotate-45"></span>
          <span className="w-6 h-3 bg-[#d4a373]/40 rounded-full transform -rotate-12 border border-stone-light/20"></span>
          <span className="w-3.5 h-2 bg-[#97a97c]/60 rounded-full transform rotate-90"></span>
        </div>
      )}

      {variant === 'branch' && (
        <svg
          className="w-56 h-14 text-[#97a97c]/60"
          viewBox="0 0 240 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          {/* Elegant branching curve */}
          <path d="M10 40 Q80 20, 230 15" />
          {/* Side twigs with leaves */}
          <path d="M70 29 Q90 10, 110 5" />
          <path d="M140 22 Q170 15, 185 5" />
          
          {/* Leaf icons */}
          <path d="M110 5 Q115 12, 105 15 Q95 8, 110 5" fill="currentColor" fillOpacity="0.1" />
          <path d="M185 5 Q192 10, 182 15 Q172 10, 185 5" fill="currentColor" fillOpacity="0.1" />
          <path d="M230 15 Q235 22, 222 25 Q212 18, 230 15" fill="currentColor" fillOpacity="0.15" />
        </svg>
      )}
    </div>
  );
}
