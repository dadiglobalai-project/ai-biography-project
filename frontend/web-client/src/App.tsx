import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import AuthLayout from './components/AuthLayout';
import SuccessView from './components/SuccessView';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import {
  ActiveFormView,
  AuthApiResponse,
  AuthUser,
  FormErrors,
  LegalDocument,
  RegisterFormState
} from './types';

const AUTH_ROUTES: Record<ActiveFormView, string> = {
  register: '/register',
  login: '/login'
};

const getAuthPath = (view: ActiveFormView) => AUTH_ROUTES[view];

const getAuthViewFromPath = (pathname: string): ActiveFormView => {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  return normalizedPath === AUTH_ROUTES.login ? 'login' : 'register';
};

const createEmptyForm = (): RegisterFormState => ({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreedToTerms: false
});

const readAuthResponse = async (response: Response): Promise<AuthApiResponse> => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const getApiError = (data: AuthApiResponse, fallback: string) =>
  data.error || data.message || fallback;

export default function App() {
  const [activeView, setActiveView] = useState<ActiveFormView>(() => {
    if (typeof window === 'undefined') {
      return 'register';
    }

    return getAuthViewFromPath(window.location.pathname);
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [form, setForm] = useState<RegisterFormState>(() => createEmptyForm());
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [selectedLegalDoc, setSelectedLegalDoc] = useState<LegalDocument | null>(null);

  const resetAuthFeedback = useCallback(() => {
    setTouched({});
    setErrors({});
    setApiError(null);
    setApiSuccess(null);
    setIsSubmitted(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const navigateToAuthView = (nextView: ActiveFormView) => {
    if (nextView === activeView) {
      return;
    }

    window.history.pushState(null, '', getAuthPath(nextView));
    setActiveView(nextView);
    resetAuthFeedback();
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const expectedPath = getAuthPath(getAuthViewFromPath(window.location.pathname));
    if (window.location.pathname !== expectedPath) {
      window.history.replaceState(null, '', expectedPath);
    }

    const syncAuthViewWithLocation = () => {
      setActiveView(getAuthViewFromPath(window.location.pathname));
      if (!authUser) {
        resetAuthFeedback();
      }
    };

    window.addEventListener('popstate', syncAuthViewWithLocation);

    return () => {
      window.removeEventListener('popstate', syncAuthViewWithLocation);
    };
  }, [authUser, resetAuthFeedback]);

  useEffect(() => {
    document.title = authUser
      ? 'Session | Xinghuoji'
      : activeView === 'register'
        ? 'Register | Xinghuoji'
        : 'Login | Xinghuoji';
  }, [activeView, authUser]);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });

        if (response.status === 401) {
          setAuthUser(null);
          return;
        }

        const data = await readAuthResponse(response);

        if (!isMounted || !response.ok || !data.user) {
          setAuthUser(null);
          return;
        }

        setAuthUser(data.user);
        setForm(prev => ({
          ...prev,
          fullName: data.user?.fullName || prev.fullName,
          email: data.user?.email || prev.email,
          password: '',
          confirmPassword: '',
          agreedToTerms: false
        }));
        setIsSubmitted(true);
      } catch {
        setAuthUser(null);
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    };

    syncSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const newErrors: FormErrors = {};

    if (form.fullName.length > 0 && form.fullName.trim().length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters long';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email.length > 0 && !emailRegex.test(form.email)) {
      newErrors.email = 'Please select a valid email address';
    }

    if (form.password && form.password.length > 0) {
      if (form.password.length < 8) {
        newErrors.password = 'Password must be 8 or more characters';
      } else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
        newErrors.password = 'Include at least one letter and one number';
      }
    }

    if (form.confirmPassword && form.confirmPassword.length > 0 && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (touched.agreedToTerms && !form.agreedToTerms) {
      newErrors.agreedToTerms = 'You must acknowledge the terms to begin';
    }

    setErrors(newErrors);
  }, [form, touched]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

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

  const handleRegisterSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setApiError(null);
    setApiSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(getAuthPath('register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword
        })
      });

      const data = await readAuthResponse(response);

      if (!response.ok || !data.user) {
        setApiError(getApiError(data, 'Registration failed'));
        return;
      }

      setApiSuccess(data.message || 'Registration complete');
      setAuthUser(data.user);

      setForm(prev => ({
        ...prev,
        fullName: data.user?.fullName || prev.fullName,
        email: data.user?.email || prev.email,
        password: '',
        confirmPassword: ''
      }));

      setIsSubmitted(true);
    } catch {
      setApiError('Unable to connect to the archival nodes. Check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      const data = await readAuthResponse(response);

      if (!response.ok || !data.user) {
        setApiError(getApiError(data, 'Authentication failed'));
        return;
      }

      setApiSuccess(data.message || 'Signature verified');
      setAuthUser(data.user);

      setForm(prev => ({
        ...prev,
        fullName: data.user?.fullName || 'Archival Successor',
        email: data.user?.email || prev.email,
        password: '',
        confirmPassword: ''
      }));

      setIsSubmitted(true);
    } catch {
      setApiError('Unable to establish secure gateway session. Check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    setApiSuccess(null);
    setApiError('Google sign-in is not connected to the JWT session yet. Use email and password for now.');
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      setAuthUser(null);
      setForm(createEmptyForm());
      resetAuthFeedback();
      setActiveView('login');

      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', getAuthPath('login'));
      }

      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return (
      <AuthLayout
        selectedLegalDoc={selectedLegalDoc}
        onCloseLegalDoc={() => setSelectedLegalDoc(null)}
      >
        <div className="w-full max-w-md mx-auto relative z-10 text-center">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400">
            Verifying secure session...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      selectedLegalDoc={selectedLegalDoc}
      onCloseLegalDoc={() => setSelectedLegalDoc(null)}
    >
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <SuccessView
            fullName={form.fullName}
            email={form.email}
            actionLabel="SIGN OUT"
            isBusy={isSubmitting}
            onContinue={handleLogout}
          />
        ) : (
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: activeView === 'register' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeView === 'register' ? -20 : 20 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md mx-auto relative z-10"
          >
            {activeView === 'register' ? (
              <RegisterPage
                form={form}
                touched={touched}
                errors={errors}
                apiError={apiError}
                isSubmitting={isSubmitting}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                strength={calculatePasswordStrength()}
                loginPath={getAuthPath('login')}
                onSubmit={handleRegisterSubmit}
                onInputChange={handleInputChange}
                onBlur={handleBlur}
                onTogglePassword={() => setShowPassword(prev => !prev)}
                onToggleConfirmPassword={() => setShowConfirmPassword(prev => !prev)}
                onSelectLegalDoc={setSelectedLegalDoc}
                onGoogleAuth={handleGoogleAuth}
                onNavigateToLogin={(event) => {
                  event.preventDefault();
                  navigateToAuthView('login');
                }}
              />
            ) : (
              <LoginPage
                form={form}
                apiError={apiError}
                isSubmitting={isSubmitting}
                showPassword={showPassword}
                registerPath={getAuthPath('register')}
                onSubmit={handleLoginSubmit}
                onInputChange={handleInputChange}
                onTogglePassword={() => setShowPassword(prev => !prev)}
                onGoogleAuth={handleGoogleAuth}
                onNavigateToRegister={(event) => {
                  event.preventDefault();
                  navigateToAuthView('register');
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}