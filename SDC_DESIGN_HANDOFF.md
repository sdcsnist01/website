# SDC Website — Design Handoff for Claude Design

> Read this with `SDC_UI_UX_AUDIT.md` (deep findings), `SDC_ROUTE_MAP.md`, `SDC_COMPONENT_INVENTORY.md`.
> This document is the brief for **redesigning the visual/UX layer** of the existing SDC SNIST website.

---

## 0. Critical constraints (read first)

> **The redesign should improve the visual design and UX while preserving existing website
> functionality, routes, content meaning, integrations, and important user journeys unless
> explicitly instructed otherwise.**

Specifically, **do not break**:
- **Routes:** `/`, `/about`, `/blog`, `/contact`, `/events`, `/events/[id]`, `/events/uxplosion3.0`, `/join`, `/admin/*`, `/api/*`. Redirects `/about/about.html → /about`, `/blog/blog.html → /blog`.
- **`/events/uxplosion3.0`** bypasses global nav/footer and renders as a standalone dark microsite — keep that outcome (its own chrome/theme) even if restyled.
- **Data:** `/events` and `/events/[id]` read Supabase `events` with a static fallback (`src/data/events.ts`). Keep the fallback behavior.
- **Payments (Razorpay):** membership ₹199/year (`create-order → verify`, 12-digit member ID + cohort year); paid event registration; server-side signature verification. Razorpay theme color is currently `#b21725`.
- **Contact:** form → `/api/contact` → Supabase `contact_messages` → `/admin/messages`. Validation: name ≥2, email regex, message 10–5000 chars.
- **Admin:** Supabase email/password + `profiles.role === "admin"`; `/admin/:path*` middleware; `noindex`.
- **Event logic:** lifecycle (`upcoming`/`live`/`past`), countdown, sort (date desc, `TBD` last), related-events (same category or mode), `EventCard` details/register URL resolution incl. `id 17 → /events/uxplosion3.0`.
- **`prefers-reduced-motion`:** currently respected in most JS; **extend** coverage, never remove it.
- **UX sound layer:** `data-sound="button|select|tap|toggleOn|toggleOff|swipe|celebration|notification|progress|…"` click-delegation + footer mute toggle. Keep the attribute contract; sounds may be reduced/re-recorded.
- **Blog content model:** article blocks = `{ title?, paragraphs?, bullets?, quote? }`. Keep the shape.
- **External:** UXplosion registration is a Google Form (`forms.gle/qa3krME1Ua34rEvD9`) — keep it working (ideally add an on-site confirmation step).

**You MAY change:** all visual styling, layout, spacing, typography, color application, component structure, animations, the blog *reader* (add real `/blog/[slug]` pages), CTA labels (make them consistent), nav/footer chrome, background FX, empty/loading/error states, and add pages (privacy, terms, membership-benefits).

**You SHOULD fix (explicitly in scope):**
1. Unify the two visual systems (site vs UXplosion) into one brand with a documented "campaign" variant.
2. Consolidate duplicate components (2 navs, 2 footers, 5 card looks, 4 modals, 4 background systems).
3. Enforce design tokens (no inline hex).
4. Fix contradictory stats/claims (see §1.6).
5. Make the recruitment form actually submit (currently discards data while claiming success) — **this is a functional bug to fix, not preserve.**
6. Replace placeholder `/about` team + partner content, or hide the section.
7. Accessibility: modal focus management, `aria-live` on form status, `aria-pressed` on filter toggles, contrast fixes.

---

## 1. SDC brand

### 1.1 Current visual identity
- **Name:** SDC SNIST — Student Developers Community, Sreenidhi Institute of Science and Technology (SNIST), Hyderabad.
- **Logo:** wordmark/badge (`sdc-india-logo.jpeg` in site nav/footer; `sdc-logo.png` on UXplosion). 3 logo files exist — pick/produce one canonical set (light + dark).
- **Look today:** warm off-white ("porcelain") surfaces, a single strong **brand red**, Material-3-style surface ramp, big tight-tracked Manrope headings, glass cards, red glow on hover, ambient tech backgrounds (matrix rain, dot grids, drifting blobs). Footer flips to near-black.
- **UXplosion sub-brand:** near-black, pink→coral→orange gradient, "bubble letter" display type, particle FX, scroll-driven storytelling.

### 1.2 Brand personality
Ambitious · technical · energetic · "elite student engineers" · builder culture ("learning by doing") · campus-rooted but industry-facing. Slightly over-claims ("FAANG mentors", "50k+ members") — dial the copy to confident-but-credible.

### 1.3 Current color language
| Role | Value | Notes |
|------|-------|-------|
| Primary | `#d9202f` | brand red |
| Primary hover / pressed | `#b21725` | also Razorpay theme |
| Deep accent | `#7a1220` | maroon (icon chips, register chip) |
| Gradient | `#e8394a → #d9202f → #8c0f1c` (135°) | headings, CTA fills |
| Surface (light) | `#fefbfa` → `#fbf3f2` → `#f6ebe9` → `#f0e2e0` → `#e9d7d5` | warm ramp |
| Border | `#e6d6d4` (`--outline-variant`), `#c9b6b3` (`--outline`) | warm |
| Text | `#17181f` | |
| Muted text | `#5c5559` | **darken to ~`#4a444a`** for AA at small sizes |
| Footer bg | `#0e0e0e` | |
| **UXplosion** bg | `#0A0A0C` | surfaces `#0D0D0F`/`#131316` |
| UXplosion gradient | `#FF2F7D → #FF5368 → #FF8A45` (90°) | |
| UXplosion pink / violet | `#FF6FA8` / `#8C5CF6` | |
| UXplosion muted | `#B8B2B7` / `#8F898F` / `#7A7278` | **lighten the darkest** for AA |
| Semantic (ad-hoc, tokenize these) | success `#34d399` / warn `#eab308` / danger `red-500` / live `emerald-400` | |

> There is also a stale parallel neutral-`oklch` token set (`--background`, `--muted`, `--border`, `--radius`, `--chart-*`) and an orphan orange/fuchsia FX pair (`#f97316`/`#d946ef` in `marketing-pages.css`). **Collapse to one system.** `docs/style_guide.md` describes a *blue/indigo* brand — **it is stale, ignore it.**

### 1.4 Typography
- **Display/Headings:** Manrope (700/800), tracking `-0.02` to `-0.04em`, line-height 0.9–1.1.
- **Body/UI:** Inter (400–700), line-height ~1.6.
- **Mono:** used for member IDs, team numbers, challenge textarea.
- **UXplosion:** Space Grotesk (headings), Manrope (body), Baloo 2 (bubble wordmark).
- **Method:** site uses discrete Tailwind steps per breakpoint; **UXplosion uses fluid `clamp()` — adopt `clamp()` everywhere.**
- Recommended scale in `SDC_UI_UX_AUDIT.md` §19.

### 1.5 Imagery & media
- Event photos (candid campus/hackathon shots), speaker portraits (1:1), partner logos (SVG), sponsor logos (currently photos — should be vector).
- Background FX are code-generated (matrix rain, dot grids, blurred blobs, particles, SVG rings).
- No illustration set, no Lottie. UXplosion "play panel" (wireframe/prototype/flow SVG) is the closest to an illustration style — could seed a light custom illustration language.
- Icons: ~60 custom animated line icons (Tabler-style, hover micro-animations) — **keep this as the single icon system.**
- Emoji used in UXplosion highlights (🏆💼🎁) and `✳` as a section marker.

### 1.6 Tone & content
- Confident, punchy, second-person ("Innovate, Collaborate, Elevate"), tech-forward.
- **Fix contradictory numbers** — pick one verified set and use it everywhere:
  - Members: home says "50k+", blog says "2500+", about says "5000+ students". 
  - Events: home "120+", about "50+ events / 120+ workshops".
  - "45 Chapters" (home) — appears nowhere else; drop or substantiate.
- **Fix UXplosion copy conflicts:** FAQ says "four-day bootcamp / four evenings"; hero + timeline + essentials say "3 days, Sept 22–24". Pricing: ₹99 member / ₹199 non-member / ₹319 combo (site membership elsewhere = ₹199/yr).
- Replace fake `/about` team names/bios/partner logos with real ones or remove.
- Add: concrete membership benefits, event code of conduct, privacy/terms.

---

## 2. Website architecture

### 2.1 Routes
| Route | Purpose |
|-------|---------|
| `/` | Home — community intro, funnel to `/join` |
| `/about` | Mission, vision, founding story, impact stats, partners, team |
| `/blog` | Community stories / event recaps (currently modal reader — add `/blog/[slug]`) |
| `/contact` | Inbound queries + social links + message form |
| `/events` | Event catalogue: hero, growth chart, search/filter, card grid, join CTA |
| `/events/[id]` | Single event: hero, about, details sidebar, agenda/speaker, gallery, register, related |
| `/events/uxplosion3.0` | Standalone UXplosion 3.0 campaign landing (own nav/footer/theme) |
| `/join` | Paid membership form + 4-step team recruitment wizard |
| `/community` | **Disabled** (`notFound()`) — GitHub contribution heatmap, parked |
| `/admin`, `/admin/login`, `/admin/events(+/new,/[id]/edit)`, `/admin/members`, `/admin/messages` | Private, session-gated, `noindex` |
| `/api/contact`, `/api/membership/{create-order,verify}`, `/api/razorpay/{create-order,verify}` | Backend |

No services/products/solutions/careers/case-studies/legal pages exist. **Add `/privacy` + `/terms`** (footer-linked). Consider a real people/teams page (the honest version of the fake About team).

### 2.2 Navigation
- **Primary nav items:** Home · About · Events · Blog · Contact. ("Join" is commented out — **restore it as a persistent CTA button.**)
- **Current behavior:** fixed "tubelight" pill — bottom icon dock on mobile, top pill on desktop (text labels only ≥1024px → **fix the 768–1023 label-less zone**), animated "lamp" glow under the active item. Fixed logo top-left, hamburger + drawer top-right on mobile. No scroll transformation. Active state = exact path match (**make it route-prefix aware** so `/events/[id]` highlights "Events").
- **Footer:** near-black, 3 columns (brand+socials / Navigation / Connect), columns hidden `<md`, SoundToggle, duplicated social links, no legal/newsletter. **Redesign as one themeable footer** with brand / nav / connect / legal / newsletter; accordion on mobile.
- **UXplosion nav/footer:** bespoke; keep the standalone outcome but restyle to the unified system's "campaign" variant.

### 2.3 Page hierarchy
```
Home ──► Join (primary conversion)
     ├─► About
     ├─► Events ──► Event detail
     │           └─► UXplosion 3.0 (campaign microsite → external Google Form)
     ├─► Blog (articles)
     └─► Contact
Join = Membership (Razorpay) + Recruitment wizard
Admin (separate, private)
```

---

## 3. Design system (existing → recommended)

### 3.1 Existing tokens (as built)
- Color: `--primary #d9202f`, `--primary-dim #b21725`, `--tertiary #7a1220`, surface ramp `#fefbfa…#e9d7d5`, `--outline-variant #e6d6d4`, `--on-surface #17181f`, `--on-surface-variant #5c5559`.
- Radius: `--radius: 0.625rem` (10px) + derived `sm…4xl`; **used inconsistently** (`lg`/`xl`/`2xl`/`3xl`/`[28px]`/`full`/`none`).
- Type utilities: `.type-display` (800, -0.04), `.type-heading` (700, -0.02), `.type-nav`, `.type-kicker` (10px, 0.2em, uppercase).
- Gradients: `.hero-gradient`, `.gradient-text`, `.hero-gradient-fill` (3 slightly different definitions).
- Containers: `.page-gutter` / `.section-shell` / inline `max-w-7xl` / UXplosion `max-w-[1180px]`.
- Shadows: all inline/ad-hoc; signature = red glow `0 0 20–40px rgba(217,32,47,.3–.4)`.

### 3.2 Recommended unified tokens
Full spec in **`SDC_UI_UX_AUDIT.md` §19**. Summary:
- **One color system**, light + dark, warm-neutral ramp kept, brand red kept, semantic tokens added, UXplosion gradient promoted to `--gradient-campaign` for an opt-in "event/campaign" theme.
- **Fluid type scale** (`clamp()`): `display-1/2`, `h1–h4`, `body-lg/body/body-sm`, `label` (min 12px), `kicker`.
- **Spacing:** `--space-section-y: clamp(3rem, 8vw, 6rem)`, one `--space-gutter`, one `--space-card`.
- **One container scale:** `--container: 80rem`, `--container-narrow: 45rem`, `--container-reading: 51rem`; add real `xl`/`2xl` layouts.
- **Radius:** `sm 6 / md 10 / lg 20 / xl 28 / pill 9999`; `none` only as explicit campaign choice.
- **Shadows:** `xs/sm/md/lg` + `--shadow-brand-glow` + `--shadow-campaign-glow`.
- **Components:** single `Button` (variants `primary|secondary|ghost|link|gradient|campaign`, sizes 36/44/52), single `Card` (`surface|glass|outline|campaign`), single `Field`, `Badge/Chip`, one `Nav`, one `Footer`, one `Dialog` (focus-trapped), one `Backdrop` (reduced-motion + off-screen aware), one `Stat` tile.
- **Icons:** the custom animated set is canonical; drop lucide + Material Symbols; add static fallbacks for reduced-motion.
- **Motion principles:** one entrance (`Reveal`: fade + 16–24px rise, 400–500ms, `cubic-bezier(0.22,1,0.36,1)`, once), ≤200ms hovers, `scale(.97)` press, scroll-linked only for storytelling + static fallback, ambient FX must stop on `prefers-reduced-motion` and `document.hidden`, sound opt-in/muteable/one-per-interaction.

---

## 4. Page specifications

> For each: **Purpose · Sections · Content hierarchy · Components · CTAs · Interactions · Responsive.**
> Section order below reflects the *current* build — keep the information architecture; improve the execution.

### 4.1 `/` Home
- **Purpose:** position SDC as an elite student-dev community; primary conversion → `/join`.
- **Sections (in order):** Hero → Campus Moments (horizontal photo strip) → Feature bento (6 cells: Master Modern Stacks / Elite Community / Hackathons / Mentorship / Events tile) → Stats band (4 tiles) → *(add: membership-benefits + testimonials/logos + closing CTA)* → Footer.
- **Content hierarchy:** wordmark "SDC SNIST" → tagline "Building the Future with Student Developers." → supporting line → 2 CTAs → social proof (moments, stats) → feature bento.
- **Components:** `Hero`, photo strip/carousel, `Card` (bento), `Stat` tile, `Backdrop` (matrix/aurora — one, reduced-motion aware), `Reveal`.
- **CTAs:** primary **Become a Member → `/join`**; secondary **Learn More → `/about`**; tertiary **View Events → `/events`**. Add a persistent nav CTA.
- **Interactions:** staggered hero entrance; pointer spotlight (desktop, fine pointer); `Reveal` per section; card hover lift + image scale; press feedback. Remove/redo the "Welcome {IP}" badge (surfacing the visitor's IP is odd).
- **Responsive:** hero centered `max-w` container; bento `1 col → 12-col grid @md`; stats `2 → 4 col`; moments = horizontal scroll on mobile; full-width stacked CTAs on mobile; add `xl`/`2xl` treatment.

### 4.2 `/about`
- **Purpose:** credibility — who SDC is, why it exists, its scale, its partners, its people.
- **Sections:** Hero (OUR STORY) → Mission + Vision (2 cards) → Founding Story → Impact stats (3) → Partners (logo marquee) → Team → *(add closing CTA band)*.
- **Content hierarchy:** kicker → "About SDC SNIST" H1 → subtitle → mission/vision → origin narrative → numbers → partners → people.
- **Components:** `Card` (glass), `Stat` tile (share component with home — reconcile the numbers), logo marquee (reduced-motion aware), team grid (replace GSAP stacked cards *or* keep with a static fallback), `Reveal`.
- **CTAs:** currently **none** — add "Become a Member" / "See our events".
- **Interactions:** `Reveal`; marquee (pause on `prefers-reduced-motion`); team hover.
- **Responsive:** 2-col → 1-col for mission/vision; stats 3 → 1; keep prose `max-w-3xl`.
- **Must fix:** placeholder team (fake names/bios) and partner logos — real or removed.

### 4.3 `/blog`
- **Purpose:** owned narrative + SEO surface (history, founder, recaps, membership value).
- **Sections:** Featured post → Category filter pills (`all/community/event/growth/digital/article`) → Card grid → Article view.
- **Content hierarchy:** featured (image + title + excerpt + meta + CTA) → filters → grid of `BlogCard` (category badge, title, meta, excerpt, "Read Article").
- **Components:** `BlogCard`, filter `Chip` group (`aria-pressed`), **new `/blog/[slug]` article pages** (server-rendered, shareable) + optional quick-view `Dialog` (focus-trapped, ESC, focus restore) — not modal-only.
- **CTAs:** "Read Article"; add on-article "Become a Member" + related posts + share.
- **Interactions:** filter transitions; card hover spring; article route transition.
- **Responsive:** featured `12-col split @lg`; grid `1 → 2 → 3`; article readable `max-w`.
- **Content model (keep):** blocks `{ title?, paragraphs?, bullets?, quote? }`. Add author, date, tags, cover-image aspect standard.

### 4.4 `/contact`
- **Purpose:** inbound — questions, collabs, speaker proposals.
- **Sections:** Left = intro + social link cards (Instagram / LinkedIn / GitHub) + "become a member" link. Right = message form card.
- **Content hierarchy:** kicker → "Contact Us" H1 → paragraph → social cards → form (name / email / message).
- **Components:** `Field` (shared), `Button`, `Card` (glass), social link cards.
- **CTAs:** **Send Message**; secondary → social + `/join`.
- **Interactions:** fade-up entrance; form loading/error/success states with **`aria-live`**; progress sound during submit.
- **Responsive:** `2-col @lg` → stacked.
- **Add:** category select (question / partnership / speaker), optional phone/location, response-time expectation.
- **Preserve:** POST `/api/contact` + validation rules + `contact_messages` storage.

### 4.5 `/events`
- **Purpose:** browse events + show community growth.
- **Sections:** Hero (count + "Browse Events") → `EventsPulseChart` (cumulative attendees) → Filter bar (search + mode `ALL/ONLINE/OFFLINE/HYBRID`) → Event card grid → Join CTA band.
- **Content hierarchy:** hero headline → growth proof → filters → cards (sorted date desc, `TBD` last) → convert.
- **Components:** `Hero`, chart (keep the area chart; consider `dynamic()` import), `Field` (search) + `Chip` toggles (`aria-pressed`), `EventCard`, empty state, CTA band.
- **CTAs:** "Browse Events" (anchor); per-card **Details** + **Register**; "Become a Member".
- **Interactions:** `AnimatePresence` list + `@starting-style` card enter/exit (keep — it's good); chart draw-in; card hover lift + reveal-register chip (hover/focus, fine-pointer only).
- **Responsive:** grid `1 → 2 → 3`; filter bar wraps; chart `aspect-ratio` scales.
- **Preserve:** Supabase→static fallback; lifecycle/countdown/sort/related logic.

### 4.6 `/events/[id]`
- **Purpose:** full event info + registration.
- **Sections:** Image hero (category, title, date/time + location pills) → About (long/short description, tags, "what you'll learn", "who should attend") + sticky Details sidebar → Agenda **or** Speaker → Gallery → Register band (if not past) → Related events.
- **Content hierarchy:** title → key facts (sidebar) → narrative → agenda/speaker → proof (gallery) → register → related.
- **Components:** `EventHero`, `EventDetails` (icon rows), `EventAgenda` / **upgraded `EventSpeaker`** (photo, title, org, links — match UXplosion quality), `EventGallery` (lightbox via shared `Dialog`), `EventRegisterButton`, `EventCard` (related).
- **CTAs:** **Register / Secure Your Spot** — **make the label reflect the actual path** ("Register on Google Form ↗" / "Pay & Register ₹X" / "Join to Register").
- **Interactions:** sticky sidebar; register modal (focus-trapped); gallery lightbox.
- **Responsive:** `lg:flex-row` 2/3 + 1/3 → stacked; sidebar un-sticks.
- **Preserve:** `generateMetadata`, `notFound()`, register branching, `[id]` = slug or numeric id, `id 17 → /events/uxplosion3.0` override.

### 4.7 `/events/uxplosion3.0`
- **Purpose:** flagship UI/UX bootcamp + hackathon campaign; drive Google-Form registration.
- **Sections:** Nav → Hero (wordmark assembly, highlights, dates) → About "design journey" (01 Learn/02 Explore/03 Design/04 Build) → Essentials (Duration 3 Days / Team 2–3 / Format Bootcamp+Hackathon) → Timeline (Day 01–03 + Finale Sept 27) → Hackathon (scroll ring, 8 phases, 5 facts) → Speaker (Madhu Pilli) → Archive (past editions → `/events/8`, `/events/4`) → Sponsors marquee → FAQ (9) → Pricing (₹99 / ₹199 / ₹319 combo) → Contact (3 organizers + `mailto:Sdc@sreenidhi.edu.in`) → Footer.
- **Content hierarchy:** wordmark → what/when → the experience → logistics → the day → speaker/proof → FAQ → price → register.
- **Components:** campaign-variant `Nav`/`Footer`/`Button`/`Card`, `Backdrop` (particles), scroll-progress ring, accordion (via shared primitive), marquee.
- **CTAs:** **Register Now → Google Form** (currently ~6×; keep prominent but add an on-site "you're registered / what's next" step after return).
- **Interactions:** hero particle assembly (reduced-motion → instant), scroll-pinned hackathon ring (keep static fallback), hairline-row hovers, nav blur-on-scroll. **This page's reduced-motion handling (`.ux-page * { animation:none }`) is the model — replicate site-wide.**
- **Responsive:** `max-w-[1180px]`; play panel + decorative strips hidden `<900px`; nav → burger `<860px`.
- **Fix:** "four-day" vs "3-day" copy; pricing vs site-membership (₹199/yr) mismatch; render `UxplosionTeams` or delete it.
- **Preserve:** standalone chrome/theme; archive links; external form.

### 4.8 `/join`
- **Purpose:** paid membership + team recruitment.
- **Sections:** Membership (`#membership`: `BecomeMemberForm`) → Recruitment wizard (`roles → apply → challenge → done`).
- **Content hierarchy:** **frame the two paths** (what's the difference, which first) → membership benefits → pay → recruitment lanes → apply.
- **Components:** `Field` (shared), `Button`, `Card`, wizard/stepper, role cards (5: Documentation / Designing / Tech Team / Organizing / Publicity), success components.
- **CTAs:** **Pay ₹199 with Razorpay** (shows price ✅); per-role **Apply**; wizard **Unlock challenge / Submit challenge**.
- **Interactions:** wizard step transitions; form validation with `aria-live`; success = member ID card (membership) / "you're in the pipeline" (recruitment).
- **Responsive:** membership `max-w-3xl`; role cards `1 → 2 → 3`.
- **MUST FIX (functional):** recruitment "done" claims "we saved your application" but **makes no API call** — add `/api/recruitment` → Supabase table + `/admin` view + confirmation email. Fix heading order (page `h1` currently sits below an `h2`).
- **Preserve:** Razorpay membership flow, 12-digit member ID, cohort year.

### 4.9 `/admin/*`
- **Purpose:** internal event/member/message management.
- **Sections:** header nav (Events / Members / Messages / View site) → tables / forms.
- **Components:** `Table` (add horizontal scroll wrapper — Members has 7 columns), `EventForm`, `Button`, status `Badge`, card list (messages).
- **Interactions:** CRUD; delete confirmation (`DeleteEventButton`); sign out.
- **Responsive:** **currently not responsive** — wrap tables, stack on mobile.
- **Preserve:** Supabase auth + `profiles.role` check, middleware, `noindex`, all queries.

---

## 5. Component checklist for the redesign

Build these once (see `SDC_COMPONENT_INVENTORY.md` §9 and `SDC_UI_UX_AUDIT.md` §19):

- [ ] `Nav` (one — merges site `Navbar`/tubelight + `UxplosionNav`; mobile bottom dock + lamp kept; persistent Join CTA; labels from `md`; route-prefix active)
- [ ] `Footer` (one — themeable; brand / nav / connect / legal / newsletter; mobile accordion; fixed contrast)
- [ ] `Button` (variants + sizes; consistent radius + casing; brand glow on primary; focus-visible ring)
- [ ] `Card` / `Surface` (replaces `ui/card` + `.glass-card` + ad-hoc + `GlassCards` shell + UXplosion cards)
- [ ] `Field` / `TextInput` / `Textarea` (replaces the 4 copy-pasted `inputClass` strings; label + hint(`aria-describedby`) + error(`aria-live`))
- [ ] `Dialog` (focus trap + restore + ESC + `aria-modal`; used by blog quick-view, event register, mobile menu, gallery lightbox)
- [ ] `Chip` / `Badge` / `Toggle` (`aria-pressed`; variants neutral/brand/success/live/warning)
- [ ] `Stat` tile (one component; single source for the numbers)
- [ ] `Backdrop` (variants: none/dots/matrix/aurora/particles; rAF not setInterval; `IntersectionObserver` + `visibilitychange` pause; reduced-motion off)
- [ ] `Reveal` (keep; make it the only scroll-entrance)
- [ ] `SectionShell` (one container/gutter/rhythm system)
- [ ] `EventCard`, `BlogCard`, `Speaker`, `Timeline`, `Accordion`, `Marquee`, `Stepper` (dedupe)
- [ ] Icon system: standardize props (`size`, `strokeWidth`, `color`, `title`, `motion`); static fallback per icon
- [ ] Empty / loading (skeleton) / error state set

---

## 6. Motion & accessibility requirements

- **Reduced motion:** every ambient/scroll/entrance animation must have a static state under `prefers-reduced-motion`. Currently 5 site-side offenders ignore it (matrix canvas, ambient CSS drift, partner marquees, kinetic orbs, GSAP stacks). UXplosion does it right — mirror that.
- **Focus:** visible `:focus-visible` on **every** interactive element (many hand-rolled CTAs have none). Modals trap + restore focus. Route changes move focus to `<h1>` / announce.
- **Live regions:** `aria-live="polite"` on all form success/error banners.
- **Toggles:** `aria-pressed` on filter/mode/category buttons.
- **Contrast:** meet WCAG AA — fix footer `white/30` (~2.7:1), UXplosion `#7A7278` on `#0A0A0C` (~3.9:1), small primary-red labels; `label` type min 12px.
- **Touch targets:** ≥ 44px for pills, close buttons, footer links.
- **Headings:** one `h1` per page, logical order (fix `/join`, `/blog`, home bento).
- **Semantic HTML:** `<main>`, `<nav>`, `<header>`, `<footer>`, `<section>` with headings, `<button>` vs `<a>` correctly.

---

## 7. Performance guardrails

- One animation library (both `motion` and `framer-motion` are installed).
- `dynamic()` the heavy client chunks (charts, GSAP section, UXplosion scroll sections).
- One font-loading path (`next/font`); drop the raw `@import` in `globals.css` and the unused Material Symbols `<link>`; subset weights.
- All images via `next/image` with `sizes`; host partner/sponsor logos locally as SVG; standardize aspect ratios; fix the homepage remote `<img>`.
- `Backdrop` FX: rAF, pause off-screen and on hidden tab, blur budget.
- Either wire `@number-flow/react` into the stat tiles or remove it.
- Clean `public/` (Next starter SVGs, `*copy*` assets, duplicated `about/` static site) and repo root (`design.pdf`).

---

## 8. What "good" looks like (acceptance)

1. A visitor moving `/` → `/events` → `/events/uxplosion3.0` experiences **one brand** (UXplosion may be a darker, more energetic *mode* of it — clearly the same family).
2. Every CTA that means "join" says the same thing and looks the same; every "register" tells you what will happen.
3. All numbers on the site agree and are believable.
4. `/about` shows real people and real partners (or omits the section).
5. Submitting the recruitment form stores the application and shows an honest confirmation.
6. Keyboard + screen-reader users can complete: join, register for an event, send a contact message, read a blog article, navigate.
7. `prefers-reduced-motion` yields a calm, fully-usable site with no infinite background motion.
8. Lighthouse: no CLS from fonts/hero/images; ambient FX don't tank mobile FPS.
9. All routes, redirects, Supabase reads, Razorpay flows, admin auth, and the UXplosion Google-Form path still work.
10. One documented token set; no inline hex in components.
