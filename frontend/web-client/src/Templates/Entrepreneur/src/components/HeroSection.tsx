/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Camera, UserCheck, ShieldAlert } from 'lucide-react';
import { BiographyData, TemplateStyle } from '../types';
import { ThemeStyles } from '../theme';
import type { EditableImageTarget } from '../../../LifeJourney/types';

interface HeroSectionProps {
  data: BiographyData;
  style: TemplateStyle;
  styles: ThemeStyles;
  onImageChangeRequest?: (target: EditableImageTarget) => void;
}

export default function HeroSection({ data, style, styles, onImageChangeRequest }: HeroSectionProps) {
  
  const handleScrollToStory = (e: React.MouseEvent) => {
    e.preventDefault();
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Render different visual elements based on the selected theme style
  return (
    <section id="hero" className={`relative overflow-hidden pt-12 pb-20 md:py-28 transition-colors duration-500 ${styles.bodyBg}`}>
      {/* Visual background accents */}
      {style === 'heritage' && (
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-10 left-10 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#0A1F44]/10 rounded-full blur-3xl"></div>
          {/* Subtle line motif */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#C5A059]/20 hidden md:block"></div>
        </div>
      )}

      {style === 'modern' && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {/* Tech Grid Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          <div className="absolute -top-40 left-1/3 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl"></div>
        </div>
      )}

      {style === 'editorial' && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Editorial frame border */}
          <div className="absolute inset-x-4 inset-y-0 border-x border-stone-200 hidden md:block"></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            {/* Tag / Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <span className={`inline-flex items-center px-3.5 py-1 text-xs font-mono font-medium uppercase tracking-wider ${styles.badgeBg} ${styles.badgeText} ${styles.rounded}`}>
                <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                Entrepreneur Story Preset
              </span>
            </motion.div>

            {/* Main Title / Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none mb-3 ${styles.textTitle}`}
            >
              {data.name}
            </motion.h1>

            {/* Subtitle / Role */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`text-lg sm:text-xl md:text-2xl font-light mb-6 ${
                style === 'heritage' ? 'text-[#0A1F44]/90 font-serif italic' : style === 'modern' ? 'text-zinc-500' : 'text-stone-700 italic'
              }`}
            >
              {data.title}
            </motion.h2>

            {/* Accent divider line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`h-[1px] w-24 origin-left mb-8 ${
                style === 'heritage' ? 'bg-[#C5A059]' : style === 'modern' ? 'bg-emerald-500' : 'bg-stone-900'
              }`}
            ></motion.div>

            {/* Short Tagline / Quote block */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`mb-6 pl-4 border-l-2 ${
                style === 'heritage' ? 'border-[#C5A059] italic' : style === 'modern' ? 'border-emerald-500' : 'border-stone-900 italic'
              }`}
            >
              <p className={`text-lg sm:text-xl font-medium ${
                style === 'heritage' ? 'text-[#0A1F44]' : style === 'modern' ? 'text-zinc-800' : 'text-stone-900'
              }`}>
                "{data.tagline}"
              </p>
            </motion.div>

            {/* Brief introductory text */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className={`text-base sm:text-lg mb-8 max-w-2xl ${styles.textBody}`}
            >
              {data.introduction}
            </motion.p>

            {/* Call to action button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap gap-4 items-center"
            >
              <a
                href="#about"
                id="btn-read-story"
                onClick={handleScrollToStory}
                className={`inline-flex items-center px-7 py-4 text-sm font-semibold tracking-wide transition-all duration-300 transform active:scale-95 ${styles.accentBg} ${styles.rounded} ${
                  style !== 'editorial' ? 'shadow-md hover:shadow-lg hover:-translate-y-0.5' : ''
                }`}
              >
                Read My Story
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </motion.div>
          </div>

          {/* Right Column: Profile Image Layout */}
          <div className="lg:col-span-5 relative flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative w-full max-w-md"
            >
              {/* Outer decorative elements based on style */}
              {style === 'heritage' && (
                <>
                  {/* Elegant Golden and Navy Offset Frames */}
                  <div className="absolute -inset-3 border border-[#C5A059]/40 rounded-none -rotate-1 pointer-events-none"></div>
                  <div className="absolute -inset-1.5 bg-[#0A1F44]/5 rounded-none rotate-1 pointer-events-none"></div>
                  {/* Solid backing shadow */}
                  <div className="absolute bottom-4 -right-4 w-12 h-12 border-b border-r border-[#C5A059]"></div>
                  <div className="absolute top-4 -left-4 w-12 h-12 border-t border-l border-[#C5A059]"></div>
                </>
              )}

              {style === 'modern' && (
                <>
                  {/* Sleek, sharp, high-tech accents */}
                  <div className="absolute -inset-2 border-2 border-emerald-500/20 rounded-lg pointer-events-none"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 bg-emerald-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-4 right-4 bg-zinc-900 text-white font-mono text-[10px] py-1 px-2.5 rounded shadow tracking-widest uppercase">
                    SYS_FOUNDER_PORTRAIT
                  </div>
                </>
              )}

              {style === 'editorial' && (
                <>
                  {/* Heavy double-border frame layout */}
                  <div className="absolute -inset-4 border border-stone-900 pointer-events-none"></div>
                  <div className="absolute -inset-1 border border-stone-900/40 pointer-events-none"></div>
                </>
              )}

              {/* Main Portrait Box */}
              <div className={`overflow-hidden relative group group/image aspect-[4/5] bg-stone-100 ${styles.shadow} ${
                style === 'heritage' ? 'rounded-2xl' : style === 'modern' ? 'rounded-lg' : 'rounded-none'
              }`}>
                <img
                  src={data.profileImageUrl || "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=800&auto=format&fit=crop"}
                  alt={`${data.name} portrait`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale-0 group-hover:scale-105 transition-transform duration-700"
                />
                {onImageChangeRequest && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onImageChangeRequest({ section: 'hero' });
                    }}
                    className="pointer-events-auto absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-black/85 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white opacity-100 shadow-lg backdrop-blur-sm transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#C5A059] sm:pointer-events-none sm:opacity-0 sm:group-hover/image:pointer-events-auto sm:group-hover/image:opacity-100 sm:group-focus-within/image:pointer-events-auto sm:group-focus-within/image:opacity-100"
                    aria-label="Change picture"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Change Picture
                  </button>
                )}
                
                {/* Text overlay caption on image hover */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-semibold tracking-wide">{data.name}</p>
                  <p className="text-xs text-stone-300 font-mono">{data.title}</p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
