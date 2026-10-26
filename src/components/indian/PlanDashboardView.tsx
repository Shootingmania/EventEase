import React, { useState, useEffect } from 'react';
import { PlanProfile, formatINR, getDefaultTasksForOccasion, getDynamicTimelinePhases, TaskItem } from '../../utils/budgetEngine';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

const BUDGET_COLORS = [
  '#7A1E3A', // Deep Royal Maroon
  '#F2A900', // Auspicious Marigold Gold
  '#2A9D8F', // Sage Teal
  '#E76F51', // Terracotta Spice
  '#3D5A80', // Royal Slate Blue
  '#D97706', // Rich Amber
  '#8B5CF6', // Festive Violet
  '#6B7280', // Charcoal Slate
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      value: number;
      percent: number;
      details?: string;
      fill: string;
    };
  }>;
}

const CustomBudgetTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#E3D5CA] shadow-xl text-xs space-y-1 z-50 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.fill }} />
          <span className="font-bold text-[#1B1C1C]">{data.name}</span>
        </div>
        <p className="font-serif text-sm font-bold text-[#7A1E3A]">
          {formatINR(data.value)} ({data.percent}%)
        </p>
        {data.details && (
          <p className="text-[11px] text-[#5E514D] max-w-[210px] leading-relaxed">
            {data.details}
          </p>
        )}
      </div>
    );
  }
  return null;
};

interface PlanDashboardViewProps {
  plan: PlanProfile;
  onEditPlan: () => void;
  onOpenConcierge: () => void;
}

export const PlanDashboardView: React.FC<PlanDashboardViewProps> = ({
  plan,
  onEditPlan,
  onOpenConcierge,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'budget' | 'vendors' | 'ambience' | 'timeline' | 'checklist'
  >('overview');

  // Accordion toggle states
  const [isBudgetOpen, setIsBudgetOpen] = useState(true);
  const [isMilestonesOpen, setIsMilestonesOpen] = useState(true);

  // Budget chart interactive state
  const [budgetDisplayMode, setBudgetDisplayMode] = useState<'chart' | 'bars'>('chart');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const budgetChartData = plan.budgetSplit.map((item, idx) => ({
    name: item.category,
    value: item.amount,
    percent: item.percent,
    details: item.details,
    fill: BUDGET_COLORS[idx % BUDGET_COLORS.length],
  }));

  // Checklist tasks initialized based on active plan and occasion with realistic dynamic deadlines
  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    plan.tasks && plan.tasks.length > 0
      ? plan.tasks
      : getDefaultTasksForOccasion(plan.type, plan.name, plan.date, plan.daysLeft)
  );

  // Sync tasks whenever user switches active plan or generates a new one
  useEffect(() => {
    setTasks(
      plan.tasks && plan.tasks.length > 0
        ? plan.tasks
        : getDefaultTasksForOccasion(plan.type, plan.name, plan.date, plan.daysLeft)
    );
  }, [plan.id, plan.type, plan.name, plan.date, plan.daysLeft]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const completedTasksCount = tasks.filter((t) => t.done).length;
  const currentReadiness = tasks.length > 0
    ? Math.round((completedTasksCount / tasks.length) * 100)
    : 0;
  const pendingTasksCount = tasks.length - completedTasksCount;

  const handleShareWhatsApp = () => {
    const text = `🎉 EventEase Celebration Blueprint for ${plan.name}!\n📅 Date: ${plan.date}\n📍 Venue: ${plan.venueName}\n💰 Budget: ${formatINR(plan.totalBudget)}\n👥 Guests: ${plan.guestsCount} confirmed.\nView the full plan on EventEase.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-5 pb-28">
      {/* 1. Festive Milestone Header & Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7A1E3A] via-[#5C0325] to-[#7A1E3A] text-white p-5 sm:p-6 shadow-xl shadow-[#7A1E3A]/15">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#FFDEAD]/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-[#2A9D8F]/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFDEAD] text-[#3D2700] text-xs font-semibold tracking-wide shadow-xs">
              <span className="material-symbols-outlined text-[14px]">cake</span>
              {plan.type === 'birthday' ? '1st Birthday Milestone' : `${plan.type.toUpperCase()} Celebration`}
            </span>
            <div className="flex items-center gap-1 text-[#FFD9DF] text-xs bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
              <span className="material-symbols-outlined text-[14px] text-[#FFBA3B]">verified</span>
              <span>Curated AI Plan</span>
            </div>
          </div>

          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {plan.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#FFD9DF]/90 mt-0.5">
              Family Joy & Traditional Blessings · {plan.vibe}
            </p>
          </div>

          {/* Metadata Pill Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs">
              <span className="material-symbols-outlined text-[15px] text-[#FFDEAD]">pin_drop</span>
              {plan.venueName}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs">
              <span className="material-symbols-outlined text-[15px] text-[#2A9D8F]">diversity_1</span>
              {plan.guestsCount} Guests (Multi-gen)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFDEAD] text-[#3D2700] text-xs font-semibold">
              <span className="material-symbols-outlined text-[15px]">hourglass_top</span>
              {plan.daysLeft} Days Left
            </span>
          </div>

          {/* Quick Action Floating Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl bg-white text-[#7A1E3A] font-semibold text-xs shadow-md active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              <span>Share WhatsApp</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              aria-label="Download PDF Plan"
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
            <button
              onClick={onEditPlan}
              aria-label="Edit Plan Parameters"
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Horizontally Scrollable Modern Pill Tabs */}
      <div className="relative overflow-x-auto no-scrollbar scroll-smooth py-1">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { id: 'overview', label: 'Overview', icon: 'dashboard' },
            { id: 'budget', label: 'Budget Split', icon: 'pie_chart' },
            { id: 'vendors', label: 'Vendors', icon: 'storefront' },
            { id: 'ambience', label: 'Ambience Themes', icon: 'palette' },
            { id: 'timeline', label: 'Timeline', icon: 'schedule' },
            { id: 'checklist', label: 'Checklist', icon: 'checklist', badge: `${completedTasksCount}/${tasks.length}` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#7A1E3A] text-white shadow-sm'
                  : 'bg-[#FAF3EB] text-[#5E514D] hover:bg-[#F5ECE1]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#E0F4F1] text-[#006A60] text-[10px]">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* 2x2 Grid of Key Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Total Budget */}
            <div className="flex flex-col justify-between p-4 rounded-2xl bg-white border border-[#E3D5CA] shadow-xs">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#FFD9DF]/60 flex items-center justify-center text-[#7A1E3A]">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#E0F4F1] text-[#006A60] text-[10px] font-semibold">
                  Safe
                </span>
              </div>
              <div className="mt-3">
                <p className="text-xs text-[#5E514D]">Allocated Budget</p>
                <p className="font-serif text-xl sm:text-2xl text-[#7A1E3A] font-bold mt-0.5">
                  {formatINR(plan.totalBudget)}
                </p>
                <p className="text-[11px] text-[#2A9D8F] font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[13px]">shield</span>
                  {formatINR(plan.contingencyAmount)} buffer locked
                </p>
              </div>
            </div>

            {/* Card 2: Guest Footfall */}
            <div className="flex flex-col justify-between p-4 rounded-2xl bg-white border border-[#E3D5CA] shadow-xs">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#FFDEAD] flex items-center justify-center text-[#3D2700]">
                  <span className="material-symbols-outlined text-[18px]">family_restroom</span>
                </div>
                <span className="text-xs text-[#5E514D] font-medium">Multi-gen</span>
              </div>
              <div className="mt-3">
                <p className="text-xs text-[#5E514D]">Guest Footfall</p>
                <p className="font-serif text-xl sm:text-2xl text-[#1B1C1C] font-bold mt-0.5">
                  {plan.guestsCount} Confirmed
                </p>
                <div className="flex items-center gap-1 text-[11px] text-[#5E514D] mt-0.5">
                  <span className="text-[#7A1E3A] font-semibold">{plan.guestBreakdown.children} kids</span>
                  <span>•</span>
                  <span>{plan.guestBreakdown.adults} adults</span>
                  <span>•</span>
                  <span>{plan.guestBreakdown.seniors} seniors</span>
                </div>
              </div>
            </div>

            {/* Card 3: Auspicious Slot & Muhurat */}
            <div className="flex flex-col justify-between p-4 rounded-2xl bg-white border border-[#E3D5CA] shadow-xs">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#FFF3D6] flex items-center justify-center text-[#3D2700]">
                  <span className="material-symbols-outlined text-[18px]">hotel_class</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#FFDEAD] text-[#3D2700] text-[10px] font-semibold">
                  Auspicious
                </span>
              </div>
              <div className="mt-3">
                <p className="text-xs text-[#5E514D]">{plan.date}</p>
                <p className="font-serif text-base sm:text-lg text-[#1B1C1C] font-bold mt-0.5 leading-snug">
                  5:15 PM Cake Cutting
                </p>
                <p className="text-[11px] text-[#F2A900] font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[13px]">brightness_high</span>
                  Shubh Godhuli Bela
                </p>
              </div>
            </div>

            {/* Card 4: Plan Readiness Ring */}
            <div className="flex flex-col justify-between p-4 rounded-2xl bg-white border border-[#E3D5CA] shadow-xs">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#E0F4F1] flex items-center justify-center text-[#2A9D8F]">
                  <span className="material-symbols-outlined text-[18px]">task_alt</span>
                </div>
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#FAF3EB]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-[#2A9D8F] transition-all duration-500"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${currentReadiness}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-[#2A9D8F]">
                    {currentReadiness}%
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-[#5E514D]">Plan Readiness</p>
                <p className="font-serif text-base sm:text-lg text-[#1B1C1C] font-bold mt-0.5">
                  {currentReadiness === 100
                    ? 'Celebration Ready'
                    : currentReadiness >= 50
                    ? 'On Schedule'
                    : 'Planning Underway'}
                </p>
                <p className="text-[11px] text-[#5E514D] mt-0.5">
                  {pendingTasksCount === 0
                    ? 'All milestones signed off'
                    : `${pendingTasksCount} milestone${pendingTasksCount > 1 ? 's' : ''} pending`}
                </p>
              </div>
            </div>
          </div>

          {/* Accordion 1: Budget Distribution Architecture */}
          <div className="rounded-2xl bg-white border border-[#E3D5CA] overflow-hidden shadow-xs">
            <button
              onClick={() => setIsBudgetOpen(!isBudgetOpen)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFD9DF]/40 flex items-center justify-center text-[#7A1E3A]">
                  <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base text-[#1B1C1C]">Budget Architecture</h2>
                  <p className="text-xs text-[#5E514D]">
                    {formatINR(plan.totalBudget - plan.contingencyAmount)} Allocated · {formatINR(plan.contingencyAmount)} Safety reserve
                  </p>
                </div>
              </div>
              <span
                className={`material-symbols-outlined text-[#5E514D] transition-transform duration-200 ${
                  isBudgetOpen ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            {isBudgetOpen && (
              <div className="px-4 sm:px-5 pb-5 pt-1 space-y-4 border-t border-[#E3D5CA]/50">
                {/* Header Switch for Donut Pie Chart vs Linear Bar */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-[#1B1C1C]">
                    Expense Distribution Breakdown
                  </span>
                  <div className="flex items-center p-0.5 bg-[#FAF3EB] rounded-lg border border-[#E3D5CA]">
                    <button
                      type="button"
                      onClick={() => setBudgetDisplayMode('chart')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                        budgetDisplayMode === 'chart'
                          ? 'bg-[#7A1E3A] text-white shadow-xs'
                          : 'text-[#5E514D] hover:text-[#7A1E3A]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">pie_chart</span>
                      <span>Pie Chart</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetDisplayMode('bars')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                        budgetDisplayMode === 'bars'
                          ? 'bg-[#7A1E3A] text-white shadow-xs'
                          : 'text-[#5E514D] hover:text-[#7A1E3A]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">view_stream</span>
                      <span>Linear Bar</span>
                    </button>
                  </div>
                </div>

                {budgetDisplayMode === 'chart' ? (
                  <div className="bg-[#FAF3EB] p-4 rounded-xl border border-[#E3D5CA]/60 flex flex-col md:flex-row items-center gap-5">
                    {/* Donut Chart Container */}
                    <div className="w-full md:w-1/2 h-64 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={budgetChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={88}
                            paddingAngle={3}
                            dataKey="value"
                            onMouseEnter={(_, index) => setHoveredCategory(budgetChartData[index].name)}
                            onMouseLeave={() => setHoveredCategory(null)}
                          >
                            {budgetChartData.map((entry) => (
                              <Cell
                                key={`cell-${entry.name}`}
                                fill={entry.fill}
                                stroke={hoveredCategory === entry.name ? '#1B1C1C' : '#FAF3EB'}
                                strokeWidth={hoveredCategory === entry.name ? 2.5 : 1}
                                className="transition-all duration-200 cursor-pointer"
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomBudgetTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Donut hole center content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#5E514D]">
                          Total Budget
                        </span>
                        <span className="font-serif text-base sm:text-lg font-bold text-[#7A1E3A]">
                          {formatINR(plan.totalBudget)}
                        </span>
                        <span className="text-[10px] text-[#2A9D8F] font-semibold">
                          100% Calibrated
                        </span>
                      </div>
                    </div>

                    {/* Interactive Legend Items */}
                    <div className="w-full md:w-1/2 flex flex-col gap-1.5">
                      {budgetChartData.map((entry) => {
                        const isHovered = hoveredCategory === entry.name;
                        return (
                          <div
                            key={entry.name}
                            onMouseEnter={() => setHoveredCategory(entry.name)}
                            onMouseLeave={() => setHoveredCategory(null)}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs transition-all cursor-pointer ${
                              isHovered
                                ? 'bg-white shadow-xs border border-[#7A1E3A] ring-1 ring-[#7A1E3A]/20 scale-[1.01]'
                                : 'hover:bg-white/70 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: entry.fill }}
                              />
                              <span className="text-[#1B1C1C] font-medium truncate">{entry.name}</span>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <span className="font-bold text-[#7A1E3A]">{formatINR(entry.value)}</span>
                              <span className="text-[10px] text-[#5E514D] ml-1">({entry.percent}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Segmented Visual Bar */
                  <div className="space-y-1.5 pt-2">
                    <div className="h-3 w-full rounded-full bg-[#FAF3EB] flex overflow-hidden p-0.5 gap-0.5">
                      {plan.budgetSplit.map((item, idx) => (
                        <div
                          key={item.category}
                          className={`h-full ${
                            idx === 0
                              ? 'bg-[#7A1E3A] rounded-l-full'
                              : idx === 1
                              ? 'bg-[#F2A900]'
                              : idx === 2
                              ? 'bg-[#2A9D8F]'
                              : idx === 3
                              ? 'bg-[#FFDEAD]'
                              : 'bg-[#8C7B75] rounded-r-full'
                          }`}
                          style={{ width: `${item.percent}%` }}
                          title={`${item.category}: ${item.percent}%`}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap justify-between items-center text-[11px] text-[#5E514D] px-0.5 gap-2">
                      {plan.budgetSplit.slice(0, 4).map((item, idx) => (
                        <span key={item.category} className="flex items-center gap-1">
                          <span
                            className={`w-2 h-2 rounded-full inline-block ${
                              idx === 0
                                ? 'bg-[#7A1E3A]'
                                : idx === 1
                                ? 'bg-[#F2A900]'
                                : idx === 2
                                ? 'bg-[#2A9D8F]'
                                : 'bg-[#FFDEAD]'
                            }`}
                          />
                          {item.category.split(' ')[0]} ({item.percent}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Itemized Breakdown Cards */}
                <div className="space-y-2">
                  {plan.budgetSplit.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#FAF3EB] border border-[#E3D5CA]/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FFD9DF]/40 text-[#7A1E3A] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-xs sm:text-sm text-[#1B1C1C]">{item.category}</p>
                          <p className="text-[11px] text-[#5E514D] line-clamp-1">{item.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm sm:text-base text-[#1B1C1C]">
                          {formatINR(item.amount)}
                        </p>
                        <span className="text-[10px] font-semibold text-[#2A9D8F] uppercase">
                          {item.percent}% · {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Accordion 2: Next Critical Milestones Checklist */}
          <div className="rounded-2xl bg-white border border-[#E3D5CA] overflow-hidden shadow-xs">
            <button
              onClick={() => setIsMilestonesOpen(!isMilestonesOpen)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E0F4F1] flex items-center justify-center text-[#006A60]">
                  <span className="material-symbols-outlined text-xl">flag</span>
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base text-[#1B1C1C]">
                    Next Critical Milestones
                  </h2>
                  <p className="text-xs text-[#5E514D]">
                    {completedTasksCount} of {tasks.length} signed off · {plan.daysLeft} days to go
                  </p>
                </div>
              </div>
              <span
                className={`material-symbols-outlined text-[#5E514D] transition-transform duration-200 ${
                  isMilestonesOpen ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            {isMilestonesOpen && (
              <div className="px-4 sm:px-5 pb-5 pt-1 space-y-2.5 border-t border-[#E3D5CA]/50">
                {tasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF3EB] cursor-pointer hover:bg-[#F5ECE1] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      className="mt-0.5 w-4 h-4 accent-[#7A1E3A] rounded cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`font-semibold text-xs sm:text-sm ${
                            task.done ? 'line-through text-[#5E514D]' : 'text-[#1B1C1C]'
                          }`}
                        >
                          {task.title}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            task.done
                              ? 'bg-[#E0F4F1] text-[#006A60]'
                              : 'bg-[#FFD9DF] text-[#7A1E3A]'
                          }`}
                        >
                          {task.due}
                        </span>
                      </div>
                      <p className="text-xs text-[#5E514D] mt-0.5">{task.note}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Curated Ambience Board Preview Card */}
          <div className="rounded-2xl bg-white border border-[#E3D5CA] p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7A1E3A] text-xl">photo_library</span>
                <h3 className="font-serif font-bold text-base text-[#1B1C1C]">Curated Ambience Board</h3>
              </div>
              <span className="text-xs font-semibold text-[#2A9D8F]">{plan.vibe}</span>
            </div>

            <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-inner bg-gradient-to-tr from-[#7A1E3A] to-[#F2A900]">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                alt="Ambience theme"
                className="w-full h-full object-cover mix-blend-overlay opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-white space-y-0.5">
                  <p className="text-[11px] font-medium text-[#FFDEAD]">Auspicious Color Palette</p>
                  <p className="font-serif text-lg font-bold">Pastel Peach, Marigold Gold & Deep Maroon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky WhatsApp Assistant Bar */}
          <div className="sticky bottom-2 z-30 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9F2]/95 backdrop-blur-md border border-[#E3D5CA] shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2A9D8F] flex items-center justify-center text-white shadow-sm">
                  <span className="material-symbols-outlined text-xl">chat</span>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-xs sm:text-sm text-[#1B1C1C]">
                      EventEase Concierge
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5E514D]">
                    Ask to negotiate play zone or re-time cake cutting
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenConcierge}
                className="px-3.5 py-2 rounded-xl bg-[#7A1E3A] text-white text-xs font-semibold flex items-center gap-1 active:scale-95 transition-transform shadow-xs"
              >
                <span>Prompt</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: BUDGET SPLIT */}
      {activeTab === 'budget' && (
        <div className="bg-white border border-[#E3D5CA] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E3D5CA] pb-4 gap-2">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#7A1E3A]">Deterministic Budget Split</h2>
              <p className="text-xs text-[#5E514D]">
                Every single category adds up to exactly {formatINR(plan.totalBudget)} with zero arithmetic errors.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#E0F4F1] text-[#006A60] text-xs font-semibold">
                {plan.budgetSplit.length} Categories
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#FFD9DF] text-[#7A1E3A] text-xs font-bold">
                Total: {formatINR(plan.totalBudget)}
              </span>
            </div>
          </div>

          {/* Recharts Pie Chart Distribution Card */}
          <div className="bg-[#FAF3EB] p-5 rounded-2xl border border-[#E3D5CA]/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7A1E3A] text-lg">pie_chart</span>
                <h3 className="font-serif font-bold text-sm text-[#1B1C1C]">
                  Expense Distribution by Category
                </h3>
              </div>
              <span className="text-[11px] text-[#5E514D]">Hover over slices to view details</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/2 h-72 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      onMouseEnter={(_, index) => setHoveredCategory(budgetChartData[index].name)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      {budgetChartData.map((entry) => (
                        <Cell
                          key={`split-cell-${entry.name}`}
                          fill={entry.fill}
                          stroke={hoveredCategory === entry.name ? '#1B1C1C' : '#FAF3EB'}
                          strokeWidth={hoveredCategory === entry.name ? 2.5 : 1}
                          className="transition-all duration-200 cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomBudgetTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Hole Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#5E514D]">
                    Total Budget
                  </span>
                  <span className="font-serif text-lg sm:text-xl font-bold text-[#7A1E3A]">
                    {formatINR(plan.totalBudget)}
                  </span>
                  <span className="text-[10px] text-[#2A9D8F] font-semibold">
                    100% Calibrated
                  </span>
                </div>
              </div>

              {/* Category Legend & Breakdown List */}
              <div className="w-full md:w-1/2 space-y-2">
                {budgetChartData.map((entry) => {
                  const isHovered = hoveredCategory === entry.name;
                  return (
                    <div
                      key={entry.name}
                      onMouseEnter={() => setHoveredCategory(entry.name)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                        isHovered
                          ? 'bg-white shadow-xs border border-[#7A1E3A] ring-1 ring-[#7A1E3A]/20 scale-[1.01]'
                          : 'bg-white/60 hover:bg-white border border-[#E3D5CA]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: entry.fill }}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1B1C1C] truncate">{entry.name}</p>
                          {entry.details && (
                            <p className="text-[10px] text-[#5E514D] truncate max-w-[160px] sm:max-w-[220px]">
                              {entry.details}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="font-bold text-[#7A1E3A]">{formatINR(entry.value)}</span>
                        <div className="text-[10px] text-[#2A9D8F] font-semibold">{entry.percent}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {plan.budgetSplit.map((item) => (
              <div
                key={item.category}
                className="p-4 rounded-xl bg-[#FAF3EB] border border-[#E3D5CA] space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-[#1B1C1C]">{item.category}</h3>
                    <p className="text-xs text-[#5E514D]">{item.details}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif font-bold text-base text-[#7A1E3A]">
                      {formatINR(item.amount)}
                    </p>
                    <span className="text-[11px] font-semibold text-[#2A9D8F] uppercase">
                      {item.percent}% allocation
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7A1E3A] rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: VENDORS WITH NEGOTIATION FORMULA */}
      {activeTab === 'vendors' && (
        <div className="bg-white border border-[#E3D5CA] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-[#E3D5CA] pb-4">
            <h2 className="font-serif font-bold text-lg text-[#7A1E3A]">
              Vendor Price Ranges & Negotiation Benchmarks
            </h2>
            <p className="text-xs text-[#5E514D]">
              Typical market ranges for {plan.city}. Formula: Target Price ← Expected Quote → Walk-Away Point.
            </p>
          </div>

          <div className="space-y-4">
            {plan.vendorEstimates.map((v) => (
              <div
                key={v.category}
                className="p-5 rounded-2xl bg-[#FAF3EB] border border-[#E3D5CA] space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2A9D8F]">
                      Category Benchmark
                    </span>
                    <h3 className="font-serif font-bold text-base text-[#1B1C1C]">{v.category}</h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-[#5E514D]">Allocated Budget: </span>
                    <strong className="text-sm text-[#7A1E3A]">{formatINR(v.allocatedAmount)}</strong>
                  </div>
                </div>

                {/* Negotiation Range Bar */}
                <div className="p-3 bg-white rounded-xl border border-[#E3D5CA] space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#2A9D8F]">Target Price: {formatINR(v.targetPrice)}</span>
                    <span className="text-[#F2A900]">Expected Quote: {formatINR(v.expectedQuote)}</span>
                    <span className="text-[#7A1E3A]">Walk-Away: {formatINR(v.walkAway)}</span>
                  </div>
                  <div className="relative h-3 w-full bg-[#FAF3EB] rounded-full overflow-hidden flex items-center">
                    <div className="h-full bg-gradient-to-r from-[#2A9D8F] via-[#F2A900] to-[#7A1E3A] w-full rounded-full" />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#5E514D]">
                    <span>Market Min: {formatINR(v.marketMin)}</span>
                    <span>Market Max: {formatINR(v.marketMax)}</span>
                  </div>
                </div>

                {/* Negotiation Tips */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs font-bold text-[#1B1C1C] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#F2A900]">tips_and_updates</span>
                    <span>Practical Negotiation Advice:</span>
                  </p>
                  <ul className="space-y-1 text-xs text-[#5E514D] list-disc list-inside">
                    {v.tips.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[#5E514D] italic pt-2">
            "Typical market ranges, estimates only. Prices may vary by season and demand."
          </p>
        </div>
      )}

      {/* 6. TAB CONTENT: AMBIENCE THEMES */}
      {activeTab === 'ambience' && (
        <div className="bg-white border border-[#E3D5CA] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-[#E3D5CA] pb-4">
            <h2 className="font-serif font-bold text-lg text-[#7A1E3A]">Ambience & Theme Direction</h2>
            <p className="text-xs text-[#5E514D]">
              Coordinated palettes, florals, and lighting suited for {plan.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF3EB] border border-[#E3D5CA] space-y-3">
              <h3 className="font-serif font-bold text-base text-[#7A1E3A]">
                1. Pastel Flora & Golden Sunlight (Selected)
              </h3>
              <p className="text-xs text-[#5E514D] leading-relaxed">
                Peach, cream, and deep maroon marigold floral garlands draping an organic wooden pergola on a manicured lawn. Soft fairy lights and bolster cushions.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="w-6 h-6 rounded-full bg-[#FFDEAD] border border-black/10" title="Peach" />
                <span className="w-6 h-6 rounded-full bg-[#F2A900] border border-black/10" title="Marigold" />
                <span className="w-6 h-6 rounded-full bg-[#7A1E3A] border border-black/10" title="Maroon" />
                <span className="w-6 h-6 rounded-full bg-[#2A9D8F] border border-black/10" title="Sage Teal" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF3EB] border border-[#E3D5CA] space-y-3">
              <h3 className="font-serif font-bold text-base text-[#7A1E3A]">
                2. Royal Heritage Brass & White Jasmine
              </h3>
              <p className="text-xs text-[#5E514D] leading-relaxed">
                Traditional brass urlis filled with fragrant mogra/jasmine petals, earthen diyas, and silk runner table accents for evening blessings.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="w-6 h-6 rounded-full bg-[#FFF9F2] border border-black/10" title="Jasmine" />
                <span className="w-6 h-6 rounded-full bg-[#F2A900] border border-black/10" title="Brass" />
                <span className="w-6 h-6 rounded-full bg-[#5C0325] border border-black/10" title="Crimson" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white border border-[#E3D5CA] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-[#E3D5CA] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#7A1E3A]">
                Reverse Execution Timeline
              </h2>
              <p className="text-xs text-[#5E514D]">
                Dynamic phases calculated from today to {plan.date} ({plan.daysLeft} days remaining).
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#E0F4F1] text-[#006A60] text-xs font-bold w-fit">
              {plan.daysLeft} Days Countdown
            </span>
          </div>

          <div className="space-y-4">
            {getDynamicTimelinePhases(plan.type, plan.date, plan.daysLeft).map((phase, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#FAF3EB] border border-[#E3D5CA] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#7A1E3A] text-white text-[10px] font-bold uppercase tracking-wider">
                      {phase.when}
                    </span>
                    <span className="text-[11px] font-semibold text-[#006A60] bg-[#E0F4F1] px-2 py-0.5 rounded-full">
                      {phase.badge}
                    </span>
                  </div>
                  {phase.dateRange && (
                    <span className="text-xs font-semibold text-[#5E514D] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#7A1E3A]">calendar_month</span>
                      {phase.dateRange}
                    </span>
                  )}
                </div>
                <ul className="space-y-1 text-xs text-[#1B1C1C] list-disc list-inside pt-1">
                  {phase.tasks.map((t, tidx) => (
                    <li key={tidx}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB CONTENT: CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="bg-white border border-[#E3D5CA] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-[#E3D5CA] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#7A1E3A]">
                {plan.type.toUpperCase()} Action Checklist
              </h2>
              <p className="text-xs text-[#5E514D]">
                Tailored milestones for {plan.name} in {plan.city}. Check off tasks to advance your plan readiness.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#E0F4F1] text-[#006A60] text-xs font-bold">
                {currentReadiness}% Ready
              </span>
              <span className="text-xs text-[#5E514D]">
                ({completedTasksCount}/{tasks.length} Done)
              </span>
            </div>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="w-full bg-[#FAF3EB] h-2.5 rounded-full overflow-hidden border border-[#E3D5CA]/50">
            <div
              className="h-full bg-[#2A9D8F] transition-all duration-300 rounded-full"
              style={{ width: `${currentReadiness}%` }}
            />
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <label
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF3EB] cursor-pointer hover:bg-[#F5ECE1] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                  className="mt-0.5 w-4 h-4 accent-[#7A1E3A] rounded cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className={`font-semibold text-xs sm:text-sm ${
                        task.done ? 'line-through text-[#5E514D]' : 'text-[#1B1C1C]'
                      }`}
                    >
                      {task.title}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        task.done
                          ? 'bg-[#E0F4F1] text-[#006A60]'
                          : 'bg-[#FFD9DF] text-[#7A1E3A]'
                      }`}
                    >
                      {task.due}
                    </span>
                  </div>
                  <p className="text-xs text-[#5E514D] mt-0.5">{task.note}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
