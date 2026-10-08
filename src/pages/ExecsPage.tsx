import React, { useState } from 'react';
import { ALL_EXECUTIVES } from '../data/mockData';
import { ExecutiveMember } from '../types';
import { ArrowLeft, Users, Award, ExternalLink, Mail, Camera } from 'lucide-react';

interface ExecsPageProps {
  onNavigateHome: () => void;
  onNavigateSignUp: () => void;
}

export const ExecsPage: React.FC<ExecsPageProps> = ({ onNavigateHome, onNavigateSignUp }) => {
  const president = ALL_EXECUTIVES.find(e => e.category === 'President');
  const vicePresidents = ALL_EXECUTIVES.filter(e => e.category === 'Vice President');
  const coreOfficers = ALL_EXECUTIVES.filter(e => e.category === 'Core Officer');
  const membersAtLarge = ALL_EXECUTIVES.filter(e => e.category === 'Member-at-large');
  const teacherSponsor = ALL_EXECUTIVES.find(e => e.category === 'Teacher Sponsor');

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (name: string) => {
    setImageErrors(prev => ({ ...prev, [name]: true }));
  };

  const renderExecCard = (exec: ExecutiveMember, isPrimary = false) => {
    const initials = exec.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2);

    const hasError = imageErrors[exec.name];
    const photoUrl = `/execs/${exec.photoFilename}`;

    return (
      <div
        key={exec.name}
        className={`rounded-2xl border p-4 sm:p-7 flex flex-col justify-between transition-all ${
          isPrimary
            ? 'bg-gradient-to-b from-white to-sky-50/60 border-sky-300 shadow-md ring-1 ring-sky-300/50'
            : 'bg-white border-sky-200/90 hover:border-sky-400 hover:shadow-md shadow-xs'
        }`}
      >
        <div>
          <div className="flex items-start gap-4 mb-4">
            {/* Photo with clean initials fallback */}
            <div className="w-16 h-16 rounded-2xl bg-sky-100 border-2 border-sky-300 overflow-hidden flex items-center justify-center shrink-0 shadow-xs relative group">
              {!hasError ? (
                <img
                  src={photoUrl}
                  alt={exec.name}
                  onError={() => handleImageError(exec.name)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display font-bold text-sky-900 text-lg">
                  {initials}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-slate-900 truncate">
                  {exec.name}
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-200 font-bold shrink-0">
                  DTPBC
                </span>
              </div>
              <p className="text-xs font-bold text-emerald-800 mt-0.5">
                {exec.role}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {exec.grade} · David Thompson Secondary
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-5">
            {exec.bio}
          </p>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              What They Do:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {exec.responsibilities.map((resp) => (
                <li key={resp} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
          <span>Photo: /public/execs/{exec.photoFilename}</span>
          <span className="text-emerald-700 font-bold">Verified Officer</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f3fc] via-[#f0f9ff] to-[#eaf6ef] py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-sky-200">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-sky-800 hover:text-sky-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
            <span>Contact:</span>
            <a href="mailto:dtpickleballexecutive@gmail.com" className="text-sky-800 font-bold hover:underline">
              dtpickleballexecutive@gmail.com
            </a>
          </div>
        </div>

        {/* Page Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-sky-600" />
            <span>Executive Officers & Sponsor</span>
          </div>
          <h1 className="font-display text-2xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Meet the DTPBC Team
          </h1>
          <p className="mt-3 text-base text-slate-700 leading-relaxed">
            The David Thompson Pickleball Club is organized by students and sponsored by David Thompson staff. Learn who our officers are and what responsibilities they oversee across gym sessions, equipment, and volunteer opportunities.
          </p>
        </div>

        {/* Section 1: Teacher Sponsor & Club President */}
        <div className="mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-4">
            01. Leadership & Staff Sponsor
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {president && renderExecCard(president, true)}
            {teacherSponsor && renderExecCard(teacherSponsor, true)}
          </div>
        </div>

        {/* Section 2: Vice Presidents */}
        <div className="mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-800 mb-4">
            02. Vice Presidents
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vicePresidents.map(vp => renderExecCard(vp))}
          </div>
        </div>

        {/* Section 3: Core Officers */}
        <div className="mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-800 mb-4">
            03. Core Officers (Secretary & Treasurer)
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {coreOfficers.map(officer => renderExecCard(officer))}
          </div>
        </div>

        {/* Section 4: Members-at-large */}
        <div className="mb-14">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
            04. Members-at-large
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {membersAtLarge.map(mal => renderExecCard(mal))}
          </div>
        </div>

        {/* Volunteer Service Hours Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-900 to-[#042817] border border-emerald-700 p-5 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl text-white">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Career Life Connections (CLC 30)</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white">
              Want to Volunteer with the Exec Team?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Help set up gym nets, referee games, or coordinate court rotations. Volunteer hours are signed off by Mr. Wan or a DTPBC exec!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="https://forms.gle/e3wNimUZKqBbFMC38"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-400/20 whitespace-nowrap"
            >
              <span>Volunteer Sign-Up Form</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://forms.gle/w2PhQhMEMwg6C6pq9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold text-white bg-sky-700 hover:bg-sky-600 transition-colors shadow-lg shadow-sky-700/20 whitespace-nowrap"
            >
              <span>Executive Sign-Up</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
