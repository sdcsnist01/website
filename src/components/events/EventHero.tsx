import Image from "next/image";
import Link from "next/link";
import { Event } from "@/types/events";
import FloatWords from "@/components/ui/FloatWords";
import { getEventLifecycle } from "@/lib/event-status";
import { STATUS_STYLE, formatEventDate, type StatusKey } from "@/lib/events-display";
import { POSTER_BACKGROUNDS } from "@/lib/event-posters";
import ReadMoreText from "@/components/events/ReadMoreText";

interface EventHeroProps {
  event: Event;
}

/** Event detail hero from the Claude Design reference (#events detail state). */
export default function EventHero({ event }: EventHeroProps) {
  const status = getEventLifecycle(event.date, event.isPast, event.isLive) as StatusKey;
  const style = STATUS_STYLE[status];
  const posterBackground = event.image ? POSTER_BACKGROUNDS[event.image] : undefined;

  const facts = [
    { k: "DATE", v: formatEventDate(event.date) },
    { k: "TIME (IST)", v: event.time },
    { k: "DURATION", v: event.duration },
    { k: event.mode === "ONLINE" ? "PLATFORM" : event.mode === "HYBRID" ? "VENUE + ONLINE" : "VENUE", v: event.location },
    { k: "SPEAKER", v: event.speaker },
  ].filter((f) => f.v);

  return (
    <section className="anim-fade-up relative overflow-hidden bg-[#151518] text-[#f8f5f0]">
      <FloatWords preset="story" tone="dark" />
      <div className="relative mx-auto max-w-[1240px] px-4 pb-10 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pb-20 md:pt-32">
        <div className="grid items-center gap-6 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <div>
            <Link
              href="/events"
              className="pressable mb-4 inline-flex min-h-11 md:mb-7 items-center gap-2.5 rounded-full border border-[#4a4a52] px-4.5 text-sm font-medium text-[#f8f5f0] hover:border-[#f8f5f0]/60"
            >
              <span aria-hidden>←</span> All events
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-[7px] rounded-full border px-3.5 py-[7px] font-mono-ui text-xs font-semibold tracking-[1.4px]"
                style={{ background: style.bg, color: style.fg, borderColor: style.border }}
              >
                <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: style.dot }} />
                {style.label}
              </span>
              <span className="rounded-md border border-[#4a4a52] px-2.5 py-[7px] font-mono-ui text-[11.5px] tracking-[1.4px] text-[#e9e4de]">
                {event.mode}
              </span>
            </div>
            <div className="mt-4 font-mono-ui text-xs tracking-[2.5px] text-[#f06a6a] md:mt-6">{event.category.toUpperCase()}</div>
            <h1 className="font-grotesk mt-2.5 text-balance text-[clamp(30px,8.2vw,40px)] font-bold leading-[1.05] tracking-[-0.04em] md:mt-3.5 md:text-[clamp(40px,6.4vw,100px)] md:leading-[0.95] md:tracking-[-0.05em]">
              {event.title}
            </h1>
            <ReadMoreText
              text={event.description}
              className="mt-4 max-w-[600px] text-pretty text-[15px] leading-[1.6] text-[#c9c4be] md:mt-6 md:text-[clamp(16px,1.3vw,19px)] md:leading-[1.65]"
            />
          </div>

          <div
            className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#2a2a30] sm:aspect-[4/3] md:rounded-3xl"
            style={posterBackground ? { backgroundColor: posterBackground } : undefined}
          >
            {event.image ? (
              <Image
                src={event.image}
                alt={event.title}
                fill
                priority
                className={posterBackground ? "object-contain sm:object-cover" : "object-cover object-[50%_35%] sm:object-center"}
                sizes="(max-width: 768px) 100vw, 45vw"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-[repeating-linear-gradient(135deg,#2a2a30_0_14px,#24242a_14px_28px)]">
                <span className="font-display-hero text-[44px] text-primary">SDC</span>
                <span className="font-mono-ui text-xs tracking-[2px] text-[#9a958e]">POSTER COMING SOON</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative border-t border-[#2a2a30] bg-[#1b1b1f]">
        <dl className="mx-auto grid max-w-[1240px] grid-cols-2 px-4 sm:px-6 md:grid-cols-5 md:px-8">
          {facts.map((f) => (
            <div key={f.k} className="border-b border-[#2a2a30] py-4 pr-4 md:py-5">
              <dt className="font-mono-ui text-[10.5px] tracking-[1.8px] text-[#9a958e]">{f.k}</dt>
              <dd className="font-grotesk mt-1.5 text-base font-semibold leading-snug text-[#f8f5f0]">{f.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
