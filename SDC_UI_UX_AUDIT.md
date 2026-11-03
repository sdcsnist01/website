# SDC Website — Complete UI/UX Reverse-Engineering Audit

> **Phase: ANALYSIS ONLY. No code was modified.**
> Single source of truth for a future redesign. Companion files:
> `SDC_ROUTE_MAP.md`, `SDC_COMPONENT_INVENTORY.md`, `SDC_DESIGN_HANDOFF.md`.
> Everything below is traced from source, not filenames. Uncertain items are marked `UNVERIFIED`.

---

## 1. Codebase & architecture

| Area | Finding |
|------|---------|
| **Framework** | Next.js **16** (`next` resolved 16.3.3; `package.json` pins `^16.2.2`). App Router, React Server Components, `reactStrictMode`, `poweredByHeader:false`. `optimizePackageImports: ["motion"]`. `next dev` auto-writes the `AGENTS.md` warning block. |
| **Language** | TypeScript 5, `@types/react` 19. |
| **Rendering** | Mostly RSC. Client components: all interactive sections (`"use client"`), all `Uxplosion*`, forms, nav, charts. `/events` + `/events/[id]` are async server components hitting Supabase. `/admin/messages` is `force-dynamic`. |
| **Routing** | File-system (`src/app`). Dynamic: `/events/[id]`, `/admin/events/[id]/edit`. Redirects: `*.html → clean` (about, blog). Middleware only on `/admin/:path*`. |
| **Styling** | **Tailwind CSS v4** (`@import "tailwindcss"` in `globals.css`, `@tailwindcss/postcss`). No `tailwind.config.js` — config is CSS-first via `@theme inline { … }`. Plus `tw-animate-css`, `shadcn/tailwind.css`. `class-variance-authority` + `clsx` + `tailwind-merge` (`cn()` in `src/lib/utils.ts`). |
| **Design tokens** | CSS custom properties in `:root` (Material-3-style surface ramp + red brand) **and** a parallel set of shadcn neutral `oklch` tokens (`--background`, `--foreground`, `--card`, `--muted`, `--chart-*`, `--radius`). The two systems overlap and partly conflict. |
| **Theme** | `<html class="dark">` is hard-coded, but the palette rendered is a **light** theme (warm off-white surfaces). The `.dark` block mostly re-declares the same light values. There is **no working dark mode** and no theme toggle. `marketing-pages.css` has a `@media (prefers-color-scheme: dark)` rule for a `.modal-panel` that may never mount. |
| **Fonts** | `next/font/google`: **Inter** (body, `--font-inter`, 300–700), **Manrope** (headings, `--font-manrope`, 200/400/700/800), **Geist** (`--font-sans`, used as `--font-heading`/`--font-sans` in `@theme`). Also a raw `@import` of Manrope+Inter at the top of `globals.css` (**duplicate load**). Material Symbols via `<link>` (unused). UXplosion page loads **Space Grotesk + Manrope + Baloo 2** separately. |
| **Icons** | ~60 hand-built animated `motion.svg` components (`src/components/ui/*-icon.tsx`); `lucide-react` configured but unused; emoji + `✳` in UXplosion; Material Symbols dead. |
| **Images** | `next/image` for most; `unoptimized` for partner SVGs + `ui-avatars`; one plain `<img>` from `lh3.googleusercontent.com` on the homepage (eslint-disabled). `next.config` only allows remote images from `*.supabase.co/storage/...`. |
| **Video** | `public/videos/join-community-bg.mp4` referenced **only in commented-out** home CTA. Not currently used. |
| **Animation libs** | `motion` / `framer-motion` 12 (both installed), `gsap` + `ScrollTrigger`, CSS keyframes, canvas. |
| **Charts** | `@visx/*` + `d3-array` + `d3-shape` + `@number-flow/react` — a large self-contained "Bklit" chart system (`src/components/charts/**`, ~70 files). Only the area chart is used (Events pulse). |
| **Data / CMS** | Supabase (`events`, `sdc_members`, `contact_messages`, `profiles`) with **static TS fallback** (`src/data/*.ts`). No headless CMS. Team/partner/stat content on `/about` is placeholder. |
| **Payments** | Razorpay (server SDK + on-demand checkout script). ₹199 membership, per-event fees. |
| **Forms** | Native `<form>` + `fetch` to `/api/*`. No form library. |
| **External** | Supabase, Razorpay, Google Fonts, Google Forms (UXplosion reg), ui-avatars.com, googleusercontent (1 image). |
| **Repo cruft** | `design.pdf` (2.6 MB), `about/` + `public/about/` static HTML/CSS/JS duplicated, `community-pulse.json` (232 KB), `src/app/community/page.disabled.tsx`, `*copy*.png/svg` in `public/`. |

### Project structure

```
src/
  app/                     route tree (home, about, blog, contact, events, events/[id],
                           events/uxplosion3.0, join, community(disabled), admin/*, api/*)
  components/
    ui/                    ~60 animated icons + button, card, avatar, tubelight-navbar,
                           glass-cards, trail-card, InteractiveBackground, AmbientBackground …
    home/  events/  blog/  membership/  recruitment/  uxplosion/  admin/  ux/  charts/  animate-ui/
    Navbar.tsx  Footer.tsx  SiteChrome.tsx  ContactForm.tsx  shimmering-text.tsx
  data/                    about.ts  blog.ts  events.ts  recruitment.ts   (static content)
  lib/                     supabase/*  events-service.ts  events-db.ts  event-status.ts
                           membership.ts  member-id.ts  razorpay.ts  ux-sound.ts  utils.ts
  hooks/                   usePrefersReducedMotion  useRevealOnScroll  useScrollProgress
                           useUxSound  useResolvedIconLoop
  styles/                  uxplosion.css   marketing-pages.css
  types/                   about  blog  events  razorpay.d
```

---

## 2. Route inventory

See **`SDC_ROUTE_MAP.md`** for the full table. Summary:

| Route | Status |
|-------|--------|
| `/` | Live |
| `/about` | Live (placeholder team/partner/stat content) |
| `/blog` | Live (modal reader, no `[slug]` route) |
| `/contact` | Live |
| `/events` | Live (Supabase → static fallback) |
| `/events/[id]` | Live (dynamic) |
| `/events/uxplosion3.0` | Live (standalone microsite, own chrome/theme) |
| `/join` | Live (membership pay + recruitment wizard) |
| `/community` | **Disabled** (`notFound()`) |
| `/admin`, `/admin/login`, `/admin/events(+/new,/[id]/edit)`, `/admin/members`, `/admin/messages` | Live, private |
| `/api/contact`, `/api/membership/*`, `/api/razorpay/*` | Live |

No: services, products, solutions, careers, case-studies, resources, or legal (privacy / terms) pages.

---

## 3. Page-by-page extraction

### 3.1 HOME `/`

**Purpose:** Establish SDC SNIST as an elite student-developer community; push visitors to `/join` (and secondarily `/about`, `/events`).
**Audience:** SNIST students (and peer colleges), prospective members, event-goers.

**Structure (top → bottom):**
1. Fixed logo (top-left) + hamburger (top-right, mobile) — from `Navbar`
2. Tubelight nav (bottom dock mobile / top pill desktop)
3. Fixed canvas background (`InteractiveBackground`) + 2 `ambient-glow` blobs
4. **Hero** (`HomeHero`)
5. **Campus Moments** horizontal photo strip
6. **Feature bento** — 6-cell `md:grid-cols-12` grid
7. **Stats band** — 4 glass stat cards
8. *(commented out)* "Join the Community" video CTA
9. Footer

**Hero:**
- Kicker badge: pulsing dot + static `Welcome to SDC SNIST`. *(Previously `Welcome {clientIp}`, a server-derived visitor IP read from request headers. Privacy finding resolved: the IP lookup was removed and the badge no longer exposes visitor IPs.)*
- H1: `SDC` + gradient `SNIST`, `.type-display`, italic, `text-[15vw]` → `md:text-8xl lg:text-9xl`.
- H2: "Building the Future with Student Developers." (`text-2xl → md:text-5xl`, `on-surface-variant`).
- Paragraph: "Innovate, Collaborate, and Elevate…" (`opacity-80`).
- CTAs: **Get Started** (`.hero-gradient-fill`, rounded-xl) → `/join`; **Learn More** (outline) → `/about`. Full-width stacked on mobile, row on `sm+`.
- Background: `HeroSpotlight` pointer glow (desktop) + faint 40px radial dot pattern (`opacity-.03`).
- Alignment: centered, `max-w-6xl`.
- Animation: `framer-motion` staggered fade-up (delays 0 / .08 / .16 / .24 / .32), gated by `useReducedMotion`. Bottom "Explore" scroll cue (desktop, fades in at .7s).
- Hierarchy: display wordmark dominates; tagline second; CTAs third.

**Campus Moments:** kicker "On campus" + H2 "Moments from the floor" + "All events →" link. Horizontal `overflow-x-auto` strip of 6 `motion.figure` cards (LaunchPad ×4, HackWithHyd, Vibe Code), `h-44 w-[72vw]` → `md:h-64 w-96`, image `group-hover:scale-105`, bottom gradient + caption. `whileInView` stagger. No snap.

**Feature bento (6 cells):**
| Cell | Content | Style |
|------|---------|-------|
| col-7 | "Master Modern Stacks" (h3) + copy | `bg-surface-container-low`, faint cyberpunk server `<img>` at `opacity-20`, terminal icon chip |
| col-5 | "Elite Community" (h3) + copy | `bg-surface-container-highest`, users icon |
| col-4 | "Hackathons" (h4) + copy | `bg-surface-container border-black/4`, party-popper icon |
| col-4 | "Mentorship" (h4) + copy | same, library icon |
| col-4 | "Events" link tile | `bg-primary` solid red, white blur orb, "View Events →" |
Grid: `h-auto` mobile → `md:h-[600px]`. `Reveal` per cell with increasing delays. Hover: border tint + icon-chip border brighten + image scale.
**Heading-level issue:** cells use `h3`/`h4` with no section `h2`.

**Stats band:** `bg-surface-container-low/30`. `grid-cols-2 → md:grid-cols-4`. Each: `.glass-card`, radial glow (per-stat `glow`), big `font-black tracking-tighter` number in inline accent color, hairline gradient divider, uppercase label. Hover `-translate-y-0.5`.
Values: **50k+ Members · 120+ Events · 45 Chapters · 1M+ Lines of code** — inline hex accents `#d9202f / #b21725 / #8c0f1c`. (These are *not* animated counters despite `@number-flow` being installed.)

---

### 3.2 ABOUT `/about`

**Purpose:** Credibility — mission, vision, origin story, scale, partners, team.
**Audience:** prospective members, partners, faculty, press.

**Structure:**
1. `AmbientBackground` (dot grid + drifting blobs)
2. **Hero** — kicker "OUR STORY", H1 "About SDC **SNIST**" (last word gradient), subtitle, hairline + italic line "Engineering excellence through radical collaboration."
3. **Mission + Vision** — 2 `.glass-card` articles (`rounded-3xl`, `p-6 → p-12`), icon chip (rocket / eye), h3, body. Hover border tint.
4. **Founding Story** — centered `max-w-3xl`, H2, gradient rule, one paragraph ("Founded in 2021…").
5. **Impact stats (3)** — `.glass-card rounded-3xl`, huge `text-5xl → md:text-7xl font-black` numbers, hairline, uppercase label. Values: **50+ Events Hosted · 5000+ Students Reached · 120+ Workshops Conducted**.
6. **Partners** — "Supported by Industry Titans" + hairline; two CSS marquees (`partner-marquee-track` 32s / `--reverse` 38s), `partner-pill` (`h-14 min-w-36`, `surface-container-high`, `outline-variant` border), logos `grayscale opacity-60`, `unoptimized`. 10 partner SVGs, split in half, each row repeated ×4.
7. **Team** — `<GlassCards />`: dark `#0a0a0a` block, 3 GSAP scroll-pinned conic-glass cards (Board / Tech Leads / Core Members), each 100vh sticky, `scrub` scale-down. Avatars via `ui-avatars.com` + hover tooltip. **All names/roles/bios are fake stubs.**

**Responsive:** mission/vision `grid-cols-1 → md:grid-cols-2`; stats `grid-cols-1 → md:grid-cols-3`; big vertical rhythm (`mb-20 → md:mb-32`).
**Notes:** `pt-28 → sm:pt-32` to clear the fixed nav. The dark team block is a jarring theme break mid-page.

---

### 3.3 BLOG `/blog`

**Purpose:** Owned narrative — history, founder, event recaps, membership value.
**Audience:** prospective members, community, SEO visitors.

**Structure:**
1. `AmbientBackground`
2. **Featured post** — `lg:grid-cols-12`: left 7 = `aspect-[16/9]` image button ("Featured" badge, hover scale), right 5 = category kicker, H1 = post title, excerpt, date · readTime, "Read Article →" button. Clicking opens the modal.
3. **Category filter** — horizontal scroll pills (`all/community/event/growth/digital/article`), active = `bg-primary text-white`. Bottom border.
4. **Card grid** — `grid-cols-1 → md:2 → lg:3`, `BlogCard` per non-featured post.
5. **Article modal** — fixed overlay, `bg-black/70 backdrop-blur`, bottom-sheet on mobile (`items-end`, `rounded-t-2xl`) / centered card on `sm+`. Cover image + "Close" pill, H2 title, `date · readTime`, then content blocks (`title` h3 / `paragraphs` / `bullets` / `quote` = left-border blockquote). Click-outside + button close. No focus trap, no history entry, no deep link.

**Content:** 7 posts in `blogPostsStub`, dates Apr 2025 – Mar 2026. Cover images are WhatsApp exports + logo files (low quality, inconsistent aspect).
**Issues:** no per-article URL (bad for sharing/SEO); modal not keyboard-accessible (no ESC handler, no focus management); featured card is a `<button>` wrapping an image with no visible text alternative on the image itself.

---

### 3.4 CONTACT `/contact`

**Purpose:** Inbound — questions, collabs, speaker proposals.
**Audience:** students, partner orgs, potential speakers.

**Structure:** `lg:grid-cols-[1fr_1.15fr]`.
- **Left:** kicker "Get in touch", H1 "Contact **Us**", paragraph, 3 social link cards (Instagram / LinkedIn / GitHub — label + hint + external-link icon, hover lift + border tint), "Or become a member →" link. All `motion` fade-up (`fadeUp` custom variant, staggered).
- **Right:** `.glass-card rounded-3xl` with heavy shadow — H2 "Send a message", reassurance line, `ContactForm` (name / email / message; `md:grid-cols-2` with message full-width; uppercase micro-labels; `min-h-40` textarea). Submit → `/api/contact`. Loading spinner, error banner (`text-red-300`), success card ("Message sent" + "Send another" / "Become a Member").
**No:** phone number, address, map, office hours, form category selector, file upload.

---

### 3.5 EVENTS `/events`

**Purpose:** Browsable event catalogue + growth proof.
**Audience:** students deciding whether to attend / register.

**Structure:**
1. `AmbientBackground`
2. **Hero** (`EventsHero`) — kicker (sparkles + "N experiences · campus & beyond"), H1 "SDC SNIST Events" (`hero-gradient` clip, `text-4xl → lg:text-8xl`), paragraph, **Browse Events** button (anchor `#events`). Floating blurred blob (motion loop).
3. **Pulse chart** (`EventsPulseChart`) — `.glass-card rounded-3xl`, kicker "Community pulse" + H3 "Cumulative attendees" + "powered by Bklit charts" caption. visx area chart, red fill/stroke, 1200ms animate, custom grid/x-axis/tooltip. Cumulative sum of `attendees` over dated events.
4. **All events** — kicker + H2 "Our Events" + "N EVENTS" pill.
5. `EventsSection`: `FilterBar` (search input + `ALL/ONLINE/OFFLINE/HYBRID` toggle pills) → count row + "Sorted by Date" → `grid-cols-1 → md:2 → lg:3` of `EventCard` in `AnimatePresence mode="popLayout"` with CSS `@starting-style` entrance. Empty state: dashed card + reset button.
6. **Join CTA** (`EventsJoinCta`) — `.glass-card` band, H2 "Join the community.", "Become a Member →" → `/join`.

**EventCard anatomy:** `rounded-2xl`, 224px image header (`next/image` or gradient fallback) with mode badge + status badge (top-left), hover-reveal "Register Now" chip (top-right, `@starting-style`, hover/focus only on fine pointers), optional countdown chip, title overlay (`line-clamp-2`, Manrope). Body: date + location row, speaker row, hairline, Attendees / Duration stats, optional winner chip, then "Details" (outline→red fill on hover) + "Register Now" (solid red). `motion` hover lift `y:-8`, tap `scale:.985`, mode-tinted gradient wash on hover.
**Sorting:** date desc; `TBD` sinks to bottom. Filter is client-side over title/description/speaker + mode.

---

### 3.6 EVENT DETAIL `/events/[id]`

**Purpose:** Full info + registration for one event.
**Structure:**
1. `EventHero` — full-bleed image, dark bottom gradient, category kicker, H1 title (`text-4xl → md:6xl`), date·time + location pills.
2. Body `lg:flex-row`:
   - **Left 2/3:** H2 "About this Event" (gradient clip), `longDescription || description` split on `\n\n`, tag chips (`#tag`), "What you will learn" (ul), "Who should attend" (ul).
   - **Right 1/3:** sticky `EventDetails` aside (`surface-container-highest rounded-3xl`) — icon rows for Date / Time / Location / Mode / Event Type / Speaker / Duration, then `EventRegisterButton`.
3. `EventAgenda` (if `agenda`) — `bg-surface-container-low/60`, H2 "Sessions & Speakers", time-chip + title + description rows. **Else** `EventSpeaker` (if `speaker`) — H2 "Speakers", one centered card with the speaker string + gradient rule.
4. `EventGallery` (if `galleryImages`) — H2 "Event Gallery" (gradient clip), `grid sm:grid-cols-2` of `aspect-[4/3]` images.
5. Register band (if `!isPast`) — gradient `#b21725→#d9202f`, H2 "Register for this Event", copy, `EventRegisterButton` ("Register Now", white pill).
6. Related events (if any) — H2 "Related Events", 3 `EventCard`s (same category or mode).

**`EventRegisterButton` logic:** past → nothing; paid (`requiresPayment` & fee>0) → "Register · ₹X" opens modal (name/email/phone) → Razorpay → verify; external `registrationUrl` → new-tab link; otherwise → `/join` ("… — Become a Member").
**Issues:** `EventSpeaker` just prints a comma-joined string, no photo/bio/links (contrast with the rich UXplosion speaker section). Agenda "time" values are often labels ("Speaker Session"), not times.

---

### 3.7 UXPLOSION 3.0 `/events/uxplosion3.0`

**Purpose:** Standalone campaign landing for the flagship UI/UX bootcamp + hackathon; drive Google-Form registrations.
**Audience:** SNIST students (all branches/years), beginners welcome.
**Theme:** its own world — near-black `#0A0A0C`, Space Grotesk / Baloo 2, pink→coral→orange gradient (`#FF2F7D → #FF5368 → #FF8A45`), `#FF6FA8` accent, `#8C5CF6` secondary. Bypasses global `SiteChrome`.

**Structure (`UxplosionLanding`):**
1. Fixed particle canvas (`UxplosionParticles`) + solid bg layer
2. `UxplosionNav` — SDC logo, links (Timeline / Experience / FAQ), gradient "Register Now" pill, burger + full-screen menu; blur + border appear after `scrollY > 8`
3. **Hero** — "✳ SDC Presents", bubble-letter wordmark **UXplosion** + floating **3.0** (particle-assembly reveal via canvas + `heroTextAssembly.ts`, `document.fonts.ready` gated, reduced-motion → instant), pills ("Bootcamp + Hackathon", "3-Day Bootcamp"), one-line pitch, highlights card (🏆 ₹10,000 Prize Pool · 💼 Internship Opportunities · 🎁 Exciting Goodies), CTAs (Register Now / View Timeline), event info (Bootcamp Sept 22–24 Online · Hackathon Sept 27 Offline SNIST). Decorative "play panel" (wireframe/prototype/flow-line SVG, staggered, hidden `<900px`).
4. **About / "A design journey"** — kicker "The UXplosion Experience", H2 "More than a bootcamp. / A design journey." (2nd line gradient), copy, right column = animated vertical progress line + 4 steps (01 Learn / 02 Explore / 03 Design / 04 Build). Faint 110px grid bg with radial mask.
5. **Essentials** — H2 "The essentials.", 3 cards: Bootcamp Duration **3 Days**, Team Size **2–3 Members**, Format **Bootcamp + Hackathon**.
6. **Timeline** — kicker "The Journey", H2 "One week. / One design journey.", 3 hairline day rows (big ghost number, "Day 0N" label, session title, topic question, date/time/mode, hover → gradient text + `translateX(8px)`), then **Finale** card ("Hackathon", Sept 27, 9:00 AM–7:30 PM, Offline · SNIST, buses provided, teams 2–3 segregated later).
7. Hairline rule
8. **Hackathon** (`UxplosionHackathon`) — `height: 400vh` scroll section; sticky `grid lg:grid-cols-2`: left = phase copy (8 phases: Start → Ideate → Build → Iterate → Refine → Test → Polish → Present) blur/slide-swapped by scroll progress + a progress hairline; right = SVG progress **ring** (stroke-dashoffset driven by `useScrollProgress`) with 8 radial phase labels and a centered `08H` gradient numeral + current phase; below = 5 fact cells (8 hours / 9 AM–7:30 PM / On campus / Buses provided / Team-based). Animated grid + breathing glow bg.
9. **Speaker** — kicker "Guest Speaker", `md:grid-cols-[300px_1fr]`: square gradient-framed photo (`/speaker.jpeg`), H2 "Madhu Pilli", role "AI Product & Design Expert", bio, Instagram / LinkedIn links.
10. **Archive** — kicker "Archive", H2 "Every edition so far.", a "Live" callout card ("UXplosion Season 3 — Happening Now", Register Now), then 2 hairline rows linking to `/events/8` and `/events/4` (real past editions from `EVENTS`).
11. **Sponsors** — "✳ Backed by", custom RAF marquee (`requestAnimationFrame`, pause on hover, arc lift+scale per item) of 2 sponsors (UI/UX Hyderabad, GoTogetherRides — LinQ), repeated ×4, edge mask.
12. Hairline rule
13. **FAQ** — kicker "FAQ", H2 "Questions, answered." (2nd word gradient), 9 accordion rows (`+`/`×` sign morph, `AnimatePresence` height). ⚠️ FAQ copy says "**four-day** bootcamp" / "four evenings" while Timeline + Essentials + hero say **3 days / Sept 22–24**.
14. **Pricing** (`#register`) — kicker "Pricing", H2 "One pass. / Bootcamp + hackathon.", 3 `rounded-none` tiers on `grid-cols-2 → md:grid-cols-3`: **SDC Members ₹99/participant**, **Non-Members ₹199/participant**, **SDC Membership + Pass ₹319** (emphasized, feature list, "Best Value", "Limited time offer"). All CTAs → the Google Form. ⚠️ Site membership elsewhere is **₹199/year**; combo math (99+199=298 ≠ 319) is unexplained; hero says prize/goodies but pricing focuses on membership bundle.
15. **Contact** — kicker "Contact", H2 "Talk to the organizers.", 3 organizer rows (name / "Organizer" / `tel:` link — Srikanth Kesani, Suchitha, Sharan), fallback `mailto:Sdc@sreenidhi.edu.in`.
16. `UxplosionFooter` — "✳ SDC — UXplosion 3.0" + `© {year} Student Developers Community, SNIST`.

**Responsive:** container `max-w-[1180px]`; play panel + strips hidden on small; timeline/hackathon reflow to stacked; nav → burger `<860px`. `@media (prefers-reduced-motion) .ux-page * { animation:none; transition:none }` — strongest reduced-motion handling in the codebase.
**Unused:** `UxplosionTeams.tsx` (50 team names) is not rendered.

---

### 3.8 JOIN `/join`

**Purpose:** Convert to paid membership **and** recruit for teams.
**Structure:**
1. `AmbientBackground`
2. **Membership** (`#membership`) — kicker "Membership", H2 "Become a Member", copy ("… 12-digit member ID … {year} membership for ₹199/year"), `BecomeMemberForm` (`.glass-card`; fullName / rollNumber / phone / email; "Pay ₹199 with Razorpay"; success = mono member ID + "Class of YYYY").
3. **RecruitmentFlow** — 4-step wizard with a progress rail:
   - **roles:** kicker "Recruitment", H1 "Pick your **lane**", 5 role cards (Documentation / Designing / Tech Team / Organizing / Publicity) — each: accent color, icon chip, tagline, title, description, 3 responsibilities, "Apply" button.
   - **apply:** back link, "Applying · {role}", H2 "Tell us about you", `.glass-card` form (fullName / rollNumber / yearBranch / email / phone / "Why this role?" ≥40 chars), "Unlock challenge".
   - **challenge:** "Challenge unlocked" badge, role-specific prompt + hint, choice buttons and/or `font-mono` textarea, "Submit challenge".
   - **done:** check icon, "You're in the {role} pipeline", "we saved your application…" (⚠️ **nothing is persisted**), "Explore other roles" / "Become a paid member" (`#membership`).

**Issues:** page `<h1>` is inside the wizard ("Pick your lane") while the membership section above uses `<h2>` — heading order is inverted. Recruitment claims data capture it doesn't do. Two competing primary actions (pay vs apply) with no framing of which to do first.

---

### 3.9 ADMIN (`/admin/*`)

Utilitarian, on-brand-token but visually minimal. Header (kicker + "Event Admin" + nav: Events / Members / Messages / View site). Tables (`bg-surface-container-high` head, hairline rows, status pills). `EventForm` for CRUD. `/admin/messages` = card list with `mailto:`. Login = glass-card form. Auth: Supabase password + `profiles.role === "admin"`, `?next=` redirect, `?error=unauthorized`.

---

## 4. Design language (extracted from code)

### 4.1 Colors

**Brand (site) — CSS vars in `:root` (`globals.css`):**
| Token | Value | Role |
|-------|-------|------|
| `--primary` | `#d9202f` | brand red, primary actions |
| `--primary-dim` | `#b21725` | hover / darker red, Razorpay theme |
| `--secondary` | `#d9202f` | = primary (no real secondary) |
| `--secondary-container` | `#fbe4e4` | tint |
| `--on-secondary-container` | `#7a1220` | |
| `--tertiary` | `#7a1220` | deep maroon (icon chips, register chip) |
| `--tertiary-container` | `#f6c9c9` | |
| `--on-tertiary-container` | `#fefbfa` | |
| `--on-primary-fixed` | `#ffffff` | text on red |
| `--surface` | `#fefbfa` | page bg (warm white) |
| `--surface-container-lowest` | `#ffffff` | |
| `--surface-container-low` | `#fbf3f2` | |
| `--surface-container` | `#f6ebe9` | |
| `--surface-container-high` | `#f0e2e0` | |
| `--surface-container-highest` | `#e9d7d5` | cards |
| `--surface-variant` | `#f0e2e0` | |
| `--outline` | `#c9b6b3` | |
| `--outline-variant` | `#e6d6d4` | borders |
| `--on-surface` / `--on-background` | `#17181f` | body text |
| `--on-surface-variant` | `#5c5559` | muted text |

**Gradients:**
- `.hero-gradient` (text): `135deg, #e8394a → #d9202f → #8c0f1c`
- `.gradient-text`: `135deg, #e8394a → #b21725`
- `.hero-gradient-fill` (button bg): `135deg, #e11d2e → #b21725`
- Event register band: `#b21725 → #d9202f`
- Deep accent literal: `#8c0f1c`

**Semantic (ad-hoc, not tokenized):** success `green-500` / `#4ade80` / `#34d399`; error `red-500` / `text-red-300`; warning/winner `yellow-500` / `#eab308`; live `emerald-400`. Event mode colors: online = `blue-500/blue-400`, offline = `orange-500/orange-400`, hybrid = `purple-500/purple-400`.

**Parallel shadcn neutral tokens** (`--background: oklch(1 0 0)`, `--foreground: oklch(.145 0 0)`, `--card`, `--muted`, `--muted-foreground: oklch(.556 0 0)`, `--border: oklch(.922 0 0)`, `--ring: oklch(.708 0 0)`, `--radius: .625rem`, `--chart-1..5`). Used by `ui/button.tsx`, `@layer base` (`body { @apply bg-background text-foreground }`), and the chart system (which also has a full dark chart palette in `.dark`). **These greys sit under the warm-white brand surfaces and cause subtle mismatches** (e.g. `border-border` = neutral grey vs `--outline-variant` = warm).

**`marketing-pages.css`:** `--brand-orange: #f97316`, `--brand-fuchsia: #d946ef` — a *different* accent pair for `.bg-orb` FX. Likely legacy.

**UXplosion palette:**
| Token | Value |
|-------|-------|
| bg | `#0A0A0C` |
| text | `#F5F3F4` / `#F4F0F2` |
| muted | `#B8B2B7` → `#8F898F` → `#7A7278` (progressively lower contrast) |
| accent gradient | `#FF2F7D → #FF5368 → #FF8A45` |
| pink | `#FF6FA8` |
| purple | `#8C5CF6` |
| hairlines | `rgba(255,255,255,0.05–0.10)` |

**`docs/style_guide.md` is stale** — it prescribes a blue/indigo primary (`#3B82F6`/`#6366F1`), Aceternity UI, and Inter-only. None of that matches the built site.

### 4.2 Typography

- **Heading font:** Manrope (`h1–h6`, `.font-headline`, `.type-*` all map to Manrope). Weights 700/800.
- **Body font:** Inter (`body`, `.font-body`, `.font-label`). Weights 300–700.
- **`--font-sans` / `--font-heading`:** Geist (set in `@theme`, applied via `@layer base html { @apply font-sans }` and `<html class="font-sans …">`) — so Geist is technically the base sans, overridden by the explicit Manrope/Inter rules. Effective stack is messy.
- **Type utilities** (`globals.css`):
  | Class | Font | Size | Weight | Tracking | Line-height |
  |-------|------|------|--------|----------|-------------|
  | `.type-display` | Manrope | (set per-use, e.g. `15vw`/`8xl`) | 800 | `-0.04em` | 0.9 |
  | `.type-heading` | Manrope | per-use | 700 | `-0.02em` | 1.05 |
  | `.type-nav` | Manrope | 0.875rem | 700 | `-0.01em` uppercase | 1.2 |
  | `.type-kicker` | Manrope | 0.625rem | 700 | `0.2em` uppercase | 1.1 |
- **Heading sizes are all inline Tailwind**, not a scale. Common H1: `text-4xl sm:text-5xl md:text-6xl lg:text-7xl` (about) / `text-[15vw]…lg:text-9xl` (home) / `text-4xl…lg:text-8xl` (events). H2: `text-3xl sm:text-4xl md:text-5xl`. H3: `text-2xl/3xl`. Body: `text-base sm:text-lg` (or `text-lg`). Small/labels: `text-xs`/`text-[10px]` uppercase `tracking-[0.14–0.22em]`.
- **UXplosion** uses `clamp()` everywhere: headings `clamp(28–30px, 3.4–3.6vw, 44–52px)`, hero wordmark `clamp(2.4rem, 13vw, 10rem)`, body `~16.5px`, muted `~13.5–15px`. Heading font Space Grotesk (`--font-uxp-heading`), body Manrope (`--font-uxp-body`), wordmark Baloo 2 (`--font-uxp-bubble`).

### 4.3 Spacing

- **Container:** `max-w-7xl` (80rem) for site, `max-w-[1180px]` for UXplosion, `max-w-6xl` (contact/admin), `max-w-3xl`/`max-w-2xl` for text.
- **Horizontal gutter:** `px-4 sm:px-6 md:px-8` — codified 3 ways: `.page-gutter`, `.section-shell`, and inline. UXplosion: `px-4 sm:px-6 md:px-8`.
- **Section vertical padding:** site `py-12 sm:py-16 md:py-20`; UXplosion `py-16 md:py-24` (sometimes `py-20 md:py-28 lg:py-32`).
- **Section margin (about):** `mb-16 sm:mb-24 md:mb-28` → `mb-20 sm:mb-28 md:mb-32`.
- **Card padding:** `p-6 sm:p-8 md:p-10/12` (glass cards); `p-5` (event/blog card body via `px-5 pb-5`); UXplosion `p-8` / `p-8 md:p-10`.
- **Grid gaps:** `gap-4 sm:gap-5 md:gap-6` (bento); `gap-8` (event grid); `gap-3 sm:gap-4` (moments); `gap-5` (recruitment/essentials).
- **Element gaps:** icon+label `gap-1.5/2`; stat rows `gap-4`; nav `gap-1.5 lg:gap-2`.
- **Nav clearance:** pages add `pt-24`/`pt-28 sm:pt-32` to clear the fixed nav; footer adds `pb-[calc(5.5rem+safe-area)]` on mobile for the bottom dock.
- Tailwind v4 spacing scale (4px base) otherwise standard. No custom spacing tokens.

### 4.4 Borders & radius

- `--radius: 0.625rem` (10px). `@theme` derives `--radius-sm … --radius-4xl` as `× 0.6 … × 2.6`.
- **Actual usage:** buttons `rounded-lg` (Button component) / `rounded-xl` / `rounded-full`; cards `rounded-2xl` / `rounded-3xl` / `rounded-[1.75rem]` / `rounded-[2.5rem]` / `rounded-[28px]`; inputs `rounded-xl`; pills `rounded-full`; UXplosion pricing `rounded-none`; icon chips `rounded-xl` / `rounded-2xl`.
- **Border widths:** almost always `1px`. Colors: `--outline-variant` (warm) OR `border-black/4–10` OR `border-white/5–10` (dark contexts) OR `border-primary/20–35` (tints) OR neutral `--border` (via `@layer base * { @apply border-border }`). UXplosion: `rgba(255,255,255,0.055–0.10)`.
- Inputs: `border-outline-variant/30–40`, focus `border-primary/50` (+ optional `0 0 0 3px rgba(217,32,47,.12)` ring).

### 4.5 Shadows

- Nav logo / burger: `0 8px 24px rgba(0,0,0,0.12)`; mobile drawer: `0 20px 50px rgba(0,0,0,0.18)`.
- Tubelight pill: `shadow-lg`.
- Cards: `shadow-sm` (Card component); event card inline `0 10px 28px rgba(0,0,0,0.22)`; blog card `0 0 0 1px … , 0 10px 36px rgba(0,0,0,0.26)` → hover `0 28px 54px rgba(0,0,0,0.45)` with a blue-ish ring (`rgba(163,166,255,0.45)` — leftover from a dark chart palette).
- Contact form card: `0 24px 80px rgba(0,0,0,0.35)`.
- **Signature "glow" hover on CTAs:** `0 0 20–40px rgba(217,32,47,0.3–0.4)`.
- `.glass-card`: no drop shadow, relies on blur + 1px red-tint border.
- UXplosion: `0 10px 34px rgba(255,47,125,0.3)` reg-button hover; heavy inset highlights on glass; `drop-shadow(0 0 5–6px rgba(255,47,125,0.5))` on flow paths; bubble text `text-shadow: 0 3px 0 rgba(160,15,80,0.3), 0 8px 16px rgba(0,0,0,0.4)`.
- **No shadow scale** — every value is inline and ad-hoc.

---

## 5. Navigation analysis

**Desktop (`≥1024px`):** centered pill at top-center (`fixed top-6`), text labels, animated "lamp" bar + glow under the active item (`layoutId="lamp"`, spring). Items: Home · About · Events · Blog · Contact. Fixed SDC logo top-left (`/sdc-india-logo.jpeg`, rounded card, blur, hover border). **No CTA button in the nav** (the "Join" item is commented out).
**Tablet (`768–1023px`):** same top pill but **icon-only** (labels appear at `≥1024`).
**Mobile (`<768px`):** pill becomes a **fixed bottom dock** (icon-only, `pb-[safe-area]`), full width `min(100%,24rem)`. Separately, a fixed hamburger (top-right) opens a `motion` drawer (`right-3 top-[4.25rem]`, `w-[min(18rem,100vw-1.5rem)]`, slide+fade from x:24) listing the same items with icons; backdrop `bg-black/70 backdrop-blur`, ESC + click-outside close, body-scroll lock. Focus moves to the first link on open, Tab/Shift+Tab stay within the trigger and menu links, and ESC or backdrop dismissal returns focus to the hamburger. So mobile has **two** navs (bottom dock + hamburger drawer) showing the same 5 links.
**Sticky/scroll:** nav is `position: fixed` always; **no scroll-based transformation** (no shrink, no hide-on-scroll, no bg change) on the site nav. Active state = exact `pathname === url` match (child routes like `/events/[id]` don't light up "Events").
**Sound:** each item `data-sound="select"` → click SFX via `UxSoundProvider`.
**Dropdowns / mega-menus:** none.

**UXplosion nav (separate):** `fixed top-0`, transparent → after `scrollY>8` gains `rgba(10,10,12,0.72)` bg + `blur(16px)` + bottom hairline. Links: Timeline / Experience / FAQ (3 only — omits Speaker/Archive/Pricing/Contact anchors). Gradient "Register Now" pill. Burger `<860px` → full-screen menu. No active-section highlighting.

**Hierarchy:**
```
Home
About
Events ── Events index ── Event detail /events/[id]
       └─ UXplosion 3.0 /events/uxplosion3.0 (own nav: Timeline · Experience · FAQ · Register)
Blog (modal articles — no sub-routes)
Contact
Join (not in nav; linked from hero CTA, footer, contact, event register fallback)
[Admin] (not in nav; /admin/login)
```

---

## 6. Footer analysis (site)

- **Background:** `#0e0e0e` (near-black) — a hard theme break from the warm-white body.
- **Top region** (`grid-cols-1 → md:grid-cols-3`):
  - **Brand col:** logo (`/sdc-india-logo.jpeg`), "SDC SNIST", description ("The premier hub for student engineers at SNIST…"), 4 social icons (Instagram, LinkedIn, GitHub, Contact-mail), hover → `#ff4d5e`.
  - **Navigation col** (`hidden md:block`): About · Events · Blog · Join (hover `translate-x-1`).
  - **Connect col** (`hidden md:block`): Contact · Instagram · LinkedIn · GitHub.
- **Bottom bar** (`border-t`, `flex … md:flex-row`): `© {currentYear} SDC SNIST. Engineering the future.` + `SoundToggle` + repeated uppercase text links (INSTAGRAM · LINKEDIN · GITHUB · JOIN).
- **Mobile:** only the brand column shows; nav/connect columns hidden. Extra bottom padding for the nav dock; `md:pb-0`.
- **Missing:** newsletter, address, phone, legal links (privacy/terms), sitemap, certifications/badges, language, "back to top".
- **Duplication:** social links appear 3× (icons + Connect col + bottom text). "Join" is in the footer but not the nav.

**UXplosion footer:** single line — "✳ SDC — UXplosion 3.0" + copyright. No links.

---

## 7. Component inventory

Full table in **`SDC_COMPONENT_INVENTORY.md`**. Highlights:
- **Two of everything for chrome** (nav ×2, footer ×2, burger-menu ×2, background-FX ×4).
- `ui/button.tsx` + `ui/card.tsx` exist but marketing pages ignore them for hand-rolled classes.
- `inputClass` string duplicated across 4 form components.
- 4 separate overlay/modal implementations (blog, event register, mobile menu, no shared primitive).
- ~60 custom animated icon components; lucide + Material Symbols effectively dead.
- Large unused surface area: `charts/**` (only area chart used), `UxplosionTeams`, `community/page.disabled.tsx`, `shimmering-text`, `trail-card`, `glass-cards-demo`, `tubelight-navbar-demo`, `@number-flow` (installed, counters not animated).

---

## 8. Image & media inventory

| Asset | Location | Used | Purpose | Ratio / size | Deco/Info | Anim | Responsive |
|-------|----------|------|---------|--------------|-----------|------|-----------|
| `sdc-india-logo.jpeg` | `public/` | Navbar, Footer | Brand logo | ~108×40 | Info | hover border | fixed heights |
| `sdc-logo.png` | `public/` | UXplosion nav | Brand logo | 1050×487 src, `h-8` | Info | no | no |
| `SDC logo.png`, `sdc-logo.png`, `sdc-india-logo.jpeg` | `public/` | mixed | **3 logo files** — inconsistent | — | Info | — | — |
| `LaunchPad20261–4.jpeg` | `public/` | Home moments, event `16` gallery | Event photos | ~4:3 mixed | Info | hover scale | strip / grid |
| `uxplosion3.0.jpeg`, `uxplosion-1.jpg`, `uxplosion-2.jpg` | `public/` | event cards/hero | Event covers | 16:9-ish | Info | card hover | `next/image fill` |
| `speaker.jpeg` | `public/` | UXplosion speaker, event `4/8` speaker | Speaker photo | 1:1 | Info | hover scale | square |
| `sponser1.jpeg`, `sponser2.jpeg` | `public/` | UXplosion sponsors | Sponsor logos (photos, not vector) | ~1:1, `56px` | Info | RAF marquee arc | fixed |
| `about/partners/*.svg` (10) | `public/about/partners/` | About marquee | Partner logos | ~120×40, `h-9` | Info | CSS marquee | `unoptimized` |
| `blog/assets/*` (WhatsApp exports, logo jpegs) | `public/blog/assets/` | Blog covers | Article covers | inconsistent, low-res | Info | hover scale | `next/image fill` |
| event `*.jpg/.png` (ai-agents, ai-summit, ai-day-2025, backend-bootcamp, blockchain, ds-workshop, techvision, hash-it-out-2, hackwithhyd, vibe-code*, beyond-tech-2024, tech-bootcamp, hackathon_event*, devops_summit*, web3_workshop*) | `public/` | event cards | Event covers | mixed | Info | card hover | `next/image` |
| `videos/join-community-bg.mp4` | `public/videos/` | **commented-out** home CTA only | bg video | — | Deco | loop (if enabled) | `object-cover` |
| `sounds/sine/*.wav` (~28) | `public/sounds/sine/` | UX sound system | UI SFX (tap, button, toggle, swipe, celebration, notification, progress/ringtone loops, type…) | audio | — | — | — |
| lh3.googleusercontent `aida-public/…` | remote | Home bento "Master Modern Stacks" cell | decorative servers image | — | Deco | hover scale | plain `<img>` (not optimized) |
| `ui-avatars.com/api/...` | remote | `GlassCards` team | generated avatars | 56px | Deco/Info | hover tooltip | fixed |
| `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`, `*copy*.svg` | `public/` | — | **Next.js starter cruft** | — | — | — | — |
| `design.pdf` | repo root | — | design reference doc (2.6 MB), not served | — | — | — | — |
| `community-pulse.json` | repo root | `/community` (disabled) | GitHub contribution data (232 KB) | — | — | — | — |

**Background graphics (no files, all code):** matrix-rain canvas + floating code snippets (`InteractiveBackground`), dot-grid + drifting blobs (`AmbientBackground`), `hero-gradient`/`ambient-glow` blurs, `ux-eco-grid`/`ux-pricing-grid` animated grids, particle canvas + SVG wireframe/flow decor (UXplosion), SVG progress ring (hackathon).
**No:** Lottie, real SVG illustration set, icon sprite. UXplosion "play panel" is the closest thing to an illustration and it's inline divs/SVG.

---

## 9. Animation & interaction audit

| # | Trigger | Animation | Duration / behavior | Purpose | Concern |
|---|---------|-----------|---------------------|---------|---------|
| 1 | Page load (home hero) | staggered fade-up of badge/H1/H2/P/CTAs | delays 0–.32s, 0.55s each, `[0.22,1,0.36,1]` | entrance polish | fine |
| 2 | Route change | `PageTransition` fade `opacity/y` | 0.28s, `mode="wait"` | continuity | small layout jank on tall pages; disabled for reduced-motion ✅ |
| 3 | Scroll into view (most sections) | `Reveal` fade-up y36 | 0.5s, `once`, `amount:.2` | progressive disclosure | consistent ✅; reduced-motion → plain div ✅ |
| 4 | Pointer move (desktop home) | `HeroSpotlight` radial glow follows cursor | opacity 0.5s | depth | fine (fine-pointer only) |
| 5 | Always (any page with `InteractiveBackground`) | canvas matrix "1/0" rain | `setInterval(50ms)` full-viewport redraw, **forever**, mouse parallax `translate` | ambience | **perf: continuous 20fps canvas repaint even offscreen; matrix still runs under `prefers-reduced-motion`** (only snippets + parallax are gated) |
| 6 | Always (about/blog/contact/events/join) | `AmbientBackground` dot-grid + 2 blobs drift | CSS `ambient-drift` 22s/28s infinite | ambience | **not gated by reduced-motion** (CSS animation always runs) |
| 7 | Always (about partners) | 2 marquees | CSS `partner-marquee-scroll` 32s/38s linear infinite | logo wall | not gated by reduced-motion; `will-change: transform` |
| 8 | Scroll (about team) | GSAP `ScrollTrigger` `scrub` scale-down of 3 stacked cards | tied to scroll, each card 100vh sticky | "stacking" reveal | heavy; GSAP+ScrollTrigger for one section; no reduced-motion handling |
| 9 | Hover (event card) | `y:-8` lift + image `scale:1.08` + mode-gradient wash + reveal "Register" chip | spring / 0.35–0.55s | affordance | chip only on `hover:hover && pointer:fine` ✅; motion-gated ✅ |
| 10 | Hover (blog card) | spring lift `y:-6` + image scale + shadow/ring swap | spring 280/22 | affordance | not motion-gated; hover ring color is a stray blue |
| 11 | In view (events pulse chart) | visx area path draw + fill | `animationDuration: 1200ms` | data reveal | fine |
| 12 | Filter change (`/events`) | `AnimatePresence mode="popLayout"` + CSS `@starting-style` card enter/exit | 0.25–0.45s | list continuity | reduced-motion handled in CSS ✅ and JS (`layout={!reduce}`) ✅ |
| 13 | Nav active item | `layoutId="lamp"` spring slide of glow bar | spring 300/30 | wayfinding | fine |
| 14 | Mobile menu open | backdrop fade + drawer slide `x:24` | 0.25s | modality | body-scroll lock ✅, ESC ✅; focus contained within the menu and trigger and returned to the trigger on dismissal ✅ *(previously: no focus trap)* |
| 15 | Contact / member / recruitment submit | button spinner + `AnimatePresence` swap to success | 0.3–0.35s | feedback | fine; progress **sound** loop plays during await |
| 16 | UXplosion hero load | particle burst → wordmark assembly (canvas + gsap) + staggered content | `HERO_TIMELINE` timers, `document.fonts.ready` | spectacle | reduced-motion → instant final state ✅ |
| 17 | Scroll (UXplosion hackathon) | 400vh pinned section; phase copy blur/slide swap + SVG ring `stroke-dashoffset` + radial labels | scroll-linked, `useScrollProgress` | narrative | very long scroll cost on mobile; heavy but self-contained |
| 18 | Hover (UXplosion list rows: timeline/teams/archive/contact) | `translateX(8px)` + gradient text + accent number + rule grow | 300–700ms | affordance | consistent within UXplosion ✅ |
| 19 | Scroll >8px (UXplosion nav) | bg `rgba` + `blur(16px)` + hairline fade in | 300ms | context | fine |
| 20 | Always (UXplosion) | particle canvas, `ux-float`/`ux-float2` decor, `ux-reg-shine` sweep (5.5s), `ux-pulse` nodes, `ux-eco-grid`/`ux-pricing-drift` (60–90s) | infinite CSS/JS | ambience | all killed by `@media (prefers-reduced-motion) .ux-page *` ✅ |
| 21 | Any element with `data-sound` | Web-Audio SFX on click; hover-icon micro-animations on ~60 icons | instant | tactility | novel; **can be fatiguing**; muteable via footer toggle; unlock requires first interaction |
| 22 | `.pressable` elements | `active:scale(.97)` | 0.15s | press feedback | motion-gated ✅ |

**Animations that may hurt UX/perf:**
- `InteractiveBackground` — perpetual full-viewport canvas repaint (20 fps) + DOM node creation every 3s; not paused off-screen or on hidden tab; matrix layer ignores reduced-motion.
- `AmbientBackground` + partner marquees + `.kinetic-orb`/`.ambient-blob` — CSS infinite animations with `will-change`, not reduced-motion-gated (site-side; UXplosion side is gated).
- GSAP stacked cards on `/about` — 3× viewport-height sticky sections push real content far down; no reduced-motion fallback.
- UXplosion hackathon 400vh — large scroll investment on phones.
- UI sound layer — accessibility/annoyance risk; at least it's opt-out and honours a stored mute.
- `@number-flow/react` installed but stats render as plain text — either wire it up or drop it.

---

## 10. Responsive design audit

**Breakpoints:** Tailwind defaults — `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`. Custom JS breakpoint: `LABEL_BREAKPOINT = 1024` in tubelight nav; UXplosion CSS media queries at `1180 / 900 / 860`.

| Viewport | Behavior |
|----------|----------|
| **Mobile (<640)** | Nav = bottom icon dock + hamburger drawer. Container `px-4`. H1 shrinks (`text-4xl` / `15vw`). Grids collapse to 1 col (bento, mission/vision, stats→2col, event grid, blog grid). Campus Moments = horizontal scroll (`w-[72vw]` cards). Footer = brand column only + big bottom padding for dock. CTAs full-width stacked. Blog modal = bottom sheet. UXplosion play panel + decorative strips hidden; hero copy full-width. |
| **Tablet (768–1023)** | Nav pill at top but **icon-only** (labels appear ≥1024) — a dead zone where the primary nav has no text. Bento → 12-col grid active. Event/blog grids → 2 col. Footer columns appear (`md:block`). About stacked-card section engages. |
| **Desktop (1024–1279)** | Nav labels show. `max-w-7xl` container centered. Event grid 3 col. UXplosion `lg:grid-cols-2` hackathon layout. |
| **Large (≥1280 / ≥1536)** | Container stays `max-w-7xl` (80rem) — content stops widening; side gutters grow. Home hero H1 `lg:text-9xl`. No `xl:`/`2xl:` specific tweaks anywhere → very wide screens get lots of empty margin. UXplosion caps at `max-w-[1180px]`. |

**Container widths:** site `max-w-7xl` (1280px) / `max-w-6xl` (contact, admin) / `max-w-5xl` (events CTA) / `max-w-3xl`–`max-w-2xl` (prose). UXplosion `max-w-[1180px]` / `max-w-[1080px]` (pricing) / `max-w-[820px]` (FAQ).

**Typography scaling:** site uses discrete Tailwind steps per breakpoint (occasionally `vw` on the home wordmark). UXplosion uses fluid `clamp()` throughout — smoother, and worth adopting site-wide.

**Images:** `next/image fill` + `sizes` on cards (mostly correct); partner logos `unoptimized` fixed height; homepage bento image is a raw `<img>` with no `sizes`/lazy hints.

**Tables:** admin tables are `w-full` with no horizontal scroll wrapper → will overflow on narrow screens (Members table has 7 columns).

**Forms:** `md:grid-cols-2` field pairs collapse to 1 col; textarea `resize-y`. Fine.

**Responsive inconsistencies:**
1. Tablet nav has no text labels (768–1023) — usability gap.
2. Two container systems (`max-w-7xl` vs `1180px`) → hero/section widths don't align between site and UXplosion.
3. Section vertical rhythm differs (site `py-12/16/20`, about `mb-16..32`, UXplosion `py-16/24`).
4. Footer hides half its links `<md` with no mobile equivalent (accordion, etc.).
5. No `xl`/`2xl` handling → large monitors look under-designed.
6. Admin tables not responsive.
7. Home hero uses `vw` units for H1 (`15vw`) → can get very large on tablets in the 640–900 band.

---

## 11. Content & information hierarchy

**Primary message:** "Building the Future with Student Developers" / "elite student engineers at SNIST" → **join the community**.
**Secondary:** events (hackathons, workshops, summits), mentorship, industry partners, UI/UX flagship (UXplosion).
**Value props:** modern-stack learning · elite peer network · hackathons with prizes · FAANG/industry mentorship · campus-to-industry bridge.

**CTA hierarchy (site):**
1. **Get Started / Become a Member → `/join`** (hero, events CTA, footer, contact) — dominant.
2. Learn More → `/about`.
3. Browse Events / View Events → `/events`.
4. Read Article (blog, modal).
5. Register (per event).

**Content hierarchy works well:**
- Home hero → clear single wordmark + tagline + two CTAs.
- Event cards — dense but scannable (badges, title overlay, stat row, dual action).
- UXplosion timeline / pricing — strong visual rhythm, clear day-by-day story.
- Contact — split "reach us" vs "message us" is clean.

**Content hierarchy problems:**
- **Contradictory numbers** (see §17): 50k+ vs 5000+ vs 2500+ members; 120+ events vs 50+ events vs 120+ workshops; "45 chapters" appears nowhere else. Undermines trust.
- **Placeholder team content** on `/about` (fake names/bios) — the team section is the emotional payoff of an About page and it's fabricated.
- **`/about` has no team photos, no "join us" CTA, no contact.**
- **Blog** has no dates-sorted list view beyond "featured + grid", no author, no tags surfaced on cards beyond category, no share.
- **UXplosion FAQ vs body copy conflict** ("four-day" vs "3-day"; ₹99/₹199 vs ₹319 combo; hero prize/goodies vs pricing membership framing).
- **`/join`** presents pay-membership and apply-to-team side by side with no guidance on sequence or difference; recruitment "done" screen over-promises ("we saved your application") without persistence.
- **Home bento** claims "FAANG mentors", "thousands of developers", "top tech partners" — unsupported superlatives; `docs/style_guide.md` and marketing copy imply a different (blue) brand.
- **No legal/privacy page** despite collecting name/email/phone/roll number and taking payments.
- **Event detail `EventSpeaker`** is a bare comma-joined string — thin where UXplosion is rich.
- **Missing context:** what membership actually unlocks (concrete perks), refund policy, event capacity/waitlist, code of conduct.

**Too much info:** event cards pack mode + status + countdown + hover chip + 2 buttons + winner chip + speaker + 2 stats — borderline. Admin members table (7 cols) on mobile.
**Too little:** About team (fake), blog article metadata, membership benefits, event speaker bios (non-UXplosion).

---

## 12. User journeys

### Journey A — Prospective member (primary)
`/` hero → **Get Started** → `/join#membership` → fill `BecomeMemberForm` → Razorpay → `/api/membership/verify` → success card with member ID.
- Decision points: pay now vs explore first; membership vs recruitment (same page, unframed).
- Friction: no "what you get" list before the pay button; Razorpay script loads on click (slight delay, error path exists); success is a static card — no email confirmation shown, no next step ("join the Discord/WhatsApp?"), no account/login concept surfaced.
- Exit points: any nav item; "explore other roles"; back button mid-Razorpay.

### Journey B — Event attendee
`/` ("View Events" tile or Campus Moments "All events") → `/events` → filter/search → `EventCard` → **Details** → `/events/[id]` → read → **Register**.
- Register branches: external Google Form (new tab) / Razorpay modal / "become a member" redirect — inconsistent, and the user can't tell which they'll get until they click.
- Friction: past events still render full detail pages with no register CTA (correct) but related-events logic can surface past events; agenda "time" column often shows a label not a time.
- Exit: related events (can loop), nav.

### Journey C — UXplosion registrant
Anywhere → `/events` card (id 17, "Register Now" chip → external form) **or** `/events/uxplosion3.0` → scroll (long) → any of ~6 "Register Now" → `forms.gle/...` (new tab, leaves the site).
- Friction: leaves to Google Forms with no return path; pricing page raises questions (₹99/₹199/₹319, "four-day" vs "3-day"); no confirmation loop back on-site.
- Strength: the page itself is persuasive and well-sequenced.

### Journey D — Recruit
`/join` → scroll past membership → `RecruitmentFlow` roles → Apply → form → challenge → done.
- Friction: **submission goes nowhere** (no API). User believes they applied. This is the most serious journey defect.
- Decision point: which lane — helped by clear role cards.

### Journey E — Contact / partner / speaker
`/` footer or nav → `/contact` → social cards or message form → `/api/contact` → Supabase → `/admin/messages`.
- Friction: no category ("speaker proposal" vs "partnership" vs "question"), no attachment, no SLA statement beyond "regularly".

### Journey F — Content reader (SEO / social)
Search/social → `/blog` → featured or grid → **modal** article.
- Friction: **no shareable URL per article**, no back-button close, no focus management, no related posts, no author/date on card. Poor for the "read one article, subscribe" loop.

### Journey G — Admin
`/admin/login` → Supabase auth + role check → `/admin/events|members|messages` → CRUD.
- Fine for internal use; no audit trail, no confirmation on some destructive actions beyond `DeleteEventButton`.

---

## 13. CTA audit

| CTA text | Location(s) | Destination | Importance | Consistency |
|----------|-------------|-------------|------------|-------------|
| Get Started | Home hero | `/join` | Primary | label differs from every other "join" CTA |
| Learn More | Home hero | `/about` | Secondary | outline style, consistent |
| View Events | Home bento tile | `/events` | Secondary | tile, not a button |
| All events → | Home CampusMoments, Footer implicit | `/events` | Tertiary | text link |
| Become a Member | Events CTA band, Contact ("Or become a member →"), ContactForm success, RecruitmentFlow done, `/join` copy | `/join` | Primary | **4 different phrasings** for the same action (Get Started / Become a Member / Join Now / Join) |
| Browse Events | `/events` hero | `#events` anchor | Primary (page) | solid red, consistent with brand |
| Reset filters | `/events` empty state | (clears state) | Contextual | consistent |
| Details | `EventCard` | `/events/[id]` (or override) | Primary (card) | outline → red-fill hover |
| Register Now | `EventCard` (chip + button), `/events/[id]` band, UXplosion (×6) | external URL / Razorpay / `/join` / Google Form | Primary | **same label, 4 different behaviors/destinations** |
| Secure Your Spot | `EventRegisterButton` default | varies | Primary | yet another synonym |
| Read Article | Blog featured + cards | (modal) | Primary (blog) | consistent within blog |
| Send Message | ContactForm | `/api/contact` | Primary (contact) | consistent |
| Pay ₹199 with Razorpay | BecomeMemberForm | Razorpay | Primary (join) | clear, shows price ✅ |
| Apply | RecruitmentFlow role cards | (wizard step) | Primary (recruit) | per-role accent color (5 different button colors) |
| Unlock challenge / Submit challenge | RecruitmentFlow | (wizard step) | Primary (recruit) | consistent within flow |
| View Timeline | UXplosion hero | `#timeline` | Secondary | outline pill |
| Sign in | Admin login | Supabase | Primary (admin) | plain |

**Primary CTA:** "join / become a member" → `/join` — but expressed as *Get Started / Become a Member / Join Now / Join / Or become a member →* across the site.
**Repeated CTA:** "Register Now" — dangerously overloaded (external form vs paid modal vs member redirect).
**Inconsistent:** button radius (xl vs full vs lg), casing (Title Case vs UPPERCASE), color (brand red vs per-role accent vs gradient).
**Missing CTA opportunities:**
- `/about` has **no CTA at all** (should push to `/join` or `/events`).
- Blog articles (modal) have no "join / subscribe / related" CTA.
- Home stats band → no CTA.
- Event detail pages for **past** events → no "see upcoming events" / "join for the next one" CTA.
- No newsletter / follow CTA anywhere (footer has raw social links only).
- No sticky/persistent "Join" CTA (the nav "Join" item is commented out).

---

## 14. Forms & conversion elements

| Form | Purpose | Fields (required*) | Validation | Error state | Success state | Submit → | Confirmation |
|------|---------|--------------------|-----------|-------------|---------------|----------|--------------|
| `ContactForm` | Inbound message | name*, email*, message* | client `required` + server: name ≥2, email regex, message 10–5000 | red banner (`text-red-300`) inside form | green card "Message sent" + "Send another" / "Become a Member" | `POST /api/contact` → Supabase `contact_messages` | on-screen only (no email to user) |
| `BecomeMemberForm` | Paid membership | fullName*, rollNumber*, phone*, email* | client `required` only | red banner | glass card: mono 12-digit member ID + "Class of {year}" + "Save this ID" | `/api/membership/create-order` → Razorpay → `/api/membership/verify` | on-screen; "keep the email you registered with"; **no visible email receipt** |
| `EventRegisterButton` modal | Paid event reg | name*, email*, phone | client `required` | red banner | green banner "Registration confirmed!" | `/api/razorpay/create-order` → Razorpay → `/api/razorpay/verify` | on-screen |
| `RecruitmentFlow` | Team recruitment | fullName*, rollNumber*, yearBranch*, email*, phone*, motivation* (≥40) + challenge answer (≥20 / choice) | client only | red banner per step | "You're in the {role} pipeline" | **nothing** — no fetch call | **false confirmation** (claims "we saved your application") |
| Admin `LoginForm` | Auth | email*, password* | Supabase + `profiles.role` | red banner | redirect to `?next` | Supabase session | — |
| `EventForm` (admin) | Event CRUD | `UNVERIFIED` full schema | — | — | — | Supabase | — |
| `FilterBar` (events) | Filter | search text, mode toggle | — | — | live filtering | client state | — |
| Blog category pills | Filter | pill select | — | — | live filtering | client state | — |

**Placeholder text:** "Your name", "you@college.edu", "Tell us about your question, collab idea, or speaker proposal…", "e.g. 2nd year CSE", "Search events, topics, or speakers…", challenge-specific bullets.
**Conversion elements present:** contact CTAs, paid membership, paid/free event registration, recruitment funnel, per-event "Register" chips, UXplosion Google Form.
**Conversion elements missing:** newsletter signup, lead-magnet download, demo request (N/A), exit-intent, social proof near forms (testimonials/logos are on separate pages), post-conversion nurture (Discord/WhatsApp invite, calendar add).
**Field friction:** membership + recruitment both ask roll number + phone + email up front with no progressive disclosure; recruitment asks 6 fields *before* revealing the challenge (stated as intentional — "unlock").

---

## 15. Accessibility audit (actual findings)

**Semantics / structure**
- Root `<html lang="en">` ✅. `<main>` used on most pages ✅. `<footer>`, `<header>` (admin) ✅.
- **`<html class="dark">` with a light palette** — assistive/UA features keyed to the class or to `color-scheme` may mismatch; there is no `<meta name="color-scheme">` and `:root` doesn't set `color-scheme`.
- **Heading order breaks:**
  - Home: feature bento uses `h3`/`h4` with no preceding `h2`; stats have no heading.
  - `/join`: the page's only `h1` ("Pick your lane") sits *below* an `h2` ("Become a Member").
  - `/blog`: `h1` is the *featured post title* (changes meaning of the page); filtered cards use `h3`.
  - Event detail: multiple `h2`s use `bg-clip-text text-transparent` — text is still in the DOM ✅ but relies on the gradient having sufficient contrast.
- Decorative canvases/graphics marked `aria-hidden` ✅ (`InteractiveBackground`, `AmbientBackground`, UXplosion particles, play panel).

**Images / alt**
- Card/logo/photo images have `alt` (event title, post title, speaker name, partner alt) ✅.
- Homepage bento decorative `<img alt="Cyberpunk high tech servers">` — decorative but given descriptive alt (minor).
- `ui-avatars` images have `alt={member.name}` ✅ (but the people are fake).

**Keyboard / focus**
- Base-UI `Button` has `focus-visible:ring` ✅. Inputs have `focus:border/shadow` ✅ (colour-only in some places, no outline).
- **Custom CTAs** (hand-rolled `<Link>`/`<a>`/`<button>` with bespoke classes) mostly have **no explicit `:focus-visible` style** — rely on UA default, which several resets/utilities can suppress.
- **Blog article modal:** no focus trap, no `role="dialog"`/`aria-modal`, no ESC handler, focus not moved in or restored on close. Opened from a `<button>` wrapping an image.
- **Event register modal:** has `role="dialog" aria-modal="true"` ✅ but no focus trap/restore; close is a bare `✕` glyph button with `aria-label="Close"` ✅.
- **Mobile nav drawer:** ESC ✅, body-scroll lock ✅, `aria-expanded`/`aria-controls` ✅, backdrop is a `<button aria-label>` ✅ — but **no focus trap** and focus isn't moved into the drawer.
- Tubelight nav items are `<Link aria-label>` with icon-only rendering on mobile/tablet — labels exist via `aria-label` ✅.
- `EventCard` hover-reveal "Register" chip: `@media (hover:hover) and (pointer:fine)` hides it by default and reveals on `:hover, :focus-within` ✅ — keyboard users on desktop can reach it; touch users get the always-visible bottom button.
- UXplosion FAQ: `<button aria-expanded>` ✅. Accordion content animates height (fine).

**ARIA**
- Good `aria-label` coverage on icon-only controls (nav, social, sound toggle, close, burger).
- `aria-hidden` on decorative layers ✅.
- No `aria-live` region for form success/error announcements — status changes are visual only (`role="status"`/`aria-live` missing on ContactForm / member / register success + error banners).
- Filter pills / mode toggles are `<button>` with visual active state but **no `aria-pressed`**.

**Forms / labels**
- All inputs are wrapped in `<label>` with visible text ✅ (uppercase micro-labels — legible but small, ~12px, `tracking` wide).
- No `aria-describedby` linking hint text ("motivation should be at least a few sentences") to fields.
- Error banners are not programmatically associated with fields.

**Contrast (measured against actual tokens)**
- `--on-surface-variant #5c5559` on `--surface #fefbfa` ≈ **7.2:1** ✅.
- `--on-surface-variant` on `--surface-container-highest #e9d7d5` ≈ **5.8:1** ✅ (body ok, borderline for `text-xs`).
- Footer `text-white/50` on `#0e0e0e` ≈ **4.6:1** — passes AA for normal text, **fails for the 10–12px uppercase** micro-text (`text-white/30` bottom links ≈ 2.7:1 — **fails**).
- UXplosion `#7A7278` on `#0A0A0C` ≈ **3.9:1** — **fails AA** for the many 13–14px muted lines; `#8F898F` ≈ 5:1 borderline.
- Gradient-clipped headings: `#8c0f1c` end-stop on white ≈ 9:1 ✅; UXplosion `#FF8A45` on `#0A0A0C` ≈ 6.5:1 ✅ but `#FF2F7D` start ≈ 4.4:1 (large text ok).
- Brand red `#d9202f` on white ≈ **4.6:1** — ok for large/bold, borderline for `text-xs` kickers/labels rendered in primary.
- `text-red-300` error text on translucent red bg — likely **< 4.5:1**.

**Touch targets**
- Nav dock items `min-h-11` (44px) ✅. Burger `h-11 w-11` ✅.
- Filter/category pills `py-2` (~32–36px height) — slightly under 44px.
- Blog "Close" pill, event `✕`, some text links — under 44px.
- Footer text links (10px) with tight spacing — hard to hit.

**Motion**
- `usePrefersReducedMotion` / `useReducedMotion` widely respected in JS (`Reveal`, `PageTransition`, hero, cards, recruitment, UXplosion hero).
- **Gaps:** `InteractiveBackground` matrix layer, `AmbientBackground` CSS drift, partner marquees, `.kinetic-orb`/`.ambient-blob`, GSAP stacked cards — **not** reduced-motion-gated on the site side. (UXplosion side is fully gated via `.ux-page *`.)

**Screen reader**
- Route change: `PageTransition` swaps a keyed `<motion.div>` — no route-announcement / focus-to-h1 on navigation (SPA nav is silent to SR users).
- ~~"Welcome {IP address}" is read aloud in the hero badge — odd content for SR users.~~ *Resolved: the badge now reads a static "Welcome to SDC SNIST".*
- Charts: visx SVG — `UNVERIFIED` whether any `<title>`/`aria` or data table alternative exists (`chart-tooltip` etc. suggest visual-only).

---

## 16. Performance-related UI observations (no changes made)

| Area | Observation |
|------|-------------|
| **Initial load** | Two font families loaded twice (Manrope + Inter via `next/font` *and* a raw `@import url(...)` at the top of `globals.css`). Geist also loaded. Material Symbols variable font requested via `<link>` and unused. UXplosion adds 3 more families on its route. |
| **Fonts** | `next/font` gives `font-display: swap` behavior; the raw `@import` uses `&display=swap` too but is render-blocking CSS. Material Symbols link uses `display=block` (can cause invisible icon flash if ever used). |
| **JS bundle** | Both `motion` and `framer-motion` (v12) are dependencies — likely overlapping. `gsap` + `ScrollTrigger` loaded for a single `/about` section. Full `@visx/*` + `d3-array` + `d3-shape` + `@number-flow` for one area chart. `razorpay` server SDK; checkout script lazy-loaded on click ✅. |
| **Canvas / animation** | `InteractiveBackground`: `setInterval(drawMatrix, 50)` = perpetual 20fps full-viewport `fillRect` + text draw; `createSnippet` every 3s appends+removes DOM nodes; `mousemove` sets `canvas.style.transform` (no rAF throttle). Runs on `/` (and any page mounting it). Not paused on `visibilitychange` or when scrolled away. |
| **CSS animations** | Multiple `infinite` keyframe animations with `will-change: transform` always active (`ambient-blob`, `kinetic-orb`, `partner-marquee-track`, UXplosion grids). `backdrop-filter: blur()` used heavily (`.glass-card`, nav, drawer, badges) — expensive on low-end mobile/Android. |
| **Scroll-linked** | GSAP `ScrollTrigger` `scrub` on `/about` (3×100vh sticky). UXplosion `useScrollProgress` drives a 400vh section + an rAF sponsor marquee with per-item transform reads (`offsetLeft`/`offsetWidth` measured on resize — layout thrash risk if mis-timed). |
| **Images** | Homepage bento uses a **remote `<img>`** (googleusercontent) with no `width`/`height`/`sizes`/`loading` → layout shift + unoptimized bytes. Partner logos + avatars `unoptimized`. Blog covers are large unoptimized-source JPEGs (WhatsApp exports). Event images are raw `public/*.jpg` at unknown dimensions. |
| **Layout shift (CLS)** | Hero H1 uses `vw` sizing (reflows during load); blog modal cover `aspect-[16/8]`; GSAP cards set inline transforms post-mount; UXplosion hero waits on `document.fonts.ready` then reveals (content pops in). |
| **Lazy loading** | `next/image` lazy by default ✅. No explicit `dynamic()` code-splitting of heavy client components (charts, GSAP, UXplosion sections all in the route bundle). `community-pulse.json` (232 KB) would be bundled if `/community` were re-enabled (it's `import`ed, not fetched). |
| **Data fetching** | `/events` + `/events/[id]` do a Supabase round-trip per request with try/catch fallback to a static array — reasonable; no caching directives shown (`UNVERIFIED`). |
| **Third-party** | Razorpay checkout script (on demand) ✅. Google Fonts (blocking link for Material Symbols). ui-avatars (per-render remote fetch × up to 18 avatars on `/about`). |
| **Repo weight** | `design.pdf` (2.6 MB), duplicated `about/` + `public/about/` static site, Next starter SVGs, `*copy*` assets — not shipped to users but bloat the repo/deploys. |

---

## 17. Visual consistency audit

### CRITICAL
1. **Two disconnected design systems.** Site (Manrope/Inter, warm-white Material surfaces, red `#d9202f`, `max-w-7xl`, tubelight nav, dark footer) vs UXplosion (Space Grotesk/Baloo, `#0A0A0C`, pink→orange gradient, `max-w-[1180px]`, bespoke nav/footer). A user moving `/events → /events/uxplosion3.0` lands on what looks like a different company.
2. **"dark" class but light site + parallel conflicting token sets.** `--surface #fefbfa` (warm Material) coexists with `--background oklch(1 0 0)` and neutral `--border/--muted/--ring`. Components mix `border-outline-variant` (warm) and `border-border` (neutral grey) and `border-black/4` and `border-white/10`. No working theme mode.
3. **Contradictory factual numbers.** Members: 50k+ (home) / 2500+ (blog) / 5000+ students (about). Events: 120+ (home) / 50+ (about) / 120+ *workshops* (about). "45 Chapters" (home) unsupported. Erodes credibility on the highest-traffic surfaces.
4. **"Register Now" means 4 different things** (external Google Form / Razorpay modal / `/join` redirect / event band) with identical styling — users can't predict the outcome.
5. **Recruitment form silently discards submissions** while telling the user "we saved your application."
6. **Placeholder team + partner content on `/about`** shipped as if real.

### HIGH
7. **Primary CTA label drift:** Get Started / Become a Member / Join Now / Join / "Or become a member →" — all → `/join`.
8. **Button radius + casing chaos:** `rounded-lg` / `rounded-xl` / `rounded-full` / `rounded-none`; Title Case vs UPPERCASE `tracking-widest`.
9. **Color literals vs tokens:** `#d9202f` / `#b21725` / `#8c0f1c` / `#7a1220` hard-coded inline hundreds of times instead of `text-primary` / `var(--primary)` — the token layer exists but is bypassed, so a rebrand touches every file.
10. **Card patterns:** `ui/card.tsx` (unused), `.glass-card` (CSS), ad-hoc `bg-surface-container-*` divs, conic-glass `GlassCards`, UXplosion `rounded-[28px]` and `rounded-none` — 5+ "card" looks.
11. **Two nav + two footer implementations**; tablet nav has no text labels (768–1023).
12. **Stat tile inconsistency:** home (4 tiles, `text-3xl→5xl`) vs about (3 tiles, `text-5xl→7xl`) — different sizes, dividers, glows for the same component idea.
13. **Background FX sprawl:** `InteractiveBackground` (matrix) on home, `AmbientBackground` (dots+blobs) elsewhere, `marketing-pages.css` orange/fuchsia orbs (orphan), UXplosion particles — 4 unrelated ambient systems, different accent colors.
14. **Section container/rhythm:** `.page-gutter` vs `.section-shell` vs inline `mx-auto max-w-7xl px-4…` vs `max-w-[1180px]`; vertical padding varies per page.
15. **Icon systems:** 60 custom animated icons + configured-but-unused lucide + emoji (UXplosion) + `✳` + loaded-but-unused Material Symbols.
16. **Footer theme break** — near-black footer under a warm-white site with no transition.

### MEDIUM
17. **Gradient definitions duplicated** with slightly different stops (`.hero-gradient` `#e8394a→#d9202f→#8c0f1c` vs `.gradient-text` `#e8394a→#b21725` vs `.hero-gradient-fill` `#e11d2e→#b21725` vs event band `#b21725→#d9202f`).
18. **Shadow values all inline/ad-hoc** — no `--shadow-*` scale; blog card hover shadow uses a stray blue ring color.
19. **Typography scaling method differs** (discrete Tailwind steps on site, fluid `clamp()` on UXplosion).
20. **Kicker styles differ:** site `.type-kicker` (10px Manrope red) vs UXplosion `✳ + 11–13px pink`.
21. **Input styling copy-pasted** across 4 forms with drift (border opacity `/30` vs `/40`, focus ring present/absent, `py-3` vs `py-3.5`).
22. **`docs/style_guide.md` describes a different (blue/indigo, Aceternity) brand** — stale doc actively misleads.
23. **Event `EventSpeaker` (plain string) vs UXplosion speaker (photo/bio/links)** — same content type, wildly different treatment.
24. **Home hero uses `vw` H1 sizing; nothing else does.**
25. **`hover:text-[#ff4d5e]` in footer** — a pinkish-red that appears nowhere else in the palette.

### LOW
26. Emoji in UXplosion hero highlights vs icon components everywhere else.
27. `!cursor-pointer` / `!cursor-default` overrides scattered on icons (fighting a base `cursor-pointer` in the icon components).
28. Next.js starter SVGs (`next.svg`, `vercel.svg`, `window.svg`…) still in `public/`.
29. Three logo files (`SDC logo.png`, `sdc-logo.png`, `sdc-india-logo.jpeg`) — nav/footer use the jpeg, UXplosion uses the png.
30. `*copy*.png/.svg` duplicate assets in `public/`.
31. UXplosion FAQ "four-day" vs the rest "3-day".
32. Partner logo list alt text includes a bare `"St"` (likely truncated "ST Microelectronics" or similar).

---

## 18. KEEP / IMPROVE / REDESIGN / PRESERVE

### KEEP (already strong)
- **UXplosion 3.0 page** as a *design reference* — its type rhythm, `clamp()` scale, hairline list rows, scroll-driven hackathon ring, restrained dark palette, and **complete `prefers-reduced-motion` handling** are the best work in the repo.
- **`Reveal`** scroll-entrance pattern (simple, consistent, reduced-motion-safe) — make it the standard.
- **Tubelight nav interaction** (bottom dock on mobile, animated lamp) — distinctive and usable; keep the *interaction*, restyle the chrome.
- **Event card information model** (mode + status + countdown + dual action) — dense but genuinely useful.
- **Filter/search on `/events`** with `AnimatePresence` + `@starting-style` — smooth and accessible-ish.
- **Custom animated icon set** — pick this as the single icon system.
- **UX sound layer architecture** (`data-sound` delegation, unlock-on-interaction, muteable) — keep as opt-in; audit which sounds fire.
- **Supabase-with-static-fallback** data pattern for events — resilient.
- **`EventRegisterButton` branching logic** (functionally) — just make the UI honest about which path it is.

### IMPROVE (good foundation, needs refinement)
- **Token layer** — it exists; enforce it (no inline hex), collapse the two systems into one, add real semantic + dark tokens.
- **Typography** — adopt UXplosion's fluid `clamp()` scale site-wide; formalize H1–H6 + body + label + kicker.
- **Card / Button / Input** — consolidate to `ui/*` components with variants; kill the ad-hoc classes.
- **Home page** — real stats, a "what membership gets you" section, testimonials/logos near the CTA, tighten the bento copy.
- **`/about`** — real team (photos, links), real partners, add a CTA, keep the GSAP stack only if it earns its scroll cost (or make it a simple grid + reduced-motion fallback).
- **Footer** — one component, add legal + newsletter, fix `<md` link hiding, fix contrast (`white/30`).
- **Nav** — add a persistent "Join" CTA button; fix the label-less tablet zone; light active state for child routes.
- **Blog** — give articles real URLs (`/blog/[slug]`), keep a modal *option* but not as the only reader; add author/date/tags/share.
- **Contact** — add category select, phone/location, `aria-live` on status.
- **Forms** — shared `<Field>`, `aria-live`, `aria-describedby`, `aria-pressed` on toggles, focus management on modals.
- **Background FX** — one configurable `<Backdrop>`; gate every ambient animation on reduced-motion; pause off-screen / on hidden tab.
- **Contrast** — lift `--on-surface-variant`, footer `white/30→/60+`, UXplosion `#7A7278→` lighter for body sizes.

### REDESIGN (significant work)
- **Whole-site visual language** — unify site + UXplosion into one brand with a "campaign mode" (UXplosion-style dark, energetic) as a *documented variant*, not a fork.
- **`/join`** — split or sequence membership vs recruitment; make recruitment actually submit; add post-conversion next steps.
- **`/about` team + credibility section** — from placeholder to real, with a clear narrative and CTA.
- **Event detail speaker/agenda** — bring non-UXplosion events up to the UXplosion speaker/timeline bar.
- **Footer + nav chrome** — full redesign as one system.
- **Empty/loading/error states** — currently ad-hoc; design a set.
- **Add missing pages** — privacy/terms, a proper membership-benefits page, possibly a "teams"/people page (the fake About team's real intent).

### PRESERVE FUNCTIONALLY (behavior must not change, visuals can)
- All routes + the `.html → clean` redirects.
- `/events/uxplosion3.0` bypassing global chrome (or replicate the outcome).
- Supabase reads with static fallback for events.
- Razorpay flows: membership (₹199) create-order → verify; event paid registration; signature verification.
- Contact → `contact_messages` → `/admin/messages`.
- Admin auth (Supabase password + `profiles.role === "admin"`) + `/admin/:path*` middleware + `noindex`.
- Member ID generation (unique 12-digit) + cohort year.
- Event lifecycle logic (`getEventLifecycle`, `getCountdownParts`), sorting (date desc, TBD last), related-events rule.
- `EventCard` details/register URL resolution + `DETAILS_URL_OVERRIDES` (id 17 → `/events/uxplosion3.0`).
- `prefers-reduced-motion` support (extend it, don't remove it).
- UX sound `data-sound` contract (keep the attribute API even if sounds are re-recorded/reduced).
- External registration links (UXplosion Google Form) — keep working; ideally add an on-site confirmation.
- Blog content model (blocks: title/paragraphs/bullets/quote) — keep the shape, change the reader.

---

## 19. Proposed future design system (evolution of SDC — do NOT implement now)

### Color tokens (single system, light + dark)
```
Brand
  --brand-red-600      #d9202f   (primary)
  --brand-red-700      #b21725   (primary-hover / pressed)
  --brand-red-900      #7a1220   (deep accent, dark surfaces)
  --brand-red-950      #8c0f1c   (gradient end)
  --brand-red-500      #e8394a   (gradient start)
  --gradient-brand     linear-gradient(135deg, #e8394a, #d9202f, #8c0f1c)

Campaign accent (UXplosion-derived, opt-in "event mode")
  --accent-pink        #FF2F7D
  --accent-coral       #FF5368
  --accent-orange      #FF8A45
  --accent-violet      #8C5CF6
  --gradient-campaign  linear-gradient(90deg, #FF2F7D, #FF5368, #FF8A45)

Neutrals — LIGHT (warm, keep the current Material ramp)
  --surface            #fefbfa
  --surface-1          #fbf3f2
  --surface-2          #f6ebe9
  --surface-3          #f0e2e0
  --surface-4          #e9d7d5
  --border             #e6d6d4
  --border-strong      #c9b6b3
  --text               #17181f
  --text-muted         #4a444a   (darkened from #5c5559 for AA at small sizes)

Neutrals — DARK (UXplosion-derived)
  --surface            #0A0A0C
  --surface-1          #0D0D0F
  --surface-2          #131316
  --border             rgba(255,255,255,0.09)
  --text               #F4F0F2
  --text-muted         #9A9298   (lightened from #7A7278 for AA)

Semantic
  --success  #2fae66 / on-dark #34d399
  --warning  #d9a441
  --danger   #d94a4a
  --info     #3a72d9
  --live     #10b981

Rule: components reference tokens only. No inline hex.
```

### Typography scale (fluid, Manrope display / Inter text — keep; Space Grotesk optional for campaign mode)
```
--font-display : "Manrope", system-ui           (700/800, tracking -0.02 to -0.04)
--font-text    : "Inter", system-ui             (400/500/600/700)
--font-mono    : ui-monospace                    (member IDs, code)

display-1  clamp(2.5rem, 9vw, 6rem)   / 0.92 / -0.04
display-2  clamp(2rem, 6vw, 4rem)     / 0.98 / -0.03
h1         clamp(2rem, 4.5vw, 3.25rem)/ 1.05 / -0.02
h2         clamp(1.6rem, 3.4vw, 2.5rem)/1.08 / -0.02
h3         clamp(1.3rem, 2.2vw, 1.75rem)/1.2 / -0.015
h4         1.25rem / 1.3 / -0.01
body-lg    1.125rem / 1.6
body       1rem / 1.6
body-sm    0.875rem / 1.5
label      0.75rem / 1.2 / uppercase / 0.14em   (min render size 12px)
kicker     0.6875rem / 1.1 / uppercase / 0.2em / 700 (display font)
```

### Spacing scale (4px base — Tailwind default; formalize section rhythm)
```
--space-section-y     : clamp(3rem, 8vw, 6rem)     (was py-12/16/20 & mb-16..32)
--space-section-y-sm  : clamp(2.5rem, 6vw, 4rem)
--space-gutter        : clamp(1rem, 4vw, 2rem)     (unify .page-gutter/.section-shell)
--space-card          : clamp(1.5rem, 3vw, 2.5rem)
--space-stack         : 1rem  / 1.5rem / 2rem      (element gaps)
--grid-gap            : clamp(1rem, 2vw, 1.5rem)
```

### Grid & containers
```
--container          : 80rem  (1280) — site max
--container-narrow   : 45rem  (prose, forms)
--container-reading  : 51rem  (UXplosion-parity ~1180px content wells → normalize to one)
Columns: 12-col grid, gutter = --grid-gap. Add xl/2xl treatments (don't just center in whitespace).
Breakpoints: 640 / 768 / 1024 / 1280 / 1536 (Tailwind default) — but ensure the nav shows labels from 768, not 1024.
```

### Components (variants, not forks)
```
Button    variant: primary | secondary(outline) | ghost | link | gradient | campaign
          size: sm(36) | md(44) | lg(52)
          radius: --radius-pill for marketing/campaign, --radius-md for app/admin
          state: hover(-2px + brand glow), active(scale .97), focus-visible(2px ring, --brand-red-600 @ 40%)
          casing: sentence case default; UPPERCASE only for `label`-styled micro CTAs
Card      variant: surface | glass | outline | campaign
          radius: --radius-lg (single value); padding: --space-card
          one component replaces ui/card + .glass-card + ad-hoc + GlassCards shell
Field     label + control + hint(aria-describedby) + error(aria-live); one input style
Badge/Chip variant: neutral | brand | success | live | warning ; sizes sm/md
Nav       one header: logo + links + persistent "Join" button; mobile = bottom dock (keep lamp);
          scrolled state = subtle bg/blur; active state matches route prefix
Footer    one component; columns collapse to accordion <md; slots: brand, nav, connect, legal, newsletter
CTA band  one "join/register" section component with campaign variant
Modal/Dialog one primitive (focus trap + restore + ESC + aria-modal) for blog reader, register, menu, gallery
Backdrop  one component: variant none|dots|matrix|aurora|particles; always reduced-motion aware; pauses off-screen
Stat/KPI  one tile; single source for the numbers
```

### Icon system
- Adopt the **custom animated SVG set** as canonical. Standardize props (`size`, `strokeWidth`, `color`, `title` for a11y, `motion` on/off). Drop `lucide-react` + the Material Symbols `<link>`. Provide a static (non-animated) fallback per icon for reduced-motion.

### Radius
```
--radius-sm  6px    (inputs in admin, small chips)
--radius-md  10px   (buttons app/admin, inputs)
--radius-lg  20px   (cards)
--radius-xl  28px   (feature cards / campaign)
--radius-pill 9999px (marketing CTAs, badges, nav)
--radius-none 0     (allowed only as an explicit campaign choice, documented)
```

### Shadows
```
--shadow-xs  0 1px 2px rgba(0,0,0,.06)
--shadow-sm  0 4px 12px rgba(0,0,0,.08)
--shadow-md  0 10px 28px rgba(0,0,0,.14)
--shadow-lg  0 24px 60px rgba(0,0,0,.22)
--shadow-brand-glow  0 0 24px rgba(217,32,47,.30)      (hover on primary)
--shadow-campaign-glow 0 10px 34px rgba(255,47,125,.30)
Glass = 1px border(--border) + backdrop-blur(12px) + --shadow-sm (used sparingly; perf budget).
```

### Motion principles
1. **One entrance:** `Reveal` (fade + 16–24px rise, 400–500ms, `cubic-bezier(0.22,1,0.36,1)`, once).
2. **One page transition:** 200–280ms opacity (no vertical shift on long pages).
3. **Hover:** ≤ 200ms; lift ≤ 4px; brand glow on primary only.
4. **Press:** `scale(0.97)`, 120–150ms.
5. **Scroll-linked** (rings, parallax, stacks): only where it tells a story (UXplosion hackathon); always with a static reduced-motion version; pause when off-screen.
6. **Ambient backgrounds:** subtle, GPU-cheap, **must** stop under `prefers-reduced-motion` and when `document.hidden`.
7. **Sound:** opt-in, muteable, ≤ one sound per interaction, never on scroll/hover.
8. Respect `prefers-reduced-motion` everywhere (extend current coverage to the 5 gaps in §9).

---

## 20. Redesign priorities (ranked)

> Format: **Priority → Problem → Why it matters → Recommended direction.** No implementation here.

1. **Unify the two design systems** → Site vs UXplosion look like different companies → brand trust + maintainability → one token set + type scale + component library; UXplosion's dark/energetic look becomes a documented "campaign" theme variant, not a separate codebase.
2. **Fix contradictory stats/claims** → 50k+ vs 2500+ members, 120+ vs 50+ events, fake "45 chapters" → credibility on the highest-traffic pages → single source of truth for numbers; only claim what's verifiable; component-ize the stat tile.
3. **Make the recruitment form actually submit** → `/join` wizard tells users "we saved your application" but makes no API call → users think they applied; SDC loses every applicant → wire to `/api/recruitment` → Supabase table + `/admin` view; add real confirmation + email.
4. **Replace placeholder About team/partners** → fake names/bios/logos shipped as real → dishonest, undermines the whole About page → real people (photo, role, links), real partner logos, or remove the section until ready.
5. **Disambiguate "Register Now"** → one label, 4 behaviors (external form / Razorpay / member redirect / band) → users can't predict outcomes, drop-off → distinct labels + icons ("Register on Google Form ↗", "Pay & Register ₹X", "Join to Register"); consistent styling per type.
6. **Consolidate the primary CTA** → Get Started / Become a Member / Join Now / Join / "Or become a member →" → diluted funnel → one verb+label ("Become a Member"), one style, add a **persistent nav CTA** (the commented-out "Join").
7. **Enforce the token layer / kill inline hex** → `#d9202f` etc. hard-coded everywhere despite tokens existing → any rebrand touches every file; theming impossible → lint rule + refactor to `text-primary` / `var(--*)`; collapse the neutral-oklch vs warm-Material duplication.
8. **Component consolidation (Button / Card / Input / Modal / Backdrop / Footer / Nav)** → 2–5 implementations each → inconsistency + bloat → build the library in §19; migrate page by page (behavior preserved).
9. **Accessibility pass on modals + focus + `aria-live`** → blog & register modals have no focus trap/restore/ESC; status changes are silent; toggles lack `aria-pressed` → excludes keyboard/SR users, legal risk → one accessible Dialog primitive; live regions on all form status; `aria-pressed` on filters; focus-to-h1 on route change.
10. **Contrast fixes** → footer `white/30` (~2.7:1), UXplosion `#7A7278` on black (~3.9:1), small primary-red labels → fails WCAG AA → darken/lighten muted tokens; min 12px for `label` type; re-check gradient headings.
11. **Reduced-motion coverage gaps** → matrix canvas, ambient CSS drift, marquees, GSAP stacks ignore `prefers-reduced-motion` (site side) → vestibular-trigger risk → gate all ambient/scroll motion; provide static fallbacks (UXplosion already does this — mirror it).
12. **Blog gets real URLs** → articles only exist in a modal, no `/blog/[slug]` → unshareable, invisible to SEO/social, no deep links → `/blog/[slug]` pages (server-rendered) + optional quick-view modal; add author/date/tags/share/related.
13. **Background-FX performance** → perpetual 20fps full-viewport canvas + many `will-change` infinite CSS animations + heavy `backdrop-filter` → mobile jank, battery drain → one `<Backdrop>` component: rAF not `setInterval`, `IntersectionObserver` + `visibilitychange` pause, blur budget, reduced-motion off.
14. **`/about` needs a CTA + narrative arc** → informational dead-end, no next step → add a closing "Join / See events" CTA band; tighten mission/vision/story into one flow; decide if the 3×100vh GSAP stack is worth its scroll cost.
15. **Event detail speaker/agenda parity** → non-UXplosion events show speakers as a bare comma string, agenda "times" are labels → thin, inconsistent → structured speaker objects (photo, title, org, links), real agenda times, reuse the UXplosion timeline treatment.
16. **`/join` structure** → membership pay + team recruitment stacked with no framing → users don't know which to do or in what order → clear split (tabs or sequence), explain the difference, show membership benefits *before* the pay button.
17. **Post-conversion experience** → membership/contact/register success = a static card, no email shown, no next step → add "check your email", "join the WhatsApp/Discord", "add to calendar", "here's your member card"; consistent success component.
18. **Font loading cleanup** → Manrope+Inter loaded twice (`next/font` + raw `@import`), Geist + unused Material Symbols, 3 more on UXplosion → slower first paint, CLS → one loading path (`next/font`), drop the `@import` and Material Symbols link, subset weights actually used.
19. **Nav usability** → no text labels 768–1023px, no active state for child routes, no persistent CTA → wayfinding gaps → labels from `md`, route-prefix active state, persistent "Join" button, keep the bottom dock + lamp on mobile.
20. **Footer redesign** → near-black break, half the links hidden `<md`, no legal/newsletter, duplicated socials, contrast fails → one themeable footer: brand / nav / connect / **legal** / **newsletter**; accordion on mobile; fix contrast; single social list.
21. **Add legal pages (privacy / terms) + code of conduct** → collects name/email/phone/roll + takes payments with no policy → compliance + trust → `/privacy`, `/terms`, link in footer; event code of conduct.
22. **Formalize empty / loading / error states** → ad-hoc per feature (events empty state good, others missing) → inconsistent, some flows have no feedback → design a set (skeletons exist for event cards — extend the pattern).
23. **Remove dead weight** → both `motion` + `framer-motion`, GSAP for one section, full visx/d3 + `@number-flow` (counters not even animated), lucide + Material Symbols, `design.pdf`, starter SVGs, duplicated `about/` static site, `UxplosionTeams`, `page.disabled.tsx`, `*copy*` assets → bundle size + confusion → pick one animation lib; `dynamic()` the chart/GSAP/UXplosion chunks; either wire `@number-flow` into the stats or drop it; clean `public/` and repo root.
24. **Image pipeline** → homepage remote `<img>` (no dims/sizes), `unoptimized` logos/avatars, low-res WhatsApp blog covers → CLS + slow LCP → all through `next/image` with `sizes`; host partner logos locally; re-export blog covers; standardize aspect ratios.
25. **Responsive `xl`/`2xl` + one container system** → content caps at `max-w-7xl`/`1180px`, wide screens = empty margins, two container widths → under-designed large displays, misaligned site vs campaign → one `--container` scale + deliberate `xl`/`2xl` layouts (wider grids, larger art).

---

## 21. Final quality check

| # | Check | Status |
|---|-------|--------|
| 1 | Every route inspected | ✅ (all `src/app/**/page.tsx` + api routes; `/admin` index 5-line file only skimmed — `UNVERIFIED`) |
| 2 | Every major page documented | ✅ (home, about, blog, contact, events, event detail, UXplosion, join, admin) |
| 3 | Reusable components identified | ✅ (`SDC_COMPONENT_INVENTORY.md`) |
| 4 | Design system extracted from actual code | ✅ (`globals.css`, `uxplosion.css`, `marketing-pages.css`, component classes) |
| 5 | Responsive behavior inspected | ✅ (breakpoints, containers, nav modes, stacking, tables) |
| 6 | Animations / interactions inspected | ✅ (22-row table §9) |
| 7 | User journeys documented | ✅ (§12, 7 journeys) |
| 8 | Forms & CTAs documented | ✅ (§13, §14) |
| 9 | Accessibility issues identified | ✅ (§15, concrete findings) |
| 10 | No code modified | ✅ (only 4 new `.md` files created at repo root) |

### `UNVERIFIED` items
- Live Supabase schema (only migrations + TS row types read).
- `/admin` (index) render/redirect behavior; full `EventForm` field list.
- Whether `RecruitmentFlow` persists anywhere (no API call found → assumed **no**).
- Live usage of `TrailCard`, `ShimmeringText`, `glass-cards-demo`, `tubelight-navbar-demo`, `marketing-pages.css` (`.interactive-bg`), `@number-flow/react`, chart components beyond the area chart.
- Exact contrast ratios (estimated from token hex; not measured with a tool).
- Whether any `next` caching/revalidate config applies to `/events` data.
- `heroTextAssembly.ts` internals (referenced, not line-by-line read).
