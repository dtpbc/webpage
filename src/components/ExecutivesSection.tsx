import React from 'react';
import { ALL_EXECUTIVES } from '../data/mockData';
import { Users, ArrowRight, Shield, Award, ExternalLink } from 'lucide-react';

interface ExecutivesSectionProps {
  onNavigateExecs: () => void;
}

export const ExecutivesSection: React.FC<ExecutivesSectionProps> = ({ onNavigateExecs }) => {
  return (
    <section id="executives" className="py-16 sm:py-24 border-t border-sky-200/60 bg-gradient-to-b from-[#eaf6ef] to-[#e6f3fc]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-800 mb-2">
              03. Student Leadership
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Executive Team & Sponsor Teacher
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-700 max-w-2xl">
              Student-organized and teacher-sponsored. Our executive team coordinates gym setups, schedules matchplay, and ensures an open, welcoming environment.
            </p>
          </div>

          <button
            onClick={onNavigateExecs}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 transition-colors cursor-pointer shadow-md shadow-sky-700/20 whitespace-nowrap self-start md:self-auto"
          >
            <span>View Full Exec Roles & Duties</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Executive Quick Roster Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {ALL_EXECUTIVES.map((exec) => {
            const initials = exec.name
              .split(' ')
              .map(p => p[0])
              .join('')
              .slice(0, 2);

            return (
              <div
                key={exec.name}
                className="rounded-2xl bg-white border border-sky-200 p-5 flex items-start gap-3.5 hover:border-sky-400 hover:shadow-md transition-all shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-300 text-sky-900 font-bold font-display text-xs flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-display text-base font-bold text-slate-900 truncate">
                    {exec.name}
                  </h4>
                  <p className="text-xs text-emerald-800 font-bold">
                    {exec.role}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    {exec.grade}
                  </p>
                  <p className="text-[11px] text-slate-600 line-clamp-1 mt-1 leading-relaxed">
                    {exec.responsibilities[0]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
