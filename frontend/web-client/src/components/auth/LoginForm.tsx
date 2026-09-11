import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import BrandLogo from '../BrandLogo';

interface LoginFormProps {
  onSuccess: (fullName: string, email: string) => void;
}

const REMEMBERED_LOGIN_EMAIL_STORAGE_KEY = 'xinghuoji.rememberedLoginEmail';
const LOGIN_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getLoginEmailError(value: string) {
  const email = value.trim();

  if (!email) {
    return 'Email address is required';
  }

  if (!LOGIN_EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }

  return null;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBERED_LOGIN_EMAIL_STORAGE_KEY);

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberEmail(true);
    }
  }, []);

  const validateField = (fieldName: string) => {
    const newErrors = { ...errors };

    if (fieldName === 'email') {
      const emailError = getLoginEmailError(email);

      if (emailError) {
        newErrors.email = emailError;
      } else {
        delete newErrors.email;
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

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setApiError(null);

    if (touched.email) {
      const emailError = getLoginEmailError(value);
      setErrors(prev => {
        const next = { ...prev };

        if (emailError) {
          next.email = emailError;
        } else {
          delete next.email;
        }

        return next;
      });
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setApiError(null);

    if (touched.password) {
      setErrors(prev => {
        const next = { ...prev };

        if (!value) {
          next.password = 'A password is required';
        } else {
          delete next.password;
        }

        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const trimmedEmail = email.trim();
    const loginErrors: { email?: string; password?: string } = {};
    const emailError = getLoginEmailError(trimmedEmail);

    if (emailError) {
      loginErrors.email = emailError;
    }

    if (!password) {
      loginErrors.password = 'A password is required';
    }

    if (Object.keys(loginErrors).length > 0) {
      setErrors(loginErrors);
      setTouched({ email: true, password: true });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.login({ email: trimmedEmail, password });
      const authenticatedEmail = response.user?.email || trimmedEmail;

      if (rememberEmail) {
        localStorage.setItem(REMEMBERED_LOGIN_EMAIL_STORAGE_KEY, authenticatedEmail);
      } else {
        localStorage.removeItem(REMEMBERED_LOGIN_EMAIL_STORAGE_KEY);
      }

      onSuccess(response.user?.fullName || 'Archival Successor', authenticatedEmail);
    } catch (err: any) {
      setApiError(err.message || 'Unable to sign in. Please check your credentials or connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-10 select-none">
      <div className="mb-10 text-left">
        <BrandLogo variant="mobile" className="mb-8 w-44 max-w-full lg:hidden -ml-2" />

        <h2 className="font-serif-display text-4xl text-legacy-navy font-semibold tracking-normal leading-tight mb-2">
          Sign in to Xinghuoji
        </h2>
        <p className="text-gray-500 font-sans text-sm md:text-base">
          Continue building and preserving your biography archive.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2.5 font-sans"
          >
            <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </motion.div>
        )}

        <div className="relative group">
          <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-slate-500 group-focus-within:text-legacy-gold transition-colors duration-200">
            Email Address
          </label>
          <div className="relative mt-2 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm transition-all duration-200 group-focus-within:border-legacy-gold group-focus-within:ring-4 group-focus-within:ring-legacy-gold/10 flex items-center">
            <Mail className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-legacy-gold transition-colors duration-200" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="name@example.com"
              className="w-full pl-7 pr-2 bg-transparent outline-none border-none text-sm text-legacy-navy placeholder-slate-400 font-sans focus:ring-0 select-text"
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

        <div className="relative group">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-slate-500 group-focus-within:text-legacy-gold transition-colors duration-200">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[10px] font-mono text-legacy-gold hover:text-legacy-gold-dark transition-colors cursor-pointer"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative mt-2 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm transition-all duration-200 group-focus-within:border-legacy-gold group-focus-within:ring-4 group-focus-within:ring-legacy-gold/10 flex items-center">
            <Lock className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-legacy-gold transition-colors duration-200" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Enter your password"
              className="w-full pl-7 pr-10 bg-transparent outline-none border-none text-sm text-legacy-navy placeholder-slate-400 font-sans focus:ring-0 select-text"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-legacy-navy transition-colors duration-200 outline-none cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
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

        <label className="flex w-fit items-center gap-2 text-xs font-sans font-medium text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberEmail}
            onChange={(e) => setRememberEmail(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-legacy-navy accent-legacy-navy focus:ring-legacy-gold/30 cursor-pointer"
          />
          Remember my email
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 py-4 bg-legacy-navy hover:bg-legacy-navy-light disabled:bg-legacy-navy/60 text-white font-cinzel text-xs font-bold tracking-[0.18em] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0 select-none cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              SIGNING IN...
            </span>
          ) : (
            <>
              SIGN IN
              <ArrowRight className="w-4.5 h-4.5 ml-1" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-xs">
        <p className="text-gray-500 font-sans">
          New here?{' '}
          <Link
            to="/register"
            className="font-semibold text-legacy-navy underline hover:text-legacy-gold cursor-pointer transition-colors duration-200 font-sans"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
