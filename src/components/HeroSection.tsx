import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Calendar, Users, MapPin, ShoppingBag, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  onJoinClick: () => void;
  onNavigateSchedule: () => void;
  onNavigateExecs: () => void;
  onNavigateMerch: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onJoinClick, 
  onNavigateSchedule, 
  onNavigateExecs,
  onNavigateMerch
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-[#e6f3fc] via-[#f0f9ff] to-[#eaf6ef]">
      {/* Background ambient radial glow: Light blue and darker green */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-sky-200/50 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-1/4 w-[550px] h-[350px] bg-emerald-200/50 blur-[130px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-3xl text-center">
          {/* Factual School Badge */}
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold tracking-wider text-sky-800 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>David Thompson Secondary School</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="text-emerald-800 font-bold">100% Free Student Club</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] text-balance">
            David Thompson <span className="text-sky-600">Pickleball</span> Club.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed font-normal">
            The official pickleball club of David Thompson Secondary School in Vancouver, BC. Drop-in gym play during lunch and after school, 4 to 8 portable courts, exhibition matchplay, and volunteer opportunities.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onJoinClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-emerald-800/20 active:scale-[0.98]"
            >
              <span>Join Free as a Member</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={onNavigateSchedule}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-sky-300 rounded-xl transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Gym Schedule & Courts</span>
            </button>

            <button
              onClick={onNavigateExecs}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs font-bold text-sky-900 hover:text-sky-950 bg-sky-100 hover:bg-sky-200/80 border border-sky-300 rounded-xl transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-sky-700" />
              <span>Meet the Execs</span>
            </button>

            <button
              onClick={onNavigateMerch}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs font-bold text-emerald-900 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200/80 border border-emerald-300 rounded-xl transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
              <span>Club Merch Drops</span>
            </button>
          </div>

          {/* Proof Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-5 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>1755 E 55th Ave, Vancouver, BC</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-emerald-800 font-bold">$0 Membership Fees</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-700">Teacher Sponsor: Mr. Willy Wan</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-sky-800 font-semibold">Grades 8–12 & Staff</span>
          </div>

          {/* Quick Notice: Free Membership & Optional Merch */}
          <div className="mt-10 p-5 rounded-2xl bg-white/90 border border-sky-200 shadow-md text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Free Student Club · Optional Seasonal Merch</span>
              </div>
              <p className="text-xs text-slate-600">
                Every David Thompson student can play for free. We also host occasional club tee and hoodie pre-orders.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-sky-700 font-semibold shrink-0">
              <a href="mailto:dtpickleballexecutive@gmail.com" className="hover:underline">
                dtpickleballexecutive@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
