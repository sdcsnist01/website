# SDC Website — Route & Page Inventory

> Reverse-engineered from source (`src/app/**`). No code changed.
> Framework: **Next.js 16 (App Router, RSC)** · React 19 · TypeScript · Tailwind CSS v4.
> Routing = file-system based under `src/app/`. Two route redirects in `next.config.ts`:
> `/about/about.html → /about`, `/blog/blog.html → /blog` (permanent).
> Middleware (`middleware.ts`) runs only on `/admin/:path*` (Supabase session refresh / gate).

---

## 1. Public, user-facing routes

| Route | Page Name | Purpose | Main Sections | Primary CTA | Secondary CTAs | Key Components | Special Behavior |
|-------|-----------|---------|---------------|-------------|----------------|----------------|------------------|
| `/` | Home | Introduce SDC SNIST, funnel to membership | Hero · Campus Moments strip · 6-cell feature bento · Stats (4) · *(commented-out "Join the Community" video CTA)* | **Get Started** → `/join` | **Learn More** → `/about`; "View Events" bento tile → `/events`; "All events" → `/events` | `HomeHero`, `HeroSpotlight`, `InteractiveBackground`, `CampusMoments`, `Reveal`, custom animated icons | Server component, statically prerendered. Hero badge is a static "Welcome to SDC SNIST" (no request-header or visitor IP lookup). Fixed canvas "matrix rain" background. |
| `/about` | About | Mission / vision / story / partners / team | Hero · Mission + Vision cards · Founding Story · Impact stats (3) · Partner logo marquee (2 rows) · `GlassCards` team stack | *(none — informational)* | *(none)* | `AmbientBackground`, `GlassCards` (GSAP ScrollTrigger), partner marquee (CSS) | GSAP pin/scale "stacked cards" for Board / Tech Leads / Core Members; each card 100vh sticky. Team data is **placeholder/stub** (`src/data/about.ts`). |
| `/blog` | Blog | Community storytelling / event recaps | Featured post hero · Category filter pills · 3-col card grid · Article modal | "Read Article" (opens modal) | Category pills (`all/community/event/growth/digital/article`) | `BlogCard`, `AmbientBackground`, in-page modal | Client component. **No dynamic `/blog/[slug]` route** — articles render in a full-screen modal overlay from `blogPostsStub`. |
| `/contact` | Contact | Inbound queries, collab, speaker proposals | Intro copy · social link cards (IG/LinkedIn/GitHub) · "become a member" link · Contact form card | "Send Message" (form submit) | Social links (external); "Or become a member →" → `/join` | `ContactForm`, `AmbientBackground`, `motion` fade-up | `src/app/contact/layout.tsx` supplies metadata only. Form POSTs `/api/contact` → Supabase `contact_messages`. |
| `/events` | Events index | Browse all SDC events | Hero (count) · `EventsPulseChart` (cumulative attendees) · Filter bar (search + mode) · Event card grid · "Join the community" CTA | **Browse Events** (anchor `#events`) | "Become a Member" → `/join`; per-card "Details" / "Register Now" | `EventsHero`, `EventsSection`, `EventCard`, `FilterBar`, `EventsPulseChart` (visx), `Reveal` | Server component. `getAllEvents()` reads Supabase `events` table; **falls back to static `src/data/events.ts`** if Supabase env/table missing. Client-side search + mode filter with `AnimatePresence` list transitions + CSS `@starting-style`. |
| `/events/[id]` | Event detail (dynamic) | Single event page | Hero (image) · About / tags / "what you'll learn" / "who should attend" · sticky Details sidebar · Agenda **or** Speaker · Gallery · Register CTA band · Related events | **Register Now / Secure Your Spot** (`EventRegisterButton`) | Related event cards → other `/events/[id]` | `EventHero`, `EventDetails`, `EventAgenda`, `EventSpeaker`, `EventGallery`, `EventRegisterButton`, `EventCard` | `generateMetadata` per event. `notFound()` if id missing. `[id]` matches the event **`slug`** (Supabase) or numeric `id` (static). Event `17` has `detailsUrl: /events/uxplosion3.0` override (see `EventCard` `DETAILS_URL_OVERRIDES`). Register button branches: external URL → paid Razorpay modal → "become a member". |
| `/events/uxplosion3.0` | UXplosion 3.0 landing | Standalone campaign microsite | Custom nav · Hero (particle text assembly) · About / "design journey" · Essentials (3) · Timeline (3 days + finale) · Hackathon (scroll-driven ring) · Speaker · Archive · Sponsors marquee · FAQ (accordion) · Pricing (3 tiers) · Contact (organizers) · Custom footer | **Register Now** → `https://forms.gle/qa3krME1Ua34rEvD9` (Google Form, repeated ~6×) | "View Timeline" (anchor); nav anchors Timeline / Experience / FAQ | `Uxplosion*` component family, `UxplosionParticles`, `heroTextAssembly.ts`, `useScrollProgress` | **Opts out of global chrome** (`SiteChrome` skips Navbar/Footer/PageTransition/UxSoundProvider for this path). Loads its own fonts (Space Grotesk, Manrope, Baloo 2) and `src/styles/uxplosion.css`. Fully dark theme (`#0A0A0C`). `UxplosionTeams.tsx` exists but is **not rendered** (unused). |
| `/join` | Recruitment / Membership | Paid membership + team recruitment | "Become a Member" form section (`#membership`) · `RecruitmentFlow` wizard | **Pay ₹199 with Razorpay** (membership) | Role "Apply" buttons; "Become a paid member" (`#membership` anchor) | `BecomeMemberForm`, `RecruitmentFlow`, `AmbientBackground` | Metadata title = "Recruitment". Membership: Razorpay checkout → `/api/membership/*` → returns 12-digit member ID + cohort year. Recruitment wizard (`roles → apply → challenge → done`) is **client-only and does not persist** — the "done" screen claims the application was saved but no API call is made. `UNVERIFIED` whether submissions are captured anywhere. |
| `/community` | Community Pulse | *(disabled)* GitHub contribution heatmap | — | — | — | — | `src/app/community/page.tsx` calls `notFound()`. Real implementation parked at `page.disabled.tsx` (imports 232 KB `community-pulse.json`). To restore: rename files. |

---

## 2. Admin routes (private, `noindex`, session-gated)

`middleware.ts` matches `/admin/:path*` and runs `updateSession` (Supabase SSR). `src/app/admin/layout.tsx` sets `robots: { index:false, follow:false }`. Auth = Supabase email/password + `profiles.role === "admin"` check.

| Route | Purpose | Notes |
|-------|---------|-------|
| `/admin` | Entry | `src/app/admin/page.tsx` (5 lines — redirect/placeholder). |
| `/admin/login` | Admin sign-in | Supabase `signInWithPassword`, then verifies `profiles.role`. `?error=unauthorized` / `?next=` query params. Wrapped in `<Suspense>`. |
| `/admin/events` | Event list / manage | Server-rendered table from Supabase `events`. New / Edit / View / Delete actions. `SignOutButton`, `DeleteEventButton`. |
| `/admin/events/new` | Create event | Renders `EventForm` (`src/components/admin/EventForm.tsx`). |
| `/admin/events/[id]/edit` | Edit event | Loads row by id, renders `EventForm`. |
| `/admin/members` | Membership registrations | Table from Supabase `sdc_members`, grouped by `membership_year` cohort. |
| `/admin/messages` | Contact inbox | `force-dynamic`; last 100 rows of `contact_messages` via admin client; `mailto:` reply links. |

---

## 3. API routes (`src/app/api/**/route.ts`)

| Endpoint | Method | Purpose | Integrations |
|----------|--------|---------|--------------|
| `/api/contact` | POST | Store contact-form message | Validates (name ≥2, email regex, message 10–5000 chars) → Supabase admin insert `contact_messages`. |
| `/api/membership/create-order` | POST | Start membership payment | Creates Supabase user + pending `sdc_members` row, generates unique 12-digit member ID, creates Razorpay order (₹199 / 19900 paise). |
| `/api/membership/verify` | POST | Confirm membership payment | Verifies Razorpay signature → marks member `active`, returns `memberId` + `membershipYear`. |
| `/api/razorpay/create-order` | POST | Start paid **event** registration | Looks up event by slug, checks `requires_payment`, seats vs attendees, creates Razorpay order. |
| `/api/razorpay/verify` | POST | Confirm event registration | Verifies signature, confirms registration. |

---

## 4. Data sources

| Source | Type | Used by |
|--------|------|---------|
| Supabase `events` | DB (primary), static fallback | `/events`, `/events/[id]`, `/admin/events`, `EventsPulseChart`, `UxplosionArchive` |
| `src/data/events.ts` (`EVENTS`, 18 entries) | Static TS array | Fallback for all event views; `UxplosionArchive` reads it directly |
| Supabase `sdc_members` | DB | `/admin/members`, membership APIs |
| Supabase `contact_messages` | DB | `/api/contact`, `/admin/messages` |
| Supabase `profiles` | DB | admin auth role check |
| `src/data/about.ts` | Static stubs (**placeholder** team/partners/stats) | `/about`, `GlassCards` |
| `src/data/blog.ts` (`blogPostsStub`, 7 posts) | Static | `/blog` |
| `src/data/recruitment.ts` (`RECRUITMENT_ROLES`, 5 roles) | Static | `RecruitmentFlow` |
| `community-pulse.json` (232 KB) | Static JSON | `/community` (disabled) |
| In-component consts | Hard-coded arrays | All `Uxplosion*` sections, `CampusMoments`, home stats/features |
| Supabase migrations | `supabase/migrations/*.sql` | `events_gallery_images`, `sdc_members_membership_year`, `contact_messages` |

---

## 5. External integrations

- **Supabase** — `@supabase/ssr` + `@supabase/supabase-js`; browser client, server client, admin (service-role) client, middleware client.
- **Razorpay** — `razorpay` SDK server-side; `checkout.razorpay.com/v1/checkout.js` injected client-side on demand. Theme color `#b21725`.
- **Google Fonts** — Inter, Manrope, Geist (via `next/font`); Material Symbols Outlined (via `<link>` in root layout, largely unused); Space Grotesk / Baloo 2 (UXplosion only).
- **Google Forms** — `forms.gle/qa3krME1Ua34rEvD9` = UXplosion 3.0 registration.
- **ui-avatars.com** — generated team avatar images in `GlassCards`.
- **lh3.googleusercontent.com** (`aida-public/...`) — one decorative image on the homepage bento (plain `<img>`, not `next/image`).
- **Social**: Instagram `@sdc.snist`, LinkedIn `sdc-snist-student-chapter`, GitHub `sdc-india`. Email `Sdc@sreenidhi.edu.in` (UXplosion contact only).

---

## 6. Verification notes

- ✅ Every `page.tsx` under `src/app` inspected.
- ✅ Dynamic route `/events/[id]` and admin edit `[id]` traced to data layer.
- ✅ `/community` confirmed disabled via `notFound()`.
- ✅ `/events/uxplosion3.0` confirmed to bypass global chrome.
- ⚠️ `UNVERIFIED`: whether `RecruitmentFlow` submissions are persisted anywhere (no API call found in component).
- ⚠️ `UNVERIFIED`: live Supabase schema (only migrations + row types in `src/lib` were read; DB not queried).
- ⚠️ `UNVERIFIED`: whether `/admin` (index) redirects or renders — file is 5 lines, not fully expanded here.
