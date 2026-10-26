# Event Planning Assistant: Questionnaire

Use this as the intake flow for the website. Ask it in short steps (one section per screen) with a progress bar. Sections 1-4 are **mandatory**. The rest are optional but improve the plan. Each question lists a suggested input type and what the answer is used for.

---

## Section 1: The Basics (mandatory)

| # | Question | Input type | Options / notes | Used for |
|---|---|---|---|---|
| 1.1 | What are you celebrating? | Single select | Wedding / Birthday / Community event / Anniversary / Baby shower / Engagement / Corporate / Other | Picks budget template and question branch |
| 1.2 | Give your event a name or short description | Text | e.g. "Riya's 1st birthday" | Personalizing ideas and PDF title |
| 1.3 | Event date (or approximate month) | Date picker + "Not fixed yet" | | Timeline, peak/off-peak pricing |
| 1.4 | Is the date flexible? | Yes / Somewhat / No | | Negotiation tips (off-peak discounts) |
| 1.5 | City and area | Text with autocomplete | | Vendor price tier by city |
| 1.6 | Event duration | Single select | 2-3 hrs / Half day / Full day / Multi-day | Venue, catering, and staffing cost |

## Section 2: Budget (mandatory)

| # | Question | Input type | Options / notes | Used for |
|---|---|---|---|---|
| 2.1 | Total budget | Number (₹) + slider | | Budget split |
| 2.2 | Is this budget firm or flexible? | Firm / Can stretch up to 10% / Can stretch up to 20% | | Contingency sizing |
| 2.3 | Who is paying? | Self / Family / Shared / Community fund / Sponsors | | Tone of advice, sponsor tips for community events |
| 2.4 | Which areas matter most to you? | Rank top 3 | Food / Venue / Decor / Photography / Entertainment / Outfits / Guest experience | Shifts budget percentages toward priorities |
| 2.5 | Which areas can you spend less on? | Multi-select | Same list | Shifts budget away from these |
| 2.6 | Do you already have anything booked or paid for? | Multi-select + amount | Venue / Caterer / Decor / etc. | Subtracts from the budget |

## Section 3: Guests (mandatory)

| # | Question | Input type | Options / notes | Used for |
|---|---|---|---|---|
| 3.1 | Expected number of guests | Number | Also ask "confirmed vs maybe" | Catering, venue size |
| 3.2 | Age mix | Sliders or counts | Children (0-12) / Teens / Adults / Seniors (60+) | Ambience, food, entertainment |
| 3.3 | Any guests with special needs? | Multi-select | Wheelchair access / Elderly seating / Infants (feeding room) / Hearing or vision needs | Venue filter |
| 3.4 | Will guests travel from out of town? | Yes / No + how many | | Accommodation and transport add-ons |
| 3.5 | Food preference of guests | Multi-select | Pure veg / Veg + non-veg / Jain / Vegan / Halal / Allergies (text) | Catering and quotes |
| 3.6 | Alcohol served? | Yes / No / Mocktails only | | Licensing and bar cost |

## Section 4: Venue and Style (mandatory)

| # | Question | Input type | Options / notes | Used for |
|---|---|---|---|---|
| 4.1 | Venue type preference | Multi-select | Banquet hall / Hotel / Farmhouse / Lawn / Home / Community hall / Temple or gurdwara hall / Beach or resort / Not decided | Venue estimate |
| 4.2 | Indoor or outdoor? | Indoor / Outdoor / Both / No preference | | Weather backup and decor |
| 4.3 | Do you already have a venue? | Yes (capacity?) / No | | Skips venue budget if yes |
| 4.4 | Preferred time of day | Morning / Afternoon / Evening / Night | | Lighting, decor, catering type |
| 4.5 | Overall vibe | Multi-select | Traditional / Modern / Minimalist / Royal / Rustic / Fun and colourful / Elegant / Cultural theme | Ambience suggestions |
| 4.6 | Favourite colours or themes (optional) | Color picker / Text | | Theme and decor ideas |
| 4.7 | Any cultural or religious rituals to plan for? | Multi-select + text | e.g. Haldi, Mehendi, Sangeet, Pooja, Cake cutting, Jagrata | Timeline and vendor list |
| 4.8 | Pinterest or Instagram references (optional) | Link / Image upload | | Gemini style matching |

---

## Section 5: Services and Add-ons (optional)

Ask "Which of these do you want?" with three states per item: **Must have / Nice to have / Not needed**.

- Photographer
- Videographer / cinematography
- Drone coverage
- Decorator / florist
- Caterer (full service or live counters only)
- Cake / dessert table
- DJ / sound system
- Live band or singer
- Emcee / anchor
- Magician / games host / kids entertainer
- Makeup artist / mehendi artist
- Return gifts / hampers
- Invitations (print / digital / video)
- Tent, lighting, and furniture rental
- Valet parking / security
- Photo booth / selfie corner
- Transport for guests
- Guest accommodation
- Event coordinator or planner on the day

Follow-up for selected items:
- Photographer: Candid / traditional / both? Number of hours? Album required?
- Entertainment: Music genre? Volume limits (elders or kids)?
- Catering: Number of courses, live counters, buffet vs plated?

## Section 6: Branch Questions by Event Type

### If Wedding
1. Which ceremonies are you planning? (Engagement, Haldi, Mehendi, Sangeet, Wedding, Reception)
2. Are all ceremonies at one venue or several?
3. Number of guests per ceremony (they usually differ)
4. Bride and groom outfit budget (combined or separate)?
5. Do you need bridal makeup, groom styling, or family styling?
6. Wedding procession (baraat) or arrival entry planned?
7. Pre-wedding shoot wanted?
8. Honeymoon or gifts included in this budget?

### If Birthday
1. Whose birthday? (Age and gender are optional)
2. Milestone birthday (1st, 18th, 25th, 50th, 60th, etc.)?
3. Child's favourite characters, hobbies, or interests (kids' parties)
4. Will parents stay at the party, or is it kids-only?
5. Surprise party? (Adds secrecy-related timeline notes)
6. Games, activities, or a performer wanted?
7. Cake type and size preference (theme, eggless, dietary)?

### If Community Event (festival, cultural programme, fundraiser, society event)
1. Purpose of the event (festival, fundraiser, annual day, sports, awareness)
2. Is entry free or ticketed?
3. Will there be sponsors or donations? Expected amount?
4. Do you need permissions (police, society, municipal, sound permit)?
5. Stage, speakers, or performances planned? How many performers?
6. Volunteers available? How many?
7. Stalls or food vendors invited?
8. Need for a rain plan or backup venue?

### If Anniversary / Engagement / Baby Shower / Other
1. Who is the main person or couple being celebrated?
2. Intimate gathering or large celebration?
3. Any special tradition or surprise element?
4. Gift or return-favour needs?

---

## Section 7: Timeline and Logistics (optional)

| # | Question | Input type | Used for |
|---|---|---|---|
| 7.1 | How many weeks or months do you have until the event? | Auto from date | Planning tasks urgency |
| 7.2 | Which tasks have you already completed? | Checklist | Skips finished steps |
| 7.3 | Who will help you plan? | Multi-select (self, spouse, family, friends, hired planner) | Task assignment |
| 7.4 | Preferred setup time at the venue | Time | Vendor scheduling |
| 7.5 | Any hard constraints? (exams, festivals, travel, monsoon) | Text | Timeline adjustments |

## Section 8: Negotiation and Vendor Preferences (optional)

| # | Question | Input type | Used for |
|---|---|---|---|
| 8.1 | What is your comfort with negotiating? | Confident / Somewhat / Need help | Level of negotiation guidance |
| 8.2 | Vendor tier preference | Budget / Mid-range / Premium / Mix | Price table tier |
| 8.3 | Prefer vendors with reviews or referrals? | Yes / No | Vendor suggestions |
| 8.4 | Would you like bundled packages (e.g. photo + video + album)? | Yes / No | Bundle discount tips |
| 8.5 | Are you OK with booking vendors in advance for a discount? | Yes / No | Early-booking advice |

## Section 9: Final Details

1. Anything else the assistant should know? (free text)
2. Biggest worry about this event? (budget, guests, time, vendors, weather, family expectations)
3. Output preferences: Show me (budget table / timeline / vendor checklist / ideas / all of these)
4. Name and email (to save and send the plan)
5. Consent to save the plan to your account

---

## Conditional Logic Summary

- If **budget < ₹50,000** → hide premium add-ons, emphasize DIY and bundled packages.
- If **guests > 300** → ask about crowd management, parking, and multiple catering counters.
- If **seniors > 20%** of guests → suggest comfortable seating, quieter music, early timing.
- If **children > 25%** of guests → suggest a kids' zone, kid-friendly menu, and safety measures.
- If **venue already booked** → skip venue questions, recompute the budget split.
- If **outdoor** → add weather backup, tent, and lighting questions.
- If **community event** → ask permits, sponsors, and volunteers; hide bridal and attire items.
- If **date within 30 days** → switch to an urgent checklist and flag vendors that may be unavailable.

---

## Suggested Data Structure (JSON keys)

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

Pass this object to your backend. The budget engine uses `budget`, `guests`, and `event.type` for the split. Gemini uses everything else for ideas, ambience, and negotiation tips.

---

## UX Tips

- Keep each screen to 4-6 questions maximum. Use "Skip for now" on optional ones.
- Show a live budget preview after Section 2 so users feel progress.
- Save answers as the user goes (so they can resume later).
- Offer a "Quick plan" mode: Sections 1-4 only, then generate the plan. Offer "Detailed plan" to unlock the rest.
- Use friendly language and examples in placeholders (e.g. "e.g. 150 guests").
