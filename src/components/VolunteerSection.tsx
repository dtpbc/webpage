import React from 'react';
import { Award, ExternalLink, CheckCircle2, Clock, Users, Shield } from 'lucide-react';

export const VolunteerSection: React.FC = () => {
  return (
    <section id="volunteer" className="py-16 sm:py-24 border-t border-sky-200/60 bg-gradient-to-b from-[#f0f9ff] to-[#eaf6ef]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-emerald-200 p-8 sm:p-12 shadow-lg relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/60 blur-[100px] pointer-events-none rounded-full" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>BC Graduation Volunteer Hours</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Earn Volunteer Hours with DTPBC
              </h2>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl">
                Looking to complete your 30 hours of Career Life Connections (CLC) work experience or volunteer service? Join our court setup crew, assist with student sign-ins, referee matches, or manage equipment.
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Volunteer hours are signed off by Mr. Wan or a DTPBC exec.</span>
              </div>

              {/* Roles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-900 mb-0.5">Net Setup & Takedown</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">Help assemble portable nets 10m before gym sessions.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-900 mb-0.5">Match Refereeing</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">Call scores and kitchen foot-faults during games.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-900 mb-0.5">Sign-In Desk</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">Check in student IDs and manage paddle stack rotation.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center">
              <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-300 text-center space-y-4 shadow-sm w-full max-w-sm">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                  <Clock className="w-6 h-6 text-emerald-700" />
                </div>

                <div>
                  <h4 className="font-display text-base font-bold text-slate-900">
                    Submit Volunteer Application
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Fill out our official Google Form to register your available days.
                  </p>
                </div>

                <a
                  href="https://forms.gle/e3wNimUZKqBbFMC38"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 transition-colors cursor-pointer shadow-md shadow-emerald-800/20"
                >
                  <span>Open Volunteer Form</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <p className="text-[10px] text-slate-500 font-medium">
                  Signed off by Mr. Wan or DTPBC exec
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
