import React from 'react';
import { PlanProfile, formatINR } from '../../utils/budgetEngine';

interface MyPlansViewProps {
  plans: PlanProfile[];
  onSelectPlan: (plan: PlanProfile) => void;
  onStartPlanning: () => void;
  onDeletePlan: (id: string) => void;
  onDuplicatePlan: (plan: PlanProfile) => void;
}

export const MyPlansView: React.FC<MyPlansViewProps> = ({
  plans,
  onSelectPlan,
  onStartPlanning,
  onDeletePlan,
  onDuplicatePlan,
}) => {
  const totalBudgetAcrossPlans = plans.reduce((acc, p) => acc + p.totalBudget, 0);
  const totalGuestsAcrossPlans = plans.reduce((acc, p) => acc + p.guestsCount, 0);
  const avgReadiness =
    plans.length > 0
      ? Math.round(plans.reduce((acc, p) => acc + p.readinessPercent, 0) / plans.length)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28">
      {/* Page Header & Action Dock */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="flex flex-col max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#5E514D] uppercase tracking-wider font-semibold">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF3EB] text-[#7A1E3A] border border-[#E3D5CA]">
              <span
                className="material-symbols-outlined text-sm text-[#F2A900]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              Central Planner Hub
            </span>
            <span>•</span>
            <span>{plans.length} Celebrations Synchronized</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#7A1E3A] tracking-tight">
            My Celebration Plans
          </h1>

          <p className="text-sm sm:text-base text-[#5E514D] leading-relaxed">
            Manage, track, and collaborate on your active and upcoming event blueprints across India. Complete Muhurat dates, Lakh/Crore budgets, and guest checklists in one place.
          </p>
        </div>

        {/* Main Add Plan CTA Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onStartPlanning}
            className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#7A1E3A] text-white font-semibold text-sm shadow-md hover:bg-[#5C0325] hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <span
              className="material-symbols-outlined text-xl text-[#FFDEAD] group-hover:rotate-12 transition-transform"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add_circle
            </span>
            <span>+ Plan a New Event</span>
          </button>
        </div>
      </div>

      {/* Portfolio Metrics Ticker Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#FAF3EB] border border-[#E3D5CA] shadow-xs">
        <div className="p-3 rounded-xl bg-white border border-[#E3D5CA]/70">
          <span className="text-xs text-[#5E514D]">Active Event Portfolios</span>
          <p className="font-serif font-bold text-xl sm:text-2xl text-[#7A1E3A] mt-1">
            {plans.length} Plans
          </p>
        </div>

        <div className="p-3 rounded-xl bg-white border border-[#E3D5CA]/70">
          <span className="text-xs text-[#5E514D]">Total Allocated Budget</span>
          <p className="font-serif font-bold text-xl sm:text-2xl text-[#1B1C1C] mt-1">
            {formatINR(totalBudgetAcrossPlans)}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-white border border-[#E3D5CA]/70">
          <span className="text-xs text-[#5E514D]">Cumulative Guests</span>
          <p className="font-serif font-bold text-xl sm:text-2xl text-[#1B1C1C] mt-1">
            {totalGuestsAcrossPlans.toLocaleString()} Attendees
          </p>
        </div>

        <div className="p-3 rounded-xl bg-white border border-[#E3D5CA]/70">
          <span className="text-xs text-[#5E514D]">Average Readiness</span>
          <p className="font-serif font-bold text-xl sm:text-2xl text-[#2A9D8F] mt-1">
            {avgReadiness}% Ready
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className="p-6 rounded-2xl bg-white border border-[#E3D5CA] hover:border-[#7A1E3A]/60 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF3EB] text-[#7A1E3A] text-xs font-semibold capitalize border border-[#E3D5CA]">
                    {p.type}
                  </span>
                  {(p.id.includes('sample') || p.name.includes('Sample Plan')) && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-amber-600">star</span>
                      Sample Plan
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-[#2A9D8F] flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {p.daysLeft} days to go
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-xl text-[#7A1E3A] group-hover:text-[#5C0325] transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs text-[#5E514D] mt-1 line-clamp-1">
                  {p.venueName} · {p.city}
                </p>
              </div>

              {/* Progress and Numbers */}
              <div className="p-3 bg-[#FAF3EB] rounded-xl border border-[#E3D5CA]/60 space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[#5E514D]">Budget:</span>
                  <strong className="text-sm font-bold text-[#1B1C1C]">
                    {formatINR(p.totalBudget)}
                  </strong>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[#5E514D]">Confirmed Guests:</span>
                  <strong className="text-xs font-semibold text-[#1B1C1C]">
                    {p.guestsCount} Attendees
                  </strong>
                </div>
                <div className="pt-1">
                  <div className="flex justify-between text-[11px] text-[#5E514D] mb-1">
                    <span>Readiness:</span>
                    <span className="font-bold text-[#2A9D8F]">{p.readinessPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2A9D8F] rounded-full"
                      style={{ width: `${p.readinessPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E3D5CA]/70">
              <button
                onClick={() => onSelectPlan(p)}
                className="px-4 py-2 rounded-xl bg-[#7A1E3A] text-white text-xs font-semibold hover:bg-[#5C0325] transition-colors shadow-xs"
              >
                Open Blueprint →
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onDuplicatePlan(p)}
                  title="Duplicate Plan"
                  className="p-2 text-[#5E514D] hover:text-[#7A1E3A] rounded-lg hover:bg-[#FAF3EB] transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">content_copy</span>
                </button>
                {plans.length > 1 && (
                  <button
                    onClick={() => onDeletePlan(p.id)}
                    title="Delete Plan"
                    className="p-2 text-[#5E514D] hover:text-rose-600 rounded-lg hover:bg-[#FAF3EB] transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Create Plan Card */}
        <button
          onClick={onStartPlanning}
          className="p-8 rounded-2xl border-2 border-dashed border-[#E3D5CA] hover:border-[#7A1E3A] bg-[#FFF9F2]/60 hover:bg-white text-center flex flex-col items-center justify-center space-y-3 transition-all group min-h-[260px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#FAF3EB] text-[#7A1E3A] group-hover:scale-110 flex items-center justify-center transition-transform">
            <span className="material-symbols-outlined text-3xl">add</span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#7A1E3A]">Plan a New Celebration</h3>
            <p className="text-xs text-[#5E514D] mt-1 max-w-xs">
              Generate exact budgets, vendor negotiation ranges & checklists for your next event.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
