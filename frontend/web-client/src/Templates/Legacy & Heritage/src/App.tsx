import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Heart, Camera, Mail, History, Award, Sparkles, Feather, 
  Calendar, MapPin, Play, Quote, Image as ImageIcon, FileText, Send, 
  Share2, Compass, Bookmark, MessageSquare, ChevronRight, Flower, Clock, Map,
  X, Volume2, VolumeX
} from 'lucide-react';
import { MILESTONES, GALLERY_ITEMS, STORIES, VALUES, INTERESTS } from './data';
import type {
  BiographyCategory,
  EditableImageTarget,
  EditableTemplateSection,
} from '../../LifeJourney/types';

interface LegacyHeritageAppProps {
  data?: BiographyCategory;
  activeEditSection?: EditableTemplateSection | null;
  onEditSectionChange?: (section: EditableTemplateSection) => void;
  onImageChangeRequest?: (target: EditableImageTarget) => void;
}

export default function App({
  data,
  activeEditSection = null,
  onEditSectionChange,
  onImageChangeRequest,
}: LegacyHeritageAppProps) {
  const [selectedItem, setSelectedItem] = useState<null | typeof GALLERY_ITEMS[0]>(null);
  const isEditable = Boolean(onEditSectionChange);
  const isImageEditable = Boolean(onImageChangeRequest);
  const heroImageUrl =
    data?.personalDetails.profileImageUrl ||
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600";
  const displayMilestones = MILESTONES.map((milestone, index) => ({
    ...milestone,
    image: data?.timeline[index]?.imageUrl || milestone.image,
  }));
  const displayGalleryItems = GALLERY_ITEMS.map((item, index) => ({
    ...item,
    id: data?.gallery[index]?.id || item.id,
    url: data?.gallery[index]?.imageUrl || item.url,
  }));
  const displayStories = STORIES.map((story, index) => ({
    ...story,
    id: data?.stories[index]?.id || story.id,
    image: data?.stories[index]?.imageUrl || story.image,
  }));
  const selectedGalleryIndex = selectedItem
    ? displayGalleryItems.findIndex((item) => item.id === selectedItem.id)
    : -1;
  
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  
  // Contact Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    relation: "Grandchild or Relative",
    message: ""
  });
  const [showFormSuccess, setShowFormSuccess] = useState(false);
  const [customRemembrances, setCustomRemembrances] = useState<Array<{
    name: string;
    relation: string;
    message: string;
    date: string;
  }>>([]);

  // Load remembrances from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("vance_sterling_remembrances");
    if (saved) {
      try {
        setCustomRemembrances(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved remembrances", e);
      }
    }
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;

    const newRemembrance = {
      name: formData.name,
      relation: formData.relation,
      message: formData.message,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    };

    const updated = [newRemembrance, ...customRemembrances];
    setCustomRemembrances(updated);
    localStorage.setItem("vance_sterling_remembrances", JSON.stringify(updated));

    setShowFormSuccess(true);
    setFormData({
      name: "",
      email: "",
      relation: "Grandchild or Relative",
      message: ""
    });

    // Reset success after some time
    setTimeout(() => {
      setShowFormSuccess(false);
    }, 6000);
  };

  const getEditHighlightClass = (section: EditableTemplateSection) => {
    if (!isEditable) {
      return '';
    }

    if (activeEditSection !== section) {
      return 'outline outline-0 outline-offset-8 outline-transparent transition-all duration-300';
    }

    return 'outline outline-4 outline-offset-8 outline-[#FED362] shadow-[0_0_0_8px_rgba(254,211,98,0.16),0_18px_45px_rgba(177,134,37,0.16)] transition-all duration-300';
  };

  const getSectionInteractionProps = (section: EditableTemplateSection) => ({
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (!isEditable) {
        return;
      }

      const target = event.target as HTMLElement;
      if (target.closest('a, button, input, textarea, select')) {
        return;
      }

      onEditSectionChange?.(section);
    },
  });

  const handleImageChangeRequest = (target: EditableImageTarget) => (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    onImageChangeRequest?.(target);
  };

  const renderChangePictureButton = (target: EditableImageTarget) => {
    if (!isImageEditable) {
      return null;
    }

    return (
      <button
        type="button"
        onClick={handleImageChangeRequest(target)}
        className="pointer-events-auto absolute bottom-3 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-artistic-dark/90 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white opacity-100 shadow-lg backdrop-blur-sm transition hover:bg-artistic-text focus:outline-none focus:ring-2 focus:ring-artistic-gold sm:pointer-events-none sm:opacity-0 sm:group-hover/image:pointer-events-auto sm:group-hover/image:opacity-100 sm:group-focus-within/image:pointer-events-auto sm:group-focus-within/image:opacity-100"
        aria-label="Change picture"
      >
        <Camera className="h-3.5 w-3.5 text-artistic-gold" />
        Change Picture
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-artistic-bg artistic-radial-bg text-artistic-text font-serif selection:bg-artistic-gold/30 selection:text-artistic-text pb-16">
      
      {/* Platform Preview Header (Elegant banner) */}
      <div className="w-full bg-artistic-dark text-artistic-light border-b border-artistic-gold/20 py-3 px-4 text-center text-xs font-mono tracking-widest uppercase flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-artistic-gold" />
          <span>ESTABLISHED ARCHIVE • EST. 2026</span>
        </div>
        <div className="hidden sm:block">
          <span>MEMORIES ARE THE HEIRLOOMS OF THE SOUL</span>
        </div>
        <div></div>
      </div>

      {/* Main Bound Scrapbook Layout Wrapper */}
      <div className="max-w-7xl lg:max-w-[1450px] mx-auto px-2 sm:px-4 lg:px-6 pt-6">
        
        {/* Leather Binding Spine Effect (Top spine for horizontal opened notebook feel) */}
        <div className="w-full h-4 bg-gradient-to-r from-artistic-dark via-[#7c5a43] to-artistic-dark rounded-t-lg border-t border-x border-artistic-dark/40 relative shadow-md flex justify-around items-center px-12">
          {/* Scrapbook Stitches */}
          <div className="w-24 h-1 bg-artistic-text/60 rounded-full border-b border-artistic-gold/20"></div>
          <div className="w-24 h-1 bg-artistic-text/60 rounded-full border-b border-artistic-gold/20"></div>
          <div className="w-24 h-1 bg-artistic-text/60 rounded-full border-b border-artistic-gold/20"></div>
          <div className="w-24 h-1 bg-artistic-text/60 rounded-full border-b border-artistic-gold/20"></div>
        </div>

        {/* The Open Book Board */}
        <div className="bg-artistic-light paper-grain rounded-b-lg border-x-8 border-b-8 border-artistic-dark shadow-2xl relative overflow-hidden vintage-double-border">
          
          {/* Fine gold ornate corners */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-artistic-gold/50 pointer-events-none rounded-tl-sm"></div>
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-artistic-gold/50 pointer-events-none rounded-tr-sm"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-artistic-gold/50 pointer-events-none rounded-bl-sm"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-artistic-gold/50 pointer-events-none rounded-br-sm"></div>

          {/* Nav / Heritage Badge Bar */}
          <header className="pt-12 pb-8 px-6 sm:px-12 border-b border-artistic-gold/20 flex flex-col items-center">
            
            {/* Elegant Wax Seal Icon Group */}
            <div className="mb-4 relative">
              <div className="w-16 h-16 bg-[#7c1a1a] rounded-full flex items-center justify-center shadow-lg border border-[#561010] transform rotate-3 select-none hover:rotate-6 transition-transform duration-300">
                <div className="absolute inset-1.5 rounded-full border border-dashed border-[#a63a3a] opacity-50"></div>
                {/* Stamp Icon: Monogram or Rose */}
                <span className="font-serif font-bold text-artistic-light text-2xl tracking-tighter opacity-80 mt-[-2px]">E</span>
              </div>
              <div className="absolute -bottom-1 -right-4 bg-artistic-gold text-[9px] font-mono px-1.5 py-0.5 rounded tracking-wider text-artistic-text border border-artistic-dark/20 shadow-sm uppercase transform rotate-12">
                VERIFIED
              </div>
            </div>

            {/* Title / Crest */}
            <h1 className="font-serif text-3xl sm:text-4xl text-center font-bold tracking-wide text-artistic-text uppercase">
              Legacy &amp; Heritage
            </h1>
            
            {/* Elegant Floral Divider */}
            <div className="w-64 h-6 my-3 flex items-center justify-center text-artistic-gold relative">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-artistic-gold to-transparent"></div>
              <div className="absolute bg-artistic-light px-3 flex items-center gap-1 text-artistic-gold">
                <Flower className="w-4 h-4" />
                <span className="text-[10px] tracking-widest font-serif font-medium">EST. 1922</span>
                <Flower className="w-4 h-4" />
              </div>
            </div>

            {/* Clickable navigation tabs (Visual Scrapbook Pages) */}
            <nav className="mt-4 flex flex-wrap gap-2 sm:gap-4 justify-center text-xs tracking-widest font-medium uppercase text-artistic-text/70">
              <button 
                onClick={() => scrollToSection("hero-section")}
                className="px-3 py-1 bg-artistic-panel/50 rounded border border-artistic-gold/20 text-artistic-text font-semibold shadow-sm hover:bg-artistic-gold/10 hover:text-artistic-gold transition-all duration-200 cursor-pointer focus:outline-none"
              >
                1. The Matriarch
              </button>
              <button 
                onClick={() => scrollToSection("about-section")}
                className="px-3 py-1 bg-artistic-panel/50 rounded border border-artistic-gold/20 text-artistic-text font-semibold shadow-sm hover:bg-artistic-gold/10 hover:text-artistic-gold transition-all duration-200 cursor-pointer focus:outline-none"
              >
                2. Chronicle &amp; Values
              </button>
              <button 
                onClick={() => scrollToSection("timeline-section")}
                className="px-3 py-1 bg-artistic-panel/50 rounded border border-artistic-gold/20 text-artistic-text font-semibold shadow-sm hover:bg-artistic-gold/10 hover:text-artistic-gold transition-all duration-200 cursor-pointer focus:outline-none"
              >
                3. The Life Journey
              </button>
              <button 
                onClick={() => scrollToSection("gallery-section")}
                className="px-3 py-1 bg-artistic-panel/50 rounded border border-artistic-gold/20 text-artistic-text font-semibold shadow-sm hover:bg-artistic-gold/10 hover:text-artistic-gold transition-all duration-200 cursor-pointer focus:outline-none"
              >
                4. Family Album
              </button>
              <button 
                onClick={() => scrollToSection("stories-section")}
                className="px-3 py-1 bg-artistic-panel/50 rounded border border-artistic-gold/20 text-artistic-text font-semibold shadow-sm hover:bg-artistic-gold/10 hover:text-artistic-gold transition-all duration-200 cursor-pointer focus:outline-none"
              >
                5. Written Memoirs
              </button>
              <button 
                onClick={() => scrollToSection("contact-section")}
                className="px-3 py-1 bg-artistic-panel/50 rounded border border-artistic-gold/20 text-artistic-text font-semibold shadow-sm hover:bg-artistic-gold/10 hover:text-artistic-gold transition-all duration-200 cursor-pointer focus:outline-none"
              >
                6. Send Letter
              </button>
            </nav>
          </header>

          {/* 1. HERO SECTION */}
          <section id="hero-section" className={`${getEditHighlightClass('hero')} py-12 px-6 sm:px-12 md:px-16 grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative border-b border-artistic-gold/20`} {...getSectionInteractionProps('hero')}>
            
            {/* Antique Postmark background embellishment */}
            <div className="absolute top-10 right-10 w-32 h-32 rounded-full border-2 border-dashed border-artistic-gold/30 flex flex-col items-center justify-center text-[10px] text-artistic-gold/40 font-mono tracking-widest uppercase rotate-12 pointer-events-none select-none">
              <span className="text-center font-bold">ARLINGTON VT</span>
              <span className="my-1 border-y border-artistic-gold/20 py-0.5">OCT 12 1922</span>
              <span>HERITAGE COMM.</span>
            </div>

            {/* Left Column: Portrait in Vintage Gold Frame */}
            <div className="md:col-span-5 flex justify-center relative">
              <div className="relative p-4 bg-white shadow-xl border border-artistic-dark/10 transform -rotate-2 hover:rotate-0 transition-transform duration-500 max-w-sm w-full group">
                
                {/* Vintage Scrapbook Corners */}
                <div className="photo-corner-tl"></div>
                <div className="photo-corner-tr"></div>
                <div className="photo-corner-bl"></div>
                <div className="photo-corner-br"></div>
                
                {/* Double frame borders */}
                <div className="border border-artistic-gold/20 p-2 bg-artistic-light">
                  <div className="overflow-hidden bg-artistic-dark aspect-[3/4] relative group/image">
                    <img 
                      src={heroImageUrl} 
                      alt="Eleanor Vance Sterling" 
                      className="w-full h-full object-cover vintage-photo-sepia object-top"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-artistic-dark/40 via-transparent to-transparent pointer-events-none"></div>
                    {renderChangePictureButton({ section: 'hero' })}
                  </div>
                  
                  {/* Under-photo handwritten label */}
                  <div className="pt-3 text-center pb-1">
                    <p className="font-script text-2xl text-artistic-text tracking-wide">
                      Eleanor Vance, autumn of 1943
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-artistic-text/50 mt-1">
                      Wellesley, MA — Photo mount 402
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Title and Bio Brief */}
            <div className="md:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-artistic-gold font-semibold flex items-center gap-2">
                  <Feather className="w-3.5 h-3.5" />
                  THE LIVING CHRONICLE
                </span>
                <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-artistic-text">
                  Eleanor Vance Sterling
                </h2>
                <p className="font-serif italic text-lg text-artistic-dark">
                  &ldquo;A life of grace, a legacy of stories, and a family&rsquo;s eternal treasure.&rdquo;
                </p>
                <div className="text-xs font-mono text-artistic-text/60 flex items-center gap-4 pt-1">
                  <span className="bg-artistic-panel px-2 py-0.5 rounded border border-artistic-gold/15 font-semibold">
                    Born: Oct 12, 1922
                  </span>
                  <span className="bg-artistic-panel px-2 py-0.5 rounded border border-artistic-gold/15 font-semibold">
                    Passed: Mar 4, 2018
                  </span>
                </div>
              </div>

              <p className="text-base text-artistic-text leading-relaxed font-serif">
                Welcome to the living archive of Eleanor Vance Sterling—matriarch, educator, and gardener of memories. This digital scrapbook preserves her handwritten diaries, treasured photographs, and the timeless milestones of a beautiful century well-lived. It serves as an heirloom passed down to anchor future generations in their native soil.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={() => scrollToSection("stories-section")}
                  className="px-6 py-2.5 border border-artistic-text text-xs uppercase tracking-widest hover:bg-artistic-text hover:text-white transition-colors cursor-pointer flex items-center gap-2 focus:outline-none"
                >
                  <BookOpen className="w-4 h-4 text-artistic-gold" />
                  Read My Story
                </button>
                <button 
                  onClick={() => scrollToSection("gallery-section")}
                  className="px-6 py-2.5 border border-artistic-text/40 text-xs uppercase tracking-widest hover:border-artistic-text hover:bg-artistic-panel/50 transition-colors cursor-pointer flex items-center gap-2 focus:outline-none"
                >
                  <Camera className="w-4 h-4 text-artistic-gold" />
                  View Photo Album
                </button>
              </div>

              {/* Pressed Leaf Decoration */}
              <div className="pt-4 flex items-center gap-3 opacity-60">
                <div className="h-[1px] w-12 bg-artistic-gold/30"></div>
                <Flower className="w-5 h-5 text-artistic-gold" />
                <span className="text-[11px] font-mono tracking-wider uppercase text-artistic-text/60">
                  Vermont Heritage Press Archive
                </span>
                <div className="h-[1px] w-12 bg-artistic-gold/30"></div>
              </div>
            </div>
          </section>

          {/* 2. ABOUT & VALUES SECTION */}
          <section id="about-section" className={`${getEditHighlightClass('about')} py-16 px-6 sm:px-12 bg-artistic-panel/30 border-b border-artistic-gold/20 relative`} {...getSectionInteractionProps('about')}>
            
            {/* Elegant Background Stamp */}
            <div className="absolute bottom-8 right-8 w-40 h-40 opacity-[0.03] pointer-events-none">
              <svg className="w-full h-full text-artistic-text" fill="currentColor" viewBox="0 0 100 100">
                <path d="M50 0 C22 0 0 22 0 50 C0 78 22 100 50 100 C78 100 100 78 100 50 C100 22 78 0 50 0 Z M50 90 C28 90 10 72 10 50 C10 28 28 10 50 10 C72 10 90 28 90 50 C90 72 72 90 50 90 Z" />
              </svg>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              
              {/* Header */}
              <div className="text-center space-y-2">
                <span className="font-script text-4xl text-artistic-gold font-medium">Chapter I</span>
                <h3 className="font-serif text-3xl font-bold tracking-tight text-artistic-text uppercase">
                  The Essence of Eleanor
                </h3>
                <div className="w-24 h-[1px] bg-artistic-gold mx-auto"></div>
              </div>

              {/* Bio Summary Paper Panel */}
              <div className="bg-artistic-light p-6 sm:p-10 rounded-sm border border-artistic-gold/20 shadow-md relative">
                <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-artistic-gold/40"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-artistic-gold/40"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-artistic-gold/40"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-artistic-gold/40"></div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-artistic-gold" />
                    <h4 className="font-serif text-xl font-bold text-artistic-text">Biography Summary</h4>
                  </div>
                  <p className="text-artistic-text/90 leading-relaxed font-serif text-base sm:text-lg">
                    Born in the gentle hills of New England, Eleanor lived through the unfolding tapestry of the 20th century. Her life was defined by a quiet passion for literature, a devotion to teaching three generations of children, and a legendary rose garden that bloomed every June. She was a woman who spoke in elegant paragraphs, wrote letters in impeccable copperplate script, and believed that even the smallest memories deserved to be beautifully preserved.
                  </p>
                  <p className="text-artistic-text/90 leading-relaxed font-serif text-base">
                    Through war, peace, the turn of a millennium, and the rapid pace of modern technology, she remained a steadfast custodian of old-world grace. This digital tribute is our humble effort to keep her lamp burning, sharing the quiet wisdom she cultivated in her Vermont schoolhouse and home garden.
                  </p>
                </div>
              </div>

              {/* Personal Values Grid */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 justify-center">
                  <History className="w-5 h-5 text-artistic-gold" />
                  <h4 className="font-serif text-lg font-bold uppercase tracking-wider text-artistic-text">
                    The Pillars of Her Life
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {VALUES.map((val, idx) => (
                    <div 
                      key={idx}
                      className="bg-artistic-light p-6 rounded-sm border border-artistic-gold/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="space-y-3">
                        <div className="w-8 h-8 rounded-full bg-artistic-panel border border-artistic-gold/30 flex items-center justify-center text-artistic-text text-xs font-serif font-bold">
                          {idx + 1}
                        </div>
                        <h5 className="font-serif text-lg font-bold text-artistic-text">{val.title}</h5>
                        <p className="font-serif italic text-sm text-artistic-dark leading-relaxed">
                          &ldquo;{val.quote}&rdquo;
                        </p>
                      </div>
                      <p className="text-xs text-artistic-text/80 mt-4 leading-relaxed font-sans">
                        {val.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* SPECIALIZED PURSUITS SECTION */}
          <section id="pursuits-section" className={`${getEditHighlightClass('pursuits')} py-16 px-6 sm:px-12 bg-artistic-panel/30 border-b border-artistic-gold/20 relative`} {...getSectionInteractionProps('pursuits')}>
            <div className="max-w-4xl mx-auto">
              <div className="bg-artistic-light p-6 sm:p-8 rounded-sm border border-dashed border-artistic-gold/30 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div className="md:col-span-1 space-y-2">
                  <div className="flex items-center gap-2 text-artistic-gold">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-widest font-semibold">CULTIVATIONS</span>
                  </div>
                  <h4 className="font-serif text-xl font-bold text-artistic-text">Hobbies &amp; Pursuits</h4>
                  <p className="text-xs text-artistic-text/70 font-sans">Activities that defined Eleanor&rsquo;s quiet days of contemplation.</p>
                </div>

                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {INTERESTS.map((int, i) => (
                    <div key={i} className="p-4 bg-artistic-panel/20 rounded-sm border border-artistic-gold/10 hover:bg-artistic-panel/40 transition-all flex items-start gap-3">
                      <div className="text-artistic-gold mt-0.5">
                        <Flower className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-serif text-sm font-bold text-artistic-text">{int.title}</h5>
                        <p className="text-xs text-artistic-text/80 font-sans mt-0.5">{int.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 3. LIFE JOURNEY TIMELINE */}
          <section id="timeline-section" className={`${getEditHighlightClass('timeline')} py-20 px-6 sm:px-12 md:px-16 border-b border-artistic-gold/20 relative`} {...getSectionInteractionProps('timeline')}>
            
            {/* Stamp postmark decorative overlay */}
            <div className="absolute top-24 left-12 w-28 h-28 opacity-[0.05] pointer-events-none select-none">
              <svg className="w-full h-full text-artistic-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v20M2 12h20M12 12a5 5 0 11-5-5" />
              </svg>
            </div>

            <div className="max-w-4xl mx-auto space-y-16">
              
              {/* Timeline Title */}
              <div className="text-center space-y-2">
                <span className="font-script text-4xl text-artistic-gold font-medium">Chapter II</span>
                <h3 className="font-serif text-3xl font-bold tracking-tight text-artistic-text uppercase">
                  Chronicle of a Centurial Journey
                </h3>
                <p className="text-xs font-mono uppercase tracking-widest text-artistic-text/60">
                  Stitched Together Memoirs &amp; Milestones
                </p>
                <div className="w-24 h-[1px] bg-artistic-gold mx-auto mt-2"></div>
              </div>

              {/* The Timeline Stitched Cord */}
              <div className="relative pl-6 sm:pl-10 space-y-16 before:absolute before:left-2 sm:before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-artistic-gold/60 before:via-artistic-dark/30 before:to-artistic-gold/60 before:border-dashed before:border-l">
                
                {displayMilestones.map((mile, idx) => (
                  <div key={idx} className="relative group">
                    
                    {/* Stitched Timeline Node */}
                    <div className="absolute -left-[22px] sm:-left-[30px] top-1.5 w-6 h-6 rounded-full bg-artistic-light border-2 border-artistic-gold flex items-center justify-center shadow-md">
                      <div className="w-2.5 h-2.5 rounded-full bg-artistic-text"></div>
                    </div>

                    {/* Timeline Content Card */}
                    <div className="bg-artistic-light rounded-sm border border-artistic-gold/20 shadow-sm hover:shadow-md transition-shadow duration-300 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 relative">
                      
                      {/* Brass-style plaque tag for year */}
                      <div className="absolute -top-3 left-4 px-3 py-1 bg-artistic-dark text-artistic-light border border-artistic-gold/30 rounded-sm shadow-md text-xs font-mono tracking-widest uppercase font-semibold">
                        {mile.year}
                      </div>

                      {/* Text Column */}
                      <div className="md:col-span-7 space-y-3 pt-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-artistic-gold font-bold bg-artistic-panel px-2 py-0.5 rounded">
                            {mile.category}
                          </span>
                          <h4 className="font-serif text-xl sm:text-2xl font-bold text-artistic-text">
                            {mile.title}
                          </h4>
                          <p className="text-xs font-mono text-artistic-text/60 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-artistic-gold" />
                            {mile.location}
                          </p>
                        </div>

                        <p className="text-sm text-artistic-text/90 leading-relaxed font-serif">
                          {mile.description}
                        </p>

                        {mile.annotation && (
                          <div className="pt-2 border-t border-artistic-gold/10">
                            <span className="font-script text-2xl text-artistic-dark font-medium leading-none inline-block transform -rotate-1">
                              &ldquo;{mile.annotation}&rdquo;
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Image Frame Column */}
                      <div className="md:col-span-5 flex items-center justify-center">
                        <div className="p-2.5 bg-white shadow-md border border-artistic-gold/20 rounded-sm max-w-[200px] w-full transform group-hover:rotate-1 transition-transform duration-300">
                          <div className="aspect-square bg-artistic-dark overflow-hidden relative group/image">
                            <img 
                              src={mile.image} 
                              alt={mile.title} 
                              className="w-full h-full object-cover vintage-photo-sepia"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30 pointer-events-none"></div>
                            {renderChangePictureButton({
                              section: 'timeline',
                              itemIndex: idx,
                              itemId: data?.timeline[idx]?.id,
                            })}
                          </div>
                          <p className="text-[9px] font-mono text-center text-artistic-text/60 mt-2 tracking-wide uppercase">
                            Plate #{idx + 101}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}

              </div>

            </div>
          </section>

          {/* 4. PHOTO ALBUM GALLERY */}
          <section id="gallery-section" className={`${getEditHighlightClass('gallery')} py-16 px-4 sm:px-8 md:px-12 lg:px-16 bg-artistic-panel/20 border-b border-artistic-gold/20`} {...getSectionInteractionProps('gallery')}>
            <div className="max-w-5xl mx-auto space-y-12">
              
              {/* Section Header */}
              <div className="text-center space-y-2">
                <span className="font-script text-4xl text-artistic-gold font-medium">Chapter III</span>
                <h3 className="font-serif text-3xl font-bold tracking-tight text-artistic-text uppercase">
                  Nostalgic Family Album
                </h3>
                <p className="text-xs font-mono uppercase tracking-widest text-artistic-text/60">
                  Slightly Rotated Scrapbook Photographs &amp; Super 8 Reels
                </p>
                <div className="w-24 h-[1px] bg-artistic-gold mx-auto mt-2"></div>
              </div>

              {/* Handcrafted Scrapbook Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10 pt-4 px-2 sm:px-4">
                
                {displayGalleryItems.map((item, idx) => {
                  const isVideo = item.type === "video";
                  return (
                    <div 
                      key={item.id} 
                      className={`p-3 bg-white shadow-lg border border-artistic-gold/10 rounded-sm transform ${item.rotation} hover:rotate-0 hover:scale-[1.02] transition-all duration-300 group max-w-sm mx-auto flex flex-col justify-between select-none`}
                    >
                      {/* Photo/Video Frame Container */}
                      <div className="relative aspect-square bg-artistic-dark overflow-hidden rounded-sm border border-artistic-gold/15 group/image">
                        <img 
                          src={item.url} 
                          alt={item.title} 
                          className={`w-full h-full object-cover vintage-photo-sepia ${isVideo ? "opacity-75 grayscale" : ""}`}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30 pointer-events-none"></div>

                        {/* If video: render old film sprockets and play icon */}
                        {isVideo && (
                          <div className="absolute inset-0 flex flex-col justify-between p-2">
                            {/* sprocket reels top */}
                            <div className="flex justify-between text-yellow-600/30 font-mono text-[7px] tracking-widest leading-none">
                              <span>01 02 03 04</span>
                              <span>SUPER 8 FILM</span>
                            </div>
                            
                            {/* Center play icon overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-artistic-dark/95 border border-artistic-gold/50 flex items-center justify-center text-artistic-gold shadow-md group-hover:scale-110 transition-transform duration-300">
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              </div>
                            </div>

                            {/* sprocket reels bottom */}
                            <div className="flex justify-between text-yellow-600/30 font-mono text-[7px] tracking-widest leading-none">
                              <span>KODAK SAFETY</span>
                              <span>REEL #{idx}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Antique translucent tape effect on photo edges */}
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-14 h-4 bg-amber-100/60 border border-dashed border-amber-200/30 backdrop-blur-xs transform -rotate-1 shadow-xs pointer-events-none mix-blend-multiply"></div>
                        {renderChangePictureButton({
                          section: 'gallery',
                          itemIndex: idx,
                          itemId: item.id,
                        })}
                      </div>

                      {/* Caption */}
                      <div className="pt-3 pb-1 px-1 flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-serif text-sm font-bold text-artistic-text leading-tight">
                            {item.title}
                          </h4>
                          <span className="text-[10px] font-mono text-artistic-gold font-bold bg-artistic-panel/40 border border-artistic-gold/20 px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                            {item.date}
                          </span>
                        </div>
                        <p className="font-script text-2xl text-artistic-dark mt-2 leading-tight">
                          &ldquo;{item.caption}&rdquo;
                        </p>
                      </div>

                    </div>
                  );
                })}

              </div>

              {/* Album Footer note */}
              <div className="text-center pt-4">
                <span className="font-script text-3xl text-artistic-dark">
                  &ldquo;A picture is a secret about a secret, the more it tells you the less you know.&rdquo;
                </span>
              </div>

            </div>
          </section>

          {/* 5. MEMORIES & STORIES */}
          <section id="stories-section" className={`${getEditHighlightClass('stories')} py-20 px-6 sm:px-12 md:px-16 border-b border-artistic-gold/20`} {...getSectionInteractionProps('stories')}>
            <div className="max-w-4xl mx-auto space-y-12">
              
              {/* Header */}
              <div className="text-center space-y-2">
                <span className="font-script text-4xl text-artistic-gold font-medium">Chapter IV</span>
                <h3 className="font-serif text-3xl font-bold tracking-tight text-artistic-text uppercase">
                  Written Memoirs &amp; Stories
                </h3>
                <p className="text-xs font-mono uppercase tracking-widest text-artistic-text/60">
                  Preserved handwritten journal pages and family legends
                </p>
                <div className="w-24 h-[1px] bg-artistic-gold mx-auto mt-2"></div>
              </div>

              {/* Notebook stories container */}
              <div className="space-y-10">
                
                {displayStories.map((story, i) => (
                  <div 
                    key={story.id}
                    className="bg-artistic-light rounded-sm border border-artistic-gold/15 shadow-md p-6 sm:p-10 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center"
                  >
                    {/* Visual Spine Stitch on Card */}
                    <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-artistic-gold/30 flex flex-col justify-around py-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-artistic-dark/40"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-artistic-dark/40"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-artistic-dark/40"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-artistic-dark/40"></div>
                    </div>

                    {/* Story Image */}
                    <div className="w-full md:w-1/3 flex-shrink-0">
                      <div className="p-2 bg-white shadow-md border border-artistic-gold/20 rounded-sm relative transform -rotate-1">
                        <div className="aspect-square bg-artistic-dark overflow-hidden relative group/image">
                          <img 
                            src={story.image} 
                            alt={story.title} 
                            className="w-full h-full object-cover vintage-photo-sepia"
                            referrerPolicy="no-referrer"
                          />
                          {renderChangePictureButton({
                            section: 'stories',
                            itemIndex: i,
                            itemId: story.id,
                          })}
                        </div>
                        <div className="absolute top-1 left-1 bg-artistic-light border border-artistic-gold/30 text-[8px] font-mono px-1 rounded uppercase tracking-wider text-artistic-text">
                          {story.category}
                        </div>
                      </div>
                    </div>

                    {/* Story Text */}
                    <div className="space-y-3 flex-grow">
                      <div className="flex flex-wrap items-baseline gap-2 text-xs font-mono">
                        <Calendar className="w-3.5 h-3.5 text-artistic-gold" />
                        <span className="text-artistic-gold font-bold">{story.date}</span>
                        <span className="text-artistic-text/40">|</span>
                        <span className="text-artistic-text/70 uppercase tracking-widest">{story.category}</span>
                      </div>

                      <div className="space-y-1 relative">
                        {/* Quote icon watermark */}
                        <Quote className="absolute -top-4 -left-6 w-12 h-12 text-artistic-gold/10 fill-current pointer-events-none" />
                        
                        <h4 className="font-serif text-2xl font-bold text-artistic-text leading-tight">
                          {story.title}
                        </h4>
                      </div>

                      <p className="text-sm text-artistic-text/90 leading-relaxed font-serif">
                        {story.excerpt}
                      </p>

                      {story.handwrittenNote && (
                        <div className="pt-3 border-t border-artistic-gold/10 mt-3">
                          <p className="font-script text-2xl text-artistic-dark leading-none">
                            Note: {story.handwrittenNote}
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                ))}

              </div>

            </div>
          </section>

          {/* 6. CONTACT SECTION */}
          <section id="contact-section" className={`${getEditHighlightClass('contact')} py-20 px-6 sm:px-12 md:px-16 bg-artistic-panel/10 relative`} {...getSectionInteractionProps('contact')}>
            
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              
              {/* Left description and details */}
              <div className="md:col-span-5 space-y-6">
                <div className="space-y-2">
                  <span className="font-script text-4xl text-artistic-gold font-medium">Chapter V</span>
                  <h3 className="font-serif text-3xl font-bold tracking-tight text-artistic-text uppercase">
                    Pass the Light
                  </h3>
                  <p className="text-xs font-mono uppercase tracking-widest text-artistic-text/60">
                    Contribute to the Heritage Archive
                  </p>
                  <div className="w-16 h-[1px] bg-artistic-gold mt-2"></div>
                </div>

                <p className="text-sm text-artistic-text/90 leading-relaxed font-serif">
                  Do you hold a letter, a photograph, or a personal memory of Eleanor Vance Sterling? Help us keep her heirloom scrapbook complete. 
                </p>

                <p className="text-sm text-artistic-text/90 leading-relaxed font-serif">
                  Send your stories or request an invitation to the annual Sterling Autumn Reunion. Your contributions will be archived inside the permanent family vault.
                </p>

                {/* Decorative stamp envelope illustration */}
                <div className="p-4 bg-artistic-light rounded border border-artistic-gold/20 shadow-sm flex items-center gap-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-artistic-gold/10 flex items-center justify-center border-b border-l border-artistic-gold/20">
                    <Feather className="w-3.5 h-3.5 text-artistic-gold" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-artistic-text/50">permanent vault</p>
                    <p className="font-serif text-sm font-bold text-artistic-text">archive@vancestirling.com</p>
                    <p className="text-[10px] text-artistic-dark font-sans">Greenwood Sanctuary, Vermont</p>
                  </div>
                </div>

                {/* Decorative Social media symbols */}
                <div className="space-y-2 pt-2">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-artistic-text/50">Social connections (decorative)</p>
                  <div className="flex gap-4 text-artistic-text/70">
                    <button 
                      type="button"
                      onClick={(e) => e.preventDefault()}
                      className="p-2 bg-artistic-light rounded-full border border-artistic-gold/20 cursor-pointer hover:text-artistic-gold hover:scale-105 transition-all focus:outline-none"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => e.preventDefault()}
                      className="p-2 bg-artistic-light rounded-full border border-artistic-gold/20 cursor-pointer hover:text-artistic-gold hover:scale-105 transition-all focus:outline-none"
                    >
                      <Compass className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => e.preventDefault()}
                      className="p-2 bg-artistic-light rounded-full border border-artistic-gold/20 cursor-pointer hover:text-artistic-gold hover:scale-105 transition-all focus:outline-none"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Lined Letter Paper styled contact form */}
              <div className="md:col-span-7 bg-white p-6 sm:p-10 rounded-sm shadow-xl border border-artistic-dark/15 relative">
                
                {/* Vintage Letter Pad Lined Sheet details */}
                <div className="absolute top-0 bottom-0 left-6 w-[1px] bg-red-200/40 pointer-events-none"></div>

                <div className="space-y-6 pt-2">
                  <div className="flex justify-between items-center border-b border-artistic-gold/20 pb-4">
                    <h4 className="font-serif text-xl font-bold text-artistic-text tracking-wide flex items-center gap-2">
                      <Feather className="w-5 h-5 text-artistic-gold" />
                      Write a Remembrance
                    </h4>
                    <span className="text-[9px] font-mono text-artistic-text/50 uppercase tracking-widest">
                      MEMOIR INTAKE FORM
                    </span>
                  </div>

                  {showFormSuccess ? (
                    <div className="py-8 px-4 text-center space-y-4 animate-fade-in bg-artistic-panel/20 border border-dashed border-artistic-gold/30 rounded-sm">
                      <div className="w-12 h-12 bg-[#7c1a1a] rounded-full flex items-center justify-center shadow-lg border border-[#561010] mx-auto transform rotate-3 scale-110">
                        <span className="font-serif font-bold text-artistic-light text-xl">S</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif text-lg font-bold text-artistic-text">Letter Sealed &amp; Delivered</h4>
                        <p className="text-xs text-artistic-text/80 max-w-sm mx-auto">Your remembrance has been beautifully formatted and cataloged in the Vance Sterling Family Remembrance Vault.</p>
                      </div>
                      <button 
                        onClick={() => setShowFormSuccess(false)}
                        className="text-xs text-artistic-gold hover:text-artistic-dark underline uppercase tracking-wider font-mono"
                      >
                        Write Another Remembrance
                      </button>
                    </div>
                  ) : (
                    <form className="space-y-4 font-serif" onSubmit={handleFormSubmit}>
                      
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-artistic-text/60 mb-1">
                          Your Full Name
                        </label>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          required
                          placeholder="e.g. Arthur Sterling Vance" 
                          className="w-full bg-artistic-panel/10 border-b border-artistic-gold/30 focus:border-artistic-gold focus:outline-none p-2 font-serif text-sm transition-colors text-artistic-text"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-artistic-text/60 mb-1">
                          Your Email Address
                        </label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          required
                          placeholder="e.g. arthur@sterlinghouse.com" 
                          className="w-full bg-artistic-panel/10 border-b border-artistic-gold/30 focus:border-artistic-gold focus:outline-none p-2 font-serif text-sm transition-colors text-artistic-text"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-artistic-text/60 mb-1">
                          How are you related?
                        </label>
                        <select 
                          name="relation"
                          value={formData.relation}
                          onChange={handleFormChange}
                          className="w-full bg-artistic-panel/10 border-b border-artistic-gold/30 focus:border-artistic-gold focus:outline-none p-2 font-serif text-sm transition-colors text-artistic-text"
                        >
                          <option value="Grandchild or Relative">Grandchild or Relative</option>
                          <option value="Former School Student (East Arlington)">Former School Student (East Arlington)</option>
                          <option value="Neighbor / Family Friend">Neighbor / Family Friend</option>
                          <option value="Historian / Archivist">Historian / Archivist</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-artistic-text/60 mb-1">
                          Your Message or Story
                        </label>
                        <textarea 
                          rows={4} 
                          name="message"
                          value={formData.message}
                          onChange={handleFormChange}
                          required
                          placeholder="Dear Vance Family, I remember the autumn of 1968 when Eleanor..." 
                          className="w-full bg-artistic-panel/10 border-b border-artistic-gold/30 focus:border-artistic-gold focus:outline-none p-2 font-serif text-sm transition-colors text-artistic-text resize-none"
                        ></textarea>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button 
                          type="button" 
                          onClick={(e) => e.preventDefault()}
                          className="w-full py-3 bg-artistic-dark text-artistic-light hover:bg-artistic-text hover:shadow-lg font-serif font-bold uppercase tracking-widest text-xs rounded-sm shadow-md border border-artistic-dark flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 text-artistic-gold" />
                          Seal and Deliver Letter
                        </button>
                      </div>

                    </form>
                  )}
                </div>
              </div>

            </div>
          </section>

          {/* FOOTER */}
          <footer className="pt-16 pb-12 px-6 sm:px-12 border-t border-artistic-gold/20 text-center space-y-4">
            
            {/* Round golden botanical illustration */}
            <div className="w-10 h-10 rounded-full border border-artistic-gold/30 mx-auto flex items-center justify-center text-artistic-gold">
              <Flower className="w-5 h-5" />
            </div>

            <p className="font-serif text-lg font-bold text-artistic-text tracking-wide uppercase">
              Vance Sterling Archives &amp; Trust
            </p>
            
            <p className="text-xs text-artistic-text/75 font-sans max-w-md mx-auto leading-relaxed">
              This memorial catalog is a preservation of Eleanor Vance Sterling&rsquo;s living legacy. All contents, family documents, diary fragments, and portraits are protected in perpetual trust.
            </p>

            <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-artistic-gold/40 to-transparent mx-auto"></div>

            <p className="text-[10px] font-mono tracking-widest text-artistic-text/50">
              &copy; 2026 Legacy &amp; Heritage. All Rights Reserved.
            </p>
          </footer>

        </div>
        
        {/* Under-book layout decoration shadow */}
        <div className="w-[95%] mx-auto h-6 bg-black/40 blur-md rounded-full mt-[-10px] opacity-75"></div>

      </div>

      {/* Lightbox / Retro Media Projector Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setSelectedItem(null)}
          />
          
          {/* Lightbox Container */}
          <div className="relative bg-[#f5f1e9] rounded-sm border-4 border-artistic-dark max-w-2xl w-full p-4 sm:p-6 shadow-2xl z-10 vintage-double-border flex flex-col justify-between max-h-[90vh]">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute -top-12 sm:top-4 right-2 sm:right-4 w-10 h-10 rounded-full bg-artistic-dark text-artistic-gold border border-artistic-gold/30 flex items-center justify-center hover:bg-artistic-text hover:text-white transition-colors cursor-pointer z-20"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedItem.type === "photo" ? (
              /* PHOTO MODE: Polaroid Layout */
              <div className="space-y-4">
                <div className="p-3 bg-white shadow-md border border-artistic-gold/20 rounded-xs aspect-square overflow-hidden relative max-h-[60vh] flex items-center justify-center group/image">
                  <img 
                    src={selectedItem.url} 
                    alt={selectedItem.title} 
                    className="max-h-full max-w-full object-contain vintage-photo-sepia rounded-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/20 pointer-events-none"></div>
                  {renderChangePictureButton({
                    section: 'gallery',
                    itemIndex: selectedGalleryIndex >= 0 ? selectedGalleryIndex : undefined,
                    itemId: selectedItem.id,
                  })}
                </div>
                
                <div className="border-t border-artistic-gold/20 pt-4 text-center">
                  <div className="flex justify-between items-baseline gap-2 mb-1">
                    <h4 className="font-serif text-lg font-bold text-artistic-text">
                      {selectedItem.title}
                    </h4>
                    <span className="text-xs font-mono text-artistic-gold font-bold">
                      {selectedItem.date}
                    </span>
                  </div>
                  <p className="font-script text-2xl text-artistic-dark mt-2">
                    &ldquo;{selectedItem.caption}&rdquo;
                  </p>
                </div>
              </div>
            ) : (
              /* VIDEO MODE: Vintage Super 8 Projector Simulation */
              <div className="space-y-4">
                <div className="bg-black rounded-xs border-2 border-artistic-dark overflow-hidden relative aspect-video flex flex-col justify-between p-2 shadow-inner group/video">
                  
                  {/* Retro Film Sprocket border simulation on left & right sides */}
                  <div className="absolute top-0 bottom-0 left-2 w-3 flex flex-col justify-between py-2 text-yellow-600/30 font-mono text-[6px] tracking-tighter leading-none pointer-events-none select-none">
                    <span>[01]</span><span>[02]</span><span>[03]</span><span>[04]</span><span>[05]</span><span>[06]</span><span>[07]</span>
                  </div>
                  <div className="absolute top-0 bottom-0 right-2 w-3 flex flex-col justify-between py-2 text-yellow-600/30 font-mono text-[6px] tracking-tighter leading-none pointer-events-none select-none col-start-2">
                    <span>[01]</span><span>[02]</span><span>[03]</span><span>[04]</span><span>[05]</span><span>[06]</span><span>[07]</span>
                  </div>

                  {/* The Real Playing Video Stream with Vintage Sepia Film Overlay */}
                  <div className="w-full h-full px-6 py-2 relative overflow-hidden flex items-center justify-center">
                    {selectedItem.videoUrl ? (
                      <video
                        src={selectedItem.videoUrl}
                        autoPlay
                        loop
                        controls
                        className="w-full h-full object-cover rounded-xs filter sepia brightness-90 contrast-125"
                      />
                    ) : (
                      <div className="w-full h-full bg-artistic-dark flex items-center justify-center text-center p-4">
                        <p className="text-sm font-mono text-artistic-gold">SUPER 8 REEL UNPLAYABLE</p>
                      </div>
                    )}
                    
                    {/* Film Static Grain Overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-black/40 mix-blend-overlay"></div>
                    <div className="absolute inset-0 pointer-events-none bg-yellow-600/5 animate-pulse mix-blend-color-burn"></div>
                  </div>
                </div>

                <div className="border-t border-artistic-gold/20 pt-4 text-center">
                  <div className="flex justify-between items-baseline gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-artistic-gold animate-bounce" />
                      <h4 className="font-serif text-lg font-bold text-artistic-text">
                        {selectedItem.title}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-artistic-gold font-bold">
                      {selectedItem.date}
                    </span>
                  </div>
                  <p className="font-script text-2xl text-artistic-dark mt-2">
                    &ldquo;{selectedItem.caption}&rdquo;
                  </p>
                  
                  <div className="mt-4 flex justify-center items-center gap-1.5 text-[9px] font-mono text-artistic-text/50 uppercase tracking-widest bg-artistic-panel/20 py-1.5 px-3 rounded-sm border border-artistic-gold/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                    <span>PROJECTOR BEAM ACTIVE • KODACHROME FILM REEL NO. {selectedItem.id.replace('vid-', '#')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
