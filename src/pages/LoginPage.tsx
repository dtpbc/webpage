import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, Lock, KeyRound } from 'lucide-react';

interface LoginPageProps {
  onNavigateHome: () => void;
  onNavigateSignUp: () => void;
  onNavigateForgotPassword: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateHome, onNavigateSignUp, onNavigateForgotPassword, onLoginSuccess }) => {
  const { login } = useAuth();
  const [query, setQuery] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!query.trim() || !password) return;
    const result = await login(query, password);
    if (!result.success) {
      setErrorMsg(result.message || 'Unable to sign in.');
      return;
    }
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f3fc] via-[#f0f9ff] to-[#eaf6ef] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-lg">
        <button onClick={onNavigateHome} className="inline-flex items-center gap-2 text-xs font-bold text-sky-800 hover:text-sky-950 mb-6 transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" /><span>Back to Home</span>
        </button>
        <div className="rounded-2xl bg-white border border-sky-200 p-6 sm:p-10 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 uppercase tracking-wider mb-2">
              <span>David Thompson Pickleball Club</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-slate-900">Student & Staff Login</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">Sign in with your registered email address.</p>
          </div>
          {errorMsg && <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">{errorMsg}</div>}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-800 font-semibold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input type="email" required autoComplete="username" placeholder="name@gmail.com" value={query} onChange={e => setQuery(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-800 font-semibold">Password</label>
                <button type="button" onClick={onNavigateForgotPassword} className="text-[11px] text-sky-800 hover:text-sky-950 hover:underline cursor-pointer flex items-center gap-1 font-bold"><KeyRound className="w-3 h-3" /><span>Forgot password?</span></button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input type="password" required autoComplete="current-password" placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white" />
              </div>
            </div>
            <button type="submit" className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 transition-colors cursor-pointer shadow-md shadow-sky-700/20 mt-4 active:scale-[0.99]">Sign In to Member Portal</button>
          </form>
          <div className="mt-6 flex flex-col items-center gap-3 pt-4 border-t border-slate-100 text-xs">
            <div>Don't have an account yet? <button onClick={onNavigateSignUp} className="text-emerald-800 font-bold hover:underline cursor-pointer">Sign up for free</button></div>
            <div className="text-[11px] text-slate-500 font-medium">Need assistance? Email <a href="mailto:dtpickleballexecutive@gmail.com" className="text-sky-800 underline font-mono font-semibold">dtpickleballexecutive@gmail.com</a></div>
          </div>
        </div>
      </div>
    </div>
  );
};
