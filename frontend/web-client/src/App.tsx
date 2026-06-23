import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CheckEmailPage from './pages/CheckEmailPage';

const pageTitles: Record<string, string> = {
  '/login': 'Login | Xinghuoji',
  '/register': 'Register | Xinghuoji',
  '/forgot-password': 'Forgot Password | Xinghuoji',
  '/check-email': 'Check Email | Xinghuoji',
};

function PageTitle() {
  const location = useLocation();

  React.useEffect(() => {
    document.title = pageTitles[location.pathname] ?? 'Xinghuoji';
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <PageTitle />
      <Routes>
        {/* Mapping authentication routes as requested */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/check-email" element={<CheckEmailPage />} />
        
        {/* Fallback pattern to map root or custom routes directly to /register */}
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
