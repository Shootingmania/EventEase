# EventEase: Project Handoff

**Working name:** EventEase (rename freely)
**One-liner:** A GenAI-powered planning assistant that helps people in India organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas.
**Status:** Planning complete. Nothing is built yet. This document contains the architecture, questionnaire, budget logic, AI integration, and frontend design prompts needed to start building.

---

## 1. Product Summary

### What the user does
1. Answers a guided questionnaire (event type, budget, guests, age mix, venue and style, add-ons).
2. Receives a generated plan containing:
   - Budget split by category (exact, adds up to the total)
   - Vendor price estimates with negotiation numbers (expected quote, target price, walk-away price)
   - Ambience and theme ideas matched to occasion and age groups
   - Suggested add-ons (photographer, DJ, etc.) with priority labels
   - Timeline working backwards from the event date
   - Vendor and task checklist
3. Downloads or shares the plan (PDF), and saves it to an account.

### Core principle
**Code does the numbers. The LLM does the creative and conversational parts.** LLMs are unreliable at arithmetic and will invent vendor prices, so budgets, price ranges, and negotiation figures come from deterministic code and our own data. Gemini is used for ambience, themes, add-on suggestions, personalization, and negotiation advice text.

### Target users
Families and individuals planning events in India, plus community or society organizers. Many users are non-technical and some are older, so the UI must be simple, large-text, and mobile-first.

---

## 2. Architecture

```
User → Frontend (React or Streamlit) → Backend (FastAPI) → ┬ Budget engine (plain code)
                                                           ├ Vendor price DB (CSV → SQLite/Postgres)
                                                           ├ Timeline generator (code skeleton)
                                                           └ Gemini API (ideas, personalization, tips)
```

| Piece | Owner | Why |
|---|---|---|
| Budget split | Code, percentage templates per event type | Totals must add up exactly |
| Vendor price ranges | Our own price table by city and tier | Avoids hallucinated prices |
| Ambience, themes, add-ons | Gemini | Creative and personalized |
| Timeline | Code skeleton (works backwards from date) + Gemini personalization | Reliable and flexible |
| Negotiation numbers | Code formula | Numbers stay consistent |
| Negotiation advice text | Gemini | Natural-language tips |

---

## 3. Recommended Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Prototype UI | **Streamlit** | Fastest MVP (a weekend) |
| Production UI | **React** (Vite or Next.js) + Tailwind | Built from the Google Stitch designs |
| Backend | **FastAPI** (Python) | Pydantic models for validation |
| LLM | **Gemini Flash-class model** via `google-genai` | Free tier from Google AI Studio for prototyping |
| Database | SQLite for MVP → Postgres later | Plans, users, vendor prices |
| PDF export | WeasyPrint or ReportLab | Downloadable plan |
| Auth (later) | Firebase Auth or Supabase | Saved plans |
| Hosting | Render / Railway / Cloud Run | Keep API key in env vars |

The model is swappable. All LLM calls live in one module, so Claude, OpenAI, or a local model through Ollama can replace Gemini by changing one function.

---

## 4. Budget Engine Specification

### 4.1 Percentage templates (store as JSON, tunable)

**Wedding**
| Category | % |
|---|---|
| Venue + catering | 48 |
| Decor | 13 |
| Photo + video | 9 |
| Attire + makeup | 10 |
| Entertainment | 6 |
| Miscellaneous (invites, transport, gifts) | 6 |
| Contingency | 8 |

**Birthday**
| Category | % |
|---|---|
| Venue | 20 |
| Catering | 35 |
| Decor + theme | 15 |
| Entertainment + games | 10 |
| Photography | 8 |
| Cake | 5 |
| Return gifts | 3 |
| Contingency | 4 |

**Community event**
| Category | % |
|---|---|
| Venue + permits | 15 |
| Food | 30 |
| Stage, sound, lighting | 20 |
| Decor | 8 |
| Entertainment / performances | 12 |
| Printing + promotion | 5 |
| Volunteers + logistics | 5 |
| Contingency | 5 |

Each template must total exactly 100. Add a unit test for that.
Templates for Anniversary, Engagement, Baby Shower, and Other can start as copies of Birthday, then be tuned.

### 4.2 Adjustments (applied before rounding)
- **User priorities (Q2.4):** move up to 3 percentage points into each of the user's top 3 categories.
- **Low-priority areas (Q2.5):** take up to 3 points from each, down to a floor of half the original share.
- **Already-booked items (Q2.6):** subtract the paid amount from the total, then split the remainder over the other categories.
- **Budget flexibility (Q2.2):** firm → contingency stays as is; can stretch → show a "stretch" column of +10% or +20%.
- **Guest mix:** many seniors → raise seating and comfort items; many children → raise entertainment and safety.
- **Rounding:** round each category to the nearest ₹100, then put any leftover into contingency so the sum equals the total exactly.

### 4.3 Per-guest sanity check
Show cost per guest (total ÷ guests) and warn if the catering share per plate is below a sensible threshold for the chosen city tier.

---

## 5. Vendor Price Table

### Schema (CSV → database)
```
category, city, tier, min_price, max_price, unit, notes, source, last_updated
```
- `tier`: budget / mid / premium
- `unit`: per plate / per event / per hour / per day / per piece
- `source`: where the number came from (vendor quote, website, friend, survey), for auditing
- `last_updated`: show staleness in admin

### Seed data
Start with 20-30 rows from real quotes, vendor websites, and people who organized events. Cover at least: venue, catering (veg and non-veg), decor, photographer, videographer, DJ, live band, makeup, cake, return gifts, sound/lighting, tent. Begin with 1-2 cities, then expand. Later, add web search or scraping to refresh prices.

### UI rule
Always label prices as **"Typical market ranges, estimates only."**

---

## 6. Negotiation Logic

For each vendor category compute three numbers from the price row (tunable constants):

```
expected_quote = min_price + 0.8 * (max_price - min_price)    # vendors usually open near the top
target_price   = expected_quote * 0.85                        # aim for 10-20% below the quote
walk_away      = min(expected_quote, allocated_budget_for_category)
```

Display as a range bar: target ← expected → walk-away marker, next to the allocated amount.

Gemini then writes the tips for each category, for example:
- Bundle photo and video for a package discount
- Book off-peak dates or weekdays
- Book early for a discount
- Ask for a lower guest-count slab, or cut a course or live counter
- Compare three quotes

The model receives the computed numbers as input and **must not change them**.

---

## 7. Gemini Integration

### Setup
- Get a key from **Google AI Studio**. Use a fast, cheap Flash-class model.
- Store the key in an environment variable (`GEMINI_API_KEY`). **Backend only.** Never in frontend code, never committed to GitHub. Add `.env` to `.gitignore`.
- Add rate limiting per user or IP, because each request costs tokens.
- Add caching for identical inputs.

### Use structured JSON output
Have Gemini return JSON with a defined schema so the UI can render cards and tables reliably.

### Reference implementation
```python
import os, json
from google import genai
from pydantic import BaseModel

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

class Theme(BaseModel):
    name: str
    description: str
    colors: list[str]
    why_it_fits: str

class Addon(BaseModel):
    name: str
    priority: str            # "must" | "nice" | "optional"
    reason: str

class Ideas(BaseModel):
    themes: list[Theme]
    ambience_notes: list[str]
    addons: list[Addon]
    negotiation_tips: dict[str, list[str]]   # keyed by category

def get_ideas(profile: dict, budget_split: dict, vendor_numbers: dict) -> Ideas:
    prompt = f"""You are an event planning assistant for India.
Event profile: {json.dumps(profile)}
Budget by category (INR, final, do not change): {json.dumps(budget_split)}
Vendor numbers (INR, final, do not change): {json.dumps(vendor_numbers)}

Tasks:
1. Suggest 3 ambience/themes suited to the occasion and age mix.
2. Suggest add-ons prioritized for this budget (must / nice / optional).
3. Give 2-3 practical negotiation tips per vendor category.
Never invent prices. Refer only to the numbers given."""
    r = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={"response_mime_type": "application/json", "response_schema": Ideas},
    )
    return r.parsed
```
Check the current model name in Google's docs at build time.

### Guardrails
- Validate every Gemini response against the schema. Retry once on failure, then fall back to template-based ideas.
- Never let the model output prices or percentages that reach the UI without passing through code.
- Add a safety fallback if the API is down: still show the budget and timeline (they don't need the LLM).

---

## 8. Timeline Generator

Work backwards from the event date using a task template per event type. Example for a wedding:

| When | Tasks |
|---|---|
| 6-12 months | Fix budget, guest list draft, book venue, hire planner (optional) |
| 4-6 months | Book caterer, photographer, decorator, send save-the-dates |
| 2-3 months | Outfits, invitations, makeup artist, entertainment |
| 1 month | Final guest count, menu tasting, seating plan, confirm vendors |
| 1 week | Final payments, vendor schedules, emergency kit |
| Day before | Venue walkthrough, delivery checks |
| Event day | Coordinator assignments, vendor arrival times |

Rules:
- Compress the timeline if the event is under 30 days away, and flag vendors likely to be unavailable.
- Skip tasks the user marked as completed (Q7.2).
- Gemini may personalize wording, but the dates come from code.

Create similar templates for birthdays (shorter) and community events (permits, volunteers, sponsors, promotion).

---

## 9. API Design (FastAPI)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/plan` | Takes the questionnaire JSON, returns the full plan |
| GET | `/api/plan/{id}` | Fetch a saved plan |
| PUT | `/api/plan/{id}` | Update answers and regenerate |
| GET | `/api/plan/{id}/pdf` | Download PDF |
| POST | `/api/budget/preview` | Fast budget split for the live preview (no LLM call) |
| GET | `/api/vendors?category=&city=&tier=` | Price ranges |
| POST | `/api/chat` | (Phase 2) Follow-up chat about a plan |
| POST | `/api/auth/*` | (Phase 2) Accounts |

`/api/budget/preview` must be instant and free, because the frontend calls it as the user moves sliders.

### Plan response shape
```json
{
  "id": "",
  "summary": { "total": 0, "guests": 0, "date": "", "days_left": 0, "cost_per_guest": 0 },
  "budget": [{ "category": "", "percent": 0, "amount": 0 }],
  "vendors": [{
    "category": "", "allocated": 0,
    "market_min": 0, "market_max": 0,
    "expected_quote": 0, "target_price": 0, "walk_away": 0,
    "tips": []
  }],
  "ideas": { "themes": [], "ambience_notes": [], "addons": [] },
  "timeline": [{ "when": "", "tasks": [] }],
  "checklist": [{ "task": "", "due": "", "done": false }],
  "disclaimer": "Typical market ranges, estimates only."
}
```

---

## 10. The Questionnaire (intake form)

Ask in short steps with a progress bar, one section per screen, 4-6 questions each. Sections 1-4 are mandatory. Offer **Quick plan** (Sections 1-4 only) and **Detailed plan** (all sections). Save answers as the user goes so they can resume.

### Section 1: Basics (mandatory)
| # | Question | Input |
|---|---|---|
| 1.1 | Event type | Single select: Wedding / Birthday / Community event / Anniversary / Baby shower / Engagement / Corporate / Other |
| 1.2 | Event name or description | Text |
| 1.3 | Event date or approximate month | Date picker + "Not fixed yet" |
| 1.4 | Is the date flexible? | Yes / Somewhat / No |
| 1.5 | City and area | Text with autocomplete |
| 1.6 | Duration | 2-3 hrs / Half day / Full day / Multi-day |

### Section 2: Budget (mandatory)
| # | Question | Input |
|---|---|---|
| 2.1 | Total budget (₹) | Number + slider |
| 2.2 | Firm or flexible? | Firm / Stretch 10% / Stretch 20% |
| 2.3 | Who is paying? | Self / Family / Shared / Community fund / Sponsors |
| 2.4 | Top 3 priorities | Rank: Food / Venue / Decor / Photography / Entertainment / Outfits / Guest experience |
| 2.5 | Areas to spend less on | Multi-select |
| 2.6 | Anything already booked or paid? | Multi-select + amount |

### Section 3: Guests (mandatory)
| # | Question | Input |
|---|---|---|
| 3.1 | Expected guests (confirmed vs maybe) | Number |
| 3.2 | Age mix | Counts: Children 0-12 / Teens / Adults / Seniors 60+ |
| 3.3 | Special needs | Wheelchair access / Elderly seating / Infants / Hearing or vision needs |
| 3.4 | Out-of-town guests? | Yes/No + how many |
| 3.5 | Food preference | Pure veg / Veg + non-veg / Jain / Vegan / Halal / Allergies (text) |
| 3.6 | Alcohol | Yes / No / Mocktails only |

### Section 4: Venue and style (mandatory)
| # | Question | Input |
|---|---|---|
| 4.1 | Venue type | Banquet hall / Hotel / Farmhouse / Lawn / Home / Community hall / Temple or gurdwara hall / Beach or resort / Not decided |
| 4.2 | Indoor / outdoor | Indoor / Outdoor / Both / No preference |
| 4.3 | Venue already booked? | Yes (capacity) / No |
| 4.4 | Time of day | Morning / Afternoon / Evening / Night |
| 4.5 | Vibe | Traditional / Modern / Minimalist / Royal / Rustic / Fun and colourful / Elegant / Cultural theme |
| 4.6 | Colours or themes (optional) | Color picker / Text |
| 4.7 | Rituals | Haldi, Mehendi, Sangeet, Pooja, Cake cutting, Jagrata, other |
| 4.8 | Inspiration links or images (optional) | Link / Upload |

### Section 5: Add-ons (optional)
Each item gets **Must have / Nice to have / Not needed**:
Photographer, Videographer, Drone, Decorator/florist, Caterer (full or live counters), Cake/dessert table, DJ/sound, Live band/singer, Emcee, Kids entertainer/magician, Makeup/mehendi artist, Return gifts, Invitations, Tent/lighting/furniture, Valet/security, Photo booth, Guest transport, Guest accommodation, Event coordinator.
Follow-ups: photographer (candid/traditional, hours, album), entertainment (genre, volume limits), catering (courses, live counters, buffet vs plated).

### Section 6: Event-specific branches
- **Wedding:** ceremonies planned (Engagement/Haldi/Mehendi/Sangeet/Wedding/Reception), one venue or several, guests per ceremony, attire budget, bridal/groom styling, baraat or entry, pre-wedding shoot, honeymoon or gifts inside budget?
- **Birthday:** whose birthday and age, milestone?, child's interests or favourite characters, kids-only or parents staying, surprise party?, games or performer, cake preferences (theme, eggless).
- **Community event:** purpose (festival, fundraiser, annual day, sports, awareness), free or ticketed, sponsors and expected amount, permits (police, society, municipal, sound), stage and performers count, volunteers count, stalls, rain plan.
- **Anniversary / Engagement / Baby shower / Other:** who is celebrated, intimate or large, special traditions or surprises, gifts and return favours.

### Section 7: Timeline and logistics (optional)
Weeks until the event (auto), tasks already done (checklist), who is helping, setup time at venue, hard constraints (exams, festivals, travel, monsoon).

### Section 8: Negotiation and vendor preferences (optional)
Comfort with negotiating (Confident / Somewhat / Need help), vendor tier (Budget / Mid / Premium / Mix), prefer reviewed or referred vendors, want bundled packages, OK with advance booking for discount.

### Section 9: Final
Anything else (free text), biggest worry (budget, guests, time, vendors, weather, family expectations), output preferences (budget table / timeline / vendor checklist / ideas / all), name and email, consent to save the plan.

### Conditional logic
- Budget under ₹50,000 → hide premium add-ons, emphasize DIY and bundled packages.
- Guests over 300 → ask about crowd management, parking, multiple catering counters.
- Seniors over 20% → suggest comfortable seating, quieter music, earlier timing.
- Children over 25% → suggest a kids' zone, kid-friendly menu, safety measures.
- Venue already booked → skip venue questions, recompute the split.
- Outdoor → add weather backup, tent, and lighting questions.
- Community event → ask permits, sponsors, volunteers; hide bridal and attire items.
- Date within 30 days → switch to an urgent checklist and flag vendors that may be unavailable.

### Intake data structure
```json
{
  "event": { "type": "", "name": "", "date": "", "date_flexible": "", "city": "", "duration": "" },
  "budget": { "total": 0, "flexibility": "", "payer": "", "priorities": [], "low_priority": [], "already_booked": [] },
  "guests": { "total": 0, "children": 0, "teens": 0, "adults": 0, "seniors": 0, "special_needs": [], "food_prefs": [], "alcohol": "" },
  "venue": { "types": [], "setting": "", "has_venue": false, "time_of_day": "", "vibe": [], "colors": [], "rituals": [] },
  "addons": { "photographer": "must", "dj": "nice", "decor": "must" },
  "branch": { "wedding": {}, "birthday": {}, "community": {}, "other": {} },
  "timeline": { "completed_tasks": [], "helpers": [], "constraints": "" },
  "negotiation": { "comfort": "", "tier": "", "bundle": true },
  "final": { "notes": "", "biggest_worry": "", "outputs": [], "email": "" }
}
```

### UX tips
- Max 4-6 questions per screen, "Skip for now" on optional ones.
- Show a live budget preview (donut chart) right after Section 2.
- Friendly placeholders with examples ("e.g. 150 guests").
- Indian number formatting everywhere (₹5,00,000).

---

## 11. Frontend Design: Google Stitch Prompts

Paste the master prompt first, then generate one screen at a time so the style stays consistent. Export to HTML/CSS or Figma when approved.

### Master prompt
```
Design a responsive web app called "EventEase", an AI event planning assistant that helps people in India plan weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas.

VISUAL STYLE
- Warm, celebratory, modern and trustworthy. Not corporate, not childish.
- Color palette: warm ivory background (#FFF9F2), deep maroon primary (#7A1E3A), marigold gold accent (#F2A900), soft teal secondary (#2A9D8F), charcoal text (#2B2B2B).
- Typography: elegant serif for headings (like Playfair Display), clean sans-serif for body and forms (like Inter or Poppins).
- Rounded corners (16px), soft shadows, generous white space, subtle floral or rangoli-inspired line patterns used sparingly as decoration.
- Friendly illustrations or icons for event types (rings, cake, lamp/diya, community group).
- Currency is Indian Rupees (₹) with Indian number formatting (e.g. ₹5,00,000).
- Mobile-first, clean, easy for non-technical users and older family members to read. Large tap targets, readable font sizes.

GENERAL UI RULES
- Top navigation: logo, "How it works", "My Plans", "Sign in" button.
- Consistent primary button (maroon, white text) and secondary button (outlined).
- Use cards, chips, sliders, and progress bars instead of long plain forms.
- Show helpful microcopy and example placeholders (e.g. "e.g. 150 guests").

Start by generating the Landing page.
```

### Screen prompts
1. **Landing page:** Hero with headline "Plan your perfect celebration, within your budget", subheading, primary button "Start planning", secondary "See a sample plan", and a hero image of a decorated Indian celebration. Three event-type cards (Wedding, Birthday, Community Event). "How it works" with 4 steps (Tell us about your event, Get your budget split, See vendor estimates, Download your plan). Feature strip: Smart budget split, Vendor price estimates, Negotiation tips, Ambience ideas, Timeline and checklist. Testimonials row and footer.
2. **Event type selection (Step 1 of 5):** "What are you celebrating?" with large selectable cards for Wedding, Birthday, Anniversary, Baby Shower, Engagement, Community Event, Other. Progress bar, Continue button, Quick plan / Detailed plan toggle.
3. **Basics and budget (Step 2 of 5):** Event name, date picker with "Date not fixed yet", city autocomplete, duration chips. Budget section with ₹ input plus slider, flexibility selector, drag-and-drop "rank your top 3 priorities" chips. Desktop right side: live budget donut chart that updates as the budget changes.
4. **Guests (Step 3 of 5):** Total guest stepper, four age steppers (Children, Teens, Adults, Seniors 60+) with a small stacked bar, special needs checkboxes, food preference chips, alcohol option.
5. **Venue and style (Step 4 of 5):** Venue type image cards, Indoor/Outdoor/Both toggle, vibe mood-board tiles, color palette picker, ritual chips, optional inspiration image upload.
6. **Add-ons (Step 5 of 5):** Grid of add-on cards, each with a Must have / Nice to have / Not needed selector. Sticky bottom bar with "Estimated cost of selected services" and a "Generate my plan" button.
7. **Loading screen:** Animated illustration with rotating messages ("Splitting your budget...", "Checking vendor price ranges...", "Finding ideas for your guests...").
8. **Plan dashboard (most important):** Tabs: Overview, Budget, Vendors, Ideas, Timeline, Checklist.
   - Overview: summary cards (budget, guests, date, days left) and a donut chart of the split.
   - Budget: table with Category, % of budget, Allocated amount, progress bar per row, contingency row highlighted.
   - Vendors: per-category card with market range, expected quote, target price, and walk-away price on a range bar, an expandable "Negotiation tips", and the note "Typical market ranges, estimates only".
   - Ideas: ambience theme cards with mood image, colour chips, short description, plus recommended add-ons labelled Must have / Nice to have.
   - Timeline: vertical timeline working backwards from the event date.
   - Checklist: tasks with checkboxes, due dates, assignee avatars.
   - Buttons: Download PDF, Share plan, Edit answers.
9. **My Plans:** Saved plans as cards (name, date, budget, checklist progress ring, Open / Duplicate / Delete) and a "+ Plan a new event" card.
10. **Mobile:** Mobile versions of a questionnaire step and the plan dashboard, with bottom navigation, collapsible sections, and horizontally scrollable tabs.

---

## 12. Build Plan and Ownership

### Phase 1: MVP (about 1-2 weeks)
| Workstream | Tasks |
|---|---|
| **Backend / logic** | FastAPI project, Pydantic models from the intake schema, budget engine with the three templates and adjustments, unit tests (templates sum to 100, split sums to the total), `/api/budget/preview`, `/api/plan` |
| **AI** | Gemini module with structured output, prompt tuning, schema validation, retry and fallback |
| **Data** | Vendor price CSV with 20-30 rows for 1-2 cities, loader into SQLite, negotiation formula |
| **Frontend** | Streamlit (or React) form with branching logic, live budget preview, plan results tabs |
| **Design** | Generate screens in Google Stitch from Section 11, review, export |

### Phase 2
- Timeline generator and checklist, PDF export
- React frontend from approved Stitch designs
- User accounts and saved plans
- Follow-up chat ("make it cheaper", "swap DJ for live band")

### Phase 3
- Expand city coverage and the price dataset
- Real vendor listings and quote requests
- Price refresh through web search or scraping
- Multilingual UI (Hindi and regional languages)
- Analytics on drop-off per questionnaire step

### Acceptance criteria for MVP
- A user can complete Sections 1-4 and receive a plan in under 30 seconds.
- Budget categories always sum exactly to the total.
- Every price shown comes from the vendor table or the budget engine, never from the LLM.
- The plan still renders (budget and timeline) if Gemini fails.
- The API key is never exposed to the browser.
- Prices are labelled as estimates.

---

## 13. Security, Privacy, and Compliance
- API keys in environment variables only; rotate if ever exposed.
- Rate limiting and basic abuse protection on `/api/plan`.
- Collect minimal personal data (name, email only when saving). Ask for explicit consent to store a plan.
- Provide a way to delete a saved plan and account.
- Do not send names or contact details to the LLM. Only send the event profile.
- Avoid storing uploaded inspiration images longer than needed.

## 14. Risks and Open Decisions
| Item | Risk / Question | Suggested default |
|---|---|---|
| Price accuracy | Estimates may be off by city and season | Label clearly, add a "report wrong price" button, refresh data regularly |
| Cities at launch | Which city or cities first? | Start with the founder's home city plus one metro |
| Frontend choice | Streamlit vs React | Streamlit for MVP, React for production |
| LLM cost | Token cost grows with users | Flash model, caching, rate limits |
| Vendor marketplace | Do we list real vendors? | Not in MVP; Phase 3 |
| Monetization | Free, ads, vendor leads, premium plans? | Decide after MVP validation |
| Language | English only at first? | English first, Hindi in Phase 3 |
| Name and branding | "EventEase" is a placeholder | Check domain and trademark availability |

---

## 15. Quick Start for the Developer

```bash
python -m venv venv && source venv/bin/activate
pip install fastapi uvicorn pydantic google-genai python-dotenv streamlit
echo "GEMINI_API_KEY=your_key_here" > .env
echo ".env" >> .gitignore
```

Suggested repo layout:
```
eventease/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── models.py            # Pydantic intake and plan schemas
│   ├── budget.py            # templates + adjustments
│   ├── negotiation.py       # price formulas
│   ├── timeline.py          # timeline templates
│   ├── ai.py                # Gemini calls (only place that talks to the LLM)
│   └── data/
│       ├── budget_templates.json
│       └── vendor_prices.csv
├── frontend/                # Streamlit app or React app
├── tests/
├── .env                     # never committed
└── README.md
```
