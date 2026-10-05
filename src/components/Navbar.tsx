import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Scan, ExternalLink, ShoppingBag, Calendar, Users } from 'lucide-react';

export type AppRoute = 'home' | 'schedule' | 'execs' | 'login' | 'signup' | 'forgot-password' | 'portal' | 'attendance' | 'fundraising' | 'roster' | 'sponsors';

interface NavbarProps {
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { 
    currentUser, 
    isAdmin,
    logout, 
  } = useAuth();

  const goRoster = () => {
    window.history.pushState(null, '', '/roster');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const initials = currentUser
    ? currentUser.name.split(' ').map(p => p[0]).join('').slice(0, 2)
    : '';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Wordmark */}
        <button 
          onClick={() => navigate('home')}
          className="text-left font-display text-xl font-bold tracking-tight text-slate-900 hover:text-sky-700 transition-colors cursor-pointer flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-xs shadow-emerald-600/50" />
          <span>DT Pickleball Club</span>
        </button>

        {/* Zone 2: School Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          <button 
            onClick={() => navigate('schedule')}
            className={`transition-colors cursor-pointer ${
              currentRoute === 'schedule' ? 'text-sky-700 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Gym Schedule
          </button>
          <button 
            onClick={() => navigate('execs')}
            className={`transition-colors cursor-pointer ${
              currentRoute === 'execs' ? 'text-sky-700 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Execs & Team
          </button>
          <button
            onClick={() => navigate('sponsors')}
            className={`transition-colors cursor-pointer ${currentRoute === 'sponsors' ? 'text-sky-700 font-bold' : 'hover:text-slate-900'}`}
          >
            Sponsors
          </button>
          <button 
            onClick={() => navigate('fundraising')}
            className={`transition-colors cursor-pointer ${
              currentRoute === 'merch' ? 'text-emerald-800 font-bold' : 'hover:text-emerald-700'
            }`}
          >
            Fundraising
          </button>
          <a
            href="https://forms.gle/e3wNimUZKqBbFMC38"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 transition-colors font-semibold"
          >
            <span>Volunteer Hours</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <button
                    onClick={goRoster}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 border border-slate-300 hover:bg-sky-50 hover:border-sky-300 transition-colors cursor-pointer"
                    title="Member Roster"
                  >
                    <Users className="w-3.5 h-3.5 text-sky-700" />
                    <span>Roster</span>
                  </button>
                  <button
                    onClick={() => navigate('attendance')}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentRoute === 'attendance'
                      ? 'bg-emerald-800 text-white font-bold'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                  title="Scanner Terminal"
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>Scanner</span>
                </button>
                </>
              )}

              <button
                onClick={() => navigate('portal')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  currentRoute === 'portal'
                    ? 'bg-sky-600 text-white border-sky-600 font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <div className="w-5 h-5 rounded bg-sky-900 text-sky-200 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <span className="max-w-[110px] truncate">{currentUser.name.split(' ')[0]}</span>
                <span className="text-[11px] font-mono text-emerald-800 font-bold">{currentUser.memberId || `#${currentUser.studentId}`}</span>
              </button>

              <button
                onClick={logout}
                title="Log out"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('login')}
                className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap rounded-lg ${
                  currentRoute === 'login' ? 'text-slate-900 bg-slate-100' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Student Login
              </button>
              <button
                onClick={() => navigate('signup')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-xs shadow-emerald-800/20"
              >
                Join Free
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
