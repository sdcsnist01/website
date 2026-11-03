"use client";

import { useMemo } from "react";
import { AreaChart, Area } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import type { Event } from "@/types/events";
import ChartLineIcon from "@/components/ui/chart-line-icon";

function parseEventDate(value: string): Date | null {
  if (!value || value === "TBD") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function EventsPulseChart({ events }: { events: Event[] }) {
  // Built only from real event records. With no dated events the chart shows an
  // empty state instead of a made-up series.
  const data = useMemo(() => {
    const dated = events
      .map((event) => {
        const date = parseEventDate(event.date);
        if (!date) return null;
        return { date, attendees: event.attendees || 0 };
      })
      .filter((row): row is { date: Date; attendees: number } => row !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const series: { date: Date; attendees: number }[] = [];
    let running = 0;
    for (const row of dated) {
      running += row.attendees;
      series.push({ date: row.date, attendees: running });
    }
    return series;
  }, [events]);

  return (
    <div className="glass-card overflow-hidden rounded-xl p-5 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <ChartLineIcon size={18} strokeWidth={2} className="!cursor-default" />
            <span className="font-mono-ui text-[11px] uppercase tracking-[2px]">Community pulse</span>
          </div>
          <h3 className="font-grotesk text-2xl font-bold text-on-surface">Cumulative attendees</h3>
          <p className="mt-1 text-sm text-on-surface-variant">Growth across SDC SNIST events, from recorded attendance.</p>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#d8d2cf] px-4 py-12 text-center text-sm text-on-surface-variant">
          No dated events yet. The attendance trend appears once event dates are recorded.
        </p>
      ) : (
        <AreaChart
          data={data}
          aspectRatio="16 / 7"
          className="min-h-[220px]"
          margin={{ top: 16, right: 12, bottom: 28, left: 12 }}
          animationDuration={1200}
        >
          <Grid horizontal numTicksRows={4} stroke="var(--chart-grid)" strokeOpacity={0.7} />
          <Area dataKey="attendees" fill="#d9272e" stroke="#d9272e" fillOpacity={0.3} gradientToOpacity={0} showHighlight />
          <XAxis />
          <ChartTooltip />
        </AreaChart>
      )}
    </div>
  );
}
