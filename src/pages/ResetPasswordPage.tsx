import React, { useEffect, useState } from 'react';
import { ArrowLeft, KeyRound, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ResetPasswordPageProps {
  onNavigateLogin: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigateLogin }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!supabase) {
      setMessage('Password reset is currently unavailable.');
      return;
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!password || password.length < 8) {
      setMessage('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('The passwords do not match.');
      return;
    }

    if (!supabase) {
      setMessage('Password reset is currently unavailable.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Your password has been updated successfully. You can now sign in.');
    setPassword('');
    setConfirmPassword('');
    setReady(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f3fc] via-[#f0f9ff] to-[#eaf6ef] py-12 px-4 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        <button onClick={onNavigateLogin} className="inline-flex items-center gap-2 text-xs font-bold text-sky-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="rounded-2xl bg-white border border-sky-200 p-6 sm:p-9 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 text-sky-800 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900">Create a New Password</h1>
            <p className="text-xs text-slate-600 mt-2">Choose a new password for your DTPBC account.</p>
          </div>

          {message && (
            <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex gap-2">
              {message.includes('successfully') ? <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />}
              <span>{message}</span>
            </div>
          )}

          {ready ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-xs font-bold text-slate-700">
                New Password
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm" />
                </div>
              </label>
              <label className="block text-xs font-bold text-slate-700">
                Confirm New Password
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input type="password" required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm" />
                </div>
              </label>
              <button disabled={saving} className="w-full py-3 rounded-xl bg-emerald-800 text-white font-bold text-sm disabled:opacity-50">
                {saving ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          ) : !message ? (
            <p className="text-center text-sm text-slate-600">Opening your secure password-reset session…</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
