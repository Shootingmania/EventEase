import React, { useState } from 'react';
import {
  PlanProfile,
  calculateBudgetSplit,
  calculateVendorNegotiation,
  formatINR,
  getDefaultTasksForOccasion,
} from '../../utils/budgetEngine';

interface QuestionnaireFlowProps {
  onPlanGenerated: (newPlan: PlanProfile) => void;
  onCancel: () => void;
  initialEventType?: string;
  defaultCity?: string;
}

export const QuestionnaireFlow: React.FC<QuestionnaireFlowProps> = ({
  onPlanGenerated,
  onCancel,
  initialEventType = 'wedding',
  defaultCity = 'Bengaluru',
}) => {
  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Formulating budget distribution...');

  // Step 1: Occasion
  const [eventType, setEventType] = useState<PlanProfile['type']>(
    (initialEventType as PlanProfile['type']) || 'wedding'
  );

  // Step 2: Basics (Common + Occasion Specific)
  const [eventName, setEventName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('2025-11-20');
  const [dateFlexible, setDateFlexible] = useState<string>('Somewhat');
  const [city, setCity] = useState<string>(defaultCity);
  const [area, setArea] = useState<string>('Indiranagar');
  const [duration, setDuration] = useState<string>('Half day');

  // Occasion-Specific Basics:
  // Wedding:
  const [weddingVenuesSetup, setWeddingVenuesSetup] = useState<string>('Single Grand Resort');
  const [weddingDays, setWeddingDays] = useState<string>('2 Days traditional');
  // Birthday:
  const [birthdayMilestone, setBirthdayMilestone] = useState<string>('1st Birthday');
  const [birthdayFormat, setBirthdayFormat] = useState<string>('Family & kids with parents staying');
  const [isSurpriseParty, setIsSurpriseParty] = useState<boolean>(false);
  // Community Event:
  const [communityPurpose, setCommunityPurpose] = useState<string>('Diwali & Dandiya Festival');
  const [communityEntry, setCommunityEntry] = useState<string>('Free for all society residents');
  // Anniversary:
  const [anniversaryMilestone, setAnniversaryMilestone] = useState<string>('50th Golden Jubilee');

  // Step 3: Guests & Hospitality (Dynamic)
  const [totalGuests, setTotalGuests] = useState<number>(() =>
    eventType === 'wedding' ? 350 : eventType === 'community' ? 450 : 80
  );
  const [childrenCount, setChildrenCount] = useState<number>(() =>
    eventType === 'birthday' ? 22 : 15
  );
  const [seniorsCount, setSeniorsCount] = useState<number>(() =>
    eventType === 'anniversary' ? 30 : 12
  );
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([
    'Elderly shaded seating',
    'Infants feeding room',
  ]);
  const [foodPreference, setFoodPreference] = useState<string>('Pure veg');
  const [alcohol, setAlcohol] = useState<string>('No alcohol');

  // Step 4: Rituals & Ambience (100% Occasion-Specific)
  const [weddingCeremonies, setWeddingCeremonies] = useState<string[]>([
    'Mehendi & Sangeet',
    'Vivah Mandap Pheras',
    'Reception Dinner',
  ]);
  const [weddingProcession, setWeddingProcession] = useState<string>('Baraat with Dhol & Brass Band');
  const [birthdayActivities, setBirthdayActivities] = useState<string[]>([
    'Toddler Soft Play Foam Pit',
    'Magician & Games Host',
    'Balloon Sculpting & Tattoos',
  ]);
  const [birthdayCakeType, setBirthdayCakeType] = useState<string>('3-Tier Theme Fondant + Smash Cake');
  const [communityPermits, setCommunityPermits] = useState<string[]>([
    'Police Loudspeaker NOC (past 10 PM)',
    'Fire Safety & Society Permission',
    'Power Generator Backup',
  ]);
  const [anniversarySpecial, setAnniversarySpecial] = useState<string[]>([
    '50-Year Photo Montage Video',
    'Golden Ring Re-Exchange',
    'Live Ghazal & Old Melodies Ensemble',
  ]);
  const [vibe, setVibe] = useState<string>('Pastel Flora & Gold');

  // Step 5: Budget & Add-ons (Dynamic based on eventType)
  const [totalBudget, setTotalBudget] = useState<number>(() =>
    eventType === 'wedding' ? 1800000 : eventType === 'community' ? 350000 : 200000
  );
  const [budgetFlexibility, setBudgetFlexibility] = useState<string>('Stretch 10%');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([
    'Photographer',
    'Theme Decor',
    'Sound & DJ',
  ]);

  // Adjust defaults when eventType changes
  const handleSelectEventType = (type: PlanProfile['type']) => {
    setEventType(type);
    if (type === 'wedding') {
      setTotalBudget(1800000);
      setTotalGuests(350);
      setEventName('Aarav & Ananya Vivah');
    } else if (type === 'birthday') {
      setTotalBudget(200000);
      setTotalGuests(80);
      setEventName("Riya's 1st Birthday");
    } else if (type === 'community') {
      setTotalBudget(350000);
      setTotalGuests(500);
      setEventName('Green Glen Diwali & Dandiya Utsav');
    } else if (type === 'anniversary') {
      setTotalBudget(500000);
      setTotalGuests(120);
      setEventName('Sharma 50th Golden Jubilee');
    } else {
      setTotalBudget(250000);
      setTotalGuests(100);
      setEventName('Special Family Celebration');
    }
  };

  const toggleArrayItem = (arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setArr((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  // Live budget split calculation
  const liveBudgetSplit = calculateBudgetSplit(totalBudget, eventType);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setLoadingMessage('Formulating deterministic budget split...');

    // Collect occasion-specific answers
    const occasionSpecifics: Record<string, unknown> = {};
    if (eventType === 'wedding') {
      occasionSpecifics.ceremonies = weddingCeremonies;
      occasionSpecifics.venueSetup = weddingVenuesSetup;
      occasionSpecifics.days = weddingDays;
      occasionSpecifics.procession = weddingProcession;
    } else if (eventType === 'birthday') {
      occasionSpecifics.milestone = birthdayMilestone;
      occasionSpecifics.format = birthdayFormat;
      occasionSpecifics.activities = birthdayActivities;
      occasionSpecifics.cakeType = birthdayCakeType;
      occasionSpecifics.surprise = isSurpriseParty;
    } else if (eventType === 'community') {
      occasionSpecifics.purpose = communityPurpose;
      occasionSpecifics.entry = communityEntry;
      occasionSpecifics.permits = communityPermits;
    } else if (eventType === 'anniversary') {
      occasionSpecifics.milestone = anniversaryMilestone;
      occasionSpecifics.highlights = anniversarySpecial;
    }

    const profileData = {
      name: eventName.trim() || `${eventType.toUpperCase()} Celebration`,
      type: eventType,
      date: eventDate,
      city,
      area,
      totalBudget,
      guestsCount: totalGuests,
      guestBreakdown: {
        children: childrenCount,
        teens: 5,
        adults: Math.max(1, totalGuests - childrenCount - seniorsCount - 5),
        seniors: seniorsCount,
      },
      occasionSpecifics,
      vibe,
    };

    let aiData: any = null;

    try {
      setLoadingMessage(`Consulting Gemini 3.8 Flash for ${city} vendor benchmarks & themes...`);
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: profileData,
          budgetSplit: liveBudgetSplit,
          city,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        aiData = json.data;
      }
    } catch (err) {
      console.warn('API call failed; using deterministic fallback:', err);
    }

    setLoadingMessage('Synchronizing Auspicious Muhurat and elder comfort protocols...');

    setTimeout(() => {
      const contingency = Math.round(totalBudget * 0.08);
      const daysLeft = Math.max(
        1,
        Math.ceil((new Date(eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      );

      const computedBudget = calculateBudgetSplit(totalBudget, eventType);
      const computedVendors = computedBudget.slice(0, 4).map((b) => {
        const v = calculateVendorNegotiation(
          b.category,
          b.amount,
          city === 'Bengaluru' || city === 'Mumbai' ? 'tier1' : 'tier2'
        );
        // If Gemini provided negotiation tips, integrate them!
        if (aiData?.negotiationTips) {
          const key = Object.keys(aiData.negotiationTips).find((k) =>
            b.category.toLowerCase().includes(k.toLowerCase())
          );
          if (key && aiData.negotiationTips[key]?.length > 0) {
            v.tips = aiData.negotiationTips[key];
          }
        }
        return v;
      });

      const initialTasks = getDefaultTasksForOccasion(eventType, eventName.trim(), eventDate, daysLeft);
      const initialReadiness = 0;

      const generatedPlan: PlanProfile = {
        id: 'plan_' + Date.now(),
        name: eventName.trim() || `${eventType.toUpperCase()} Celebration`,
        type: eventType,
        date: eventDate,
        daysLeft,
        city,
        area,
        venueName: `${area} Celebration Grounds, ${city}`,
        totalBudget,
        contingencyAmount: contingency,
        guestsCount: totalGuests,
        guestBreakdown: {
          children: childrenCount,
          teens: 5,
          adults: Math.max(1, totalGuests - childrenCount - seniorsCount - 5),
          seniors: seniorsCount,
        },
        specialNeeds,
        foodPreference,
        alcohol,
        vibe: aiData?.themes?.[0]?.name || vibe,
        muhurat:
          aiData?.muhuratNote ||
          `${eventDate} · 5:15 PM Auspicious Shubh Godhuli Bela`,
        selectedAddons,
        readinessPercent: initialReadiness,
        tasks: initialTasks,
        budgetSplit: computedBudget,
        vendorEstimates: computedVendors,
      };

      setIsGenerating(false);
      onPlanGenerated(generatedPlan);
    }, 1200);
  };

  if (isGenerating) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-[#E3D5CA] border-t-[#7A1E3A] animate-spin flex items-center justify-center">
            <span
              className="material-symbols-outlined text-3xl text-[#F2A900] animate-pulse"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              celebration
            </span>
          </div>
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="font-serif text-2xl font-bold text-[#7A1E3A]">
            Generating Your {eventType.toUpperCase()} Plan
          </h2>
          <p className="text-sm font-semibold text-[#2A9D8F] animate-pulse">
            {loadingMessage}
          </p>
          <p className="text-xs text-[#5E514D]">
            Connected to Gemini AI & Indian deterministic price benchmarks
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Stepper Header Card */}
      <div className="bg-white border border-[#E3D5CA] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#7A1E3A] text-white text-[11px] font-bold uppercase tracking-wider">
                Step {step} of 6
              </span>
              <span className="text-xs text-[#5E514D] font-medium">
                {step === 1 && '1. Occasion Selection'}
                {step === 2 && `2. ${eventType.toUpperCase()} Essentials & Logistics`}
                {step === 3 && '3. Guests & Hospitality Guardrails'}
                {step === 4 && `4. ${eventType.toUpperCase()} Ceremonies & Theme Ambience`}
                {step === 5 && '5. Target Budget (₹) & Financial Comfort'}
                {step === 6 && `6. ${eventType.toUpperCase()} Priority Add-ons & Upgrades`}
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#7A1E3A]">
              {step === 1 && 'What celebration are you organizing?'}
              {step === 2 && `${eventType.toUpperCase()} Specifics & Timeline`}
              {step === 3 && "Who's Coming? (Multi-Gen Hospitality)"}
              {step === 4 && `${eventType.toUpperCase()} Rituals & Ambience`}
              {step === 5 && `Target Budget in ₹ for ${eventType.toUpperCase()}`}
              {step === 6 && `Select Priority Add-ons for ${eventType.toUpperCase()}`}
            </h1>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF3EB] rounded-full border border-[#E3D5CA] self-start sm:self-auto">
            <span
              className="material-symbols-outlined text-sm text-[#F2A900]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span className="text-xs font-semibold text-[#7A1E3A]">
              Step {step} of 6
            </span>
          </div>
        </div>

        <div className="w-full bg-[#FAF3EB] h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#7A1E3A] rounded-full transition-all duration-500"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Dynamic Branching Area */}
        <div className="lg:col-span-8 bg-white border border-[#E3D5CA] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* STEP 1: Occasion Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-[#5E514D]">
                Select an occasion below. The questionnaire will automatically adapt all questions to match this exact celebration:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'wedding', label: 'Wedding (Vivah)', icon: 'favorite', sub: 'Mandap, Sangeet & Reception' },
                  { id: 'birthday', label: 'Birthday Milestone', icon: 'cake', sub: 'Theme decor, games & cake' },
                  { id: 'community', label: 'Community Festival', icon: 'groups', sub: 'Diwali, Dandiya & Society Mela' },
                  { id: 'anniversary', label: 'Anniversary / Jubilee', icon: 'military_tech', sub: 'Golden/Silver couple memories' },
                  { id: 'baby_shower', label: 'Godh Bharai', icon: 'child_friendly', sub: 'Traditional blessing ceremonies' },
                  { id: 'engagement', label: 'Engagement / Roka', icon: 'diamond', sub: 'Ring exchange & family blessings' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectEventType(item.id as PlanProfile['type'])}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[120px] ${
                      eventType === item.id
                        ? 'border-[#7A1E3A] bg-[#FFD9DF]/20 shadow-sm ring-1 ring-[#7A1E3A]'
                        : 'border-[#E3D5CA] hover:border-[#7A1E3A]/50 bg-[#FFF9F2]/40'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FAF3EB] text-[#7A1E3A] flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    </div>
                    <div>
                      <p className="font-serif font-bold text-sm text-[#7A1E3A]">{item.label}</p>
                      <p className="text-[11px] text-[#5E514D] mt-0.5">{item.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: DYNAMIC OCCASION ESSENTIALS */}
          {step === 2 && (
            <div className="space-y-5 text-xs">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#1B1C1C]">Celebration Title</label>
                <input
                  type="text"
                  placeholder="e.g. Riya's 1st Birthday"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FFF9F2] border border-[#E3D5CA] rounded-xl text-sm focus:outline-none focus:border-[#7A1E3A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B1C1C]">Event Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E3D5CA] rounded-xl focus:outline-none focus:border-[#7A1E3A]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B1C1C]">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E3D5CA] rounded-xl focus:outline-none focus:border-[#7A1E3A]"
                  />
                </div>
              </div>

              {/* DYNAMIC QUESTIONS BRANCHING FOR OCCASION: */}
              {eventType === 'wedding' && (
                <div className="p-4 bg-[#FAF3EB] rounded-xl border border-[#E3D5CA] space-y-4">
                  <h3 className="font-serif font-bold text-sm text-[#7A1E3A]">
                    Wedding Specific Venue & Days Configuration
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1B1C1C]">Venue Allocation</label>
                      <select
                        value={weddingVenuesSetup}
                        onChange={(e) => setWeddingVenuesSetup(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#E3D5CA] rounded-lg"
                      >
                        <option value="Single Grand Resort">Single Destination Resort / Palace</option>
                        <option value="Separate Banquets">Multiple Separate Banquets across city</option>
                        <option value="Home + Wedding Hall">Home (Haldi/Mehendi) + Grand Hall</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1B1C1C]">Festivity Duration</label>
                      <select
                        value={weddingDays}
                        onChange={(e) => setWeddingDays(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#E3D5CA] rounded-lg"
                      >
                        <option value="1 Day express">1 Day Express (Morning Wedding, Evening Reception)</option>
                        <option value="2 Days traditional">2 Days Traditional (Sangeet + Wedding/Reception)</option>
                        <option value="3-4 Days grand">3-4 Days Grand Festivities</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {eventType === 'birthday' && (
                <div className="p-4 bg-[#FAF3EB] rounded-xl border border-[#E3D5CA] space-y-4">
                  <h3 className="font-serif font-bold text-sm text-[#7A1E3A]">
                    Birthday Milestone & Party Structure
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1B1C1C]">Milestone Age</label>
                      <select
                        value={birthdayMilestone}
                        onChange={(e) => setBirthdayMilestone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#E3D5CA] rounded-lg"
                      >
                        <option value="1st Birthday">1st Birthday (Toddler Milestone)</option>
                        <option value="5th / 10th Birthday">5th / 10th Kids Party</option>
                        <option value="18th / 21st Adulthood">18th / 21st Adulthood</option>
                        <option value="25th / 30th Milestone">25th / 30th Milestone</option>
                        <option value="50th / 60th Jubilee">50th / 60th Shashti Poorthi</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1B1C1C]">Party Format</label>
                      <select
                        value={birthdayFormat}
                        onChange={(e) => setBirthdayFormat(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#E3D5CA] rounded-lg"
                      >
                        <option value="Family & kids with parents staying">Family & Kids with parents staying</option>
                        <option value="Kids drop-off only party">Kids drop-off only (games & entertainers)</option>
                        <option value="Evening adult celebration">Evening cocktail & adult celebration</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="surprise"
                      checked={isSurpriseParty}
                      onChange={(e) => setIsSurpriseParty(e.target.checked)}
                      className="accent-[#7A1E3A]"
                    />
                    <label htmlFor="surprise" className="font-medium cursor-pointer">
                      This is a surprise party (requires secret coordinator communication)
                    </label>
                  </div>
                </div>
              )}

              {eventType === 'community' && (
                <div className="p-4 bg-[#FAF3EB] rounded-xl border border-[#E3D5CA] space-y-4">
                  <h3 className="font-serif font-bold text-sm text-[#7A1E3A]">
                    Community Festival & Society Setup
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1B1C1C]">Festival Objective</label>
                      <select
                        value={communityPurpose}
                        onChange={(e) => setCommunityPurpose(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#E3D5CA] rounded-lg"
                      >
                        <option value="Diwali & Dandiya Festival">Diwali, Dandiya & Garba Utsav</option>
                        <option value="Society Annual Day">Apartment Society Annual Gathering</option>
                        <option value="Sports League">Society Sports League & Fun Fair</option>
                        <option value="Charity Fundraiser">Community Cultural Fundraiser</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1B1C1C]">Entry & Passes</label>
                      <select
                        value={communityEntry}
                        onChange={(e) => setCommunityEntry(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#E3D5CA] rounded-lg"
                      >
                        <option value="Free for all society residents">Free for all verified residents</option>
                        <option value="Ticketed passes for outsiders">Ticketed passes (with QR code scanner)</option>
                        <option value="Voluntary contribution pass">Voluntary contribution pass</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {eventType === 'anniversary' && (
                <div className="p-4 bg-[#FAF3EB] rounded-xl border border-[#E3D5CA] space-y-4">
                  <h3 className="font-serif font-bold text-sm text-[#7A1E3A]">
                    Anniversary Celebration Highlights
                  </h3>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1B1C1C]">Milestone Year</label>
                    <select
                      value={anniversaryMilestone}
                      onChange={(e) => setAnniversaryMilestone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E3D5CA] rounded-lg"
                    >
                      <option value="25th Silver Jubilee">25th Silver Jubilee (Silver Ring Exchange)</option>
                      <option value="50th Golden Jubilee">50th Golden Jubilee (Golden Blessings & Ghazals)</option>
                      <option value="10th / 15th Anniversary">10th / 15th Milestone Gathering</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: WHO'S COMING & DYNAMIC HOSPITALITY */}
          {step === 3 && (
            <div className="space-y-5 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-[#1B1C1C]">Expected Guest Count</label>
                  <span className="font-serif text-lg font-bold text-[#7A1E3A]">{totalGuests} Guests</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max={eventType === 'wedding' ? '1500' : eventType === 'community' ? '1200' : '300'}
                  step="10"
                  value={totalGuests}
                  onChange={(e) => setTotalGuests(parseInt(e.target.value))}
                  className="w-full accent-[#7A1E3A]"
                />
              </div>

              {/* Dynamic Age Breakdown tailored to event */}
              <div className="p-4 bg-[#FAF3EB] rounded-xl border border-[#E3D5CA] space-y-3">
                <span className="font-semibold text-[#1B1C1C]">Multi-Generational Guest Age Mix</span>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-white rounded-lg border border-[#E3D5CA]">
                    <span className="text-[11px] text-[#5E514D]">Children (0-12)</span>
                    <input
                      type="number"
                      min="0"
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(parseInt(e.target.value) || 0)}
                      className="w-full text-center font-bold text-base text-[#7A1E3A] mt-1 bg-transparent"
                    />
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#E3D5CA]">
                    <span className="text-[11px] text-[#5E514D]">Adults (20-59)</span>
                    <p className="font-bold text-base text-[#1B1C1C] mt-1">
                      {Math.max(1, totalGuests - childrenCount - seniorsCount)}
                    </p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#E3D5CA]">
                    <span className="text-[11px] text-[#5E514D]">Seniors (60+)</span>
                    <input
                      type="number"
                      min="0"
                      value={seniorsCount}
                      onChange={(e) => setSeniorsCount(parseInt(e.target.value) || 0)}
                      className="w-full text-center font-bold text-base text-[#7A1E3A] mt-1 bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Elder and Toddler Care Checkbox Options */}
              <div className="space-y-2">
                <label className="font-semibold text-[#1B1C1C]">
                  {eventType === 'birthday' ? 'Toddler & Family Comfort Features' : 'Accessibility & Elder Comfort Features'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Elderly shaded seating',
                    'Infants feeding room',
                    'Wheelchair ramp access',
                    'Acoustic decibel cap (<70dB)',
                    eventType === 'wedding' ? 'Valet parking assistance' : 'Children safe play zone',
                    eventType === 'community' ? 'Emergency first aid stand' : 'Sofa front row for elders',
                  ].map((need) => (
                    <button
                      key={need}
                      type="button"
                      onClick={() => toggleArrayItem(specialNeeds, setSpecialNeeds, need)}
                      className={`p-2 rounded-lg border text-left transition-colors flex items-center gap-2 ${
                        specialNeeds.includes(need)
                          ? 'border-[#2A9D8F] bg-[#E0F4F1] text-[#006A60] font-semibold'
                          : 'border-[#E3D5CA] bg-[#FFF9F2] text-[#5E514D]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {specialNeeds.includes(need) ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span>{need}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B1C1C]">Food Preference</label>
                  <select
                    value={foodPreference}
                    onChange={(e) => setFoodPreference(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E3D5CA] rounded-xl"
                  >
                    <option value="Pure veg">Pure Veg Satvik Catering</option>
                    <option value="Veg + Non-veg">Veg + Non-veg Live Counters</option>
                    <option value="Jain food included">Jain Special Food Station</option>
                    <option value="Halal certified">Halal Certified Menu</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B1C1C]">Beverages / Bar</label>
                  <select
                    value={alcohol}
                    onChange={(e) => setAlcohol(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E3D5CA] rounded-xl"
                  >
                    <option value="No alcohol">No alcohol (Artisan mocktails & juices)</option>
                    <option value="Beer and wine">Wine & Cocktail Bar</option>
                    <option value="Full bar">Full Service Licensed Bar</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DYNAMIC OCCASION RITUALS & CEREMONIES */}
          {step === 4 && (
            <div className="space-y-5 text-xs">
              {eventType === 'wedding' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-semibold text-[#1B1C1C]">Select Wedding Ceremonies to Include</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        'Engagement / Roka',
                        'Haldi / Pithi',
                        'Mehendi & Sangeet',
                        'Vivah Mandap Pheras',
                        'Reception Dinner',
                        'Baraat Procession',
                      ].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleArrayItem(weddingCeremonies, setWeddingCeremonies, c)}
                          className={`p-2.5 rounded-xl border text-left transition-colors flex items-center gap-2 ${
                            weddingCeremonies.includes(c)
                              ? 'border-[#7A1E3A] bg-[#FFD9DF]/40 text-[#7A1E3A] font-semibold'
                              : 'border-[#E3D5CA] bg-[#FFF9F2] text-[#5E514D]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {weddingCeremonies.includes(c) ? 'check' : 'add'}
                          </span>
                          <span>{c}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#1B1C1C]">Groom / Bridal Grand Entry Style</label>
                    <select
                      value={weddingProcession}
                      onChange={(e) => setWeddingProcession(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E3D5CA] rounded-xl"
                    >
                      <option value="Baraat with Dhol & Brass Band">Baraat with Live Dhol & Traditional Brass Band</option>
                      <option value="Vintage Car / Open Jeep Entry">Vintage Car or Open Jeep Entry</option>
                      <option value="Floral Chaddar & Cold Pyros">Floral Chaddar with Cold Pyro Sparklers</option>
                      <option value="Intimate Acoustic Walk">Intimate Soft Acoustic Violin Entry</option>
                    </select>
                  </div>
                </div>
              )}

              {eventType === 'birthday' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-semibold text-[#1B1C1C]">Entertainment & Activities for Guests</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Toddler Soft Play Foam Pit',
                        'Magician & Games Host',
                        'Balloon Sculpting & Tattoos',
                        'Photo Booth with Fun Props',
                        'Puppet Show / Storyteller',
                        'Live Cotton Candy & Popcorn',
                      ].map((act) => (
                        <button
                          key={act}
                          type="button"
                          onClick={() => toggleArrayItem(birthdayActivities, setBirthdayActivities, act)}
                          className={`p-2.5 rounded-xl border text-left transition-colors flex items-center gap-2 ${
                            birthdayActivities.includes(act)
                              ? 'border-[#7A1E3A] bg-[#FFD9DF]/40 text-[#7A1E3A] font-semibold'
                              : 'border-[#E3D5CA] bg-[#FFF9F2] text-[#5E514D]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {birthdayActivities.includes(act) ? 'check' : 'add'}
                          </span>
                          <span>{act}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#1B1C1C]">Cake Design Style</label>
                    <select
                      value={birthdayCakeType}
                      onChange={(e) => setBirthdayCakeType(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E3D5CA] rounded-xl"
                    >
                      <option value="3-Tier Theme Fondant + Smash Cake">3-Tier Theme Fondant + 1st Bday Smash Cake</option>
                      <option value="Fresh Berry & Vanilla Cream">Fresh Berry & Vanilla Cream Cake (Eggless)</option>
                      <option value="Designer Dessert Table">Customized Dessert Table with Cupcakes</option>
                    </select>
                  </div>
                </div>
              )}

              {eventType === 'community' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-semibold text-[#1B1C1C]">Required Permits & Production Logistics</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Police Loudspeaker NOC (past 10 PM)',
                        'Fire Safety & Society Permission',
                        'Power Generator Backup',
                        'Volunteer Safety Marshals',
                        'Ambulance & Medical Desk',
                        'Rain Contingency Canopy',
                      ].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => toggleArrayItem(communityPermits, setCommunityPermits, p)}
                          className={`p-2.5 rounded-xl border text-left transition-colors flex items-center gap-2 ${
                            communityPermits.includes(p)
                              ? 'border-[#7A1E3A] bg-[#FFD9DF]/40 text-[#7A1E3A] font-semibold'
                              : 'border-[#E3D5CA] bg-[#FFF9F2] text-[#5E514D]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {communityPermits.includes(p) ? 'check' : 'add'}
                          </span>
                          <span>{p}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {eventType === 'anniversary' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-semibold text-[#1B1C1C]">Nostalgic Elements & Surprises</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        '50-Year Photo Montage Video',
                        'Golden Ring Re-Exchange',
                        'Live Ghazal & Old Melodies Ensemble',
                        'Grandchildren Memory Book',
                      ].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleArrayItem(anniversarySpecial, setAnniversarySpecial, s)}
                          className={`p-2.5 rounded-xl border text-left transition-colors flex items-center gap-2 ${
                            anniversarySpecial.includes(s)
                              ? 'border-[#7A1E3A] bg-[#FFD9DF]/40 text-[#7A1E3A] font-semibold'
                              : 'border-[#E3D5CA] bg-[#FFF9F2] text-[#5E514D]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {anniversarySpecial.includes(s) ? 'check' : 'add'}
                          </span>
                          <span>{s}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-2 border-t border-[#E3D5CA]/70">
                <label className="font-semibold text-[#1B1C1C]">Celebration Color Palette</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'Pastel Flora & Gold',
                    'Royal Marigold & Crimson',
                    'Minimalist & Modern',
                    'Festive Diyas & Lights',
                  ].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVibe(v)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        vibe === v
                          ? 'border-[#7A1E3A] bg-[#7A1E3A] text-white font-semibold'
                          : 'border-[#E3D5CA] bg-[#FFF9F2] text-[#5E514D]'
                      }`}
                    >
                      <p className="font-bold text-xs">{v}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: TARGET BUDGET IN ₹ */}
          {step === 5 && (
            <div className="space-y-5 text-xs">
              <div className="p-5 bg-[#FAF3EB] rounded-2xl border border-[#E3D5CA] space-y-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2A9D8F]">
                      Total Target Budget
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#7A1E3A] mt-0.5">
                      {formatINR(totalBudget)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#5E514D]">Per Guest: </span>
                    <span className="font-bold text-sm text-[#1B1C1C]">
                      {formatINR(Math.round(totalBudget / Math.max(1, totalGuests)))}
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min={eventType === 'wedding' ? '300000' : '50000'}
                  max={eventType === 'wedding' ? '5000000' : eventType === 'community' ? '1500000' : '800000'}
                  step={eventType === 'wedding' ? '50000' : '25000'}
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(parseInt(e.target.value))}
                  className="w-full accent-[#7A1E3A] cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-[#5E514D]">
                  <span>{formatINR(eventType === 'wedding' ? 300000 : 50000)}</span>
                  <span className="font-semibold text-[#7A1E3A]">Selected: {formatINR(totalBudget)}</span>
                  <span>{formatINR(eventType === 'wedding' ? 5000000 : eventType === 'community' ? 1500000 : 800000)}</span>
                </div>

                {/* Quick Budget Presets */}
                <div className="pt-2 border-t border-[#E3D5CA]/70 space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#1B1C1C]">Quick Budget Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {(eventType === 'wedding'
                      ? [1000000, 1500000, 2000000, 3000000, 4500000]
                      : eventType === 'community'
                      ? [150000, 250000, 350000, 500000, 800000]
                      : [100000, 200000, 300000, 400000, 600000]
                    ).map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTotalBudget(amt)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                          totalBudget === amt
                            ? 'bg-[#7A1E3A] text-white border-[#7A1E3A] shadow-xs'
                            : 'bg-white text-[#5E514D] border-[#E3D5CA] hover:border-[#7A1E3A]'
                        }`}
                      >
                        {formatINR(amt)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Budget Flexibility & Contingency Reserve */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B1C1C]">Budget Cap Flexibility</label>
                  <select
                    value={budgetFlexibility}
                    onChange={(e) => setBudgetFlexibility(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E3D5CA] rounded-xl text-xs"
                  >
                    <option value="Strict cap">Strict Cap (Zero overflow tolerance)</option>
                    <option value="Stretch 10%">Stretch 10% for high-demand vendors</option>
                    <option value="Comfortable buffer">Flexible for premium experiences</option>
                  </select>
                </div>

                <div className="p-3 bg-[#FAF3EB] rounded-xl border border-[#E3D5CA] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E0F4F1] text-[#006A60] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">security</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#1B1C1C] block">
                      Auto Safety Reserve: {formatINR(Math.round(totalBudget * 0.08))}
                    </span>
                    <span className="text-[11px] text-[#5E514D]">
                      8% reserved against last-minute vendor price changes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: DEDICATED PRIORITY ADD-ONS & UPGRADES */}
          {step === 6 && (
            <div className="space-y-5 text-xs">
              <div className="p-4 bg-[#FAF3EB] rounded-2xl border border-[#E3D5CA] space-y-1">
                <div className="flex items-center gap-2 text-[#7A1E3A]">
                  <span className="material-symbols-outlined text-lg">hotel_class</span>
                  <h3 className="font-serif font-bold text-sm">
                    Customize Priority Add-ons for {eventType.toUpperCase()}
                  </h3>
                </div>
                <p className="text-[11px] text-[#5E514D]">
                  Select the services and upgrades you wish to prioritize. Gemini AI and our benchmark engine will calculate quotes and negotiation benchmarks for each.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(eventType === 'wedding'
                  ? [
                      { id: 'Candid Photographer', label: 'Candid Wedding Photographer', tag: 'Must-Have', sub: 'Couple portraits & spontaneous moments' },
                      { id: 'Cinematic Videographer', label: 'Cinematic 4K Videography', tag: 'Recommended', sub: 'Teaser reel + 30-min highlight movie' },
                      { id: 'Drone Coverage', label: 'Drone Aerial Cinematography', tag: 'Delight', sub: 'Sweeping outdoor baraat & mandap views' },
                      { id: 'Floral Mandap Decor', label: 'Royal Floral Mandap & Torans', tag: 'Must-Have', sub: 'Fresh marigold, mogra, and brass urlis' },
                      { id: 'Live Sangeet DJ', label: 'Live Sangeet DJ & Sound Rig', tag: 'Recommended', sub: 'Complete sound console and Bollywood party' },
                      { id: 'Bridal Makeup Team', label: 'Bridal Makeup & Hair Artists', tag: 'Must-Have', sub: 'HD bridal package + family styling' },
                      { id: 'Vintage Luxury Car', label: 'Vintage Chauffeur Entry Car', tag: 'Delight', sub: 'Decorated open-top car for grand entry' },
                      { id: 'Return Gifts & Hampers', label: 'Traditional Return Gift Hampers', tag: 'Recommended', sub: 'Handcrafted dry fruit & mithai boxes' },
                    ]
                  : eventType === 'birthday'
                  ? [
                      { id: 'Candid Photographer', label: 'Candid Milestone Photographer', tag: 'Must-Have', sub: '4 hrs cake cutting & family album' },
                      { id: 'Theme Balloon Backdrop', label: 'Custom Theme Balloon Backdrop', tag: 'Must-Have', sub: 'Organic arches with personalized name sign' },
                      { id: 'Soft Play Area & Attendant', label: 'Soft Play Zone & Foam Pit', tag: 'Recommended', sub: 'Ages 0-5 safe play area with 2 attendants' },
                      { id: 'Magician & Games Host', label: 'Magician & Kids Games Host', tag: 'Recommended', sub: '45-min magic show and interactive fun' },
                      { id: 'Customized Theme Cake', label: '3-Tier Cake + Smash Cake', tag: 'Must-Have', sub: 'Eggless organic vanilla-berry tier' },
                      { id: 'Kids Return Gift Packs', label: 'Kids Personalized Goodie Packs', tag: 'Recommended', sub: 'Eco-friendly craft kits & storybooks' },
                      { id: 'DJ / Sound System', label: 'Acoustic Sound & Family DJ', tag: 'Delight', sub: 'Regulated gentle playlist (<70dB)' },
                      { id: 'Live Popcorn & Cotton Candy', label: 'Live Popcorn & Cotton Candy Cart', tag: 'Delight', sub: 'Unlimited fresh treats for all children' },
                    ]
                  : eventType === 'community'
                  ? [
                      { id: 'Line Array Sound System', label: 'Line Array Concert Sound Rig', tag: 'Must-Have', sub: 'Stage audio calibrated to municipal limits' },
                      { id: 'Stage LED Display Wall', label: 'Giant Stage LED Video Wall', tag: 'Recommended', sub: 'Live camera feed & festival visuals' },
                      { id: 'Professional Event DJ', label: 'High-Energy Festival DJ & Dhol', tag: 'Must-Have', sub: 'Traditional garba, dandiya & bollywood sets' },
                      { id: 'Food Stalls Management', label: 'Food & Craft Kiosk Management', tag: 'Must-Have', sub: 'Standardized stalls with power & water lines' },
                      { id: 'Security & Volunteers', label: 'Security Guards & Volunteer Badges', tag: 'Must-Have', sub: 'Crowd management marshals & gate entry' },
                      { id: 'Rain Contingency Canopy', label: 'Weatherproof Canopy & Marquee', tag: 'Recommended', sub: 'Rain protection for central performance area' },
                      { id: 'Banner & Social Promotion', label: 'Society Banners & Digital Passes', tag: 'Recommended', sub: 'WhatsApp passes with QR verification' },
                      { id: 'Emergency Medical Stand', label: 'First Aid & Medical Standby', tag: 'Must-Have', sub: 'Onsite certified nurse & basic emergency kit' },
                    ]
                  : [
                      { id: '50-Year Photo Montage Video', label: '50-Year Nostalgia Montage Reel', tag: 'Must-Have', sub: 'Digitized memories with voiceover' },
                      { id: 'Live Ghazal & Old Melodies Ensemble', label: 'Live Ghazal & Retro Ensemble', tag: 'Recommended', sub: 'Curated 1970s classics & sitar' },
                      { id: 'Golden Ring Re-Exchange', label: 'Golden Ring Exchange Decor', tag: 'Must-Have', sub: 'Floral blessings gazebo & petals shower' },
                      { id: 'Handcrafted Keepsake Gifts', label: 'Brass & Silver Keepsake Gifts', tag: 'Recommended', sub: 'Personalized memento for each family' },
                      { id: 'Candid Family Album', label: 'Candid Family Photo Album', tag: 'Must-Have', sub: 'High-gloss printed photobook' },
                      { id: 'Vintage Couple Entry Car', label: 'Decorated Couple Arrival Car', tag: 'Delight', sub: 'Chauffeur-driven classic luxury sedan' },
                    ]
                ).map((addon) => {
                  const isSelected = selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleArrayItem(selectedAddons, setSelectedAddons, addon.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[90px] ${
                        isSelected
                          ? 'border-[#7A1E3A] bg-[#FFD9DF]/40 shadow-xs ring-1 ring-[#7A1E3A]'
                          : 'border-[#E3D5CA] bg-[#FFF9F2] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-[#1B1C1C]">{addon.label}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            addon.tag === 'Must-Have'
                              ? 'bg-[#7A1E3A] text-white'
                              : addon.tag === 'Recommended'
                              ? 'bg-[#E0F4F1] text-[#006A60]'
                              : 'bg-[#FFDEAD] text-[#3D2700]'
                          }`}
                        >
                          {addon.tag}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#E3D5CA]/40">
                        <span className="text-[11px] text-[#5E514D]">{addon.sub}</span>
                        <span
                          className={`material-symbols-outlined text-base ${
                            isSelected ? 'text-[#7A1E3A]' : 'text-[#8C7B75]'
                          }`}
                        >
                          {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E3D5CA]/60">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl border border-[#E3D5CA] text-xs font-semibold text-[#5E514D] hover:bg-[#FAF3EB] transition-colors"
              >
                ← Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl border border-[#E3D5CA] text-xs font-semibold text-[#5E514D] hover:bg-[#FAF3EB] transition-colors"
              >
                Cancel
              </button>
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-[#7A1E3A] hover:bg-[#5C0325] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Continue to Step {step + 1}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                className="px-8 py-3 rounded-xl bg-[#7A1E3A] hover:bg-[#5C0325] text-white text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                <span>Generate My {eventType.toUpperCase()} Plan</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Calibrating Budget Bar (Desktop) */}
        <div className="lg:col-span-4 bg-white border border-[#E3D5CA] rounded-2xl p-6 shadow-sm space-y-4 sticky top-24">
          <div className="flex items-center justify-between border-b border-[#E3D5CA] pb-3">
            <div>
              <span className="text-[10px] font-bold text-[#2A9D8F] uppercase tracking-wider">
                Deterministic Engine
              </span>
              <h3 className="font-serif font-bold text-sm text-[#7A1E3A]">
                {eventType.toUpperCase()} Split Calibration
              </h3>
            </div>
            <span className="font-serif font-bold text-base text-[#7A1E3A]">
              {formatINR(totalBudget)}
            </span>
          </div>

          <p className="text-[11px] text-[#5E514D]">
            Indian percentage distribution tailored to {eventType.toUpperCase()} in {city}:
          </p>

          <div className="space-y-2.5 pt-1">
            {liveBudgetSplit.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#1B1C1C] font-medium truncate max-w-[150px]">
                    {item.category}
                  </span>
                  <span className="font-semibold text-[#7A1E3A]">
                    {formatINR(item.amount)} ({item.percent}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#FAF3EB] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7A1E3A] rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#FAF3EB] rounded-xl text-[11px] text-[#5E514D] border border-[#E3D5CA]/70 flex items-start gap-2">
            <span className="material-symbols-outlined text-sm text-[#F2A900] mt-0.5 shrink-0">
              verified
            </span>
            <span>
              Per guest cost: <strong>{formatINR(Math.round(totalBudget / Math.max(1, totalGuests)))}</strong>/person
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
