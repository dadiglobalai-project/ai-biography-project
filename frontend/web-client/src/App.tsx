import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Diamond, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Sparkles,
  Info,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

import LegalModal from './components/LegalModal';
import SuccessView from './components/SuccessView';
import BrandLogo from './components/BrandLogo';
import { RegisterFormState, FormErrors, ActiveFormView, LegalDocument } from './types';
import { TERMS_OF_SERVICE, PRIVACY_POLICY, AFTERLIFE_PROTOCOLS } from './data';

export default function App() {
  // Navigation / View State
  const [activeView, setActiveView] = useState<ActiveFormView>('register');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Field State
  const [form, setForm] = useState<RegisterFormState>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  });

  // Real-time touch tracking to show validation warnings cleanly
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Dynamic Validation Errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Server API states
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  // Password visibility triggers
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Legal Modal Control
  const [selectedLegalDoc, setSelectedLegalDoc] = useState<LegalDocument | null>(null);

  // Real-time validation calculator
  useEffect(() => {
    const newErrors: FormErrors = {};

    // Name check
    if (form.fullName.length > 0 && form.fullName.trim().length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters long';
    }

    // Email check using a clean regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email.length > 0 && !emailRegex.test(form.email)) {
      newErrors.email = 'Please select a valid email address';
    }

    // Password complex criteria
    if (form.password && form.password.length > 0) {
      if (form.password.length < 8) {
        newErrors.password = 'Password must be 8 or more characters';
      } else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
        newErrors.password = 'Include at least one letter and one number';
      }
    }

    // Password matching
    if (form.confirmPassword && form.confirmPassword.length > 0 && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms check
    if (touched.agreedToTerms && !form.agreedToTerms) {
      newErrors.agreedToTerms = 'You must acknowledge the terms to begin';
    }

    setErrors(newErrors);
  }, [form, touched]);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Mark input as touched on blur
  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  // Password Strength Indicator Calculation
  const calculatePasswordStrength = (): { level: number; label: string; bg: string; text: string } => {
    const pwd = form.password || '';
    if (!pwd) return { level: 0, label: 'No password', bg: 'bg-gray-100', text: 'text-gray-400' };
    if (pwd.length < 5) return { level: 1, label: 'Fragile', bg: 'bg-rose-500', text: 'text-rose-500' };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Za-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { level: 2, label: 'Moderate', bg: 'bg-amber-500', text: 'text-amber-500' };
    return { level: 3, label: 'Impervious', bg: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  const strength = calculatePasswordStrength();

  // Registration Submission Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setApiSuccess(null);

    // Trigger touched state on all elements
    const allTouched = {
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreedToTerms: true
    };
    setTouched(allTouched);

    // Final validation check
    const finalErrors: FormErrors = {};
    if (!form.fullName.trim()) {
      finalErrors.fullName = 'Full Name is required';
    } else if (form.fullName.trim().length < 3) {
      finalErrors.fullName = 'Full Name must be at least 3 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      finalErrors.email = 'Email address is required';
    } else if (!emailRegex.test(form.email)) {
      finalErrors.email = 'Please enter a valid email';
    }

    if (!form.password) {
      finalErrors.password = 'A password is required';
    } else if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      finalErrors.password = 'Please meet password guidelines';
    }

    if (form.password !== form.confirmPassword) {
      finalErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.agreedToTerms) {
      finalErrors.agreedToTerms = 'You must agree to the Terms & Privacy protocols';
    }

    setErrors(finalErrors);

    // If no client errors, initiate real server register
    if (Object.keys(finalErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setApiSuccess(data.message || 'Registration complete');
          setIsSubmitted(true);
        } else {
          setApiError(data.error || 'Registration failed');
        }
      } catch (err) {
        setApiError('Unable to connect to the archival nodes. Check connection.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Mock Login Submission Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setApiSuccess(null);

    let hasErrors = false;
    const loginErrors: FormErrors = {};

    if (!form.email) {
      loginErrors.email = 'Email address is required';
      hasErrors = true;
    }
    if (!form.password) {
      loginErrors.password = 'A password is required';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(loginErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setApiSuccess(data.message || 'Signature verified');
        // Update user state so success profile reads their real credential
        setForm(prev => ({
          ...prev,
          fullName: data.user?.fullName || 'Archival Successor'
        }));
        setIsSubmitted(true);
      } else {
        setApiError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setApiError('Unable to establish secure gateway session. Check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans select-none selection:bg-legacy-gold/30">
      
      {/* 1. LEFT PANEL: The Grand Constellation Library Imagery */}
      <div 
        id="archival-heritage-hero" 
        className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative items-stretch overflow-hidden select-none"
      >
        {/* Beautiful atmospheric image with no-referrer for safety */}
        <img 
          src="/src/assets/images/celestial_library_1781657848291.jpg" 
          alt="Xinghuoji Archival Sanctuary"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[12000ms] hover:scale-105"
        />

        {/* Cinematic rich warm shadow & starfield overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-legacy-navy/95 via-legacy-navy/60 to-legacy-navy/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/40 via-transparent to-legacy-navy/20" />
        
        {/* Subtle floating ambient specks */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[25%] left-[20%] w-20 h-20 bg-legacy-gold/20 rounded-full blur-2xl animate-ambient-pulse" />
          <div className="absolute bottom-[35%] right-[15%] w-32 h-32 bg-amber-500/10 rounded-full blur-3xl animate-ambient-pulse [animation-delay:3s]" />
        </div>

        {/* Content Panel (Left Column) */}
        <div className="relative w-full flex flex-col justify-between p-12 select-text text-white">
          
          {/* Top Logo Container */}
          <BrandLogo variant="hero" />

          {/* Centered Literary Quotes */}
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

          {/* Institutional Stamp Footer */}
          <div className="flex items-center gap-4 text-[10px] font-mono tracking-[0.25em] text-gray-400 select-none">
            <span>EST. 2024</span>
            <span className="h-px bg-legacy-gold/35 flex-1 max-w-[80px]" />
            <span className="text-legacy-gold-light/70 uppercase">Digital Archive of Humanity</span>
          </div>

        </div>
      </div>

      {/* 2. RIGHT PANEL: The Immersive Registration / Sign-in Interface */}
      <div 
        id="registration-portal-panel" 
        className="w-full lg:w-[55%] xl:w-[50%] bg-white flex flex-col justify-center relative p-6 sm:p-10 md:p-16 overflow-y-auto"
      >
        
        {/* Subtle, beautiful modern layout glow for right panel */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-legacy-gold/[0.02] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-sky-200/[0.02] rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {isSubmitted ? (
            
            /* SUCCESS REGISTRY CERTIFICATE STATE */
            <SuccessView 
              fullName={form.fullName}
              email={form.email}
              onContinue={() => {
                setIsSubmitted(false);
                setForm({
                  fullName: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  agreedToTerms: false
                });
                setTouched({});
              }}
            />

          ) : (

            /* CORE FORM VIEW (REGISTER AND LOGIN TOGGLE) */
            <motion.div 
              key={activeView}
              initial={{ opacity: 0, x: activeView === 'register' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeView === 'register' ? -20 : 20 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-md mx-auto relative z-10"
            >
              
              {/* Header section (Dynamic titles for accessibility) */}
              <div className="mb-10 text-left">
                
                {/* Responsive Mobile Logo display (only visible when Left Panel is hidden) */}
                <BrandLogo variant="mobile" className="mb-6 lg:hidden" />

                <h2 className="font-serif-display text-4xl text-legacy-navy font-semibold tracking-normal leading-tight mb-2">
                  {activeView === 'register' ? 'Begin Your Legacy' : 'Enter the Sanctuary'}
                </h2>
                <p className="text-gray-500 font-sans text-sm md:text-base">
                  {activeView === 'register' 
                    ? 'Join a community dedicated to preserving the stories that matter most.' 
                    : 'Access and tend your eternal chronicle of memories and media.'
                  }
                </p>
              </div>

              {/* REGISTER INTAKE FORM */}
              {activeView === 'register' ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-6" noValidate>
                  
                  {apiError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-rose-50/80 border border-rose-150 rounded-lg text-rose-700 text-xs flex items-start gap-2.5 font-sans"
                    >
                      <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{apiError}</span>
                    </motion.div>
                  )}
                  
                  {/* Full Name Input Block */}
                  <div className="relative group">
                    <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-gray-400 group-focus-within:text-legacy-gold transition-colors duration-200">
                      FULL NAME
                    </label>
                    <div className="relative mt-1 border-b border-gray-200 group-focus-within:border-legacy-gold transition-colors duration-300 py-1.5 flex items-center">
                      <User className="absolute left-0 w-4 h-4 text-gray-400 group-focus-within:text-legacy-gold transition-colors duration-200" />
                      <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('fullName')}
                        placeholder="Theodore Roosevelt"
                        className="w-full pl-6 pr-4 bg-transparent outline-none border-none text-sm text-legacy-navy placeholder-gray-300 font-sans select-text focus:ring-0"
                        required
                        autoComplete="name"
                      />
                      {touched.fullName && (
                        <div className="absolute right-0">
                          {errors.fullName ? (
                            <AlertCircle className="w-4 h-4 text-rose-500 animate-bounce" />
                          ) : form.fullName.trim() ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : null}
                        </div>
                      )}
                    </div>
                    {touched.fullName && errors.fullName && (
                      <p className="text-xs text-rose-500 mt-1 font-sans flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-rose-500 inline-block" /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email Address Input Block */}
                  <div className="relative group">
                    <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-gray-400 group-focus-within:text-legacy-gold transition-colors duration-200">
                      EMAIL ADDRESS
                    </label>
                    <div className="relative mt-1 border-b border-gray-200 group-focus-within:border-legacy-gold transition-colors duration-300 py-1.5 flex items-center">
                      <Mail className="absolute left-0 w-4 h-4 text-gray-400 group-focus-within:text-legacy-gold transition-colors duration-200" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('email')}
                        placeholder="theo@legacy.com"
                        className="w-full pl-6 pr-4 bg-transparent outline-none border-none text-sm text-legacy-navy placeholder-gray-300 font-sans select-text focus:ring-0"
                        required
                        autoComplete="email"
                      />
                      {touched.email && (
                        <div className="absolute right-0">
                          {errors.email ? (
                            <AlertCircle className="w-4 h-4 text-rose-500 animate-bounce" />
                          ) : form.email ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : null}
                        </div>
                      )}
                    </div>
                    {touched.email && errors.email && (
                      <p className="text-xs text-rose-500 mt-1 font-sans flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-rose-500 inline-block" /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Input Block */}
                  <div className="relative group">
                    <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-gray-400 group-focus-within:text-legacy-gold transition-colors duration-200">
                      CHOOSE A PASSWORD
                    </label>
                    <div className="relative mt-1 border-b border-gray-200 group-focus-within:border-legacy-gold transition-colors duration-300 py-1.5 flex items-center">
                      <Lock className="absolute left-0 w-4 h-4 text-gray-400 group-focus-within:text-legacy-gold transition-colors duration-200" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('password')}
                        placeholder="••••••••••••"
                        className="w-full pl-6 pr-10 bg-transparent outline-none border-none text-sm text-legacy-navy placeholder-gray-300 font-mono focus:ring-0 select-text"
                        required
                        autoComplete="new-password"
                      />
                      
                      {/* Password Visibility Toggle */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 p-1.5 rounded-full hover:bg-slate-100 text-gray-400 hover:text-legacy-navy transition-colors duration-200 outline-none"
                        title={showPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>

                    {/* Passive Live Password Indicators */}
                    {form.password && form.password.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex gap-1">
                          {[1, 2, 3].map((step) => (
                            <span 
                              key={step} 
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                strength.level >= step ? strength.bg : 'bg-gray-100'
                              }`} 
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 uppercase font-mono">
                          <span>SECURITY LEVEL</span>
                          <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                        </div>
                      </div>
                    )}

                    {touched.password && errors.password && (
                      <p className="text-xs text-rose-500 mt-1 font-sans flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-rose-500 inline-block" /> {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Input Block */}
                  <div className="relative group">
                    <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-gray-400 group-focus-within:text-legacy-gold transition-colors duration-200">
                      CONFIRM YOUR PASSWORD
                    </label>
                    <div className="relative mt-1 border-b border-gray-200 group-focus-within:border-legacy-gold transition-colors duration-300 py-1.5 flex items-center">
                      <Lock className="absolute left-0 w-4 h-4 text-gray-400 group-focus-within:text-legacy-gold transition-colors duration-200" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        placeholder="••••••••••••"
                        className="w-full pl-6 pr-10 bg-transparent outline-none border-none text-sm text-legacy-navy placeholder-gray-300 font-mono focus:ring-0 select-text"
                        required
                        autoComplete="new-password"
                      />
                      
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-0 p-1.5 rounded-full hover:bg-slate-100 text-gray-400 hover:text-legacy-navy transition-colors duration-200 outline-none"
                        title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="text-xs text-rose-500 mt-1 font-sans flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-rose-500 inline-block" /> {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Terms & Conditions Checkbox Anchor */}
                  <div className="flex items-start gap-3 mt-4 text-left">
                    <div className="relative flex items-center h-5 mt-0.5">
                      <input
                        id="agreedToTerms"
                        name="agreedToTerms"
                        type="checkbox"
                        checked={form.agreedToTerms}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('agreedToTerms')}
                        className="w-4.5 h-4.5 rounded border border-gray-300 text-legacy-navy focus:ring-legacy-gold/30 accent-legacy-navy cursor-pointer"
                        required
                      />
                    </div>
                    <div className="text-xs text-gray-500 font-sans leading-relaxed select-text">
                      <label htmlFor="agreedToTerms" className="cursor-pointer">
                        I agree to the{' '}
                      </label>
                      <button
                        type="button"
                        onClick={() => setSelectedLegalDoc(TERMS_OF_SERVICE)}
                        className="font-semibold text-legacy-navy underline hover:text-legacy-gold cursor-pointer transition-colors duration-200"
                      >
                        Terms of Service
                      </button>
                      <span> and </span>
                      <button
                        type="button"
                        onClick={() => setSelectedLegalDoc(PRIVACY_POLICY)}
                        className="font-semibold text-legacy-navy underline hover:text-legacy-gold cursor-pointer transition-colors duration-200"
                      >
                        Privacy Policy
                      </button>
                      <span>, including the </span>
                      <button
                        type="button"
                        onClick={() => setSelectedLegalDoc(AFTERLIFE_PROTOCOLS)}
                        className="font-semibold text-legacy-navy underline hover:text-legacy-gold cursor-pointer transition-colors duration-200"
                      >
                        digital afterlife protocols
                      </button>
                      <span>.</span>
                      {touched.agreedToTerms && errors.agreedToTerms && (
                        <p className="text-xs text-rose-500 mt-1.5 font-sans flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" /> {errors.agreedToTerms}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Primary REGISTER Button ("CREATE YOUR LEGACY" in wireframe) */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-legacy-navy hover:bg-legacy-navy-light disabled:bg-legacy-navy/60 text-white font-cinzel text-xs font-bold tracking-[0.2em] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 select-none relative overflow-hidden"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        COMPILING RECORD...
                      </span>
                    ) : (
                      <>
                        CREATE YOUR LEGACY
                        <Sparkles className="w-4.5 h-4.5 text-legacy-gold animate-pulse fill-legacy-gold/30" />
                      </>
                    )}
                  </button>

                </form>
              ) : (

                /* MOCK LOGIN FORM */
                <form onSubmit={handleLoginSubmit} className="space-y-6" noValidate>

                  {apiError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-rose-50/80 border border-rose-150 rounded-lg text-rose-700 text-xs flex items-start gap-2.5 font-sans"
                    >
                      <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{apiError}</span>
                    </motion.div>
                  )}
                  
                  {/* Email Input */}
                  <div className="relative group">
                    <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-gray-400 group-focus-within:text-legacy-gold transition-colors duration-200">
                      EMAIL ADDRESS
                    </label>
                    <div className="relative mt-1 border-b border-gray-200 group-focus-within:border-legacy-gold transition-colors duration-300 py-1.5 flex items-center">
                      <Mail className="absolute left-0 w-4 h-4 text-gray-400 group-focus-within:text-legacy-gold transition-colors duration-200" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="theo@legacy.com"
                        className="w-full pl-6 pr-4 bg-transparent outline-none border-none text-sm text-legacy-navy placeholder-gray-300 font-sans focus:ring-0 select-text"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="relative group">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-gray-400 group-focus-within:text-legacy-gold transition-colors duration-200">
                        PASSWORD
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('Secret recovery is mapped to your designated trust trustee.')}
                        className="text-[10px] font-mono text-legacy-gold hover:text-legacy-gold-dark transition-colors"
                      >
                        FORGOT PASSWORD?
                      </button>
                    </div>
                    <div className="relative mt-1 border-b border-gray-200 group-focus-within:border-legacy-gold transition-colors duration-300 py-1.5 flex items-center">
                      <Lock className="absolute left-0 w-4 h-4 text-gray-400 group-focus-within:text-legacy-gold transition-colors duration-200" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleInputChange}
                        placeholder="••••••••••••"
                        className="w-full pl-6 pr-10 bg-transparent outline-none border-none text-sm text-legacy-navy placeholder-gray-300 font-mono focus:ring-0 select-text"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 p-1.5 rounded-full hover:bg-slate-100 text-gray-400 hover:text-legacy-navy transition-colors duration-200 outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  {/* AUTHORIZE GATE BUTTON */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-legacy-navy hover:bg-legacy-navy-light disabled:bg-legacy-navy/60 text-white font-cinzel text-xs font-bold tracking-[0.2em] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 select-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        VERIFYING SIGNATURE...
                      </span>
                    ) : (
                      <>
                        ACCESS YOUR ARCHIVES
                        <ArrowRight className="w-4.5 h-4.5 ml-1" />
                      </>
                    )}
                  </button>

                </form>
              )}

              {/* 3. DIVIDER: "OR SECURE WITH" / "OR SECURE" */}
              <div className="relative my-8 select-none">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-150" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-4 text-[10px] font-mono tracking-[0.2em] uppercase text-gray-400">
                    OR SECURE WITH
                  </span>
                </div>
              </div>

              {/* 4. THIRD-PARTY GOOGLE LOG-IN BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setIsSubmitting(true);
                  setTimeout(() => {
                    setIsSubmitting(false);
                    // Autofill for user-friendly testing
                    setForm(prev => ({
                      ...prev,
                      fullName: 'Theodore Roosevelt',
                      email: 'theo@legacy.com'
                    }));
                    alert('Authenticated securely via Google Identity Authority. Field presets synchronized.');
                  }, 800);
                }}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 hover:border-legacy-gold/50 bg-white rounded-lg text-slate-700 hover:text-legacy-navy font-sans text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:bg-slate-50/50"
              >
                {/* Standard Google Multi-Color Identity Vector Logo */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>

              {/* 5. SELECTION TOGGLE FOOTER */}
              <div className="mt-8 text-center text-xs">
                <p className="text-gray-500 font-sans">
                  {activeView === 'register' ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveView('login');
                          setTouched({});
                          setApiError(null);
                          setApiSuccess(null);
                        }}
                        className="font-semibold text-legacy-navy underline hover:text-legacy-gold cursor-pointer transition-colors duration-200"
                      >
                        Sign in to your Archive
                      </button>
                    </>
                  ) : (
                    <>
                      New to the Constellation?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveView('register');
                          setTouched({});
                          setApiError(null);
                          setApiSuccess(null);
                        }}
                        className="font-semibold text-legacy-navy underline hover:text-legacy-gold cursor-pointer transition-colors duration-200"
                      >
                        Begin Your Legacy
                      </button>
                    </>
                  )}
                </p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>



      </div>

      {/* 3. DYNAMIC TERMS AND POLICIES DRAWER POPUP */}
      <AnimatePresence>
        {selectedLegalDoc && (
          <LegalModal 
            document={selectedLegalDoc}
            onClose={() => setSelectedLegalDoc(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
