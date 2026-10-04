import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SkillLevel } from '../types';
import { ArrowLeft, CheckCircle2, User as UserIcon, Mail, Hash, Lock } from 'lucide-react';

interface SignUpPageProps {
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
  onSignupSuccess: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ 
  onNavigateHome, 
  onNavigateLogin, 
  onSignupSuccess 
}) => {
  const { signup } = useAuth();

  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [grade, setGrade] = useState<'Grade 8' | 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12' | 'Staff / Teacher'>('Grade 10');
  const [email, setEmail] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Beginner (Learning Rules)');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only numbers, max 7 digits, NO DT- prefix
    const val = e.target.value.replace(/\D/g, '').slice(0, 7);
    setStudentId(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (studentId.length !== 7) {
      setErrorMsg('Student ID must be exactly a 7-digit number (e.g. 1842109).');
      return;
    }

    const result = await signup({
      name: fullName.trim(),
      studentId: studentId.trim(),
      grade,
      email: email.trim(),
      skillLevel,
    }, password);

    if (!result.success) {
      setErrorMsg(result.message || 'Unable to create your account.');
      return;
    }

    if (result.message) {
      setErrorMsg(result.message);
      return;
    }

    onSignupSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f3fc] via-[#f0f9ff] to-[#eaf6ef] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-lg">
        {/* Navigation back */}
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-sky-800 hover:text-sky-950 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* Card */}
        <div className="rounded-2xl bg-white border border-sky-200 p-6 sm:p-10 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>100% Free · David Thompson Secondary</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-slate-900">
              Student Club Sign-Up
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Register for the David Thompson Pickleball Club (DTPBC). Open to all students in Grades 8 through 12 and school staff.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-800 font-semibold mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jason Wong"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 font-semibold mb-1.5">
                  Student ID Number <span className="text-slate-500 font-normal">(7 digits)</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={7}
                    placeholder="1842109"
                    value={studentId}
                    onChange={handleStudentIdChange}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">7 digits only, no prefix</p>
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1.5">
                  Grade Level
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white cursor-pointer"
                >
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                  <option value="Staff / Teacher">Staff / Teacher</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-1.5">
                Email Address <span className="text-slate-500 font-normal">(Any email: Gmail, Outlook, etc.)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="student@gmail.com, outlook.com, or school email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-1.5">
                Pickleball Skill Level
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white cursor-pointer"
              >
                <option value="Beginner (Learning Rules)">Beginner (Learning Rules & Serving)</option>
                <option value="Intermediate (Consistent Rallies)">Intermediate (Consistent Kitchen Rallies)</option>
                <option value="Advanced (Competitive Play)">Advanced (Competitive Game & Match Play)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-1.5">
                Set Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Choose a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 transition-colors cursor-pointer shadow-md shadow-emerald-800/20 mt-4 active:scale-[0.99]"
            >
              Complete Free Member Sign-Up
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600 pt-4 border-t border-slate-100">
            Already registered?{' '}
            <button
              onClick={onNavigateLogin}
              className="text-sky-800 font-bold hover:underline cursor-pointer"
            >
              Sign in to your account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
