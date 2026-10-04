import React, { useState } from 'react';
import { requestPasswordReset } from '../lib/supabase';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, Send, KeyRound } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ 
  onNavigateLogin, 
  onNavigateHome 
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatusMessage(null);

    const result = await requestPasswordReset(email.trim());
    setLoading(false);

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: result.message,
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: result.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f3fc] via-[#f0f9ff] to-[#eaf6ef] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        <button
          onClick={onNavigateLogin}
          className="inline-flex items-center gap-2 text-xs font-bold text-sky-800 hover:text-sky-950 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        <div className="rounded-2xl bg-white border border-sky-200 p-6 sm:p-9 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 text-sky-800 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6" />
          </div>

          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-extrabold text-slate-900">
              Reset Your Password
            </h1>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Enter your email address below. We will dispatch a secure password reset link to your inbox.
            </p>
          </div>

          {statusMessage && (
            <div
              className={`mb-6 p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border border-red-300 text-red-900'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed font-medium">{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-800 font-semibold mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com (any email)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Dispatching Reset Email...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reset Password Link</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
            <p>
              Need quick help? Contact us at{' '}
              <a href="mailto:dtpickleballexecutive@gmail.com" className="text-sky-800 underline font-mono font-semibold">
                dtpickleballexecutive@gmail.com
              </a>
            </p>
            <p>
              or{' '}
              <a href="mailto:dt.pickleball@outlook.com" className="text-sky-800 underline font-mono font-semibold">
                dt.pickleball@outlook.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
