"use client";

import { useState, type KeyboardEvent } from "react";
import { ARCHIVE_DEMO } from "@/data/about-archive-demo";

/**
 * Past leadership archive from the Claude Design reference (#legacycar). The shipped records are
 * DEMO content, so none are shown as real board members. The section shows the pending message
 * until confirmed records are added and `demo` is set to false.
 */
export default function ArchiveSection() {
  const years = ARCHIVE_DEMO.demo ? [] : ARCHIVE_DEMO.years;
  const [selected, setSelected] = useState(years.length - 1);
  const year = years[selected];
  const totalMembers = years.reduce((sum, y) => sum + y.members.length, 0);

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const step = e.key === "ArrowRight" ? 1 : -1;
    const next = (selected + step + years.length) % years.length;
    setSelected(next);
    document.getElementById(`archive-tab-${years[next].id}`)?.focus();
  }

  return (
    <section
      aria-label="Past leadership archive"
      className="relative scroll-mt-16 overflow-hidden border-t border-[#e4ddd2] bg-background px-4 py-20 sm:px-6 sm:py-28 md:px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(23,23,25,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(23,23,25,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "linear-gradient(180deg, #000 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[10vw] -top-[8vw] h-[46vw] w-[46vw] min-h-80 min-w-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(217,39,46,0.14) 0%, rgba(247,148,32,0.05) 45%, rgba(217,39,46,0) 70%)" }}
      />

      <div className="relative mx-auto max-w-[1100px]">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-10">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-0.5 w-7 bg-primary" aria-hidden />
              <span className="font-mono-ui text-xs tracking-[3px] text-[#a91f29]">{ARCHIVE_DEMO.eyebrow}</span>
            </div>
            <h2 className="font-grotesk text-[clamp(30px,4.2vw,58px)] font-bold leading-[1.02] tracking-[-0.04em] text-[#171719]">
              Built by Many.
              <br />
              <span className="text-primary">Carried Forward</span>
              <br />
              by Every Generation.
            </h2>
            <p className="mt-6 max-w-[46ch] text-pretty text-base leading-[1.65] text-[#5c5c66]">{ARCHIVE_DEMO.intro}</p>
            {years.length > 0 ? (
            <div className="mt-7 flex max-w-[46ch] flex-wrap items-stretch gap-0 border-t border-[#e4ddd2] pt-5">
              <div className="pr-7">
                <div className="font-grotesk text-[40px] font-bold leading-none tracking-[-0.04em] text-[#171719] tabular-nums">
                  {totalMembers}
                </div>
                <div className="font-mono-ui mt-2 text-[11px] tracking-[2px] text-[#77736c]">BOARD MEMBERS</div>
              </div>
              <div className="border-l border-[#e4ddd2] px-7">
                <div className="font-grotesk text-[40px] font-bold leading-none tracking-[-0.04em] text-primary tabular-nums">
                  {years.length}
                </div>
                <div className="font-mono-ui mt-2 text-[11px] tracking-[2px] text-[#77736c]">BATCHES</div>
              </div>
              {ARCHIVE_DEMO.demo ? (
                <div className="flex items-end border-l border-[#e4ddd2] pl-7">
                  <span className="font-mono-ui rounded-[5px] border border-black/25 px-2 py-1 text-[10.5px] tracking-[1.5px] text-[#77736c]">
                    DEMO RECORDS
                  </span>
                </div>
              ) : null}
            </div>
            ) : null}
          </div>

          <ol className="relative mx-auto w-full max-w-[420px]" aria-label="Batches">
            <span aria-hidden className="absolute bottom-7 left-3 top-7 w-px bg-gradient-to-b from-primary via-black/20 to-black/5" />
            {years.map((y, i) => (
              <li key={y.id}>
                <button
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-pressed={i === selected}
                  className="relative block w-full min-h-11 cursor-pointer py-4 pl-11 text-left"
                >
                  <span
                    aria-hidden
                    className={`absolute left-[5px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 ${
                      i === selected ? "border-primary bg-primary" : "border-black/30 bg-background"
                    }`}
                  />
                  <span className="flex flex-wrap items-baseline gap-3.5">
                    <span className={`font-grotesk text-xl font-bold tracking-[-0.03em] ${i === selected ? "text-primary" : "text-[#171719]"}`}>
                      {y.label}
                    </span>
                    <span className="font-mono-ui text-[11px] tracking-[2px] text-[#77736c]">{y.tenure}</span>
                  </span>
                  <span className="font-mono-ui mt-1.5 block text-[11px] tracking-[1.5px] text-[#77736c]">
                    {y.members.length} MEMBERS
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        {years.length > 0 ? (
        <div className="mt-16">
          <div role="tablist" aria-label="Board batch" className="mb-7 flex flex-wrap gap-2">
            {years.map((y, i) => (
              <button
                key={y.id}
                id={`archive-tab-${y.id}`}
                type="button"
                role="tab"
                aria-selected={i === selected}
                aria-controls="archive-panel"
                tabIndex={i === selected ? 0 : -1}
                onClick={() => setSelected(i)}
                onKeyDown={onTabKey}
                className={`min-h-11 rounded-full border px-5 text-sm font-medium transition-colors ${
                  i === selected
                    ? "border-primary bg-primary text-white"
                    : "border-[#e0d3c8] bg-white text-[#5c5c66] hover:border-[#f0b8b8] hover:text-[#171719]"
                }`}
              >
                {y.label}
                <span className="ml-2.5 opacity-70">{y.members.length}</span>
              </button>
            ))}
          </div>

          <div id="archive-panel" role="tabpanel" aria-live="polite" aria-labelledby={`archive-tab-${year.id}`}>
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4 border-b border-[#e4ddd2] pb-4">
              <span className="font-grotesk text-[clamp(26px,3.2vw,40px)] font-bold leading-none tracking-[-0.04em] text-[#171719]">
                Board {year.label}
              </span>
              <span className="font-mono-ui text-xs tracking-[2px] text-[#77736c]">TENURE {year.tenure}</span>
            </div>
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {year.members.map((m) => (
                <li
                  key={m.id}
                  className="relative overflow-hidden rounded-[14px] border border-[#e4ddd2] bg-white p-3 sm:p-4"
                >
                  <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-lg bg-[#f4efe7]">
                    <span className="font-grotesk text-[clamp(44px,6vw,76px)] font-bold tracking-[-0.05em] text-primary/60" aria-hidden>
                      {m.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-primary" />
                  </div>
                  <div className="px-1 pb-1 pt-4">
                    <div className="font-grotesk text-lg font-bold leading-tight tracking-[-0.03em] text-[#171719]">{m.name}</div>
                    <div className="font-mono-ui mt-2 text-[10.5px] uppercase leading-snug tracking-[1.4px] text-[#a91f29]">{m.role}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        ) : (
          <p className="mt-16 max-w-[52ch] text-pretty text-base leading-[1.65] text-[#5c5c66]">{ARCHIVE_DEMO.empty}</p>
        )}
      </div>
    </section>
  );
}
