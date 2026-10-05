/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, AppRoute } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { VolunteerSection } from './components/VolunteerSection';
import { ExecutivesSection } from './components/ExecutivesSection';
import { MemberDashboard } from './components/MemberDashboard';
import { AdminCalendarModal } from './components/AdminCalendarModal';
import { SchedulePage } from './pages/SchedulePage';
import { ExecsPage } from './pages/ExecsPage';
import { MerchPage } from './pages/MerchPage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AttendancePage } from './pages/AttendancePage';
import { RosterPage } from './pages/RosterPage';
import { Footer } from './components/Footer';

function parseRouteFromPath(): AppRoute {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!path || path === 'home') return 'home';
  if (path === 'schedule') return 'schedule';
  if (path === 'execs') return 'execs';
  if (path === 'fundraising' || path === 'merch') return 'fundraising';
  if (path === 'login') return 'login';
  if (path === 'signup' || path === 'sign-up') return 'signup';
  if (path === 'forgot-password' || path === 'forgotpassword' || path === 'reset-password') return 'forgot-password';
  if (path === 'portal' || path === 'dashboard') return 'portal';
  if (path === 'attendance' || path === 'scanner') return 'attendance';
  if (path === 'roster') return 'roster';
  return 'home';
}

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => parseRouteFromPath());
  const { currentUser } = useAuth();

  // Legacy /merch URLs resolve to /fundraising.
  useEffect(() => { if (window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase() === 'merch') window.history.replaceState(null, '', '/fundraising'); }, []);

  // Legacy /merch URLs resolve to /fundraising.
  useEffect(() => { if (window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase() === 'merch') window.history.replaceState(null, '', '/fundraising'); }, []);

  // Handle browser back and forward button clicks
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseRouteFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: AppRoute) => {
    setCurrentRoute(route);
    const targetPath = route === 'home' ? '/' : `/${route}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f3fc] via-[#f0f9ff] to-[#eaf6ef] text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <Navbar currentRoute={currentRoute} navigate={navigate} />

      <main className="flex-grow">
        {currentRoute === 'schedule' ? (
          <SchedulePage
            onNavigateHome={() => navigate('home')}
            onNavigateSignUp={() => navigate('signup')}
          />
        ) : currentRoute === 'execs' ? (
          <ExecsPage
            onNavigateHome={() => navigate('home')}
            onNavigateSignUp={() => navigate('signup')}
          />
        ) : currentRoute === 'fundraising' ? (
          <MerchPage
            onNavigateHome={() => navigate('home')}
            onNavigateSignUp={() => navigate('signup')}
          />
        ) : currentRoute === 'signup' ? (
          <SignUpPage
            onNavigateHome={() => navigate('home')}
            onNavigateLogin={() => navigate('login')}
            onSignupSuccess={() => navigate('portal')}
          />
        ) : currentRoute === 'login' ? (
          <LoginPage
            onNavigateHome={() => navigate('home')}
            onNavigateSignUp={() => navigate('signup')}
            onNavigateForgotPassword={() => navigate('forgot-password')}
            onLoginSuccess={() => navigate('portal')}
          />
        ) : currentRoute === 'forgot-password' ? (
          <ForgotPasswordPage
            onNavigateLogin={() => navigate('login')}
            onNavigateHome={() => navigate('home')}
          />
        ) : currentRoute === 'roster' ? (
          <RosterPage onNavigateHome={() => navigate('home')} />
        ) : currentRoute === 'attendance' ? (
          <AttendancePage
            onNavigateHome={() => navigate('home')}
            onNavigatePortal={() => navigate('portal')}
          />
        ) : currentRoute === 'portal' && currentUser ? (
          <MemberDashboard
            onBackToHome={() => navigate('home')}
            onNavigateAttendance={() => navigate('attendance')}
            onNavigateSchedule={() => navigate('schedule')}
          />
        ) : (
          /* Home View */
          <>
            <HeroSection
              onJoinClick={() => navigate('signup')}
              onNavigateSchedule={() => navigate('schedule')}
              onNavigateExecs={() => navigate('execs')}
              onNavigateMerch={() => navigate('fundraising')}
            />
            <VolunteerSection />
            <ExecutivesSection onNavigateExecs={() => navigate('execs')} />
          </>
        )}
      </main>

      <Footer navigate={navigate} />

      {/* Admin Calendar Modal */}
      <AdminCalendarModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
