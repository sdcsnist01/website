"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import EventCard from "@/components/events/EventCard";
import FloatWords from "@/components/ui/FloatWords";
import { getEventLifecycle } from "@/lib/event-status";
import { STATUS_STYLE, eventYear, formatEventDate, type StatusKey } from "@/lib/events-display";
import type { Event } from "@/types/events";
import { POSTER_BACKGROUNDS } from "@/lib/event-posters";

/** Events list view from the Claude Design reference (EventsPage.dc.html, list state). */

type StatusFilter = "all" | StatusKey;
type ModeFilter = "ALL" | "ONLINE" | "OFFLINE" | "HYBRID";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "live", label: "Live" },
  { key: "past", label: "Past" },
];

const MODE_SEGMENTS: { key: ModeFilter; label: string }[] = [
  { key: "ALL", label: "All modes" },
  { key: "ONLINE", label: "Online" },
  { key: "OFFLINE", label: "Offline" },
  { key: "HYBRID", label: "Hybrid" },
];

const SELECT_CLASS =
  "min-h-11 w-full cursor-pointer rounded-[10px] border border-[#d8d2cf] bg-white px-3 text-[13px] font-medium text-[#151518] md:w-auto";

export default function EventsExperience({ events }: { events: Event[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [mode, setMode] = useState<ModeFilter>("ALL");
  const [category, setCategory] = useState("all");
  const [year, setYear] = useState("all");

  const rows = useMemo(
    () => events.map((event) => ({ event, status: getEventLifecycle(event.date, event.isPast, event.isLive) as StatusKey })),
    [events],
  );

  const categories = useMemo(() => Array.from(new Set(events.map((e) => e.category))).sort(), [events]);
  const years = useMemo(
    () => Array.from(new Set(events.map((e) => eventYear(e.date)))).sort((a, b) => b.localeCompare(a)),
    [events],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = { all: rows.length, upcoming: 0, live: 0, past: 0 };
    rows.forEach((r) => (counts[r.status] += 1));
    return counts;
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter(({ event, status: s }) => {
      if (status !== "all" && s !== status) return false;
      if (mode !== "ALL" && event.mode !== mode) return false;
      if (category !== "all" && event.category !== category) return false;
      if (year !== "all" && eventYear(event.date) !== year) return false;
      if (!needle) return true;
      return [event.title, event.description, event.category, event.speaker, event.location]
        .some((field) => field.toLowerCase().includes(needle));
    });
  }, [rows, query, status, mode, category, year]);

  const hasFilters = Boolean(query.trim()) || status !== "all" || mode !== "ALL" || category !== "all" || year !== "all";

  // Featured: the live or next upcoming event, or the most recent one. Shown only without filters.
  const featured = !hasFilters
    ? rows.find((r) => r.status === "live") ?? rows.find((r) => r.status === "upcoming") ?? rows[0]
    : undefined;
  const directory = featured ? filtered.filter((r) => r.event.id !== featured.event.id) : filtered;
  const featuredPosterBg = featured?.event.image ? POSTER_BACKGROUNDS[featured.event.image] : undefined;

  function clearAll() {
    setQuery("");
    setStatus("all");
    setMode("ALL");
    setCategory("all");
    setYear("all");
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 max-sm:opacity-40">
          <FloatWords preset="about" />
        </div>
        <div aria-hidden className="pointer-events-none absolute -right-[1vw] top-[22px] whitespace-nowrap font-grotesk text-[clamp(110px,20vw,300px)] font-bold leading-[0.9] tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgba(23,23,25,0.09)]">EVENTS</div>
      <div className="relative mx-auto max-w-[1240px] px-4 pt-6 sm:px-6 sm:pt-10 md:px-8 md:pt-12">
        <div className="mb-3 flex items-center gap-3 md:mb-[18px] font-mono-ui text-xs tracking-[3px] text-[#a91f29]">
          <span className="h-px w-7 bg-primary" aria-hidden />
          EVENTS
        </div>
        <h1 className="anim-fade-up font-grotesk max-w-[16ch] text-balance text-[clamp(36px,5.4vw,76px)] font-bold leading-none tracking-[-0.045em] text-[#151518]">
          Where the tech community <span className="text-primary">comes alive.</span>
        </h1>
        <p className="mt-2.5 max-w-[46ch] md:mt-3.5 text-pretty text-[clamp(16px,1.4vw,20px)] leading-[1.6] text-[#5c5c66]">
          Workshops, hackathons, tech talks, and the people worth building with.
        </p>
        <label className="relative mt-4 block max-w-[760px] rounded-full border border-[#d8d2cf] bg-white shadow-[0_6px_18px_rgba(26,26,28,0.05)] transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 md:mt-6 md:rounded-none md:border-0 md:border-b-2 md:border-[#151518] md:bg-transparent md:shadow-none md:focus-within:ring-0">
          <span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 md:left-0" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#151518" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </span>
          <span className="sr-only">Search events by name, description, category or keyword</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, workshops, hackathons…"
            className="font-grotesk h-12 w-full border-none bg-transparent pl-11 pr-4 text-[16px] font-medium tracking-[-0.02em] text-[#151518] outline-none placeholder:text-[#8a8a94] md:h-[50px] md:pl-[38px] md:pr-0 md:text-[clamp(16px,1.6vw,20px)]"
          />
        </label>
      </div>
      </section>

      <section aria-label="Filters" className="relative mx-auto max-w-[1240px] px-4 pt-3 sm:px-6 md:px-8 md:pt-[18px]">
        <div className="flex flex-col justify-between gap-2.5 border-t border-[#e0d8cc] pt-1.5 md:flex-row md:items-center">
          <div role="group" aria-label="Status" className="scrollbar-hide flex max-w-full gap-3 overflow-x-auto md:gap-4">
            {STATUS_TABS.map((tab) => {
              const on = status === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setStatus(tab.key)}
                  className={`font-grotesk flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 py-1.5 pb-2 pt-1.5 text-[15px] font-semibold md:min-h-11 md:gap-2 md:text-[clamp(15px,1.4vw,18px)] tracking-[-0.02em] transition-colors ${
                    on ? "border-primary text-[#151518]" : "border-transparent text-[#77736c] hover:text-[#151518]"
                  }`}
                >
                  {tab.label}
                  <sup className="font-mono-ui text-[10.5px] text-[#77736c]">{statusCounts[tab.key]}</sup>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:gap-2.5">
            <div role="group" aria-label="Mode" className="col-span-2 scrollbar-hide flex max-w-full gap-0.5 overflow-x-auto rounded-[10px] border border-[#d8d2cf] bg-white p-[3px] md:col-span-1">
              {MODE_SEGMENTS.map((seg) => {
                const on = mode === seg.key;
                return (
                  <button
                    key={seg.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setMode(seg.key)}
                    className={`font-mono-ui min-h-10 shrink-0 whitespace-nowrap rounded-[7px] px-2.5 text-[10.5px] uppercase tracking-[0.8px] transition-colors md:min-h-[38px] md:px-3 md:text-[11.5px] md:tracking-[1px] ${
                      on ? "bg-[#151518] text-white" : "bg-transparent text-[#4a4a52]"
                    }`}
                  >
                    {seg.label}
                  </button>
                );
              })}
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category" className={SELECT_CLASS}>
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Filter by year" className={SELECT_CLASS}>
              <option value="all">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-1.5 flex min-h-9 flex-wrap items-center gap-4 md:mt-2 md:min-h-12">
          <span aria-live="polite" className="font-mono-ui text-xs tracking-[1.5px] text-[#151518]">
            {filtered.length} {filtered.length === 1 ? "EVENT" : "EVENTS"}
          </span>
          {hasFilters ? (
            <button type="button" onClick={clearAll} className="min-h-11 py-2.5 text-[13.5px] font-medium text-primary underline underline-offset-4">
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      {featured ? (
        <section aria-label="Featured event" className="relative mx-auto max-w-[1240px] px-4 pt-7 sm:px-6 md:px-8 md:pt-12">
          <div className="mb-3 flex items-center gap-3 md:mb-4 font-mono-ui text-xs tracking-[3px] text-[#a91f29]">
            <span className="h-px w-7 bg-primary" aria-hidden />
            FEATURED · {STATUS_STYLE[featured.status].label}
          </div>
          <article className="grid items-center gap-4 md:grid-cols-2 md:gap-10">
            <Link
              href={featured.event.detailsUrl || `/events/${featured.event.id}`}
             
              className="group relative block aspect-[4/3] overflow-hidden rounded-[18px] bg-[#151518] sm:aspect-[16/10] md:rounded-[22px]"
              style={featuredPosterBg ? { backgroundColor: featuredPosterBg } : undefined}
            >
              {featured.event.image ? (
                <Image
                  src={featured.event.image}
                  alt=""
                  fill
                  className={`${featuredPosterBg ? "object-contain sm:object-cover" : "object-cover"} transition-transform duration-[1100ms] group-hover:scale-[1.04] motion-reduce:transition-none`}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : null}
              <span
                className="font-mono-ui absolute left-3 top-3 inline-flex items-center gap-[7px] rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[1.2px] md:left-[18px] md:top-[18px] md:px-3.5 md:py-[7px] md:text-[11px] md:tracking-[1.4px]"
                style={{ background: STATUS_STYLE[featured.status].bg, color: STATUS_STYLE[featured.status].fg, borderColor: STATUS_STYLE[featured.status].border }}
              >
                {STATUS_STYLE[featured.status].label}
              </span>
              <span className="font-mono-ui absolute left-3 top-[42px] rounded-md bg-[rgba(21,21,24,0.75)] px-2 py-1 text-[9.5px] tracking-[1px] text-white md:left-[18px] md:top-[52px] md:px-2.5 md:py-1.5 md:text-[10.5px] md:tracking-[1.4px]">
                {featured.event.mode}
              </span>
            </Link>
            <div className="flex flex-col gap-2 md:gap-3.5">
              <div className="font-mono-ui flex flex-wrap gap-3 text-[11px] tracking-[1.5px]">
                <span className="text-primary">{featured.event.category.toUpperCase()}</span>
                <span className="text-[#77736c]">{formatEventDate(featured.event.date)}</span>
              </div>
              <h2 className="font-grotesk text-balance text-[clamp(28px,3.2vw,44px)] font-bold leading-[0.98] tracking-[-0.045em] text-[#151518]">
                {featured.event.title}
              </h2>
              <div className="text-[14.5px] text-[#4a4a52]">{featured.event.location}</div>
              <p className="line-clamp-3 max-w-[44ch] text-pretty text-[15px] leading-[1.55] text-[#5c5c66] md:line-clamp-none md:text-base md:leading-[1.6]">{featured.event.description}</p>
              <div>
                <Link
                  href={featured.event.detailsUrl || `/events/${featured.event.id}`}
                 
                  className="pressable inline-flex items-center gap-3 rounded-full bg-primary px-7 py-[15px] text-[15px] font-semibold text-white transition-colors hover:bg-primary-dim"
                >
                  {featured.status === "past" ? "View recap" : "Explore event"} <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </article>
        </section>
      ) : null}

      <section id="events-dir" aria-labelledby="all-events-heading" className="relative mx-auto max-w-[1240px] scroll-mt-24 px-4 pb-16 pt-8 sm:px-6 md:px-8 md:pb-24 md:pt-12">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 md:mb-6">
          <h2 id="all-events-heading" className="font-grotesk text-[clamp(28px,3.6vw,48px)] font-bold tracking-[-0.04em] text-[#151518]">
            All events
          </h2>
          <span className="font-mono-ui text-[11px] tracking-[2px] text-[#77736c]">{directory.length} LISTED</span>
        </div>

        {directory.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 min-[360px]:gap-3.5 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {directory.map(({ event }) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3.5 rounded-[28px] border border-dashed border-[#b8b2ac] px-6 py-18 text-center">
            <div aria-hidden className="font-grotesk text-[clamp(64px,10vw,130px)] font-bold leading-[0.9] tracking-[-0.06em] text-primary">
              0
            </div>
            <h3 className="font-grotesk text-[clamp(24px,3vw,36px)] font-bold tracking-[-0.035em] text-[#151518]">No events match your filters.</h3>
            <p className="max-w-[420px] text-[15px] leading-[1.55] text-[#4a4a52]">
              Try a different search term, or clear the filters to see every event.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="pressable mt-1.5 min-h-12 rounded-full bg-primary px-7 text-[15px] font-semibold text-white shadow-[0_6px_16px_rgba(217,39,46,0.2)] transition-colors hover:bg-primary-dim"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      <ImpactBand events={events} />
    </>
  );
}

/** Impact band from the reference (#impact). Figures are computed only from the recorded event records. */
function ImpactBand({ events }: { events: Event[] }) {
  const [view, setView] = useState<"monthly" | "perEvent">("monthly");

  const attended = useMemo(() => events.filter((e) => e.attendees > 0 && e.date !== "TBD"), [events]);
  const total = attended.reduce((sum, e) => sum + e.attendees, 0);
  const hosted = events.filter((e) => e.isPast || e.isLive).length;

  const monthly = useMemo(() => {
    const byMonth = new Map<string, number>();
    attended.forEach((e) => byMonth.set(e.date.slice(0, 7), (byMonth.get(e.date.slice(0, 7)) ?? 0) + e.attendees));
    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, value]) => ({ label: month, value }));
  }, [attended]);

  const perEvent = useMemo(
    () => [...attended].sort((a, b) => a.date.localeCompare(b.date)).slice(-12).map((e) => ({ label: e.date.slice(2, 7), value: e.attendees })),
    [attended],
  );

  const bars = view === "monthly" ? monthly : perEvent;
  const max = Math.max(1, ...bars.map((b) => b.value));

  const modeTotals = (["OFFLINE", "ONLINE", "HYBRID"] as const).map((m) => {
    const value = attended.filter((e) => e.mode === m).reduce((sum, e) => sum + e.attendees, 0);
    return { mode: m, value, pct: total ? Math.round((value / total) * 100) : 0 };
  });
  const modeColor = { OFFLINE: "#d9272e", ONLINE: "#f8f5f0", HYBRID: "#f06a6a" } as const;

  return (
    <section aria-labelledby="impact-heading" className="relative overflow-hidden bg-[#171719] text-[#f8f5f0]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "56px 56px" }}
      />
      <div aria-hidden className="pointer-events-none absolute -right-[6vw] -top-[8vw] h-[36vw] w-[36vw] min-h-[280px] min-w-[280px] rounded-full" style={{ background: "radial-gradient(circle, rgba(229,37,41,0.28) 0%, rgba(229,37,41,0) 70%)" }} />

      <div className="relative mx-auto max-w-[1240px] px-4 py-20 sm:px-6 md:px-8 md:py-24">
        <div className="mb-8 flex flex-wrap justify-between gap-3 font-mono-ui text-xs tracking-[2.5px]">
          <h2 id="impact-heading" className="font-normal text-[#e8a29a]">
            COMMUNITY IMPACT
          </h2>
          <span className="text-[#9a958e]">FROM RECORDED EVENTS</span>
        </div>

        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-14">
          <div>
            <div className="font-grotesk text-[clamp(60px,8vw,120px)] font-bold leading-[0.85] tracking-[-0.06em] tabular-nums">
              {total.toLocaleString("en-US")}
            </div>
            <div className="font-grotesk mt-[18px] max-w-[20ch] text-[clamp(19px,2vw,28px)] font-medium tracking-[-0.02em] text-[#c9c4be]">
              total attendance across SDC events.
            </div>
            <div className="mt-7 flex items-baseline gap-3.5 border-t border-[#2f2f34] pt-[18px]">
              <span className="font-grotesk text-[clamp(36px,4vw,56px)] font-bold leading-none tracking-[-0.04em] text-[#e8a29a]">{hosted}</span>
              <span className="text-[15px] text-[#c9c4be]">events hosted</span>
            </div>
          </div>

          <div className="min-w-0 rounded-[20px] border border-[#2f2f34] bg-[#1e1e22] p-5 sm:p-[22px]">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-mono-ui text-[11px] tracking-[2px] text-[#c9c4be]">ATTENDANCE</div>
                <div className="font-mono-ui mt-1.5 text-[11.5px] text-[#9a958e]">
                  {bars.length ? `${bars[0].label} → ${bars[bars.length - 1].label}` : "No dated events yet"}
                </div>
              </div>
              <div role="group" aria-label="Chart view" className="flex gap-0.5 rounded-full border border-[#3a3a40] p-[3px]">
                {(["monthly", "perEvent"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={view === v}
                    onClick={() => setView(v)}
                    className={`min-h-9 rounded-full px-3.5 text-[12.5px] font-medium transition-colors ${view === v ? "bg-[#f8f5f0] text-[#151518]" : "text-[#c9c4be]"}`}
                  >
                    {v === "monthly" ? "Monthly" : "Per event"}
                  </button>
                ))}
              </div>
            </div>

            {bars.length > 0 ? (
              <>
                <div className="relative flex h-[200px] items-end gap-1.5 border-b border-[#3a3a40]">
                  {bars.map((b) => (
                    <div
                      key={`${b.label}-${b.value}`}
                      role="img"
                      aria-label={`${b.label}: ${b.value.toLocaleString("en-US")}`}
                      title={`${b.label}: ${b.value.toLocaleString("en-US")}`}
                      className="relative flex-1 rounded-t-[4px] bg-primary transition-[height] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                      style={{ height: `${Math.max(3, (b.value / max) * 100)}%` }}
                    />
                  ))}
                </div>
                {/* Phones show every third label so they don't collide. Hidden labels keep their slot, so the bars still line up. */}
                <div className="mt-2 flex gap-1.5">
                  {bars.map((b, i) => (
                    <div
                      key={b.label}
                      aria-hidden
                      className={`font-mono-ui min-w-0 flex-1 whitespace-nowrap text-center text-[10px] text-[#9a958e] sm:truncate ${i % 3 ? "max-sm:invisible" : ""}`}
                    >
                      {b.label}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-10 text-center text-sm text-[#9a958e]">Attendance appears here once dated events record attendance.</p>
            )}

            <div className="mt-[22px] flex h-1.5 gap-[3px] overflow-hidden rounded" aria-hidden>
              {modeTotals.map((m) => (
                <div key={m.mode} style={{ width: `${m.pct}%`, background: modeColor[m.mode] }} />
              ))}
            </div>
            <div className="mt-3.5 grid grid-cols-3 gap-3">
              {modeTotals.map((m) => (
                <div key={m.mode}>
                  <div className="font-mono-ui flex items-center gap-[7px] text-[10.5px] tracking-[1.5px] text-[#9a958e]">
                    <span className="h-[7px] w-[7px] rounded-full" style={{ background: modeColor[m.mode] }} aria-hidden />
                    {m.mode}
                  </div>
                  <div className="font-grotesk mt-2 text-[clamp(20px,2vw,26px)] font-bold leading-none tracking-[-0.03em] tabular-nums">
                    {m.value.toLocaleString("en-US")}
                  </div>
                  <div className="font-mono-ui mt-1 text-[10.5px] text-[#9a958e]">{m.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
