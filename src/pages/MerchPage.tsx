import React from 'react';
import { ArrowLeft, ShoppingBag, CheckCircle2, Mail, Sparkles } from 'lucide-react';

interface MerchPageProps {
  onNavigateHome: () => void;
  onNavigateSignUp: () => void;
}

export const MerchPage: React.FC<MerchPageProps> = ({ onNavigateHome, onNavigateSignUp }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f3fc] via-[#f0f9ff] to-[#eaf6ef] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-sky-200">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-sky-800 hover:text-sky-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <span className="text-xs text-emerald-800 font-bold font-mono">
            DTPBC Seasonal Apparel
          </span>
        </div>

        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
            <span>Seasonal Drops & Team Gear</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Club Merch & Apparel
          </h1>
          <p className="mt-3 text-base text-slate-700 leading-relaxed">
            Joining the David Thompson Pickleball Club is always <strong className="text-emerald-800 font-bold">100% Free</strong>. However, we occasionally run limited-edition custom merch drops so students and staff can represent DTPBC with pride.
          </p>
        </div>

        {/* 100% Free Membership Banner */}
        <div className="mb-10 p-5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">Membership is 100% Free</p>
              <p className="text-[11px] text-slate-600">Merch is strictly optional and proceeds fund gym equipment, replacement Franklin balls, and tournament prizes.</p>
            </div>
          </div>
          <button
            onClick={onNavigateSignUp}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 transition-colors whitespace-nowrap shadow-xs"
          >
            Join Free
          </button>
        </div>

        {/* Merch Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: 'DTPBC Club Athletic Tee',
              price: '$20.00',
              tag: 'Pre-Order Drop',
              colors: 'Light Blue with Dark Green Logo',
              desc: 'Moisture-wicking athletic performance t-shirt featuring the David Thompson Secondary Pickleball Club chest crest.',
            },
            {
              title: 'DTPBC Heavyweight Hoodie',
              price: '$45.00',
              tag: 'Winter Drop',
              colors: 'Navy Blue & Dark Green Accents',
              desc: 'Premium fleece hoodie warm-up sweater with double-lined hood and kangaroo pouch. Ideal for walking to school.',
            },
            {
              title: 'Pro Tour Cushion Grip 3-Pack',
              price: '$10.00',
              tag: 'In-Gym Stock',
              colors: 'Light Blue, Dark Green, White',
              desc: 'Tacky non-slip absorbent overgrips to re-wrap your pickleball paddle handle for maximum kitchen control.',
            },
            {
              title: 'Insulated Sports Bottle (750ml)',
              price: '$18.00',
              tag: 'Limited Stock',
              colors: 'Matte Navy with Laser Engraving',
              desc: 'Double-walled stainless steel bottle that keeps ice water freezing cold through 3 hours of gym scrimmages.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white border border-sky-200 p-5 flex flex-col justify-between hover:border-sky-400 hover:shadow-md transition-all shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-200 font-bold">
                    {item.tag}
                  </span>
                  <span className="font-bold text-emerald-800 text-sm font-mono">{item.price}</span>
                </div>

                <div className="w-full h-32 rounded-xl bg-gradient-to-br from-sky-50 to-emerald-50 border border-sky-200 flex flex-col items-center justify-center mb-4 text-center p-3">
                  <ShoppingBag className="w-8 h-8 text-sky-700 mb-1" />
                  <span className="text-[10px] text-slate-600 font-mono font-medium">{item.colors}</span>
                </div>

                <h3 className="font-display text-base font-bold text-slate-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <a
                  href="mailto:dtpickleballexecutive@gmail.com?subject=DTPBC Merch Order Request"
                  className="w-full py-2.5 rounded-lg text-xs font-bold text-slate-800 bg-slate-100 hover:bg-sky-600 hover:text-white transition-colors block text-center border border-slate-200"
                >
                  Order / Inquire
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Contact ordering note */}
        <div className="p-6 rounded-2xl bg-white border border-sky-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 shadow-xs">
          <div>
            <p className="text-slate-900 font-bold">Have sizing questions or want to suggest a merch design?</p>
            <p className="text-slate-600">Talk to Treasurer Kenny Le or email us anytime.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono font-semibold text-sky-800">
            <a href="mailto:dtpickleballexecutive@gmail.com" className="hover:underline">
              dtpickleballexecutive@gmail.com
            </a>
            <span className="text-slate-300">·</span>
            <a href="mailto:dt.pickleball@outlook.com" className="hover:underline">
              dt.pickleball@outlook.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
