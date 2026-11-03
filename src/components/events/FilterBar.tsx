"use client";

import MagnifierIcon from "@/components/ui/magnifier-icon";
import SlidersHorizontalIcon from "@/components/ui/sliders-horizontal-icon";
import WifiIcon from "@/components/ui/wifi-icon";
import MapPinIcon from "@/components/ui/map-pin-icon";
import LayersIcon from "@/components/ui/layers-icon";
import type { ComponentType } from "react";
import type { AnimatedIconProps } from "@/components/ui/types";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedMode: string;
  setSelectedMode: (mode: string) => void;
}

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedMode,
  setSelectedMode,
}: FilterBarProps) {
  const modes: { id: string; label: string; Icon: ComponentType<AnimatedIconProps> }[] = [
    { id: "ALL", label: "All modes", Icon: SlidersHorizontalIcon },
    { id: "ONLINE", label: "Online", Icon: WifiIcon },
    { id: "OFFLINE", label: "Offline", Icon: MapPinIcon },
    { id: "HYBRID", label: "Hybrid", Icon: LayersIcon },
  ];

  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative max-w-xl flex-grow">
        <label htmlFor="event-search" className="sr-only">
          Search events
        </label>
        <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-on-surface-variant">
          <MagnifierIcon size={20} strokeWidth={2} className="!cursor-default" />
        </div>
        <input
          id="event-search"
          type="text"
          placeholder="Search events, topics, or speakers…"
          className="font-body w-full rounded-full border border-[#d8d2cf] bg-white py-3.5 pl-12 pr-6 text-on-surface transition-colors duration-300 placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div role="group" aria-label="Filter by mode" className="scrollbar-hide flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
        <span className="font-mono-ui mr-2 hidden whitespace-nowrap text-[11px] tracking-[1.5px] text-on-surface-variant md:block">
          MODE
        </span>
        {modes.map((mode) => {
          const Icon = mode.Icon;
          const isActive = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setSelectedMode(mode.id)}
              className={`pressable flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-[#d8d2cf] bg-white text-on-surface-variant hover:border-[#f0b8b8] hover:text-on-surface"
              }`}
            >
              <Icon size={14} strokeWidth={2} className="!cursor-pointer" />
              {mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
