import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Check, Eye, EyeOff, Lock, Mail, Sparkles, User } from 'lucide-react';

import BrandLogo from '../components/BrandLogo';
import { AFTERLIFE_PROTOCOLS, PRIVACY_POLICY, TERMS_OF_SERVICE } from '../data';
import { FormErrors, LegalDocument, RegisterFormState } from '../types';

interface PasswordStrength {
  level: number;
  label: string;
  bg: string;
  text: string;
}

interface RegisterPageProps {
  form: RegisterFormState;
  touched: Record<string, boolean>;
  errors: FormErrors;
  apiError: string | null;
  isSubmitting: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  strength: PasswordStrength;
  loginPath: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (fieldName: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onSelectLegalDoc: (document: LegalDocument) => void;
  onGoogleAuth: () => void;
  onNavigateToLogin: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function RegisterPage({
  form,
  touched,
  errors,
  apiError,
  isSubmitting,
  showPassword,
  showConfirmPassword,
  strength,
  loginPath,
  onSubmit,
  onInputChange,
  onBlur,
  onTogglePassword,
  onToggleConfirmPassword,
  onSelectLegalDoc,
  onGoogleAuth,
  onNavigateToLogin
}: RegisterPageProps) {
  return (
    <>
      <div className="mb-10 text-left">
        <BrandLogo variant="mobile" className="mb-6 lg:hidden" />

        <h2 className="font-serif-display text-4xl text-legacy-navy font-semibold tracking-normal leading-tight mb-2">
          Begin Your Legacy
        </h2>
        <p className="text-gray-500 font-sans text-sm md:text-base">
          Join a community dedicated to preserving the stories that matter most.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
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
              onChange={onInputChange}
              onBlur={() => onBlur('fullName')}
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
              onChange={onInputChange}
              onBlur={() => onBlur('email')}
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
              onChange={onInputChange}
              onBlur={() => onBlur('password')}
              placeholder="............"
              className="w-full pl-6 pr-10 bg-transparent outline-none border-none text-sm text-legacy-navy placeholder-gray-300 font-mono focus:ring-0 select-text"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-0 p-1.5 rounded-full hover:bg-slate-100 text-gray-400 hover:text-legacy-navy transition-colors duration-200 outline-none"
              title={showPassword ? 'Hide Password' : 'Show Password'}
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>

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
              onChange={onInputChange}
              onBlur={() => onBlur('confirmPassword')}
              placeholder="............"
              className="w-full pl-6 pr-10 bg-transparent outline-none border-none text-sm text-legacy-navy placeholder-gray-300 font-mono focus:ring-0 select-text"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={onToggleConfirmPassword}
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

        <div className="flex items-start gap-3 mt-4 text-left">
          <div className="relative flex items-center h-5 mt-0.5">
            <input
              id="agreedToTerms"
              name="agreedToTerms"
              type="checkbox"
              checked={form.agreedToTerms}
              onChange={onInputChange}
              onBlur={() => onBlur('agreedToTerms')}
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
              onClick={() => onSelectLegalDoc(TERMS_OF_SERVICE)}
              className="font-semibold text-legacy-navy underline hover:text-legacy-gold cursor-pointer transition-colors duration-200"
            >
              Terms of Service
            </button>
            <span> and </span>
            <button
              type="button"
              onClick={() => onSelectLegalDoc(PRIVACY_POLICY)}
              className="font-semibold text-legacy-navy underline hover:text-legacy-gold cursor-pointer transition-colors duration-200"
            >
              Privacy Policy
            </button>
            <span>, including the </span>
            <button
              type="button"
              onClick={() => onSelectLegalDoc(AFTERLIFE_PROTOCOLS)}
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

      <button
        type="button"
        onClick={onGoogleAuth}
        className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 hover:border-legacy-gold/50 bg-white rounded-lg text-slate-700 hover:text-legacy-navy font-sans text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:bg-slate-50/50"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
        </svg>
        Google
      </button>

      <div className="mt-8 text-center text-xs">
        <p className="text-gray-500 font-sans">
          Already have an account?{' '}
          <a
            href={loginPath}
            onClick={onNavigateToLogin}
            className="font-semibold text-legacy-navy underline hover:text-legacy-gold cursor-pointer transition-colors duration-200"
          >
            Sign in to your Archive
          </a>
        </p>
      </div>
    </>
  );
}
