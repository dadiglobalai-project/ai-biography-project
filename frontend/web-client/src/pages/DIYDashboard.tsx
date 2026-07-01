import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Lightbulb, 
  Check, 
  ArrowRight, 
  Plus, 
  LogOut, 
  ChevronRight, 
  Info,
  BookOpen,
  Award,
  PenTool,
  Compass,
  Star,
  AlertCircle
} from 'lucide-react';
import { authService } from '../services/authService';
import BrandLogo from '../components/BrandLogo';

type RelationType = 'Myself' | 'Parent' | 'Grandparent' | 'Child' | 'Spouse' | 'Loved One';

interface Template {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  tag: string;
}

export default function DIYDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ fullName?: string; email: string } | null>(null);
  const [selectedRelation, setSelectedRelation] = useState<RelationType>('Loved One');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  
  // Custom dialog or modal states
  const [modalContent, setModalContent] = useState<{ title: string; desc: string } | null>(null);

  React.useEffect(() => {
    let active = true;
    document.title = "DIY Dashboard | Xinghuoji";

    const loadDashboard = async () => {
      try {
        const session = await authService.getCurrentUser();
        if (!active) {
          return;
        }

        if (session.user) {
          setCurrentUser(session.user);
        }
      } catch {
        if (active) {
          navigate('/login', { replace: true });
        }
        return;
      }

      try {
        const dashboard = await authService.getDashboard();
        if (!active) {
          return;
        }

        if (dashboard.user) {
          setCurrentUser((previousUser) => ({
            email: dashboard.user?.email || previousUser?.email || '',
            fullName: dashboard.user?.fullName || previousUser?.fullName,
          }));
        }
        setDashboardError(null);
      } catch (err: any) {
        if (!active) {
          return;
        }

        const message = err?.message || 'Unable to load dashboard.';
        if (/unauthorized|forbidden|session|token/i.test(message)) {
          navigate('/login', { replace: true });
          return;
        }

        setDashboardError(message);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [navigate]);

  const relations: RelationType[] = ['Myself', 'Parent', 'Grandparent', 'Child', 'Spouse', 'Loved One'];

  // Map each selected relation option to a recommended template
  const getRecommendation = (relation: RelationType): { name: string; id: string } => {
    switch (relation) {
      case 'Myself':
        return { name: 'Personal Memoir', id: 'personal-memoir' };
      case 'Parent':
        return { name: 'Family Legacy', id: 'life-journey' };
      case 'Grandparent':
        return { name: 'Ancestor Chronicles', id: 'ancestor-chronicles' };
      case 'Child':
        return { name: 'Growth & Dreams', id: 'growth-dreams' };
      case 'Spouse':
        return { name: 'Love & Union', id: 'love-union' };
      case 'Loved One':
      default:
        return { name: 'Family Legacy', id: 'life-journey' };
    }
  };

  const recommended = getRecommendation(selectedRelation);
  const displayName = currentUser?.fullName || 'User';

  const templates: Template[] = [
    {
      id: 'visionary-legacy',
      title: 'Visionary Legacy',
      subtitle: 'The Visionary who changed the way WE LIVE',
      description: 'A high-contrast, bold template designed for leaders, innovators, and creators who forged new paths.',
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
      tag: 'Bold & Creative'
    },
    {
      id: 'life-journey',
      title: 'Life Journey',
      subtitle: 'A journey through the land',
      description: 'Complete autobiography template emphasizing chronologies, personal milestones, and wisdom gathered.',
      imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
      tag: 'Classic Memoir'
    },
    {
      id: 'entrepreneur-story',
      title: 'Entrepreneur Story',
      subtitle: 'Document your business adventures',
      description: 'Tailored for founders, pathfinders, and industry pioneers to archive their ventures, failures, and triumphs.',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
      tag: 'Professional'
    }
  ];

  const handleApplyRecommendation = () => {
    const matched = templates.find(t => t.id === recommended.id);
    if (matched) {
      setSelectedTemplateId(matched.id);
      setModalContent({
        title: `Recommended Template Applied!`,
        desc: `The "${matched.title}" template has been successfully selected as recommended for your ${selectedRelation}.`
      });
    } else {
      setModalContent({
        title: `Recommendation Applied`,
        desc: `"${recommended.name}" has been chosen for your ${selectedRelation}. Let's begin crafting this legacy.`
      });
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
    navigate('/login');
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplateId(template.id);
    setModalContent({
      title: `Template Selected: ${template.title}`,
      desc: `Excellent choice! You are starting the draft with the "${template.title}" aesthetic model. We are creating a secure archive space.`
    });
  };

  const handleCreateNew = () => {
    setModalContent({
      title: "Create New Biography",
      desc: "Starting a blank canvas project. Our AI guide will help structure your custom chapters as you write."
    });
  };

  const handleContinueDraft = () => {
    setModalContent({
      title: "Continue Draft",
      desc: "Loading your last saved auto-draft from the cloud repository. All media files are synchronized."
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans selection:bg-amber-200">
      
      {/* 1. Header Navigation matches Mockup 100% */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer max-w-[150px] sm:max-w-[190px]" 
            onClick={() => navigate('/preserve-story')}
          >
            <BrandLogo variant="mobile" className="w-full h-auto" />
          </div>

          {/* Nav links containing ONLY DIY Dashboard link with bold active line */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <button 
              onClick={() => navigate('/diy-dashboard')}
              className="text-[#0A1128] font-bold border-b-2 border-[#FED362] pb-1 transition-all cursor-pointer"
            >
              DIY Dashboard
            </button>
          </nav>

          {/* User Session Profile with Name & Avatar & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="font-sans text-sm font-bold text-[#0A1128]">
                {displayName}
              </span>
              <div className="relative w-8.5 h-8.5 rounded-full overflow-hidden border border-slate-200/80 shadow-sm bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150" 
                  alt={`${displayName} profile`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-10 md:py-14 space-y-12">
        
        {/* Welcome Back Greeting Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2 max-w-2xl">
            <h1 className="font-serif-display text-4xl md:text-5xl font-semibold text-[#0A1128] tracking-tight leading-tight">
              Welcome Back, {displayName}
            </h1>
            <p className="text-slate-500 italic text-sm md:text-base font-sans">
              "Every story preserved today becomes a legacy for tomorrow."
            </p>
          </div>

          {/* Action buttons (Right-aligned in desktop) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-black hover:bg-slate-900 active:scale-[0.98] text-white rounded-xl text-xs font-bold tracking-wide transition-all duration-150 shadow-sm cursor-pointer"
            >
              Create New Biography
            </button>
            <button
              onClick={handleContinueDraft}
              className="px-6 py-3 bg-white border border-slate-200 hover:border-slate-800 active:scale-[0.98] text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold tracking-wide transition-all duration-150 shadow-sm cursor-pointer"
            >
              Continue Draft
            </button>
          </div>
        </div>

        {dashboardError && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-3">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{dashboardError}</span>
          </div>
        )}

        {/* Interactive "Let AI Recommend a Template" Dark Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0A192F] rounded-3xl p-8 md:p-10 text-white relative overflow-hidden border border-slate-800 shadow-[0_20px_50px_rgba(10,25,47,0.15)]"
        >
          {/* Subtle top brand decoration line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FED362] to-amber-500" />
          
          <div className="absolute -right-24 -bottom-24 w-72 h-72 bg-amber-400/[0.04] rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-8 relative z-10">
            
            {/* Header info */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
                <Lightbulb className="w-5 h-5 fill-current" />
              </div>
              <h2 className="text-xl md:text-2xl font-serif-display font-semibold tracking-tight text-slate-100">
                Let AI Recommend a Template
              </h2>
            </div>

            {/* Question description */}
            <div className="space-y-4">
              <p className="text-slate-300 font-sans text-sm font-medium">
                Who are you creating this biography for?
              </p>

              {/* Grid of relative relation buttons */}
              <div className="flex flex-wrap gap-2.5">
                {relations.map((relation) => {
                  const isActive = selectedRelation === relation;
                  return (
                    <button
                      key={relation}
                      onClick={() => setSelectedRelation(relation)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide border transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-[#B18625] border-[#B18625] text-white shadow-md shadow-[#B18625]/20 scale-[1.03]' 
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {relation}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-white/10 pt-1" />

            {/* Live updated Recommended Template feedback info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">
                  Recommended Template:
                </span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={recommended.name}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 5 }}
                    className="text-sm font-semibold text-[#FED362] flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {recommended.name}
                  </motion.span>
                </AnimatePresence>
              </div>

              <button
                onClick={handleApplyRecommendation}
                className="flex items-center gap-1 text-xs font-bold text-[#FED362] hover:text-amber-300 tracking-wider uppercase transition-colors cursor-pointer self-start sm:self-auto group"
              >
                Apply Recommendation 
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

          </div>
        </motion.div>

        {/* "Choose a Biography Template" Main Showcase List */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif-display text-2xl md:text-3xl font-semibold text-[#0A1128] tracking-tight">
              Choose a Biography Template
            </h2>
            <p className="text-slate-500 text-sm">
              Start with a professionally designed template tailored to your life story.
            </p>
          </div>

          {/* Biography Templates Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {templates.map((template) => {
              const isSelected = selectedTemplateId === template.id;
              return (
                <div
                  key={template.id}
                  className={`bg-white rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-300 relative group cursor-pointer ${
                    isSelected 
                      ? 'border-[#FED362] shadow-[0_12px_35px_rgba(254,211,98,0.15)] ring-1 ring-[#FED362]' 
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-xl'
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                >
                  
                  {/* Image container & overlay with 100% styled screenshot layout */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                    <img 
                      src={template.imageUrl} 
                      alt={template.title}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark gradient overlay for typography readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                    {/* Top tag badge */}
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] font-mono font-bold tracking-wider bg-black/60 backdrop-blur-md text-[#FED362] px-2.5 py-1 rounded-full border border-white/10 uppercase">
                        {template.tag}
                      </span>
                    </div>

                    {/* Overlay Title & Description Texts */}
                    <div className="absolute bottom-5 inset-x-5 space-y-1">
                      <p className="text-[11px] font-sans text-slate-300 font-bold uppercase tracking-wider italic leading-none opacity-90">
                        "{template.subtitle}"
                      </p>
                      <h3 className="font-serif-display text-lg font-bold text-white leading-tight">
                        {template.title}
                      </h3>
                    </div>

                    {/* Selection halo check */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border border-white/20 shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Template body detail card area */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      {template.description}
                    </p>

                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold tracking-wide text-[#B18625] uppercase">
                        {isSelected ? 'Selected Active' : 'Select Theme'}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-100 group-hover:bg-[#FED362] group-hover:text-slate-900 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* 3. Black Square Floating Action Button (FAB) matching the mockup */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => {
            setModalContent({
              title: "Create Custom Legacy",
              desc: "Configure an adaptive layout. You can define custom typography, color boards, and archive options entirely tailored to your preferences."
            });
          }}
          className="w-12 h-12 rounded-xl bg-black hover:bg-slate-900 active:scale-[0.95] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-150 cursor-pointer group"
          title="Add Custom Template"
        >
          <Plus className="w-6 h-6 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* 4. Elegant Platform Footer */}
      <footer className="border-t border-slate-100 py-6 text-center select-none bg-white">
        <p className="text-[11px] text-slate-400 font-medium">
          &copy; 2026 Xinghuoji. The Eternal Spark. All rights reserved.
        </p>
      </footer>

      {/* Modern Pop-up / Modal Component for interactive user feedback */}
      <AnimatePresence>
        {modalContent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalContent(null)}
              className="absolute inset-0 bg-[#0A1128]/40 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 max-w-sm w-full shadow-2xl relative z-10 text-center space-y-5"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 fill-current" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif-display text-xl font-bold text-[#0A1128]">
                  {modalContent.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed font-sans">
                  {modalContent.desc}
                </p>
              </div>

              <button
                onClick={() => setModalContent(null)}
                className="w-full py-3 rounded-xl bg-black hover:bg-slate-900 text-white font-sans text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
