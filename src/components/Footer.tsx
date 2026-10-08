import React from 'react';
import { MapPin, ExternalLink, Mail, ShieldCheck, Instagram, MessageCircle, Linkedin, Users } from 'lucide-react';
import { AppRoute } from './Navbar';

interface FooterProps {
  navigate: (route: AppRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="border-t border-emerald-800/40 bg-gradient-to-b from-[#08291f] to-[#041a12] py-10 sm:py-16 text-xs text-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10 sm:mb-12">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <h4 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>DT Pickleball Club</span>
            </h4>
            <p className="text-slate-300 leading-relaxed text-xs">
              David Thompson Secondary School's official student pickleball club (DTPBC) in Vancouver, BC. 100% free drop-in sessions, exhibition matchplay, and volunteer opportunities.
            </p>
            <div className="flex items-start gap-1.5 text-slate-300 text-[11px] pt-1">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
              <span>1755 E 55th Ave, Vancouver, BC</span>
            </div>
          </div>

          {/* Quick Pages */}
          <div className="space-y-2">
            <p className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Club Navigation
            </p>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button 
                  onClick={() => navigate('home')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-300"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('schedule')}
                  className="hover:text-white transition-colors cursor-pointer text-sky-300 font-semibold"
                >
                  Gym Schedule & Court Setups
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('sponsors')}
                  className="hover:text-white transition-colors cursor-pointer text-amber-300 font-semibold"
                >
                  Sponsors
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('execs')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-300"
                >
                  Exec Team Directory & Duties
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('fundraising')}
                  className="hover:text-white transition-colors cursor-pointer text-emerald-400 font-semibold"
                >
                  Fundraising
                </button>
              </li>
            </ul>
          </div>

          {/* Student Access */}
          <div className="space-y-2">
            <p className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Student Member Portal
            </p>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button 
                  onClick={() => navigate('portal')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-300"
                >
                  My Student Pass & Profile
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('signup')}
                  className="hover:text-white transition-colors cursor-pointer text-emerald-400 font-semibold"
                >
                  Join Free (Grades 8–12)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('forgot-password')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-300"
                >
                  Password Reset
                </button>
              </li>
              <li>
                <a
                  href="https://forms.gle/e3wNimUZKqBbFMC38"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-300 text-slate-300 transition-colors pt-1"
                >
                  <span>Volunteer Hours Form (CLC 30)</span>
                  <ExternalLink className="w-3 h-3 text-emerald-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://forms.gle/w2PhQhMEMwg6C6pq9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-300 text-slate-300 transition-colors pt-1"
                >
                  <span>Executive Sign-Up</span>
                  <ExternalLink className="w-3 h-3 text-emerald-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Community */}
          <div className="space-y-2">
            <p className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Join Our Community
            </p>
            <div className="space-y-1.5 text-xs">
              <a href="https://www.instagram.com/dt.pickleball/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <Instagram className="w-3.5 h-3.5 text-pink-300" />
                <span>Instagram · @dt.pickleball</span>
              </a>
              <a href="https://chat.whatsapp.com/Lsfb3JPQkHr8hzE0CeUWwm" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Community</span>
              </a>
              <a href="https://discord.gg/VwPed6wGru" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <MessageCircle className="w-3.5 h-3.5 text-indigo-300" />
                <span>Discord Community</span>
              </a>
              <a href="https://www.linkedin.com/in/dt-pickleball-club-0b6866387" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <Linkedin className="w-3.5 h-3.5 text-sky-300" />
                <span>LinkedIn</span>
              </a>
              <a href="https://mailchi.mp/49bb5379194b/email" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                <span>Join the Mailing List</span>
              </a>
            </div>
          </div>

          {/* School Contact & Emails */}
          <div className="space-y-2">
            <p className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Contact & Staff Sponsor
            </p>
            <p className="text-white font-medium">Teacher Sponsor: Mr. Willy Wan</p>
            <p className="text-slate-300">Club President: Noah Park</p>
            <p className="text-slate-400 text-[11px] pt-1">
              Volunteer hours signed off by Mr. Wan or a DTPBC exec.
            </p>
            <div className="pt-2 text-[11px] space-y-1 font-mono">
              <p className="text-slate-300">
                Email:{' '}
                <a href="mailto:dtpickleballexecutive@gmail.com" className="text-sky-300 hover:underline">
                  dtpickleballexecutive@gmail.com
                </a>
              </p>
              <p className="text-slate-300">
                Alt:{' '}
                <a href="mailto:dt.pickleball@outlook.com" className="text-sky-300 hover:underline">
                  dt.pickleball@outlook.com
                </a>
              </p>
              <p className="text-emerald-400 pt-1 font-sans">100% Free Extracurricular Club</p>
            </div>
          </div>
        </div>

        {/* Quiet Bottom Strip */}
        <div className="pt-8 border-t border-sky-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 David Thompson Secondary School Pickleball Club. Vancouver School Board (SD39).</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-5 gap-y-2">
            <span>David Thompson Athletics</span>
            <span>Non-Marking Footwear Policy</span>
            <span>Vancouver, BC</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
