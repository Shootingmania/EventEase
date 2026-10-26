/**
 * EventEase Deterministic Budget Engine & Indian Vendor Benchmarks
 * Rule: Code does the numbers and arithmetic. LLM does creative personalization.
 */

export interface BudgetSplitItem {
  category: string;
  percent: number;
  amount: number;
  status: 'paid' | 'advance' | 'booked' | 'quote_pending' | 'reserved';
  details: string;
  icon: string;
}

export interface VendorNegotiationItem {
  category: string;
  allocatedAmount: number;
  marketMin: number;
  marketMax: number;
  expectedQuote: number;
  targetPrice: number;
  walkAway: number;
  tips: string[];
}

export interface TaskItem {
  id: string;
  title: string;
  due: string;
  done: boolean;
  note: string;
}

export interface PlanProfile {
  id: string;
  name: string;
  type: 'wedding' | 'birthday' | 'community' | 'anniversary' | 'engagement' | 'baby_shower' | 'other';
  date: string;
  daysLeft: number;
  city: string;
  area: string;
  venueName: string;
  totalBudget: number;
  contingencyAmount: number;
  guestsCount: number;
  guestBreakdown: {
    children: number;
    teens: number;
    adults: number;
    seniors: number;
  };
  specialNeeds: string[];
  foodPreference: string;
  alcohol: string;
  vibe: string;
  muhurat: string;
  selectedAddons: string[];
  readinessPercent: number;
  budgetSplit: BudgetSplitItem[];
  vendorEstimates: VendorNegotiationItem[];
  tasks?: TaskItem[];
}

export interface TimelinePhase {
  when: string;
  dateRange: string;
  badge: string;
  tasks: string[];
}

/**
 * Calculates a realistic milestone deadline string relative to the event date and days left.
 * fractionOfTimeline: 0.05 = earliest/immediate, 0.95 = eve of celebration.
 */
export function formatMilestoneDeadline(
  eventDateStr: string | undefined,
  daysLeft: number | undefined,
  fractionOfTimeline: number
): string {
  const effectiveDaysLeft =
    daysLeft !== undefined && daysLeft > 0
      ? daysLeft
      : eventDateStr
      ? Math.max(1, Math.ceil((new Date(eventDateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 30;

  // Days from now until milestone completion
  const daysFromNow = Math.max(1, Math.round(effectiveDaysLeft * fractionOfTimeline));
  const daysBeforeEvent = Math.max(0, effectiveDaysLeft - daysFromNow);

  let calendarLabel = '';
  if (eventDateStr) {
    try {
      const targetDate = new Date(eventDateStr);
      if (!isNaN(targetDate.getTime())) {
        const milestoneDate = new Date(targetDate.getTime() - daysBeforeEvent * 24 * 60 * 60 * 1000);
        calendarLabel = milestoneDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        });
      }
    } catch {
      calendarLabel = '';
    }
  }

  if (daysBeforeEvent === 0) {
    return calendarLabel ? `Event Day (${calendarLabel})` : 'Event Day';
  } else if (daysBeforeEvent === 1) {
    return calendarLabel ? `Event Eve · ${calendarLabel} (T-1d)` : 'Event Eve (T-1d)';
  } else if (daysFromNow <= 2) {
    return calendarLabel ? `Due: ${calendarLabel} (Next 48h)` : 'Due in 48h';
  } else {
    return calendarLabel ? `Due: ${calendarLabel} (T-${daysBeforeEvent}d)` : `In ${daysFromNow}d (T-${daysBeforeEvent}d)`;
  }
}

/**
 * Returns comprehensive, realistic celebration tasks (10-12 items) with:
 * - Initially zero tasks ticked off (done: false)
 * - Deadlines calculated dynamically from event date and days left
 */
export function getDefaultTasksForOccasion(
  type: PlanProfile['type'],
  _name?: string,
  eventDateStr?: string,
  daysLeft?: number
): TaskItem[] {
  switch (type) {
    case 'wedding':
      return [
        {
          id: 'w1',
          title: 'Confirm Vedic Mandap Pandit & Auspicious Lagna Samagri',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.08),
          done: false,
          note: 'Confirm sunset Godhuli / Brahma Muhurat with pure ghee havankund samagri checklist',
        },
        {
          id: 'w2',
          title: 'Lock Vivah Mandap Lawn & Banquet Agreement',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.15),
          done: false,
          note: 'Verify staging layout, valet parking capacity, green rooms, and 25kVA generator backup',
        },
        {
          id: 'w3',
          title: 'Finalize Royal Banquet Menu & Live Chaat Counters',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.25),
          done: false,
          note: 'Schedule live menu tasting with catering head; specify satvik and jain dietary options',
        },
        {
          id: 'w4',
          title: 'Contract Candid Photographer & Cinematic Videographer',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.35),
          done: false,
          note: 'Sign contract for 4k drone coverage, candid reels, traditional photo album, and raw footage handover',
        },
        {
          id: 'w5',
          title: 'Finalize Bridal Mehendi Artist & Sangeet Choreographer',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.45),
          done: false,
          note: 'Curate family flashmob medleys, bridal organic henna design, and stage acoustics check',
        },
        {
          id: 'w6',
          title: 'Lock Baraat Brass Band, Ghodi & Dhol Players NOC',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.55),
          done: false,
          note: 'Obtain local police route permission and enforce sound limiter compliance (<75dB)',
        },
        {
          id: 'w7',
          title: 'Approve Floral Mandap, Entry Arch & Fairy Lights Decor',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.65),
          done: false,
          note: 'Seasonal fresh marigold & mogra torans, royal entrance walkover, and candle walkway',
        },
        {
          id: 'w8',
          title: 'Complete Bridal & Groom Trousseau Fittings',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.72),
          done: false,
          note: 'Final alterations for wedding lehenga/sherwani, jewelry safety locker, and footwear trials',
        },
        {
          id: 'w9',
          title: 'Confirm Out-of-Town Guest Accommodations & Transport',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.8),
          done: false,
          note: 'Verify hotel room blocks, shuttle buses, airport/railway station arrival coordinator desk',
        },
        {
          id: 'w10',
          title: 'Dispatch WhatsApp Wedding E-invites with GPS Pin & RSVP',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.86),
          done: false,
          note: 'Digital invitations with live navigation map, parking directions, and headcount tracker',
        },
        {
          id: 'w11',
          title: 'Assemble Silver/Brass Return Gift Keepsakes & Mithai',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.92),
          done: false,
          note: 'Packaged premium dry fruits, artisanal sweets boxes, and personalized blessings cards',
        },
        {
          id: 'w12',
          title: 'Prepare Day-of Coordinator Runsheet & Cash Gratuity Envelopes',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.97),
          done: false,
          note: 'Minute-by-minute schedule distributed to family leads; vendor tip envelopes allocated',
        },
      ];

    case 'birthday':
      return [
        {
          id: 'b1',
          title: 'Reserve Celebration Lawn / Banquet Space & Setup Slot',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.08),
          done: false,
          note: 'Ensure weather-proof canopy, safe child-friendly flooring, and stroller access',
        },
        {
          id: 'b2',
          title: 'Finalize 3-Tier Smash Cake & Dessert Table',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.18),
          done: false,
          note: 'Order customized eggless smash cake, cupcakes, and fruit tarts with personalized cake topper',
        },
        {
          id: 'b3',
          title: 'Approve Theme Decor, Balloon Garland & Photo Backdrop',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.28),
          done: false,
          note: 'Pastel or playful character theme, welcome easel board, and organic balloon arches',
        },
        {
          id: 'b4',
          title: 'Book Safe Soft Play Zone, Ball Pit & Inflatables',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.38),
          done: false,
          note: '50mm non-toxic EVA foam mats on grass lawn with 2 certified attendants for toddler safety',
        },
        {
          id: 'b5',
          title: 'Contract Candid Kids & Family Story Photographer',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.48),
          done: false,
          note: 'Capture milestone cake smash, candid grandparents portraits, and guest mini-reels',
        },
        {
          id: 'b6',
          title: 'Confirm Kid-Friendly Banquet Menu & Live Chaat Stalls',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.58),
          done: false,
          note: 'Mini burgers, pav bhaji, cotton candy / popcorn cart, organic baby purees, and fruit shakes',
        },
        {
          id: 'b7',
          title: 'Hire Interactive Entertainer (Magician / Game Host / Mascot)',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.68),
          done: false,
          note: '45-minute interactive magic show, balloon sculpting, and music games for children',
        },
        {
          id: 'b8',
          title: 'Curate Birthday Kid & Family Outfits',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.76),
          done: false,
          note: 'Comfortable coordinated celebratory outfits with spare change-of-clothes on hand',
        },
        {
          id: 'b9',
          title: 'Dispatch WhatsApp RSVP Reminders with GPS Pin',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.84),
          done: false,
          note: 'Digital invite link tracking parent headcounts, dietary allergies, and arrival windows',
        },
        {
          id: 'b10',
          title: 'Pack Customized Return Gift Hampers & Activity Kits',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.9),
          done: false,
          note: 'Age-appropriate storybooks, wooden puzzles, crayons, and gourmet chocolate treats',
        },
        {
          id: 'b11',
          title: 'Stock First-Aid, Sanitizers & Emergency Comfort Kit',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.95),
          done: false,
          note: 'Baby wipes, insect repellent, electric bottle warmer, band-aids, and spare batteries',
        },
        {
          id: 'b12',
          title: 'Finalize Day-of Schedule & Vendor Delivery Windows',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.98),
          done: false,
          note: 'Cake delivery refrigeration check, sound check (<70dB), and nap time schedule alignment',
        },
      ];

    case 'community':
      return [
        {
          id: 'c1',
          title: 'Secure Society Amphitheatre / Sports Arena Booking',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.08),
          done: false,
          note: 'Sign RWA agreement, coordinate facility manager, and mark staging zones',
        },
        {
          id: 'c2',
          title: 'Obtain Police, Fire & Loudspeaker NOC Permits',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.16),
          done: false,
          note: 'Loudspeaker permit valid up to 10:00 PM, fire safety extinguisher clearances, and security layout',
        },
        {
          id: 'c3',
          title: 'Contract 25kVA Heavy Generator & Electrical Grid Backup',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.26),
          done: false,
          note: 'Dedicated diesel generator for stage sound, floodlights, food stalls, and water stations',
        },
        {
          id: 'c4',
          title: 'Sign Agreement with Pure Veg Street Food Stalls & Caterers',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.36),
          done: false,
          note: 'Hygiene audit for 6 food stalls (chaat, dosas, jalebi-fafda, tea/coffee), and drinking water dispensers',
        },
        {
          id: 'c5',
          title: 'Book Professional DJ, Stage Lighting & Sound Engineer',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.46),
          done: false,
          note: 'Festive playlist curation, wireless microphones for MC, stage monitors, and decibel check',
        },
        {
          id: 'c6',
          title: 'Approve Festive Theme Decor, Torans & Entry Arch',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.56),
          done: false,
          note: 'Society gate illuminated torans, community rangoli competition square, and photo booth setup',
        },
        {
          id: 'c7',
          title: 'Publish Digital Event Poster & Society WhatsApp Broadcast',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.66),
          done: false,
          note: 'Share timing schedule, dress code, parking advisory, and guest passes registration link',
        },
        {
          id: 'c8',
          title: 'Approve Resident Entry Passes & QR Scanner Desk',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.75),
          done: false,
          note: 'Fast-track verification desk for registered apartment flats and wristbands for verified visitors',
        },
        {
          id: 'c9',
          title: 'Procure Dandiya Sticks, Traditional Props & Mementos',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.83),
          done: false,
          note: '500 pairs of wooden dandiyas, competition trophies, and volunteer identification badges',
        },
        {
          id: 'c10',
          title: 'Brief Volunteer Safety Marshals & Crowd Flow Guides',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.9),
          done: false,
          note: 'Briefing for 12 volunteer marshals on emergency clearways, lost children post, and senior citizen seating',
        },
        {
          id: 'c11',
          title: 'Setup Medical First Aid Desk & Ambulance Standby',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.95),
          done: false,
          note: 'Trained first-aid nurse on duty, wheelchair ramps, glucose stations, and emergency vehicle lane',
        },
        {
          id: 'c12',
          title: 'Coordinate Eco Waste Management Squad & Day-of Runsheet',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.98),
          done: false,
          note: 'Color-coded wet/dry bins, post-event eco cleaning team, and aarti / prize distribution script',
        },
      ];

    case 'anniversary':
      return [
        {
          id: 'a1',
          title: 'Reserve Grand Conservatory / Heritage Banquet Hall',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.08),
          done: false,
          note: 'Intimate banquet setup with elevator access, comfortable seating, and dedicated stage area',
        },
        {
          id: 'a2',
          title: 'Finalize Royal Mughlai & Plated Dinner Menu',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.18),
          done: false,
          note: 'Curate heritage Awadhi dishes, live chaat, artisanal mocktails, and anniversary tier cake',
        },
        {
          id: 'a3',
          title: 'Contract Live Ghazal, Flute & Retro Melodies Ensemble',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.28),
          done: false,
          note: 'Curate nostalgic 1970s–1980s classics playlist with acoustic harmonium, flute, and warm sound (<65dB)',
        },
        {
          id: 'a4',
          title: 'Digitize Nostalgia Photos for 50-Year Story Reel',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.38),
          done: false,
          note: 'Scan vintage wedding photos, digitize blessings from family abroad, and test projector display',
        },
        {
          id: 'a5',
          title: 'Approve Vintage Floral & Amber Glass Candle Decor',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.48),
          done: false,
          note: 'Warm ambient lighting, seasonal white lilies and roses, stage floral frame, and memory photo gallery',
        },
        {
          id: 'a6',
          title: 'Book Portrait & Family Reunion Photographer',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.58),
          done: false,
          note: 'Multi-generational family portraits, candid couple moments, and keepsake hardbound album',
        },
        {
          id: 'a7',
          title: 'Arrange Vintage Floral Open-Top Couple Entry Car',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.68),
          done: false,
          note: 'Classic vintage car entry with marigold floral styling and chauffeur in traditional livery',
        },
        {
          id: 'a8',
          title: 'Celebrant Couple Formal Attire & Styling Fittings',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.76),
          done: false,
          note: 'Designer silks or suits tailored for supreme comfort, with jewelry and footwear checked',
        },
        {
          id: 'a9',
          title: 'Send Personalized Digital Invitations with Directions',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.84),
          done: false,
          note: 'Elegant WhatsApp invite with RSVP tracking, valet parking info, and dress code suggestion',
        },
        {
          id: 'a10',
          title: 'Craft Handcrafted Silver/Brass Keepsake Favours',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.9),
          done: false,
          note: 'Engraved brass/silver mementos, exotic dry fruits, and handwritten thank-you notes',
        },
        {
          id: 'a11',
          title: 'Organize Toast Speeches & Memory Exchange Schedule',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.95),
          done: false,
          note: 'Microphone rehearsal for children and grandchildren speeches, toast drinks, and garland exchange',
        },
        {
          id: 'a12',
          title: 'Finalize Day-of Hospitalities & Elder Comfort Protocol',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.98),
          done: false,
          note: 'Assign family escorts for senior guests, confirm cake delivery window, and settle vendor balances',
        },
      ];

    default:
      return [
        {
          id: 'd1',
          title: 'Confirm Celebration Venue Hall & Booking Advance',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.08),
          done: false,
          note: 'Confirm setup time window, guest seating capacity, and parking arrangements',
        },
        {
          id: 'd2',
          title: 'Finalize Festive Feast Menu & Live Beverage Counters',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.18),
          done: false,
          note: 'Reviewed live counter offerings, sweet courses, and dietary preferences with catering supervisor',
        },
        {
          id: 'd3',
          title: 'Confirm Ceremony Ritual Officiant & Samagri Checklist',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.28),
          done: false,
          note: 'Schedule shubh muhurat timings and gather all necessary traditional items',
        },
        {
          id: 'd4',
          title: 'Approve Floral, Entry Arch & Warm Lighting Decor',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.38),
          done: false,
          note: 'Traditional fresh flower torans, warm fairy lights, and themed welcome signage',
        },
        {
          id: 'd5',
          title: 'Hire Candid Event Photographer & Video Storyteller',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.48),
          done: false,
          note: 'Coverage for key ritual moments, family group pictures, and short highlight reel',
        },
        {
          id: 'd6',
          title: 'Test Acoustic Sound System & Curate Music Playlist',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.58),
          done: false,
          note: 'Ambient background instrumental melodies and cordless microphones for announcements',
        },
        {
          id: 'd7',
          title: 'Finalize Host Family Festive Attire & Styling',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.68),
          done: false,
          note: 'Coordinated festive outfits finalized and grooming appointments booked',
        },
        {
          id: 'd8',
          title: 'Send Digital WhatsApp Invitations with GPS Location Pin',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.78),
          done: false,
          note: 'Real-time RSVP tracking enabled with directions and schedule for multi-gen family comfort',
        },
        {
          id: 'd9',
          title: 'Order Celebration Cake & Traditional Sweets Platter',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.86),
          done: false,
          note: 'Customized cake flavor, delivery timing confirmation, and festive sweets display',
        },
        {
          id: 'd10',
          title: 'Assemble Return Gifts & Handcrafted Keepsakes',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.92),
          done: false,
          note: 'Curated gift packages with heartfelt thank-you notes for all attending guests',
        },
        {
          id: 'd11',
          title: 'Confirm Final Guest Headcount with Catering & Venue',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.96),
          done: false,
          note: 'Final plate count lock-in to avoid excess wastage and ensure seamless seating',
        },
        {
          id: 'd12',
          title: 'Prepare Day-of Host Checklist & Vendor Gratuity Buffer',
          due: formatMilestoneDeadline(eventDateStr, daysLeft, 0.98),
          done: false,
          note: 'Assign welcoming duties, keep emergency petty cash ready, and review run-sheet',
        },
      ];
  }
}

/**
 * Generates dynamic reverse-execution timeline phases based on days left and event date.
 * Does NOT hardcode static phases; instead adapts intervals and computes real calendar dates.
 */
export function getDynamicTimelinePhases(
  type: PlanProfile['type'],
  eventDateStr?: string,
  daysLeft?: number
): TimelinePhase[] {
  const effectiveDaysLeft =
    daysLeft !== undefined && daysLeft > 0
      ? daysLeft
      : eventDateStr
      ? Math.max(1, Math.ceil((new Date(eventDateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 30;

  const formatDateOffset = (daysBefore: number): string => {
    if (!eventDateStr) return `T-${daysBefore} Days`;
    try {
      const d = new Date(eventDateStr);
      if (isNaN(d.getTime())) return `T-${daysBefore} Days`;
      const target = new Date(d.getTime() - daysBefore * 24 * 60 * 60 * 1000);
      return target.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return `T-${daysBefore} Days`;
    }
  };

  const eventDateFormatted = eventDateStr
    ? new Date(eventDateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Event Day';

  // Branch based on duration left:
  if (effectiveDaysLeft >= 60) {
    const tMid1 = Math.round(effectiveDaysLeft * 0.7);
    const tMid2 = Math.round(effectiveDaysLeft * 0.4);
    const tLate = Math.round(effectiveDaysLeft * 0.15);

    return [
      {
        when: `Phase 1: Foundation & Major Contracts`,
        dateRange: `${formatDateOffset(effectiveDaysLeft)} – ${formatDateOffset(tMid1)}`,
        badge: `${effectiveDaysLeft} to ${tMid1} Days Prior`,
        tasks: [
          `Finalize total celebration budget cap and guest count estimation`,
          `Lock in primary venue / banquet hall with initial advance payment`,
          `Book lead caterer, photographer, and ceremony officiant`,
        ],
      },
      {
        when: `Phase 2: Creative Concept & Vendor Assembly`,
        dateRange: `${formatDateOffset(tMid1 - 1)} – ${formatDateOffset(tMid2)}`,
        badge: `${tMid1 - 1} to ${tMid2} Days Prior`,
        tasks: [
          `Approve theme decor palette, stage backdrops, and floral specifications`,
          `Book music entertainment (DJ / live ensemble / choreographer)`,
          `Begin wardrobe trials, trousseau design, and bridal/host fittings`,
        ],
      },
      {
        when: `Phase 3: Invitations & Logistics Lock`,
        dateRange: `${formatDateOffset(tMid2 - 1)} – ${formatDateOffset(tLate)}`,
        badge: `${tMid2 - 1} to ${tLate} Days Prior`,
        tasks: [
          `Dispatch digital WhatsApp invitations with live GPS map pins`,
          `Schedule food tasting session and finalize live counter selections`,
          `Reserve out-of-town guest accommodations and transportation arrangements`,
        ],
      },
      {
        when: `Phase 4: Final Headcounts & Countdown`,
        dateRange: `${formatDateOffset(tLate - 1)} – ${formatDateOffset(2)}`,
        badge: `${tLate - 1} to 2 Days Prior`,
        tasks: [
          `Lock RSVP attendance numbers with caterer and banquet manager`,
          `Procure custom return gifts, sweets boxes, and ritual samagri`,
          `Conduct final dress rehearsal and tech sound check`,
        ],
      },
      {
        when: `Phase 5: Event Eve & Celebration Day`,
        dateRange: `${formatDateOffset(1)} – ${eventDateFormatted}`,
        badge: `Eve & Day-of`,
        tasks: [
          `T-1 Day: Venue load-in walkthrough, vendor point of contact check, and cash gratuities allocation`,
          `Morning: Decor installation, floral setup, and generator load check`,
          `Afternoon: Green room readiness, live catering arrival, and sound calibration`,
          `Evening: Auspicious ceremony execution at Shubh Muhurat window`,
        ],
      },
    ];
  } else if (effectiveDaysLeft >= 20) {
    const tMid1 = Math.round(effectiveDaysLeft * 0.65);
    const tMid2 = Math.round(effectiveDaysLeft * 0.3);

    return [
      {
        when: `Sprint 1: Priority Bookings (First 5-7 Days)`,
        dateRange: `${formatDateOffset(effectiveDaysLeft)} – ${formatDateOffset(tMid1)}`,
        badge: `${effectiveDaysLeft} to ${tMid1} Days Left`,
        tasks: [
          `Lock venue slot, electrical generator backup, and catering advance`,
          `Confirm primary photographer, sound system, and theme styling`,
          `Finalize guest list and compile WhatsApp phone directory`,
        ],
      },
      {
        when: `Sprint 2: Creative Sign-off & Invites`,
        dateRange: `${formatDateOffset(tMid1 - 1)} – ${formatDateOffset(tMid2)}`,
        badge: `${tMid1 - 1} to ${tMid2} Days Left`,
        tasks: [
          `Broadcast digital WhatsApp invitation with GPS pin and RSVP confirmation`,
          `Confirm menu courses, live chaat stalls, and celebratory cake design`,
          `Order customized return favours and outfit final adjustments`,
        ],
      },
      {
        when: `Sprint 3: RSVP Lock & Vendor Finalization`,
        dateRange: `${formatDateOffset(tMid2 - 1)} – ${formatDateOffset(2)}`,
        badge: `${tMid2 - 1} to 2 Days Left`,
        tasks: [
          `Lock headcount with caterer and confirm plate count guarantees`,
          `Verify police / society loudspeaker permissions and parking permits`,
          `Distribute day-of runsheet to family coordinators and key vendors`,
        ],
      },
      {
        when: `Sprint 4: Event Eve & Live Execution`,
        dateRange: `${formatDateOffset(1)} – ${eventDateFormatted}`,
        badge: `Eve & Event Day`,
        tasks: [
          `Event Eve: On-site inspection, cake refrigeration check, and cash envelopes ready`,
          `Event Day T-4h: Stage floral installation and sound equipment power-up`,
          `Event Day T-1h: Welcome drinks ready, host family in position, guest arrivals`,
          `Event Day Muhurat: Grand celebratory ritual and banquet feast`,
        ],
      },
    ];
  } else {
    // Rapid Execution (Less than 20 days remaining)
    const tHalf = Math.max(2, Math.round(effectiveDaysLeft * 0.5));

    return [
      {
        when: `Urgent Sprint 1: Rapid Lock-ins (Next 48 Hours)`,
        dateRange: `${formatDateOffset(effectiveDaysLeft)} – ${formatDateOffset(effectiveDaysLeft - 2)}`,
        badge: `Next 48h`,
        tasks: [
          `Instant contracts: Venue hall, lead caterer, and photographer bookings`,
          `Lock core menu and guest count estimation`,
          `Broadcast emergency digital Save-the-Date on WhatsApp`,
        ],
      },
      {
        when: `Sprint 2: Quick-Turnaround Creative & Favours`,
        dateRange: `${formatDateOffset(effectiveDaysLeft - 3)} – ${formatDateOffset(tHalf)}`,
        badge: `${effectiveDaysLeft - 3} to ${tHalf} Days Left`,
        tasks: [
          `Approve ready-made floral decor themes and stage lighting`,
          `Order express bakery cake and pre-packaged sweets gift boxes`,
          `Track incoming RSVPs and confirm final plate count`,
        ],
      },
      {
        when: `Sprint 3: Final Countdown & Logistics Check`,
        dateRange: `${formatDateOffset(tHalf - 1)} – ${formatDateOffset(1)}`,
        badge: `${tHalf - 1} to 1 Day Left`,
        tasks: [
          `Confirm sound volume guidelines and electricity backup at venue`,
          `Organize emergency cash buffer envelopes for vendor final settlements`,
          `Distribute timing schedule to family leads and coordinator`,
        ],
      },
      {
        when: `Sprint 4: Celebration Day Execution`,
        dateRange: eventDateFormatted,
        badge: `Today · Event Day`,
        tasks: [
          `Vendor load-in and floral decor setup 3 hours prior to guest arrival`,
          `Sound and microphone testing for rituals and music`,
          `Guest reception, auspicious ceremony, and celebration feast`,
        ],
      },
    ];
  }
}

export const TEMPLATES_PERCENT: Record<string, Record<string, number>> = {
  wedding: {
    'Venue & Catering': 48,
    'Decor & Floral Mandap': 13,
    'Attire & Makeup': 10,
    'Photo & Video': 9,
    'Contingency Buffer': 8,
    'Entertainment & DJ': 6,
    'Invites, Transport & Gifts': 6,
  },
  birthday: {
    'Catering & Cake': 35,
    'Venue & Play Lawn': 20,
    'Decor & Theme Backdrops': 15,
    'Entertainment & Games Host': 10,
    'Photography & Reels': 8,
    'Cake & Dessert Table': 5,
    'Contingency Buffer': 4,
    'Return Gifts & Favours': 3,
  },
  community: {
    'Catering & Prasadam / Food': 30,
    'Stage, Sound & High-Wattage Lighting': 20,
    'Venue & Police / Municipal Permits': 15,
    'Cultural Performances & Artists': 12,
    'Festive Decor & Entrance Torans': 8,
    'Contingency Buffer': 5,
    'Volunteers, Logistics & Water': 5,
    'Printing, Badges & Promotion': 5,
  },
};

/**
 * Deterministic budget split calculation.
 * Guaranteed to round to nearest ₹100 and sum EXACTLY to totalBudget.
 */
export function calculateBudgetSplit(
  totalBudget: number,
  eventType: string,
  userPriorities: string[] = []
): BudgetSplitItem[] {
  const basePercentages = { ...(TEMPLATES_PERCENT[eventType] || TEMPLATES_PERCENT['birthday']) };

  // Adjust priorities if specified (+3% to top priority, -3% from lowest non-contingency)
  if (userPriorities.length > 0) {
    const topCat = Object.keys(basePercentages).find((c) =>
      userPriorities.some((p) => c.toLowerCase().includes(p.toLowerCase()))
    );
    if (topCat && basePercentages[topCat]) {
      basePercentages[topCat] += 3;
      const otherCats = Object.keys(basePercentages).filter(
        (c) => c !== topCat && !c.includes('Contingency')
      );
      if (otherCats.length > 0) {
        basePercentages[otherCats[otherCats.length - 1]] -= 3;
      }
    }
  }

  const items: BudgetSplitItem[] = [];
  let allocatedSum = 0;
  const categories = Object.keys(basePercentages);

  categories.forEach((cat, index) => {
    const pct = basePercentages[cat];
    let amt = Math.round((totalBudget * (pct / 100)) / 100) * 100;

    // For the last category (contingency), take exact remainder so sum equals totalBudget 100%
    if (index === categories.length - 1) {
      amt = totalBudget - allocatedSum;
    } else {
      allocatedSum += amt;
    }

    let icon = 'payments';
    if (cat.includes('Catering') || cat.includes('Food')) icon = 'restaurant';
    else if (cat.includes('Venue')) icon = 'forest';
    else if (cat.includes('Decor')) icon = 'palette';
    else if (cat.includes('Photo')) icon = 'photo_camera';
    else if (cat.includes('Entertainment') || cat.includes('Games')) icon = 'celebration';
    else if (cat.includes('Contingency')) icon = 'shield_with_heart';
    else if (cat.includes('Stage')) icon = 'podium';
    else if (cat.includes('Cake')) icon = 'cake';

    items.push({
      category: cat,
      percent: pct,
      amount: amt,
      status: index === 0 ? 'paid' : index === 1 ? 'advance' : index === 2 ? 'booked' : 'quote_pending',
      details: `${pct}% allocation based on Indian event standards`,
      icon,
    });
  });

  return items;
}

/**
 * Calculates Indian vendor negotiation range numbers:
 * expected_quote = min_price + 0.8 * (max_price - min_price)
 * target_price   = expected_quote * 0.85
 * walk_away      = min(expected_quote, allocated_budget_for_category)
 */
export function calculateVendorNegotiation(
  category: string,
  allocatedAmount: number,
  cityTier: 'tier1' | 'tier2' = 'tier1'
): VendorNegotiationItem {
  const multiplier = cityTier === 'tier1' ? 1.0 : 0.8;

  let marketMin = Math.round(allocatedAmount * 0.7 * multiplier);
  let marketMax = Math.round(allocatedAmount * 1.35 * multiplier);

  const expectedQuote = Math.round(marketMin + 0.8 * (marketMax - marketMin));
  const targetPrice = Math.round(expectedQuote * 0.85);
  const walkAway = Math.min(expectedQuote, allocatedAmount);

  const tipsMap: Record<string, string[]> = {
    catering: [
      'Ask for a complimentary live chaat counter or welcome drink dispenser instead of asking for direct price cuts.',
      'Request slab pricing for 70 vs 100 guests to avoid paying for excess food wastage.',
      'Check if service staff and buffet burner fuel charges are included in the per-plate quote.',
    ],
    decor: [
      'Bundle lawn entrance torans with photo backdrop for a 15% combined package concession.',
      'Opt for seasonal Indian marigolds and jasmine over imported carnations to save 30% without losing grandeur.',
      'Ask the venue if they have in-house fairy lights to avoid duplicate vendor rentals.',
    ],
    photo: [
      'Bundle candid photography with family photobook printing for free social reel cuts.',
      'Negotiate on delivery turnaround time (e.g. 10 days) in exchange for booking on off-peak weekdays.',
      'Confirm raw video footage handover terms in the written agreement.',
    ],
    venue: [
      'Inquire about morning vs evening slot discounts if your ritual is flexible.',
      'Ask for complimentary generator backup and green room access without separate hourly billing.',
    ],
  };

  const matchedTips =
    tipsMap[category.toLowerCase().split(' ')[0]] || [
      'Always request three itemized quotations before signing the advance receipt.',
      'Confirm cancellation and postponement clauses in writing.',
      'Never disburse more than 30% advance before on-site setup commences.',
    ];

  return {
    category,
    allocatedAmount,
    marketMin,
    marketMax,
    expectedQuote,
    targetPrice,
    walkAway,
    tips: matchedTips,
  };
}

/**
 * Format Indian Currency INR (e.g. ₹2,00,000 or ₹45,000)
 */
export function formatINR(val: number): string {
  return '₹' + val.toLocaleString('en-IN');
}
