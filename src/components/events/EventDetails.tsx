import type { ComponentType } from "react";
import { Event } from "@/types/events";
import EventRegisterButton from "@/components/events/EventRegisterButton";
import type { AnimatedIconProps } from "@/components/ui/types";
import ClockIcon from "@/components/ui/clock-icon";
import MapPinIcon from "@/components/ui/map-pin-icon";
import UsersIcon from "@/components/ui/users-icon";
import HashtagIcon from "@/components/ui/hashtag-icon";
import TelephoneIcon from "@/components/ui/telephone-icon";
import HistoryCircleIcon from "@/components/ui/history-circle-icon";

interface EventDetailsProps {
  event: Event;
}

export default function EventDetails({ event }: EventDetailsProps) {
  // Long values (location, speaker) span both columns on phones; short ones share a row.
  const details: { Icon: ComponentType<AnimatedIconProps>; label: string; value: string; wide?: boolean }[] = [
    { Icon: HistoryCircleIcon, label: "Date", value: event.date },
    { Icon: ClockIcon, label: "Time", value: event.time },
    { Icon: MapPinIcon, label: "Location", value: event.location, wide: true },
    { Icon: UsersIcon, label: "Mode", value: event.mode },
    { Icon: HashtagIcon, label: "Event type", value: event.category },
    { Icon: TelephoneIcon, label: "Speaker", value: event.speaker, wide: true },
    ...(event.duration ? [{ Icon: ClockIcon, label: "Duration", value: event.duration }] : []),
  ];

  return (
    <aside aria-labelledby="event-details-heading" className="glass-card rounded-xl p-5 sm:p-8">
      <h2 id="event-details-heading" className="font-grotesk text-2xl font-bold text-on-surface">
        Event details
      </h2>

      <dl className="mt-5 grid grid-cols-1 gap-x-3 gap-y-3 min-[390px]:grid-cols-2 sm:mt-8 sm:block sm:space-y-5">
        {details.map((detail) => {
          const Icon = detail.Icon;
          return (
            <div key={detail.label} className={`flex items-start gap-3 sm:gap-4 ${detail.wide ? "min-[390px]:col-span-2" : ""}`}>
              <div className="shrink-0 rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary sm:rounded-xl sm:p-2.5">
                <Icon size={18} strokeWidth={2} color="#d9272e" className="!cursor-default" />
              </div>
              <div className="min-w-0 flex-1 border-b border-[#e4ddd6] pb-3 last:border-0 sm:pb-4">
                <dt className="font-mono-ui text-[10.5px] uppercase tracking-[1.5px] text-on-surface-variant sm:text-[11px]">{detail.label}</dt>
                <dd className="mt-0.5 break-words font-semibold text-on-surface sm:mt-1">{detail.value}</dd>
              </div>
            </div>
          );
        })}
      </dl>

      <EventRegisterButton event={event} />
    </aside>
  );
}
