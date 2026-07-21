import React, { useState } from 'react';
import { 
  Compass, 
  Heart, 
  Leaf, 
  Feather, 
  MapPin, 
  Mail, 
  Calendar, 
  Sparkles, 
  Play, 
  ChevronRight, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Layers, 
  Award, 
  BookOpen,
  ArrowRight,
  Send,
  FileText,
  Menu,
  X,
  Sprout,
  Palette,
  Mountain
} from 'lucide-react';
import { CATEGORIES_DATA } from './data';
import { getSectionCopy } from './sectionCopy';
import type {
  BiographyCategory,
  EditableSectionCopyKey,
  EditableTemplateSection,
  GalleryItem,
  HobbyItem,
  MemoryStory,
  PersonalDetails,
  TimelineMilestone,
  ValueItem,
} from './types';

interface LifeJourneyTemplateProps {
  categoryKey?: BiographyCategory['id'];
  dataOverride?: BiographyCategory;
  activeEditSection?: EditableTemplateSection | null;
  onDataChange?: React.Dispatch<React.SetStateAction<BiographyCategory>>;
  onEditSectionChange?: (section: EditableTemplateSection) => void;
}

export default function LifeJourneyTemplate({
  categoryKey = 'life',
  dataOverride,
  activeEditSection = null,
  onDataChange,
  onEditSectionChange,
}: LifeJourneyTemplateProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const data = dataOverride ?? CATEGORIES_DATA[categoryKey];
  const isInlineEditable = Boolean(onDataChange);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 300);
  };

  // Helper to render correct icons dynamically from data names
  const renderIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case 'Compass': return <Compass className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Leaf': return <Leaf className={className} />;
      case 'Feather': return <Feather className={className} />;
      case 'Sprout': return <Sprout className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Palette': return <Palette className={className} />;
      case 'Mountain': return <Mountain className={className} />;
      case 'Calendar': return <Calendar className={className} />;
      case 'MapPin': return <MapPin className={className} />;
      case 'Mail': return <Mail className={className} />;
      case 'Play': return <Play className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Layers': return <Layers className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  // Theme styling mapping based on selected biography perspective
  const getThemeStyles = () => {
    switch (data.settings.theme) {
      case 'charcoal':
        return {
          bg: 'bg-[#121214] text-zinc-100',
          navBg: 'bg-[#121214]/85 border-zinc-800/60',
          card: 'bg-[#1C1C1F] border-zinc-800/80 shadow-md',
          accent: 'text-indigo-400 bg-indigo-950/40 border-indigo-900/40',
          accentButton: 'bg-indigo-600 hover:bg-indigo-500 text-white',
          accentHover: 'hover:border-indigo-500/50',
          badge: 'bg-indigo-900/30 text-indigo-300 border-indigo-800/40',
          textMuted: 'text-zinc-400',
          divider: 'bg-zinc-800',
          highlight: 'text-indigo-400',
          innerCard: 'bg-zinc-900/40 border-zinc-800/50',
          footer: 'border-zinc-800 bg-[#0A0A0C]',
          input: 'bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-indigo-500',
          tag: 'bg-zinc-800/60 border-zinc-700/50 text-zinc-300'
        };
      case 'sage':
        return {
          bg: 'bg-[#F4F7F5] text-slate-800',
          navBg: 'bg-[#F4F7F5]/85 border-emerald-200/20',
          card: 'bg-white border-emerald-900/10 shadow-xs',
          accent: 'text-emerald-800 bg-emerald-50 border-emerald-100',
          accentButton: 'bg-slate-900 hover:bg-slate-800 text-emerald-50',
          accentHover: 'hover:border-emerald-300',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200/50',
          textMuted: 'text-slate-500',
          divider: 'bg-emerald-900/5',
          highlight: 'text-emerald-700',
          innerCard: 'bg-emerald-50/30 border-emerald-100/50',
          footer: 'border-emerald-900/5 bg-white',
          input: 'bg-white border-slate-200 text-slate-800 focus:ring-emerald-600',
          tag: 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
        };
      case 'cream':
      default:
        return {
          bg: 'bg-[#FAF6F0] text-stone-850',
          navBg: 'bg-[#FAF6F0]/85 border-amber-200/20',
          card: 'bg-white border-amber-900/10 shadow-xs',
          accent: 'text-amber-800 bg-amber-50 border-amber-200/30',
          accentButton: 'bg-stone-900 hover:bg-stone-850 text-amber-50',
          accentHover: 'hover:border-amber-300',
          badge: 'bg-amber-100 text-amber-800 border-amber-200/50',
          textMuted: 'text-stone-500',
          divider: 'bg-stone-200/60',
          highlight: 'text-orange-600',
          innerCard: 'bg-[#FAF8F5] border-stone-200/60',
          footer: 'border-stone-200 bg-white',
          input: 'bg-white border-stone-200 text-stone-800 focus:ring-amber-500',
          tag: 'bg-amber-50/60 border-amber-100 text-amber-900'
        };
    }
  };

  const theme = getThemeStyles();

  const getEditHighlightClass = (section: EditableTemplateSection) => {
    if (activeEditSection !== section) {
      return 'relative rounded-[2rem] outline outline-0 outline-offset-8 outline-transparent transition-all duration-300';
    }

    return 'relative rounded-[2rem] outline outline-4 outline-offset-8 outline-[#FED362] shadow-[0_0_0_8px_rgba(254,211,98,0.16),0_18px_45px_rgba(177,134,37,0.16)] transition-all duration-300';
  };

  const getSectionInteractionProps = (section: EditableTemplateSection) => ({
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (!isInlineEditable) {
        return;
      }

      const target = event.target as HTMLElement;
      if (target.closest('a, button, input, textarea, select')) {
        return;
      }

      onEditSectionChange?.(section);
    },
  });

  type EditableTextTag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'div';

  const updatePersonalDetail = (field: keyof PersonalDetails, value: string) => {
    onDataChange?.((current) => ({
      ...current,
      personalDetails: {
        ...current.personalDetails,
        [field]: value,
      },
    }));
  };

  const updateValueItem = (index: number, field: keyof ValueItem, value: string) => {
    onDataChange?.((current) => ({
      ...current,
      values: current.values.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateHobbyItem = (index: number, field: keyof HobbyItem, value: string) => {
    onDataChange?.((current) => ({
      ...current,
      hobbies: current.hobbies.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateTimelineItem = (index: number, updates: Partial<TimelineMilestone>) => {
    onDataChange?.((current) => ({
      ...current,
      timeline: current.timeline.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      ),
    }));
  };

  const updateGalleryItem = (index: number, updates: Partial<GalleryItem>) => {
    onDataChange?.((current) => ({
      ...current,
      gallery: current.gallery.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      ),
    }));
  };

  const updateStoryItem = (index: number, field: keyof MemoryStory, value: string) => {
    onDataChange?.((current) => ({
      ...current,
      stories: current.stories.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateSectionDescription = (section: EditableSectionCopyKey, value: string) => {
    onDataChange?.((current) => ({
      ...current,
      sectionCopy: {
        ...current.sectionCopy,
        [section]: {
          title: sectionCopy[section].title,
          description: value,
        },
      },
    }));
  };

  const editableTextClass = isInlineEditable
    ? 'cursor-text rounded-md outline-none transition hover:bg-[#FED362]/20 focus:bg-[#FED362]/25 focus:ring-2 focus:ring-[#FED362]/80 focus:ring-offset-2 focus:ring-offset-white'
    : '';

  const renderEditableText = ({
    as: Component = 'span',
    value,
    className = '',
    section,
    multiline = false,
    onChange,
  }: {
    as?: EditableTextTag;
    value: string;
    className?: string;
    section: EditableTemplateSection;
    multiline?: boolean;
    onChange: (value: string) => void;
  }) => {
    const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
      const nextValue = event.currentTarget.innerText.replace(/\u00a0/g, ' ').trim();
      if (nextValue !== value) {
        onChange(nextValue);
      }
    };

    return (
      <Component
        className={`${className} ${editableTextClass}`}
        contentEditable={isInlineEditable}
        suppressContentEditableWarning
        onFocus={() => onEditSectionChange?.(section)}
        onBlur={isInlineEditable ? handleBlur : undefined}
        onKeyDown={(event) => {
          if (!multiline && event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
      >
        {value}
      </Component>
    );
  };

  // Font class bindings
  const getHeadingFont = () => {
    switch (data.settings.fontPairing) {
      case 'modern':
        return 'font-sans font-extrabold tracking-tight';
      case 'editorial':
        return 'font-serif italic font-semibold';
      case 'classic':
      default:
        return 'font-serif font-black tracking-tight';
    }
  };

  // Fixed profile portraits representing the carpenter at different life chapters
  const getCategoryPortrait = () => {
    return 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&q=80&w=800'; // Bearded master carpenter in workshop
  };

  const profileImageUrl = data.personalDetails.profileImageUrl || getCategoryPortrait();
  const contactEmail = data.personalDetails.contactEmail || 'julian.vance@cannonbeachwood.org';
  const instagramHandle = data.personalDetails.instagramHandle || '@JulianVanceWood';
  const twitterHandle = data.personalDetails.twitterHandle || '@VanceShipwrights';
  const facebookLabel = data.personalDetails.facebookLabel || 'Cabin Studio';
  const linkedinLabel = data.personalDetails.linkedinLabel || 'Julian Vance Forestry';
  const sectionCopy = getSectionCopy(data.sectionCopy);

  return (
    <div className={`min-h-screen ${theme.bg} selection:bg-amber-200 selection:text-amber-900 transition-colors duration-500 font-sans antialiased flex flex-col justify-between ${
      activeEditSection === 'style' ? 'ring-4 ring-inset ring-[#FED362]' : ''
    }`}>
      
      {/* Sticky Navigation Bar */}
      <header className={`sticky top-0 z-40 w-full ${theme.navBg} backdrop-blur-md border-b transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 h-16 md:h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <a href="#hero-section" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-serif font-black border transition-all bg-amber-600/10 border-amber-600/20 text-amber-900">
              JV
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif font-black text-sm tracking-tight leading-none group-hover:text-amber-700 transition-colors">
                {data.personalDetails.fullName}
              </span>
              <span className="font-mono text-[8px] opacity-60 font-bold uppercase tracking-widest mt-0.5">
                {data.personalDetails.occupation}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-mono text-[10px] font-extrabold uppercase tracking-widest">
            <a href="#about-section" className="hover:opacity-75 transition-opacity">About</a>
            <a href="#timeline-section" className="hover:opacity-75 transition-opacity">Timeline</a>
            <a href="#gallery-section" className="hover:opacity-75 transition-opacity">Gallery</a>
            <a href="#stories-section" className="hover:opacity-75 transition-opacity">Stories</a>
            <a 
              href="#contact-section" 
              className={`px-4 py-2 rounded-xl transition-all font-mono font-bold tracking-widest uppercase text-[9px] border ${theme.accentButton}`}
            >
              Send Letter
            </a>
          </nav>

          {/* Mobile Navigation Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden p-2 opacity-80 hover:opacity-100 transition-opacity"
            aria-label="Toggle navigation menu"
            id="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Mobile Overlay Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-x-0 top-16 bg-[#FAF6F0] border-stone-200 border-b shadow-lg p-6 space-y-5 font-mono text-[10px] font-black uppercase tracking-widest flex flex-col z-50 animate-fade-in">
              <a href="#about-section" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-stone-100/10 pb-2">About</a>
              <a href="#timeline-section" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-stone-100/10 pb-2">Timeline</a>
              <a href="#gallery-section" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-stone-100/10 pb-2">Gallery</a>
              <a href="#stories-section" onClick={() => setIsMobileMenuOpen(false)} className="py-1 border-b border-stone-100/10 pb-2">Stories</a>
              <a 
                href="#contact-section" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`w-full text-center font-bold tracking-widest uppercase p-3 rounded-xl border ${theme.accentButton}`}
              >
                Send Letter
              </a>
            </div>
          )}

        </div>
      </header>

      {/* Main Container Frame with Dynamic Spacing */}
      <div className={`max-w-6xl mx-auto px-6 md:px-12 w-full flex-grow ${
        data.settings.spacing === 'compact' ? 'space-y-12 py-6 md:py-8' : 'space-y-16 md:space-y-20 py-8 md:py-12'
      }`}>
        
        {/* ========================================================= */}
        {/* HERITAGE MEMOIR IDENTITY (Visual Category Marker)        */}
        {/* ========================================================= */}
        <section className="text-center space-y-3 pb-6 border-b border-amber-900/5" id="lens-section">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-50/70 border border-amber-200/50 shadow-xs">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
            </span>
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest text-stone-700">
              CLASSIC MEMOIR // HERITAGE WOODCRAFT EDITION
            </span>
          </div>
          <p className="font-serif italic text-xs text-stone-500 max-w-lg mx-auto">
            A visual archive and narrative chronicle honoring traditional timber joinery, maritime shipwright vessels, and coastal memoirs.
          </p>
        </section>

        {/* ========================================================= */}
        {/* 1. HERO SECTION (Split Layout - No Dead Space)            */}
        {/* ========================================================= */}
        <section
          className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${getEditHighlightClass('hero')}`}
          id="hero-section"
          {...getSectionInteractionProps('hero')}
        >
          
          {/* Left Column: Portrait */}
          <div className="lg:col-span-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-indigo-500 rounded-3xl blur-2xl opacity-15 group-hover:opacity-25 transition-all duration-700 -z-10 scale-[1.01]" />
              
              <div className="aspect-[4/5] rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-stone-150 relative">
                <img 
                  src={profileImageUrl} 
                  alt={data.personalDetails.fullName} 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 filter brightness-95 contrast-[1.02]"
                  referrerPolicy="no-referrer"
                  id="hero-portrait"
                />
                
                {/* Visual Category Label Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 font-mono text-[9px] font-extrabold tracking-widest uppercase rounded-lg shadow-md border bg-amber-100 text-amber-950 border-amber-200">
                    {data.badge}
                  </span>
                </div>

                {/* Overlay Year Label */}
                <div className="absolute bottom-4 right-4 bg-stone-900/80 backdrop-blur-xs px-2.5 py-1 text-[8px] font-mono text-stone-200 rounded-md tracking-wider">
                  CHAPTER ERA // 1952 – 2026
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Biographical content */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="space-y-3">
              <span className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest rounded-md font-extrabold inline-block ${theme.accent}`}>
                {data.quote}
              </span>
              
              {renderEditableText({
                as: 'h1',
                value: data.personalDetails.fullName,
                section: 'hero',
                className: `${getHeadingFont()} text-4xl sm:text-5xl md:text-6xl font-black leading-tight text-stone-900 tracking-tight`,
                onChange: (value) => updatePersonalDetail('fullName', value),
              })}
              
              {renderEditableText({
                as: 'p',
                value: data.personalDetails.tagline,
                section: 'hero',
                multiline: true,
                className: `font-sans font-bold text-lg sm:text-xl leading-snug ${theme.highlight}`,
                onChange: (value) => updatePersonalDetail('tagline', value),
              })}
            </div>

            <div className={`h-px w-24 ${theme.divider}`} />

            {/* Introduction Narrative */}
            {renderEditableText({
              as: 'p',
              value: data.personalDetails.shortIntro,
              section: 'hero',
              multiline: true,
              className: 'font-sans text-[14px] md:text-[15px] opacity-90 leading-relaxed font-normal',
              onChange: (value) => updatePersonalDetail('shortIntro', value),
            })}

            <div className="pt-2 flex flex-wrap gap-4">
              <a 
                href="#about-section"
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold font-sans text-xs tracking-wider uppercase transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ${theme.accentButton}`}
              >
                <span>Read My Story</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </a>
              <a 
                href="#contact-section"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent hover:bg-stone-500/5 text-stone-800 border border-stone-300 rounded-xl font-bold font-sans text-xs tracking-wider uppercase transition-all"
              >
                <span>Send Message</span>
              </a>
            </div>
          </div>

        </section>

        {/* ========================================================= */}
        {/* 2. CHRONICLE OVERVIEW & VALUES (Bento Grid)              */}
        {/* ========================================================= */}
        <section
          className={`space-y-12 ${getEditHighlightClass('about')}`}
          id="about-section"
          {...getSectionInteractionProps('about')}
        >
          
          {/* Section Header */}
          <div className="text-left max-w-2xl">
            <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 font-mono text-[9px] tracking-widest font-black uppercase rounded-sm inline-block mb-3">
              02 / THE ARCHIVAL ESSENCE
            </span>
            <h2 className={`${getHeadingFont()} text-3xl md:text-4xl font-black tracking-tight text-stone-900`}>
              {sectionCopy.about.title}
            </h2>
            {renderEditableText({
              as: 'p',
              value: sectionCopy.about.description,
              section: 'about',
              multiline: true,
              className: 'font-sans text-xs md:text-sm text-stone-500 mt-1.5',
              onChange: (value) => updateSectionDescription('about', value),
            })}
          </div>

          {/* Bento Grid Layout - Fills all space neatly */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Card 1: Main Story Block (Col-span 7) */}
            <div className={`lg:col-span-7 rounded-3xl border p-8 md:p-10 text-left space-y-6 flex flex-col justify-start h-full ${theme.card}`}>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <h4 className="font-mono text-[9px] font-black uppercase tracking-widest text-stone-400">
                    BIOGRAPHY JOURNAL
                  </h4>
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 leading-tight">
                  The Journey of My Hands
                </h3>
                <div className="font-sans text-[14px] opacity-95 leading-relaxed space-y-4">
                  {data.personalDetails.bioFull.split('\n\n').map((paragraph, index, paragraphs) => (
                    <React.Fragment key={index}>
                      {renderEditableText({
                        as: 'p',
                        value: paragraph,
                        section: 'about',
                        multiline: true,
                        onChange: (value) => {
                          const updatedParagraphs = [...paragraphs];
                          updatedParagraphs[index] = value;
                          updatePersonalDetail('bioFull', updatedParagraphs.join('\n\n'));
                        },
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Decorative blockquote */}
              <div className="bg-[#FFFDF9] border border-amber-200/50 rounded-2xl p-5 italic text-sm text-stone-700 leading-relaxed font-serif relative mt-2">
                <span className="text-amber-500 font-bold block mb-1 text-2xl leading-none">“</span>
                {renderEditableText({
                  as: 'p',
                  value: data.personalDetails.signatureQuote,
                  section: 'about',
                  multiline: true,
                  className: '-mt-2 pl-4',
                  onChange: (value) => updatePersonalDetail('signatureQuote', value),
                })}
              </div>
            </div>

            {/* Card 2: Personal Values Block (Col-span 5) */}
            <div className={`lg:col-span-5 rounded-3xl border p-8 md:p-10 text-left flex flex-col justify-center h-full ${theme.card}`}>
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-100/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <h4 className="font-mono text-[9px] font-black uppercase tracking-widest text-stone-400">
                    CORE BELIEFS & STANDARDS
                  </h4>
                </div>
                
                <ul className="space-y-6">
                  {data.values.map((val, index) => (
                    <li key={val.id} className="flex gap-4 items-start group">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 transition-colors bg-orange-50 border-orange-100 text-orange-700">
                        {renderIcon(val.icon, "w-4.5 h-4.5")}
                      </div>
                      <div>
                        {renderEditableText({
                          as: 'h5',
                          value: val.title,
                          section: 'about',
                          className: 'font-serif text-[14px] font-bold text-stone-900',
                          onChange: (value) => updateValueItem(index, 'title', value),
                        })}
                        {renderEditableText({
                          as: 'p',
                          value: val.description,
                          section: 'about',
                          multiline: true,
                          className: 'font-sans text-[11.5px] text-stone-500 leading-relaxed mt-1',
                          onChange: (value) => updateValueItem(index, 'description', value),
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Specialized Pursuits - Displayed below in a gorgeous full-width row */}
          <div className={`rounded-3xl border p-8 md:p-10 text-left space-y-6 ${theme.card}`}>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <h4 className="font-mono text-[9px] font-black uppercase tracking-widest text-stone-400">
                SPECIALIZED PURSUITS
              </h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-1">
              {data.hobbies.map((hob, index) => (
                <div key={hob.id} className="text-left space-y-2 group">
                  <div className="aspect-video rounded-2xl overflow-hidden bg-stone-100 relative border border-stone-200/40 shadow-xs">
                    <img 
                      src={hob.imageUrl} 
                      alt={hob.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="absolute top-3 left-3 bg-stone-900/85 backdrop-blur-xs w-6 h-6 rounded-md flex items-center justify-center text-amber-100 border border-stone-800 shadow-xs">
                      {renderIcon(hob.icon, "w-3.5 h-3.5 text-amber-400")}
                    </div>
                  </div>
                  {renderEditableText({
                    as: 'h5',
                    value: hob.title,
                    section: 'about',
                    className: 'font-serif text-xs font-black text-stone-900 pt-1 group-hover:text-amber-700 transition-colors',
                    onChange: (value) => updateHobbyItem(index, 'title', value),
                  })}
                  {renderEditableText({
                    as: 'p',
                    value: hob.description,
                    section: 'about',
                    multiline: true,
                    className: 'font-sans text-[11px] text-stone-500 leading-relaxed line-clamp-3',
                    onChange: (value) => updateHobbyItem(index, 'description', value),
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. CHRONOLOGICAL TIMELINE (With Integrated Media Cards)   */}
        {/* ========================================================= */}
        <section
          className={`space-y-6 ${getEditHighlightClass('timeline')}`}
          id="timeline-section"
          {...getSectionInteractionProps('timeline')}
        >
          
          {/* Section Header */}
          <div className="text-left max-w-2xl">
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-[9px] tracking-widest font-black uppercase rounded-sm inline-block mb-3">
              03 / CHRONOLOGY OF ERAS
            </span>
            <h2 className={`${getHeadingFont()} text-3xl md:text-4xl font-black tracking-tight text-stone-900`}>
              {sectionCopy.timeline.title}
            </h2>
            {renderEditableText({
              as: 'p',
              value: sectionCopy.timeline.description,
              section: 'timeline',
              multiline: true,
              className: 'font-sans text-xs md:text-sm text-stone-500 mt-1.5',
              onChange: (value) => updateSectionDescription('timeline', value),
            })}
          </div>

          {/* Timeline Backbone */}
          <div className="relative border-l-2 border-stone-300/40 ml-4 md:ml-10 pl-8 md:pl-16 space-y-6 py-1">
            
            {data.timeline.map((milestone, idx) => (
              <div key={milestone.id} className="relative text-left group">
                
                {/* Visual Timeline Node */}
                <div className="absolute -left-[41px] md:-left-[73px] top-2 w-6 h-6 rounded-full bg-white border-4 flex items-center justify-center shadow-xs transition-colors group-hover:border-amber-600 border-amber-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                </div>

                {/* Milestone Container Split */}
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-2xl border p-6 transition-colors duration-300 ${theme.card} ${theme.accentHover}`}>
                  
                  {/* Left block of Milestone Card */}
                  <div className={`${milestone.imageUrl ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-2`}>
                    {renderEditableText({
                      value: milestone.year,
                      section: 'timeline',
                      className: 'px-2.5 py-1 bg-stone-900 text-amber-50 text-[9px] font-mono font-black tracking-widest rounded-md block w-fit',
                      onChange: (value) => updateTimelineItem(idx, { year: value }),
                    })}
                    {renderEditableText({
                      as: 'h3',
                      value: milestone.title,
                      section: 'timeline',
                      className: 'font-serif text-lg md:text-xl font-bold text-stone-900 leading-tight',
                      onChange: (value) => updateTimelineItem(idx, { title: value }),
                    })}
                    <div className="flex items-center gap-1 opacity-70 text-[10px] font-mono uppercase tracking-widest">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      {renderEditableText({
                        value: milestone.location,
                        section: 'timeline',
                        onChange: (value) => updateTimelineItem(idx, { location: value }),
                      })}
                    </div>

                    {/* Integrated Historical Image (if provided) */}
                    {milestone.imageUrl && (
                      <div className="pt-2">
                        <div className="rounded-xl overflow-hidden aspect-[1.9/1] bg-stone-100 border border-stone-200/50 p-1 bg-white shadow-xs">
                          <img 
                            src={milestone.imageUrl} 
                            alt={milestone.title} 
                            className="w-full h-full object-cover rounded-lg filter sepia-[0.1]"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        {milestone.imageCaption && renderEditableText({
                            as: 'p',
                            value: milestone.imageCaption,
                            section: 'timeline',
                            multiline: true,
                            className: 'font-mono text-[8px] text-stone-400 mt-1 leading-normal italic',
                            onChange: (value) => updateTimelineItem(idx, { imageCaption: value }),
                          })}
                      </div>
                    )}
                  </div>

                  {/* Right block of Milestone Card */}
                  <div className={`${milestone.imageUrl ? 'lg:col-span-8' : 'lg:col-span-9'} text-sm leading-relaxed text-stone-600 border-t lg:border-t-0 lg:border-l border-stone-200/40 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-start lg:justify-between space-y-3 lg:space-y-0 lg:h-full`}>
                    {renderEditableText({
                      as: 'p',
                      value: milestone.description,
                      section: 'timeline',
                      multiline: true,
                      className: 'italic text-stone-800',
                      onChange: (value) => updateTimelineItem(idx, { description: value }),
                    })}
                    
                    <div className="space-y-2 bg-[#FAF8F5]/40 rounded-xl p-4 border border-stone-100/50">
                      <h4 className="font-mono text-[9px] font-extrabold tracking-widest text-stone-450 uppercase">
                        ACHIEVEMENTS / RECOLLECTIONS
                      </h4>
                      <ul className="list-none space-y-1.5 font-sans text-xs">
                        {milestone.details.map((detail, dIdx) => (
                          <li key={dIdx} className="flex gap-2 items-start text-stone-700">
                            <span className="text-amber-600 font-bold shrink-0 mt-0.5">▪</span>
                            {renderEditableText({
                              value: detail,
                              section: 'timeline',
                              multiline: true,
                              onChange: (value) => {
                                const nextDetails = [...milestone.details];
                                nextDetails[dIdx] = value;
                                updateTimelineItem(idx, { details: nextDetails });
                              },
                            })}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. MULTIMEDIA GALLERY (Dense 6-Item Aesthetic Polaroid Grid)*/}
        {/* ========================================================= */}
        <section
          className={`space-y-12 ${getEditHighlightClass('gallery')}`}
          id="gallery-section"
          {...getSectionInteractionProps('gallery')}
        >
          
          {/* Section Header */}
          <div className="text-left max-w-2xl">
            <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 font-mono text-[9px] tracking-widest font-black uppercase rounded-sm inline-block mb-3">
              04 / MULTIMEDIA ARCHIVES
            </span>
            <h2 className={`${getHeadingFont()} text-3xl md:text-4xl font-black tracking-tight text-stone-900`}>
              {sectionCopy.gallery.title}
            </h2>
            {renderEditableText({
              as: 'p',
              value: sectionCopy.gallery.description,
              section: 'gallery',
              multiline: true,
              className: 'font-sans text-xs md:text-sm text-stone-500 mt-1.5',
              onChange: (value) => updateSectionDescription('gallery', value),
            })}
          </div>

          {/* Cards Gallery Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.gallery.map((item, idx) => (
              <div 
                key={item.id} 
                className={`rounded-2xl border p-4 text-left group transition-all duration-300 flex flex-col justify-between ${theme.card} ${theme.accentHover} hover:shadow-md`}
              >
                <div>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 mb-4 border border-stone-200/20 relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-all duration-500 filter contrast-[1.02]"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-xs px-2 py-0.5 text-[8px] font-mono text-white rounded-md tracking-wider">
                      {item.category.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-mono text-[9px] uppercase tracking-widest font-black ${theme.highlight}`}>
                      {item.category} RECORD
                    </span>
                    {item.year && (
                      <span className="font-mono text-[9px] text-stone-400 font-bold">
                        EST.{' '}
                        {renderEditableText({
                          value: item.year,
                          section: 'gallery',
                          onChange: (value) => updateGalleryItem(idx, { year: value }),
                        })}
                      </span>
                    )}
                  </div>
                  
                  {renderEditableText({
                    as: 'h4',
                    value: item.title,
                    section: 'gallery',
                    className: 'font-serif text-base font-bold text-stone-900',
                    onChange: (value) => updateGalleryItem(idx, { title: value }),
                  })}
                </div>
                
                {renderEditableText({
                  as: 'p',
                  value: item.caption,
                  section: 'gallery',
                  multiline: true,
                  className: 'font-sans text-[11px] text-stone-500 mt-1 leading-relaxed border-t border-stone-100/50 pt-2.5 mt-3',
                  onChange: (value) => updateGalleryItem(idx, { caption: value }),
                })}
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. NARRATIVES & MEMORIES (Detailed Stories Trilogy)       */}
        {/* ========================================================= */}
        <section
          className={`space-y-12 animate-fade-in ${getEditHighlightClass('stories')}`}
          id="stories-section"
          {...getSectionInteractionProps('stories')}
        >
          
          {/* Section Header */}
          <div className="text-left max-w-2xl">
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-[9px] tracking-widest font-black uppercase rounded-sm inline-block mb-3">
              05 / CHRONICLE NARRATIVES
            </span>
            <h2 className={`${getHeadingFont()} text-3xl md:text-4xl font-black tracking-tight text-stone-900`}>
              {sectionCopy.stories.title}
            </h2>
            {renderEditableText({
              as: 'p',
              value: sectionCopy.stories.description,
              section: 'stories',
              multiline: true,
              className: 'font-sans text-xs md:text-sm text-stone-500 mt-1.5',
              onChange: (value) => updateSectionDescription('stories', value),
            })}
          </div>

          {/* Stories Blog Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {data.stories.map((story, index) => (
              <article 
                key={story.id} 
                className={`rounded-3xl overflow-hidden border flex flex-col justify-between text-left group transition-all duration-300 ${theme.card} ${theme.accentHover} hover:shadow-md`}
              >
                <div>
                  {/* Image Preview */}
                  <div className="aspect-[16/10] overflow-hidden bg-stone-100 relative shrink-0">
                    <img 
                      src={story.imageUrl} 
                      alt={story.title} 
                      className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {renderEditableText({
                      value: story.category,
                      section: 'stories',
                      className: 'absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs px-2.5 py-1 text-[8px] font-mono text-amber-200 rounded-md tracking-wider uppercase font-black',
                      onChange: (value) => updateStoryItem(index, 'category', value),
                    })}
                  </div>

                  {/* Text content area */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[9px] font-mono text-stone-400">
                      {renderEditableText({
                        value: story.readTime,
                        section: 'stories',
                        className: 'font-bold uppercase tracking-wider text-orange-600',
                        onChange: (value) => updateStoryItem(index, 'readTime', value),
                      })}
                      {renderEditableText({
                        value: story.date,
                        section: 'stories',
                        onChange: (value) => updateStoryItem(index, 'date', value),
                      })}
                    </div>

                    {renderEditableText({
                      as: 'h3',
                      value: story.title,
                      section: 'stories',
                      className: 'font-serif text-lg font-bold text-stone-950 leading-tight group-hover:text-amber-800 transition-colors',
                      onChange: (value) => updateStoryItem(index, 'title', value),
                    })}

                    {renderEditableText({
                      as: 'p',
                      value: story.shortDescription,
                      section: 'stories',
                      multiline: true,
                      className: 'font-sans text-stone-600 text-xs leading-relaxed line-clamp-4',
                      onChange: (value) => updateStoryItem(index, 'shortDescription', value),
                    })}
                  </div>
                </div>

                {/* Footer action link */}
                <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between mt-4">
                  <span className="font-mono text-[8px] text-stone-400 font-bold uppercase tracking-widest">
                    CHRONICLE ARCHIVE
                  </span>
                  <div className="flex items-center gap-1.5 text-stone-700 font-sans font-bold text-xs uppercase tracking-wider group-hover:text-amber-600 transition-colors">
                    <span>Archived Log</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                </div>

              </article>
            ))}
          </div>

        </section>

        {/* ========================================================= */}
        {/* 6. CONTACT SECTION (Rustic Oregon Cabin Postbox Theme)    */}
        {/* ========================================================= */}
        <section
          className={`rounded-3xl border p-8 md:p-12 ${theme.card} ${getEditHighlightClass('contact')}`}
          id="contact-section"
          {...getSectionInteractionProps('contact')}
        >
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch text-left">
            
            {/* Contact text and details (Col: 5/12) */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-[9px] tracking-widest font-black uppercase rounded-sm inline-block">
                    06 / REACH OUT
                  </span>
                  <h2 className={`${getHeadingFont()} text-3xl font-black text-stone-900`}>
                    {sectionCopy.contact.title}
                  </h2>
                  {renderEditableText({
                    as: 'p',
                    value: sectionCopy.contact.description,
                    section: 'contact',
                    multiline: true,
                    className: 'font-sans text-xs text-stone-500 leading-relaxed',
                    onChange: (value) => updateSectionDescription('contact', value),
                  })}
                </div>

                {/* Contact Detail Card */}
                <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${theme.innerCard}`}>
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-[8px] text-stone-400 block font-bold">CABIN MAILBOX</span>
                    {renderEditableText({
                      value: contactEmail,
                      section: 'contact',
                      className: 'font-sans text-xs font-bold text-stone-850 hover:underline cursor-pointer',
                      onChange: (value) => updatePersonalDetail('contactEmail', value),
                    })}
                  </div>
                </div>
              </div>

              {/* Social Channels List */}
              <div className="space-y-3">
                <h4 className="font-mono text-[9px] text-stone-400 uppercase tracking-widest font-extrabold">
                  CONNECT ON SOCIAL STATIONS
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <span className={`p-3 rounded-xl border flex items-center gap-2.5 text-stone-600 transition-all duration-300 hover:border-amber-500/50 hover:text-stone-900 cursor-pointer ${theme.innerCard}`}>
                    <Instagram className="w-4 h-4 text-stone-500" />
                    {renderEditableText({
                      value: instagramHandle,
                      section: 'contact',
                      className: 'font-sans text-xs font-semibold',
                      onChange: (value) => updatePersonalDetail('instagramHandle', value),
                    })}
                  </span>
                  
                  <span className={`p-3 rounded-xl border flex items-center gap-2.5 text-stone-600 transition-all duration-300 hover:border-amber-500/50 hover:text-stone-900 cursor-pointer ${theme.innerCard}`}>
                    <Twitter className="w-4 h-4 text-stone-500" />
                    {renderEditableText({
                      value: twitterHandle,
                      section: 'contact',
                      className: 'font-sans text-xs font-semibold',
                      onChange: (value) => updatePersonalDetail('twitterHandle', value),
                    })}
                  </span>

                  <span className={`p-3 rounded-xl border flex items-center gap-2.5 text-stone-600 transition-all duration-300 hover:border-amber-500/50 hover:text-stone-900 cursor-pointer ${theme.innerCard}`}>
                    <Facebook className="w-4 h-4 text-stone-500" />
                    {renderEditableText({
                      value: facebookLabel,
                      section: 'contact',
                      className: 'font-sans text-xs font-semibold',
                      onChange: (value) => updatePersonalDetail('facebookLabel', value),
                    })}
                  </span>

                  <span className={`p-3 rounded-xl border flex items-center gap-2.5 text-stone-600 transition-all duration-300 hover:border-amber-500/50 hover:text-stone-900 cursor-pointer ${theme.innerCard}`}>
                    <Linkedin className="w-4 h-4 text-stone-500" />
                    {renderEditableText({
                      value: linkedinLabel,
                      section: 'contact',
                      className: 'font-sans text-xs font-semibold',
                      onChange: (value) => updatePersonalDetail('linkedinLabel', value),
                    })}
                  </span>
                </div>
              </div>

            </div>

            {/* Contact Form Container */}
            <div className={`lg:col-span-7 bg-[#FFFDF9] border border-amber-200/40 p-6 md:p-8 rounded-2xl relative flex flex-col justify-center h-full`}>
              {isSubmitted ? (
                <div className="bg-emerald-50/50 border border-emerald-200/60 p-8 rounded-xl text-center space-y-4 my-8">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                    <Send className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">Message Sent!</h3>
                  <p className="font-sans text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                    Thank you for writing. Your message has been received at the shore cabin mailbox. Julian will respond as soon as his hands are clear of saw work.
                  </p>
                  <button 
                    type="button" 
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2 text-xs font-mono font-bold text-emerald-700 hover:text-emerald-800 underline transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-serif text-lg font-bold text-stone-900 mb-6">
                    Send a Message to the Cabin
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] text-stone-400 font-extrabold uppercase">
                          YOUR FULL NAME *
                        </label>
                        <input 
                           type="text" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Sarah Miller" 
                          className={`w-full rounded-lg p-3 ${theme.input}`}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] text-stone-400 font-extrabold uppercase">
                          YOUR EMAIL ADDRESS *
                        </label>
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. sarah@example.com" 
                          className={`w-full rounded-lg p-3 ${theme.input}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] text-stone-400 font-extrabold uppercase">
                        SUBJECT OF INQUIRY
                      </label>
                      <input 
                        type="text" 
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. Heirloom Walnut Table Commission" 
                        className={`w-full rounded-lg p-3 ${theme.input}`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] text-stone-400 font-extrabold uppercase">
                        YOUR LETTER MESSAGE *
                      </label>
                      <textarea 
                        rows={4} 
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Type your message with clean hands..." 
                        className={`w-full rounded-lg p-3 resize-none ${theme.input}`}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-stone-900 hover:bg-stone-800 text-amber-100 p-3.5 rounded-lg font-bold tracking-wider uppercase text-xs inline-flex items-center justify-center gap-2 border border-stone-800 transition-colors disabled:opacity-55 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                    </button>

                  </form>
                </>
              )}
            </div>

          </div>
        </section>

      </div>

      {/* ========================================================= */}
      {/* GLOBAL FOOTER                                             */}
      {/* ========================================================= */}
      <footer className={`w-full border-t py-12 shrink-0 ${theme.footer}`}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-8 text-left">
          
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-orange-800 shrink-0 bg-orange-50">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-[9px] opacity-60 uppercase tracking-widest font-extrabold block">
                {data.personalDetails.fullName.toUpperCase()} // HISTORICAL ARCHIVE
              </span>
              <p className="font-sans text-[11px] opacity-50 mt-0.5">
                Honoring traditional forestry, hand joinery, and maritime vessel architecture.
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <span className="font-mono text-[9px] opacity-60 uppercase tracking-widest block font-black">
              COOS BAY TO CANNON BEACH // OREGON LANDS
            </span>
            <p className="font-sans text-[11px] opacity-50">
              &copy; 2026 {data.personalDetails.fullName}. Built with respect to the redwood forests.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
