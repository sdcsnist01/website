"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import SlidersHorizontalIcon from "@/components/ui/sliders-horizontal-icon";
import ArrowNarrowRightIcon from "@/components/ui/arrow-narrow-right-icon";
import { Event } from "@/types/events";
import EventCard from "@/components/events/EventCard";
import FilterBar from "@/components/events/FilterBar";

export default function EventsSection({ events }: { events: Event[] }) {
  const reduce = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState("ALL");

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.speaker.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMode = selectedMode === "ALL" || event.mode === selectedMode;

      return matchesSearch && matchesMode;
    });
  }, [events, searchQuery, selectedMode]);

  return (
    <div className="flex flex-col">
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedMode={selectedMode}
        setSelectedMode={setSelectedMode}
      />

      <div className="mb-8 flex items-center justify-between gap-4 border-b border-[#e4ddd6] pb-4">
        <span className="font-mono-ui text-xs tracking-[2px] text-primary" aria-live="polite">
          {filteredEvents.length} {filteredEvents.length === 1 ? "EVENT" : "EVENTS"}
        </span>
        <span className="font-mono-ui flex items-center gap-2 text-[11px] tracking-[1.5px] text-on-surface-variant">
          <SlidersHorizontalIcon size={14} strokeWidth={2} color="#d9272e" className="!cursor-default" />
          SORTED BY DATE
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredEvents.map((event) => (
            <motion.div
              layout={!reduce}
              key={event.id}
              className="h-full"
              initial={false}
              exit={
                reduce
                  ? undefined
                  : {
                      opacity: 0,
                      scale: 0.96,
                      y: -10,
                      transition: { duration: 0.25 },
                    }
              }
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#d8d2cf] bg-white px-6 py-20 text-center sm:py-24">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <SlidersHorizontalIcon size={28} strokeWidth={1.75} className="!cursor-default" />
          </div>
          <h3 className="font-grotesk mb-3 text-2xl font-bold text-on-surface">No matching events</h3>
          <p className="mx-auto mb-8 max-w-md text-pretty text-sm text-on-surface-variant sm:text-base">
            Try a different search or mode, or reset filters to browse the full calendar.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedMode("ALL");
            }}
            className="pressable inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-7 font-semibold text-white transition-colors hover:bg-primary-dim"
          >
            Reset filters
            <ArrowNarrowRightIcon size={18} strokeWidth={2.5} className="!cursor-pointer" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
