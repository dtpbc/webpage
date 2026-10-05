import React, { useState } from 'react';
import { ArrowLeft, Handshake, Mail } from 'lucide-react';

interface SponsorsPageProps {
  onNavigateHome: () => void;
  onNavigateSignUp: () => void;
}

const SPONSORS: { name: string; logo: string }[] = [
   { name: 'Photo Crumb Studios', logo: '/sponsors/images.jpg' }
  { name: 'K8 Strings', logo: '/sponsors/cropped-k8strings-logo1-scaled.png' }
  { name: 'Rackets & Runners', logo: '/sponsors/channels4_profile.jpg' }
];

export const SponsorsPage: React.FC<SponsorsPageProps> = ({ onNavigateHome }) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f3fc] via-[#f0f9ff] to-[#eaf6ef] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-sky-200">
          <button onClick={onNavigateHome} className="inline-flex items-center gap-2 text-xs font-bold text-sky-800 hover:text-sky-950 transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" /><span>Back to Home</span>
          </button>
          <a href="mailto:dtpickleballexecutive@gmail.com" className="inline-flex items-center gap-2 text-xs font-bold text-sky-800 hover:underline">
            <Mail className="w-3.5 h-3.5" />Become a Sponsor
          </a>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">
            <Handshake className="w-4 h-4" /><span>Community Partners</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Our Sponsors</h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            We’re grateful to the organizations and businesses that support DT Pickleball Club and help us keep our programs accessible to students.
          </p>
        </div>

        {SPONSORS.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPONSORS.map((sponsor) => (
              <div key={sponsor.name} className="min-h-48 rounded-2xl bg-white border border-sky-200 shadow-sm p-8 flex items-center justify-center">
                {!imageErrors[sponsor.name] ? (
                  <img src={sponsor.logo} alt={sponsor.name} onError={() => setImageErrors(prev => ({ ...prev, [sponsor.name]: true }))} className="max-h-28 max-w-full object-contain" />
                ) : (
                  <span className="text-sm font-bold text-slate-700">{sponsor.name}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white/80 border-2 border-dashed border-sky-300 p-12 sm:p-16 text-center shadow-sm">
            <Handshake className="w-12 h-12 mx-auto text-amber-600 mb-4" />
            <h2 className="font-display text-2xl font-bold text-slate-900">Sponsor logos coming soon</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
              We’re building our sponsor list. Interested in supporting DT Pickleball Club? Contact the executive team to learn about sponsorship opportunities.
            </p>
            <a href="mailto:dtpickleballexecutive@gmail.com" className="inline-flex mt-6 px-5 py-2.5 rounded-xl bg-emerald-800 text-white text-sm font-bold hover:bg-emerald-700 transition-colors">
              Contact the Club
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
