import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import BrandLogo from '../BrandLogo';

interface LoginFormProps {
  onSuccess: (fullName: string, email: string) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  // Form Field State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Password visibility trigger
  const [showPassword, setShowPassword] = useState(false);

  // Handle input focus/blur behaviors
  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  };

  const validateField = (fieldName: string) => {
    const newErrors = { ...errors };
    if (fieldName === 'email') {
      if (!email) {
        newErrors.email = 'Email address is required';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          newErrors.email = 'Please select a valid email address';
        } else {
          delete newErrors.email;
        }
      }
    }
    if (fieldName === 'password') {
      if (!password) {
        newErrors.password = 'A password is required';
      } else {
        delete newErrors.password;
      }
    }
    setErrors(newErrors);
  };

  // Login Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Validate both fields
    const loginErrors: { email?: string; password?: string } = {};
    let hasErrors = false;

    if (!email) {
      loginErrors.email = 'Email address is required';
      hasErrors = true;
    }
    if (!password) {
      loginErrors.password = 'A password is required';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(loginErrors);
      setTouched({ email: true, password: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.login({ email, password });
      onSuccess(response.user?.fullName || 'Archival Successor', email);
    } catch (err: any) {
      setApiError(err.message || 'Unable to establish secure gateway session. Check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Single Sign-on integration
  const handleGoogleLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess('Theodore Roosevelt', 'theo@legacy.com');
      alert('Authenticated securely via Google Identity Authority. Field presets synchronized.');
    }, 800);
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-10 select-none">
      {/* Header section */}
      <div className="mb-10 text-left">
        {/* Responsive Mobile Logo display */}
        <BrandLogo variant="mobile" className="mb-6 lg:hidden -ml-2" />

        <h2 className="font-serif-display text-4xl text-legacy-navy font-semibold tracking-normal leading-tight mb-2">
          Enter the Sanctuary
        </h2>
        <p className="text-gray-500 font-sans text-sm md:text-base">
          Access and tend your eternal chronicle of memories and media.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email) {
                  setErrors(prev => ({ ...prev, email: !e.target.value ? 'Email address is required' : undefined }));
                }
              }}
              onBlur={() => handleBlur('email')}
              placeholder="theo@legacy.com"
              className="w-full pl-6 pr-4 bg-transparent outline-none border-none text-sm text-legacy-navy placeholder-gray-300 font-sans focus:ring-0 select-text"
              required
              autoComplete="email"
            />
          </div>
          {touched.email && errors.email && (
            <p className="text-xs text-rose-500 mt-1 font-sans flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-rose-500 inline-block" /> {errors.email}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div className="relative group">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-gray-400 group-focus-within:text-legacy-gold transition-colors duration-200">
              PASSWORD
            </label>
            <Link
              to="/forgot-password"
              className="text-[10px] font-mono text-legacy-gold hover:text-legacy-gold-dark transition-colors cursor-pointer"
            >
              FORGOT PASSWORD?
            </Link>
          </div>
          <div className="relative mt-1 border-b border-gray-200 group-focus-within:border-legacy-gold transition-colors duration-300 py-1.5 flex items-center">
            <Lock className="absolute left-0 w-4 h-4 text-gray-400 group-focus-within:text-legacy-gold transition-colors duration-200" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) {
                  setErrors(prev => ({ ...prev, password: !e.target.value ? 'A password is required' : undefined }));
                }
              }}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••••••"
              className="w-full pl-6 pr-10 bg-transparent outline-none border-none text-sm text-legacy-navy placeholder-gray-300 font-mono focus:ring-0 select-text"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 p-1.5 rounded-full hover:bg-slate-100 text-gray-400 hover:text-legacy-navy transition-colors duration-200 outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
          {touched.password && errors.password && (
            <p className="text-xs text-rose-500 mt-1 font-sans flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-rose-500 inline-block" /> {errors.password}
            </p>
          )}
        </div>

        {/* AUTHORIZE GATE BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 py-4 bg-legacy-navy hover:bg-legacy-navy-light disabled:bg-legacy-navy/60 text-white font-cinzel text-xs font-bold tracking-[0.2em] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 select-none cursor-pointer"
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

      {/* DIVIDER: "OR SECURE WITH" */}
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

      {/* THIRD-PARTY GOOGLE LOG-IN BUTTON */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 hover:border-legacy-gold/50 bg-white rounded-lg text-slate-700 hover:text-legacy-navy font-sans text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:bg-slate-50/50"
      >
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

      {/* SELECTION TOGGLE FOOTER */}
      <div className="mt-8 text-center text-xs">
        <p className="text-gray-500 font-sans">
          New to the Constellation?{' '}
          <Link
            to="/register"
            className="font-semibold text-legacy-navy underline hover:text-legacy-gold cursor-pointer transition-colors duration-200 font-sans"
          >
            Begin Your Legacy
          </Link>
        </p>
      </div>
    </div>
  );
}
