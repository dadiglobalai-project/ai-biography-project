import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CheckEmailPage from './pages/CheckEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import PreserveStoryPage from './pages/PreserveStoryPage';
import DIYDashboard from './pages/DIYDashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import AccountSettingsPage from './pages/AccountSettingsPage';
import LifeJourneyPreviewPage from './pages/LifeJourneyPreviewPage';
import LifeJourneyEditPage from './pages/LifeJourneyEditPage';

const pageTitles: Record<string, string> = {
  '/': 'Xinghuoji | AI Biography & Digital Legacy Platform',
  '/login': 'Login | Xinghuoji',
  '/register': 'Register | Xinghuoji',
  '/forgot-password': 'Forgot Password | Xinghuoji',
  '/check-email': 'Check Email | Xinghuoji',
  '/reset-password': 'Reset Password | Xinghuoji',
  '/preserve-story': 'Preserve Story | Xinghuoji',
  '/diy-dashboard': 'DIY Dashboard | Xinghuoji',
  '/professional-dashboard': 'Professional Dashboard | Xinghuoji',
  '/account-settings': 'Profile & Account Settings | Xinghuoji',
  '/diy-dashboard/templates/life-journey/preview': 'Life Journey Preview | Xinghuoji',
  '/diy-dashboard/templates/life-journey/edit': 'Edit Life Journey | Xinghuoji',
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
        <Route path="/" element={<HomePage />} />
        {/* Mapping authentication routes as requested */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/check-email" element={<CheckEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/preserve-story" element={<PreserveStoryPage />} />
        <Route path="/diy-dashboard" element={<DIYDashboard />} />
        <Route path="/professional-dashboard" element={<ProfessionalDashboard />} />
        <Route path="/account-settings" element={<AccountSettingsPage />} />
        <Route path="/diy-dashboard/templates/:templateId/preview" element={<LifeJourneyPreviewPage />} />
        <Route path="/diy-dashboard/templates/:templateId/edit" element={<LifeJourneyEditPage />} />
        
                
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
