/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlanProfile, getDefaultTasksForOccasion } from './utils/budgetEngine';
import { INITIAL_INDIAN_PLANS } from './data/indianPlansData';
import { TopNavBar } from './components/indian/TopNavBar';
import { BottomNav } from './components/indian/BottomNav';
import { LandingPage } from './components/indian/LandingPage';
import { PlanDashboardView } from './components/indian/PlanDashboardView';
import { MyPlansView } from './components/indian/MyPlansView';
import { QuestionnaireFlow } from './components/indian/QuestionnaireFlow';
import { ConciergeModal } from './components/indian/ConciergeModal';

const STORAGE_KEY = 'eventease_indian_plans_v3';

export default function App() {
  const [plans, setPlans] = useState<PlanProfile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: PlanProfile[] = JSON.parse(stored);
        return parsed.map((p) => {
          const needsFreshTasks = !p.tasks || p.tasks.length <= 4;
          return {
            ...p,
            readinessPercent: needsFreshTasks ? 0 : (p.readinessPercent ?? 0),
            tasks: needsFreshTasks
              ? getDefaultTasksForOccasion(p.type, p.name, p.date, p.daysLeft)
              : p.tasks,
          };
        });
      }
      return INITIAL_INDIAN_PLANS;
    } catch {
      return INITIAL_INDIAN_PLANS;
    }
  });

  const [activePlanId, setActivePlanId] = useState<string>(() => {
    return plans[0]?.id || INITIAL_INDIAN_PLANS[0].id;
  });

  const [currentView, setCurrentView] = useState<
    'landing' | 'dashboard' | 'my-plans' | 'questionnaire'
  >('dashboard');

  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [isConciergeOpen, setIsConciergeOpen] = useState<boolean>(false);
  const [questionnaireEventType, setQuestionnaireEventType] = useState<string>('wedding');

  // Sync plans to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [plans]);

  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0] || INITIAL_INDIAN_PLANS[0];

  const handleStartPlanning = (type = 'wedding') => {
    setQuestionnaireEventType(type);
    setCurrentView('questionnaire');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlanGenerated = (newPlan: PlanProfile) => {
    setPlans((prev) => [newPlan, ...prev]);
    setActivePlanId(newPlan.id);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPlan = (plan: PlanProfile) => {
    setActivePlanId(plan.id);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePlan = (id: string) => {
    setPlans((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (activePlanId === id && filtered.length > 0) {
        setActivePlanId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleDuplicatePlan = (plan: PlanProfile) => {
    const copy: PlanProfile = {
      ...plan,
      id: 'plan_' + Date.now(),
      name: `${plan.name} (Copy)`,
    };
    setPlans((prev) => [copy, ...prev]);
    setActivePlanId(copy.id);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#1B1C1C] flex flex-col font-sans selection:bg-[#7A1E3A] selection:text-white">
      {/* Fixed Top Navigation Bar */}
      <TopNavBar
        currentView={currentView}
        setCurrentView={(v) => {
          setCurrentView(v as typeof currentView);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onStartPlanning={() => handleStartPlanning('wedding')}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
      />

      {/* Main Viewport Content with Top Padding for Fixed Header */}
      <main className="flex-1 pt-20">
        {currentView === 'landing' && (
          <LandingPage
            onStartPlanning={() => handleStartPlanning('wedding')}
            onViewSamplePlan={() => {
              setActivePlanId(INITIAL_INDIAN_PLANS[0].id);
              setCurrentView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectEventType={(type) => handleStartPlanning(type)}
          />
        )}

        {currentView === 'dashboard' && (
          <PlanDashboardView
            plan={activePlan}
            onEditPlan={() => handleStartPlanning(activePlan.type)}
            onOpenConcierge={() => setIsConciergeOpen(true)}
          />
        )}

        {currentView === 'my-plans' && (
          <MyPlansView
            plans={plans}
            onSelectPlan={handleSelectPlan}
            onStartPlanning={() => handleStartPlanning('wedding')}
            onDeletePlan={handleDeletePlan}
            onDuplicatePlan={handleDuplicatePlan}
          />
        )}

        {currentView === 'questionnaire' && (
          <QuestionnaireFlow
            initialEventType={questionnaireEventType}
            defaultCity={selectedCity}
            onPlanGenerated={handlePlanGenerated}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      {/* Mobile-First Bottom Touch Navigation Bar */}
      <BottomNav
        currentView={currentView}
        setCurrentView={(v) => {
          setCurrentView(v as typeof currentView);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onStartPlanning={() => handleStartPlanning('wedding')}
        onOpenConcierge={() => setIsConciergeOpen(true)}
      />

      {/* WhatsApp AI Celebration Concierge Modal */}
      <ConciergeModal
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
        plan={activePlan}
      />
    </div>
  );
}
