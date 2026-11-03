# SDC Website — Component & Design-Pattern Inventory

> Reverse-engineered from `src/components/**`. No code changed.
> ~140 component/util files. Three visual "worlds" coexist:
> **(A) Site chrome** (Manrope/Inter, warm off-white surfaces, red accent),
> **(B) UXplosion 3.0** (Space Grotesk/Baloo, near-black, pink→orange gradient),
> **(C) Admin** (plain Material-token forms/tables).

---

## 1. Layout & chrome components

| Component | Location | Purpose | Used On | Variants | Interactive? |
|-----------|----------|---------|---------|----------|--------------|
| `RootLayout` | `src/app/layout.tsx` | HTML shell, font vars, `<html class="dark">`, Material Symbols link | All | — | No |
| `SiteChrome` | `src/components/SiteChrome.tsx` | Conditionally wraps children in Navbar/Footer/PageTransition/UxSoundProvider | All | Skips chrome for `/admin/*` and `/events/uxplosion3.0` | No |
| `Navbar` | `src/components/Navbar.tsx` | Fixed logo (top-left), hamburger (top-right, `<md`), mobile drawer, delegates to `NavBar` | Site | Mobile drawer vs desktop | Yes — menu toggle, ESC close (returns focus to the hamburger), focus moves into the menu on open and is contained by Tab/Shift+Tab, body-scroll lock, `data-sound` |
| `NavBar` (tubelight) | `src/components/ui/tubelight-navbar.tsx` | The actual nav pill | Site | **Mobile:** fixed bottom dock, icon-only. **768–1024px:** top pill, icon-only. **≥1024px:** top pill, text labels. Animated "lamp" (`layoutId`) under active item | Yes — active state, hover color |
| `Footer` | `src/components/Footer.tsx` | Dark (`#0e0e0e`) 3-column footer | Site | Columns hidden `<md` (only brand col shows) | Yes — hover translate links, `SoundToggle` |
| `UxplosionNav` | `src/components/uxplosion/UxplosionNav.tsx` | Bespoke fixed nav, blur-on-scroll, burger + full-screen menu | UXplosion | scrolled / not-scrolled bg | Yes — scroll listener, menu, body lock |
| `UxplosionFooter` | `src/components/uxplosion/UxplosionFooter.tsx` | Minimal 2-item footer bar | UXplosion | — | No |
| `AdminLayout` | `src/app/admin/layout.tsx` | Admin header + nav + `max-w-6xl` main | Admin | — | No |
| `PageTransition` | `src/components/ux/PageTransition.tsx` | Route-change fade (`opacity/y`, 0.28s) | Site | Disabled under `prefers-reduced-motion` | No (auto) |

**Redundancy:** two full nav systems + two footers + two "burger menu + overlay" implementations (`Navbar` vs `UxplosionNav`). Candidate for a single themeable `SiteHeader` / `SiteFooter`.

---

## 2. Hero components

| Component | Location | Purpose | Used On | Notes |
|-----------|----------|---------|---------|-------|
| `HomeHero` | `src/components/home/HomeHero.tsx` | Display headline "SDC SNIST", subhead, 2 CTAs, static "Welcome to SDC SNIST" badge, scroll cue | `/` | `framer-motion` staggered fade-up; `useReducedMotion` gate; `min-h-screen` on `md+`; no props (takes no visitor data) |
| `HeroSpotlight` | `src/components/home/HeroSpotlight.tsx` | Pointer-following radial glow (desktop, fine pointer only) | `/` hero | Pure inline style, `aria-hidden` |
| `EventsHero` + `EventsJoinCta` | `src/components/events/EventsHero.tsx` | Events index hero + bottom membership CTA band | `/events` | `hero-gradient` text clip; floating blurred blob (motion) |
| `EventHero` | `src/components/events/EventHero.tsx` | Full-bleed image hero for a single event, category kicker, date/location pills | `/events/[id]` | `min-h-[420px]`, dark bottom gradient, `next/image priority` |
| `UxplosionHero` | `src/components/uxplosion/UxplosionHero.tsx` | Particle "text assembly" wordmark, event info, highlights card, 2 CTAs, decorative "play panel" | `/events/uxplosion3.0` | Canvas + `heroTextAssembly.ts` + `document.fonts.ready`; staggered `content(delay)` inline transitions; decorative SVG "wireframe/prototype/flow" panel hidden `<900px` |

---

## 3. Buttons & CTA patterns

| Pattern | Where | Style | Notes |
|---------|-------|-------|-------|
| `Button` (shadcn/base-ui) | `src/components/ui/button.tsx` | `class-variance-authority`; variants: `default / outline / secondary / ghost / destructive / link`; sizes `xs/sm/default/lg/icon*`; `rounded-lg`, `h-8` default | **Barely used in marketing pages** — most CTAs are hand-rolled `<Link>`/`<a>`/`<button>` with bespoke classes |
| Primary marketing CTA | Home, Events, Contact, Join | `rounded-xl` **or** `rounded-full`, `bg-[#d9202f]` / `.hero-gradient-fill`, `uppercase tracking-wide`, hover `-translate-y` + red glow shadow | Radius is inconsistent (xl vs full); color usually literal hex, not token |
| Secondary CTA | Home, Contact | `rounded-xl border border-outline-variant`, hover `bg-black/5` | |
| Event card actions | `EventCard` | 2 buttons: "Details" (`rounded-lg` outline → fills red on hover) + "Register Now" (`rounded-lg` solid red) | Plus a hover-reveal "Register Now" chip (top-right, `@starting-style`) |
| "Register Now" pill (UXplosion) | ~6 places | `rounded-full` gradient `#FF2F7D→#FF5368→#FF8A45`, `text-[#0A0A0C]`, `.ux-reg-btn` hover lift + `.ux-reg-shine` sweep | Always links to the Google Form |
| UXplosion pricing CTA | `UxplosionPricing` | `rounded-full`; emphasized tier gradient, others outline | Cards themselves are `rounded-none` |
| `.pressable` utility | `globals.css` | `active:scale-.97` press feedback | Applied to many CTAs/links |
| `EventRegisterButton` | `src/components/events/EventRegisterButton.tsx` | Renders link / member-CTA / paid Razorpay modal | State machine: external URL → member CTA → paid modal (name/email/phone) |

---

## 4. Card components

| Component | Location | Style | Used On |
|-----------|----------|-------|---------|
| `Card` family | `src/components/ui/card.tsx` | `rounded-2xl border border-white/10 bg-surface-container-high shadow-sm`; `CardHeader/Title/Description/Content/Footer` | **Rarely imported** — most "cards" are ad-hoc divs |
| `.glass-card` (CSS util) | `globals.css` | `rgba(255,255,255,.6)` + `backdrop-blur(12px)` + `1px solid rgba(217,32,47,.12)` | About mission/vision, stats, Contact form, Events CTA, Join forms, membership success |
| Home feature bento | `src/app/page.tsx` inline | 6 cells on a `md:grid-cols-12` grid, mixed `rounded-xl`, `bg-surface-container*`, icon chip `rounded-2xl` | `/` |
| Stat card | Home + About inline | `.glass-card rounded-2xl/3xl`, radial glow, big colored number, hairline divider, uppercase label | `/`, `/about` (different numbers, different sizes) |
| `EventCard` | `src/components/events/EventCard.tsx` | `rounded-2xl border-outline-variant/40 bg-surface-container-highest`; 224px image header w/ mode + status badges, gradient scrim, title overlay; stat row; winner chip; 2 actions | `/events`, `/events/[id]` related, `EventsSection` |
| `EventCardSkeleton` | `src/components/events/EventCardSkeleton.tsx` | Loading placeholder | (loading states) |
| `BlogCard` | `src/components/blog/BlogCard.tsx` | `rounded-2xl` surface; image header + category tone badge + title overlay; excerpt; "Read Article" | `/blog` grid; `motion` spring hover (lift + image scale + shadow) |
| `TrailCard` | `src/components/ui/trail-card.tsx` | *(present; usage not confirmed — `UNVERIFIED`)* | — |
| `GlassCards` / `StackedCards` | `src/components/ui/glass-cards.tsx` | Conic-gradient border + heavy glass (`blur(25px) saturate(180%)`), inner dark panel, `AvatarGroup` | `/about` team section; GSAP ScrollTrigger scale-stacking, each 100vh sticky |
| UXplosion Essentials / Timeline / Pricing / Archive rows | `Uxplosion*` | `rounded-[28px] border-white/10` cards, `rounded-none` pricing, hairline "list rows" with hover `translateX(8px)` + gradient text | UXplosion |

**Radius chaos:** `rounded-lg` (Button), `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-[28px]`, `rounded-[1.75rem]`/`[2.5rem]`, `rounded-none` (UXplosion pricing), `rounded-full` all appear as "the card/button radius".

---

## 5. Forms & inputs

| Component | Location | Fields | Validation | States |
|-----------|----------|--------|------------|--------|
| `ContactForm` | `src/components/ContactForm.tsx` | name, email, message (all required) | client `required` + server (name ≥2, email regex, message 10–5000) | loading (spinner), error banner, success card ("Send another" / "Become a Member"); UX sounds |
| `BecomeMemberForm` | `src/components/membership/BecomeMemberForm.tsx` | fullName, rollNumber, phone, email (all required) | client `required` | loading ("Opening Razorpay…"), error banner, success card with mono 12-digit member ID + cohort year; Razorpay checkout; sounds |
| `RecruitmentFlow` | `src/components/recruitment/RecruitmentFlow.tsx` | Step 2: fullName, rollNumber, yearBranch, email, phone, motivation (≥40 chars). Step 3: role challenge (writing textarea and/or choice buttons) | client only; motivation length; challenge answer ≥20 chars | 4-step wizard `roles → apply → challenge → done`; progress rail; `AnimatePresence`; **no persistence / no API call** |
| `EventRegisterButton` modal | `src/components/events/EventRegisterButton.tsx` | name, email, phone (phone optional) | client `required` | modal, loading "Processing…", error/success banners, Razorpay |
| Admin `LoginForm` | `src/app/admin/login/page.tsx` | email, password | Supabase + role check | error banner, loading |
| `EventForm` | `src/components/admin/EventForm.tsx` | Full event schema (`UNVERIFIED` field list — not fully expanded) | — | create/edit |
| `FilterBar` | `src/components/events/FilterBar.tsx` | search text input + 4 mode toggle pills (`ALL/ONLINE/OFFLINE/HYBRID`) | — | active pill state; `data-sound` |
| Blog category pills | `src/app/blog/page.tsx` inline | 6 filter pills | — | active pill = `bg-primary text-white` |

**Shared input style** (site): `rounded-xl border border-outline-variant/30–40 bg-surface-container-low(est) px-4 py-3(.5)` + `focus:border-primary/50` (+ sometimes `focus:shadow-[0_0_0_3px_rgba(217,32,47,.12)]`). Defined as a local `inputClass` const, **copy-pasted** across `ContactForm`, `BecomeMemberForm`, `RecruitmentFlow`, `EventRegisterButton` with small drift.

---

## 6. Interactive / motion primitives

| Component | Location | Purpose | Reduced-motion? |
|-----------|----------|---------|-----------------|
| `Reveal` | `src/components/home/Reveal.tsx` | `whileInView` fade-up (y36, 0.5s, `once`, `amount:.2`) — the standard section entrance | Yes — renders plain `<div>` |
| `ShimmeringText` | `src/components/shimmering-text.tsx` | Per-char color shimmer loop | Yes; usage `UNVERIFIED` |
| `InteractiveBackground` | `src/components/ui/InteractiveBackground.tsx` | Fixed `z-[-1]` canvas: matrix "1/0" rain (`setInterval 50ms`), floating code snippets (`setInterval 3s`), mouse parallax | Partial — disables snippets + parallax, **matrix rain still runs** |
| `AmbientBackground` | `src/components/ui/AmbientBackground.tsx` | Absolute dot-grid + 2 drifting blurred blobs (CSS `ambient-drift` 22s/28s) | No explicit gate (CSS animation always on) |
| `InteractiveBackground` marketing variant | `src/styles/marketing-pages.css` (`.interactive-bg`, `.bg-orb`, `.bg-grid`) | Orange/fuchsia orbs + grid | `UNVERIFIED` if still wired to a component |
| `CampusMoments` | `src/components/home/CampusMoments.tsx` | Horizontal-scroll photo strip, per-item `whileInView` | Yes |
| `EventsPulseChart` | `src/components/events/EventsPulseChart.tsx` | visx area chart (cumulative attendees), 1200ms animate, custom tooltip/grid/axis | via chart internals |
| `charts/*` (~70 files) | `src/components/charts/**` | "Bklit"-style animated time-series chart system (visx + d3 + motion): area, grid, axes, tooltip, loading sweep, projection, decimation, phase orchestrator | Extensive, self-contained; only `AreaChart`/`Area`/`Grid`/`XAxis`/`ChartTooltip` used on the site so far |
| `UxplosionParticles` | `src/components/uxplosion/UxplosionParticles.tsx` | Full-page particle canvas | `@media reduced-motion` kills all `.ux-page` animation |
| `UxplosionHackathon` | `src/components/uxplosion/UxplosionHackathon.tsx` | 400vh scroll-pinned SVG progress ring with 8 radial phase labels, `useScrollProgress` | Partial |
| `heroTextAssembly.ts` | `src/components/uxplosion/heroTextAssembly.ts` | Particle-burst → wordmark choreography (canvas + gsap) | Gated by `usePrefersReducedMotion` in `UxplosionHero` |
| `avatar-group` (animate-ui) | `src/components/animate-ui/**` | Overlapping avatars + hover tooltip | — |
| `UxSoundProvider` / `useUxSound` / `ux-sound.ts` / `SoundToggle` | `src/components/ux/*`, `src/lib/ux-sound.ts`, `src/hooks/useUxSound.ts` | Global Web-Audio UI SFX layer: unlock on first interaction, `data-sound="button|select|tap|toggleOn|…"` click delegation, mute toggle (persisted). 28 WAV files in `public/sounds/sine/` | Respects mute; not motion-gated |

---

## 7. Icon system

| System | Location | Count | Used where |
|--------|----------|-------|------------|
| Custom animated SVG icons | `src/components/ui/*-icon.tsx` | ~60 | Everywhere on the site — each is a `forwardRef` `motion.svg` (Tabler-style paths) with hover `startAnimation`/`stopAnimation`, `size/color/strokeWidth/className/loop` props (`AnimatedIconProps` in `ui/types.ts`) |
| `lucide-react` | dependency + `components.json` `iconLibrary: "lucide"` | configured | Effectively unused in app code (custom icons win) |
| Emoji | inline | — | `HIGHLIGHTS` in UXplosion hero (🏆 💼 🎁), pricing ★ ✓ |
| `✳` glyph | inline | — | UXplosion section kickers |
| Material Symbols Outlined | `<link>` in `layout.tsx` + `.material-symbols-outlined` CSS | loaded | No confirmed usage — dead weight |

---

## 8. Badges / chips / misc

| Pattern | Where | Style |
|---------|-------|-------|
| Section kicker | site | `.type-kicker` — 10px, 700, uppercase, `tracking-[0.2em]`, `text-primary` |
| UXplosion kicker | UXplosion | `✳` + 11–13px bold uppercase `tracking-[0.2em] text-[#FF6FA8]` |
| Event mode badge | `EventCard` | pill, per-mode color (blue/orange/purple), backdrop-blur |
| Event status badge | `EventCard` | `upcoming` (red) / `live` (emerald `● Live`) / `past` (grey) via `getEventLifecycle` |
| Count pill | `/events` | `rounded-full border-[#d9202f]/25 bg-[#d9202f]/10 text-[#d9202f]` "N EVENTS" |
| Blog category badge | `BlogCard` | tone per category (`getCategoryTone`) |
| Winner chip | `EventCard` | `border-yellow-500/20 bg-yellow-500/10`, trophy icon |
| Cohort chip | `/admin/members` | `border-primary/30 bg-primary/10` "YYYY cohort · N" |
| Countdown chip | `EventCard` | "Starts in {Nd Nh}" via `getCountdownParts` |

**No components for:** breadcrumbs, tabs, tooltips (except chart + avatar), global modal/dialog primitive (blog + register + event-register each hand-roll their own overlay), carousels (marquees are CSS/RAF), accordion primitive (UXplosion FAQ + blog are bespoke).

---

## 9. Components to unify in a redesign

1. **Nav** — merge `Navbar`/`NavBar`/`UxplosionNav` into one themeable header; keep tubelight bottom-dock as a mobile mode.
2. **Footer** — one `SiteFooter`, theme prop for the UXplosion variant.
3. **Card** — adopt `ui/card.tsx` (or a new token-driven `Surface`) everywhere; kill ad-hoc `.glass-card` divs and the 6+ radii.
4. **Button** — route every CTA through `ui/button.tsx`; add `gradient` + `pill` variants for the marketing/UXplosion looks.
5. **Input / Field** — extract the copy-pasted `inputClass` into one `<Field>` / `<TextInput>` with label + error slots.
6. **Overlay / Dialog** — one primitive for blog modal, event-register modal, mobile menu, gallery lightbox (currently 4 implementations).
7. **Stat / KPI tile** — one component; fix the contradictory numbers (see audit §17).
8. **Section shell** — `.section-shell` / `.page-gutter` / inline `mx-auto max-w-7xl px-4…` / `max-w-[1180px]` are 4 ways to do the same container.
9. **Background FX** — consolidate `InteractiveBackground`, `AmbientBackground`, `marketing-pages.css` orbs, `UxplosionParticles` into one configurable `<Backdrop variant>`.
10. **Icons** — pick one system (custom animated set is the strongest); drop lucide + Material Symbols config.
11. **Reveal** — already good; make it the *only* scroll-entrance mechanism (UXplosion reuses it — keep that).

---

## 10. Verification notes

- ✅ All `src/components` subtrees enumerated; primary components read in full.
- ⚠️ `UNVERIFIED`: `EventForm` full field list, `TrailCard` / `ShimmeringText` / `glass-cards-demo` / `tubelight-navbar-demo` live usage, `marketing-pages.css` wiring, `InteractiveBackgroundNumberFlow`/`@number-flow/react` usage.
- ⚠️ `UNVERIFIED`: whether any `charts/**` component beyond the area chart is rendered anywhere user-facing.
