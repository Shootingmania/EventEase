import React from 'react';
import { formatINR } from '../../utils/budgetEngine';

interface LandingPageProps {
  onStartPlanning: () => void;
  onViewSamplePlan: () => void;
  onSelectEventType: (type: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanning,
  onViewSamplePlan,
  onSelectEventType,
}) => {
  return (
    <div className="space-y-16 pb-24">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF3EB] border border-[#E3D5CA] text-xs font-semibold text-[#7A1E3A]">
                <span
                  className="material-symbols-outlined text-sm text-[#F2A900]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                <span>Crafted for Indian Celebrations · Weddings, Birthdays & Melas</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#7A1E3A] tracking-tight leading-[1.15]">
                Plan your perfect celebration,{' '}
                <span className="italic text-[#2A9D8F]">within your budget.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#5E514D] max-w-2xl leading-relaxed mx-auto lg:mx-0">
                A GenAI-assisted event planning companion that helps families in India organize weddings, birthdays, and community festivals with exact budget splits, local vendor price ranges, and negotiation benchmarks.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={onStartPlanning}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#7A1E3A] text-white font-semibold text-base shadow-md hover:bg-[#5C0325] hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Start Planning (Free)</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
                <button
                  onClick={onViewSamplePlan}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white border border-[#E3D5CA] text-[#7A1E3A] hover:bg-[#FAF3EB] font-semibold text-base transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <span className="material-symbols-outlined text-lg">visibility</span>
                  <span>See a Sample Plan</span>
                </button>
              </div>

              {/* Trust Pillars */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E3D5CA]/60 text-left">
                <div>
                  <p className="font-serif font-bold text-[#7A1E3A] text-lg">100% Exact</p>
                  <p className="text-xs text-[#5E514D]">Budgets sum to the Rupee</p>
                </div>
                <div>
                  <p className="font-serif font-bold text-[#7A1E3A] text-lg">Real Ranges</p>
                  <p className="text-xs text-[#5E514D]">Tier-1 & 2 market data</p>
                </div>
                <div>
                  <p className="font-serif font-bold text-[#7A1E3A] text-lg">0 Slop</p>
                  <p className="text-xs text-[#5E514D]">No hallucinated rates</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl bg-gradient-to-br from-[#7A1E3A] via-[#5C0325] to-[#7A1E3A] p-6 text-white shadow-2xl shadow-[#7A1E3A]/20 overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#F2A900]/20 blur-2xl" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDEAD] text-[#3D2700] text-xs font-bold shadow-xs">
                      <span className="material-symbols-outlined text-sm">cake</span>
                      Live AI Plan Preview
                    </span>
                    <span className="text-xs font-medium text-[#FFD9DF]">Bengaluru</span>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl font-bold">Riya's 1st Birthday</h3>
                    <p className="text-xs text-[#FFD9DF]/90 mt-0.5">Indiranagar Club Lawn · 80 Multi-gen Guests</p>
                  </div>

                  {/* Mini Metric Strip */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-white/10 rounded-xl backdrop-blur-md">
                    <div>
                      <p className="text-[11px] text-[#FFD9DF]">Allocated Budget</p>
                      <p className="font-bold text-lg text-white">₹2,00,000</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#FFD9DF]">Muhurat Timing</p>
                      <p className="font-bold text-xs text-white mt-1">5:15 PM Godhuli</p>
                    </div>
                  </div>

                  {/* Budget Segment Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#FFD9DF]">
                      <span>Catering (35%)</span>
                      <span>Venue (32%)</span>
                      <span>Photo (15%)</span>
                    </div>
                    <div className="h-2 w-full bg-black/20 rounded-full flex overflow-hidden p-0.5 gap-0.5">
                      <div className="h-full bg-[#FFDEAD] rounded-l-full" style={{ width: '35%' }} />
                      <div className="h-full bg-[#F2A900]" style={{ width: '32%' }} />
                      <div className="h-full bg-[#2A9D8F]" style={{ width: '15%' }} />
                      <div className="h-full bg-white/60 rounded-r-full" style={{ width: '18%' }} />
                    </div>
                  </div>

                  <button
                    onClick={onViewSamplePlan}
                    className="w-full py-2.5 rounded-xl bg-white text-[#7A1E3A] font-semibold text-xs shadow-md hover:bg-[#FFF9F2] transition-colors"
                  >
                    Explore Full Live Plan →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Event Types Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#7A1E3A]">
            What celebration are you organizing?
          </h2>
          <p className="text-sm text-[#5E514D]">
            Select an occasion to launch tailored budget allocations, auspicious timings, and vendor checklists.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'wedding', label: 'Wedding (Vivah)', icon: 'favorite', desc: 'Mandap, Sangeet & Catering' },
            { id: 'birthday', label: 'Birthday Milestone', icon: 'cake', desc: 'Theme decor, cake & soft play' },
            { id: 'community', label: 'Community Festival', icon: 'groups', desc: 'Diwali, Dandiya & Society Mela' },
            { id: 'anniversary', label: 'Golden Jubilee', icon: 'military_tech', desc: 'Ghazal nights & Banquets' },
            { id: 'baby_shower', label: 'Godh Bharai', icon: 'child_friendly', desc: 'Traditional blessing ceremonies' },
            { id: 'engagement', label: 'Engagement / Roka', icon: 'diamond', desc: 'Intimate family rings exchange' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectEventType(item.id)}
              className="p-4 rounded-2xl bg-white border border-[#E3D5CA] hover:border-[#7A1E3A] hover:shadow-md text-left transition-all group flex flex-col justify-between min-h-[140px]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FAF3EB] text-[#7A1E3A] group-hover:bg-[#7A1E3A] group-hover:text-white flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
              </div>
              <div>
                <p className="font-serif font-bold text-sm text-[#7A1E3A]">{item.label}</p>
                <p className="text-[11px] text-[#5E514D] mt-0.5 line-clamp-2 leading-tight">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. How It Works (4 Steps) */}
      <section className="bg-[#FAF3EB] py-14 border-y border-[#E3D5CA]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2A9D8F]">Simple 4-Step Process</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#7A1E3A]">
              From idea to finalized celebration plan in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Share Event Scope',
                desc: 'Answer our 5-minute guided questionnaire on guests, budget, age mix, and rituals.',
                icon: 'quiz',
              },
              {
                step: '02',
                title: 'Exact Budget Split',
                desc: 'Our deterministic formula splits your budget down to the Rupee without math errors.',
                icon: 'pie_chart',
              },
              {
                step: '03',
                title: 'Vendor Negotiation Numbers',
                desc: 'Get expected quotes, target discounts, and walk-away numbers based on your city.',
                icon: 'handshake',
              },
              {
                step: '04',
                title: 'Execute & Share Plan',
                desc: 'Track checklists working backwards from the date, with WhatsApp and PDF export.',
                icon: 'file_download',
              },
            ].map((s) => (
              <div key={s.step} className="p-6 rounded-2xl bg-white border border-[#E3D5CA]/70 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl font-bold text-[#7A1E3A]/40">{s.step}</span>
                  <div className="w-8 h-8 rounded-lg bg-[#FAF3EB] text-[#7A1E3A] flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">{s.icon}</span>
                  </div>
                </div>
                <h3 className="font-serif font-bold text-base text-[#7A1E3A]">{s.title}</h3>
                <p className="text-xs text-[#5E514D] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Core Features Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#7A1E3A]">
            Features engineered for Indian festivities
          </h2>
          <p className="text-sm text-[#5E514D]">
            We honor family traditions, dietary preferences, and multi-generational comforts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E3D5CA] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD9DF]/50 text-[#7A1E3A] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">shield_with_heart</span>
            </div>
            <h3 className="font-serif font-bold text-base text-[#7A1E3A]">Toddler & Elder Guardrails</h3>
            <p className="text-xs text-[#5E514D] leading-relaxed">
              Automated decibel guards (&lt;70dB) near grandparents' seating, dedicated nap window locks, and private nursing lounges.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E3D5CA] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E0F4F1] text-[#2A9D8F] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">schedule</span>
            </div>
            <h3 className="font-serif font-bold text-base text-[#7A1E3A]">Auspicious Muhurat Sync</h3>
            <p className="text-xs text-[#5E514D] leading-relaxed">
              Synchronize cake cutting, ring exchanges, and pheras with traditional Shubh Bela and sunset Godhuli slots.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E3D5CA] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3D6] text-[#3D2700] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">price_change</span>
            </div>
            <h3 className="font-serif font-bold text-base text-[#7A1E3A]">Smart Negotiation Power</h3>
            <p className="text-xs text-[#5E514D] leading-relaxed">
              Know the typical quotation markup before meeting the caterer or decorator. Target 15% savings with packaged bundles.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#7A1E3A] text-white p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold max-w-2xl mx-auto leading-tight">
            Ready to plan your celebration without budget anxiety?
          </h2>
          <p className="text-sm sm:text-base text-[#FFD9DF] max-w-xl mx-auto">
            Generate your personalized budget breakdown, vendor quotation range, and day-of checklist in less than 2 minutes.
          </p>
          <button
            onClick={onStartPlanning}
            className="px-8 py-4 rounded-xl bg-[#F2A900] hover:bg-[#e09c00] text-[#3D2700] font-bold text-base shadow-md transition-all active:scale-95"
          >
            Launch Free Planning Assistant
          </button>
        </div>
      </section>
    </div>
  );
};
