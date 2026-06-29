import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import AuthLayout from '../components/auth/AuthLayout';
import RegisterForm from '../components/auth/RegisterForm';
import SuccessView from '../components/SuccessView';
import { authService } from '../services/authService';

export default function RegisterPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successUser, setSuccessUser] = useState({ fullName: '', email: '' });
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Check on mount if user is already validated via a secure JWT cookie
  useEffect(() => {
    let active = true;
    authService.getCurrentUser()
      .then((res) => {
        if (active && res.success && res.user) {
          setSuccessUser({ fullName: res.user.fullName, email: res.user.email });
          setIsSubmitted(true);
        }
      })
      .catch(() => {
        // No active or valid JWT session found, proceed to register form
      })
      .finally(() => {
        if (active) {
          setIsLoadingSession(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleRegisterSuccess = (fullName: string, email: string) => {
    setSuccessUser({ fullName, email });
    setIsSubmitted(true);
  };

  const handleContinue = async () => {
    try {
      // Clear secure JWT cookie on logout/exit
      await authService.logout();
    } catch (err) {
      console.error("Unable to clear secure session:", err);
    }
    setIsSubmitted(false);
    setSuccessUser({ fullName: '', email: '' });
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-legacy-navy mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-mono tracking-widest text-legacy-gold">CONSULTING HISTORICAL ARCHIVES...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <SuccessView
            fullName={successUser.fullName}
            email={successUser.email}
            onContinue={handleContinue}
          />
        ) : (
          <RegisterForm onSuccess={handleRegisterSuccess} />
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
