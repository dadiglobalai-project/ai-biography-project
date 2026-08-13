/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, CheckCircle, ExternalLink, Menu, X } from 'lucide-react';
import { biographyData } from './data';
import { themeStylesMap } from './theme';
import { TemplateStyle } from './types';

// Import our modular subcomponents
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import JourneySection from './components/JourneySection';
import GallerySection from './components/GallerySection';
import StoriesSection from './components/StoriesSection';
import ContactSection from './components/ContactSection';

export default function App() {
  const currentStyle: TemplateStyle = 'heritage';
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const styles = themeStylesMap[currentStyle];

  // Monitor scroll height to show back-to-top buttons
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareClick = () => {
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const handlePrintClick = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-500 ${styles.bodyBg} selection:bg-[#C5A059]/30 selection:text-[#0A1F44]`}>
      
      {/* 2. Main Public Biography Website Navigation Header */}
      <header className={`border-b transition-colors duration-500 z-30 sticky top-0 ${styles.cardBg} ${styles.borderLight}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo / Monogram */}
            <a 
              href="#" 
              onClick={(e) => { handleScrollTo('hero', e); setMobileMenuOpen(false); }} 
              className={`flex items-center space-x-2.5 group`}
            >
              <div className={`w-9 h-9 flex items-center justify-center font-bold font-serif text-sm transition-all duration-300 ${
                currentStyle === 'heritage' 
                  ? 'bg-[#0A1F44] text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-white rounded-none shadow-sm' 
                  : currentStyle === 'modern' 
                    ? 'bg-zinc-900 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-zinc-950 rounded' 
                    : 'bg-stone-950 text-white rounded-none border border-stone-800'
              }`}>
                DC
              </div>
              <div>
                <span className={`block text-sm font-bold tracking-tight leading-none ${
                  currentStyle === 'heritage' ? 'font-serif text-navy-950' : currentStyle === 'modern' ? 'font-sans text-zinc-900' : 'font-serif text-stone-950'
                }`}>
                  {biographyData.name}
                </span>
                <span className="block text-[10px] font-mono tracking-widest text-stone-400 uppercase mt-0.5">
                  Archives &amp; Legacy
                </span>
              </div>
            </a>

            {/* Nav anchors list (smooth-scrolling - Desktop Only) */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {[
                { id: 'about', label: 'About' },
                { id: 'journey', label: 'Life Journey' },
                { id: 'gallery', label: 'Gallery' },
                { id: 'stories', label: 'Memories' },
                { id: 'contact', label: 'Contact' }
              ].map((navItem) => (
                <a
                  key={navItem.id}
                  href={`#${navItem.id}`}
                  onClick={(e) => handleScrollTo(navItem.id, e)}
                  className={`text-xs font-mono font-medium tracking-wider uppercase transition-colors duration-200 ${
                    currentStyle === 'heritage' ? 'text-[#0A1F44]/75 hover:text-[#C5A059]' : currentStyle === 'modern' ? 'text-zinc-600 hover:text-emerald-500' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {navItem.label}
                </a>
              ))}
            </nav>

            {/* Hamburger button (Mobile Only) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded focus:outline-none hover:bg-stone-100/50 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className={`w-6 h-6 ${currentStyle === 'heritage' ? 'text-[#0A1F44]' : 'text-stone-900'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${currentStyle === 'heritage' ? 'text-[#0A1F44]' : 'text-stone-900'}`} />
              )}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer (Mobile Only) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={`md:hidden border-t overflow-hidden ${styles.cardBg} ${styles.borderLight}`}
            >
              <div className="px-4 py-6 space-y-4">
                {[
                  { id: 'about', label: 'About' },
                  { id: 'journey', label: 'Life Journey' },
                  { id: 'gallery', label: 'Gallery' },
                  { id: 'stories', label: 'Memories' },
                  { id: 'contact', label: 'Contact' }
                ].map((navItem) => (
                  <a
                    key={navItem.id}
                    href={`#${navItem.id}`}
                    onClick={(e) => {
                      handleScrollTo(navItem.id, e);
                      setMobileMenuOpen(false);
                    }}
                    className={`block py-2 text-sm font-mono font-medium tracking-wider uppercase transition-colors duration-200 ${
                      currentStyle === 'heritage' ? 'text-[#0A1F44]/85 hover:text-[#C5A059]' : currentStyle === 'modern' ? 'text-zinc-700 hover:text-emerald-500' : 'text-stone-700 hover:text-stone-950'
                    }`}
                  >
                    {navItem.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 3. Main Biography Content Flow */}
      <main className="flex-grow">
        
        {/* Hero Section */}
        <HeroSection data={biographyData} style={currentStyle} styles={styles} />

        {/* About & Core Character Values Section */}
        <AboutSection data={biographyData} style={currentStyle} styles={styles} />

        {/* Timeline Life Journey Section */}
        <JourneySection data={biographyData} style={currentStyle} styles={styles} />

        {/* Media Photo & Video Gallery Section */}
        <GallerySection data={biographyData} style={currentStyle} styles={styles} />

        {/* Personal Stories / Blog Section */}
        <StoriesSection data={biographyData} style={currentStyle} styles={styles} />

        {/* Contact Form Section */}
        <ContactSection data={biographyData} style={currentStyle} styles={styles} />

      </main>

      {/* 4. Elegant Public Website Footer */}
      <footer className={`border-t transition-colors duration-500 py-8 ${
        currentStyle === 'heritage' 
          ? 'bg-[#0A1F44] text-white border-[#C5A059]/10' 
          : currentStyle === 'modern' 
            ? 'bg-zinc-900 text-zinc-300 border-zinc-800' 
            : 'bg-stone-950 text-stone-300 border-stone-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Copyright & Platform Disclosure */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono text-stone-500">
            <div>
              &copy; {new Date().getFullYear()} Daniel Chen. All rights reserved. 
              <span className="mx-2">|</span>
              Preserved by Chen Legacy Trust.
            </div>
            

          </div>

        </div>
      </footer>

      {/* 5. Back to Top Floating Action Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            id="back-to-top-button"
            onClick={handleScrollTop}
            className={`fixed bottom-6 right-6 p-3 z-40 shadow-xl border cursor-pointer hover:-translate-y-0.5 active:scale-95 transition-all duration-200 ${
              currentStyle === 'heritage' 
                ? 'bg-[#C5A059] text-white border-[#C5A059]/80 hover:bg-[#C5A059]/90' 
                : currentStyle === 'modern' 
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 hover:bg-emerald-600' 
                  : 'bg-stone-900 text-white border-stone-750 hover:bg-stone-800'
            } ${currentStyle === 'heritage' || currentStyle === 'editorial' ? 'rounded-none' : 'rounded-full'}`}
            title="Scroll to Top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 6. Share Link Visual Notification Toast (Visual Feedback) */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            id="share-notification-toast"
            className="fixed bottom-8 left-1/2 z-50 transform -translate-x-1/2 bg-stone-950 border border-stone-800 text-white py-3 px-5 rounded-lg shadow-2xl flex items-center space-x-2.5"
          >
            <CheckCircle className="w-4.5 h-4.5 text-green-500 flex-shrink-0" />
            <span className="text-xs font-mono font-medium">
              Share link copied to clipboard! (Preview Mode)
            </span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
