"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { Event } from "@/types/events";
import { getEventLifecycle } from "@/lib/event-status";
import { formatEventDate, type StatusKey, STATUS_STYLE } from "@/lib/events-display";
import { POSTER_BACKGROUNDS } from "@/lib/event-posters";

const DETAILS_URL_OVERRIDES: Record<string, string> = {
  "17": "/events/uxplosion3.0",
};


/** Directory card from the Claude Design reference (#events-dir). */
export default function EventCard({ event, showDescription = false }: { event: Event; showDescription?: boolean }) {
  const reduce = useReducedMotion();
  const lifecycle = getEventLifecycle(event.date, event.isPast, event.isLive) as StatusKey;
  const status = STATUS_STYLE[lifecycle];
  const posterBackground = event.image ? POSTER_BACKGROUNDS[event.image] : undefined;
  const isPoster = Boolean(posterBackground);

  const detailsHref = event.detailsUrl || DETAILS_URL_OVERRIDES[event.id] || `/events/${event.id}`;
  const registerExternal = Boolean(event.registrationUrl && event.registrationUrl !== "#");
  const registerHref = registerExternal ? event.registrationUrl : `${detailsHref}#register`;
  const canRegister = lifecycle !== "past";

  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col rounded-[18px] border border-[#eae6e4] bg-white p-2 transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-[0_14px_30px_rgba(217,39,46,0.10)] sm:rounded-[22px] sm:p-2.5"
    >
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-[#efeae4] min-[360px]:aspect-square sm:aspect-[16/10] sm:rounded-[14px]"
        style={isPoster ? { backgroundColor: posterBackground } : undefined}
      >
        {event.image ? (
          <Image
            src={event.image}
            alt=""
            fill
            className={`transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none ${
              isPoster ? "object-contain sm:object-cover" : "object-cover object-[50%_35%] sm:object-center"
            }`}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(135deg,#fdf0f0,#f4c9be)]" />
        )}
        <span
          className="font-mono-ui absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8.5px] font-semibold tracking-[0.8px] sm:left-3 sm:top-3 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[10.5px] sm:tracking-[1.3px]"
          style={{ background: status.bg, color: status.fg, borderColor: status.border }}
        >
          <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${status.pulse ? "motion-safe:animate-pulse" : ""}`} style={{ background: status.dot }} />
          {status.label}
        </span>
        <span className="font-mono-ui absolute right-2 top-2 rounded-md bg-[rgba(21,21,24,0.75)] px-1.5 py-0.5 text-[8.5px] tracking-[0.8px] text-white sm:right-3 sm:top-3 sm:px-2.5 sm:py-1.5 sm:text-[10px] sm:tracking-[1.3px]">
          {event.mode}
        </span>
        <span aria-hidden className="absolute bottom-3 right-3 flex h-[38px] w-[38px] translate-x-[-6px] translate-y-[6px] scale-90 items-center justify-center rounded-full bg-primary text-base text-white opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">↗</span>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3 sm:px-2 sm:pb-1.5 sm:pt-4">
        <div className="font-mono-ui flex flex-wrap justify-between gap-x-2 gap-y-1 text-[9px] tracking-[0.6px] sm:text-[10.5px] sm:tracking-[1.4px]">
          <span className="text-primary">{event.category.toUpperCase()}</span>
          <span className="text-right text-[#77736c]">{formatEventDate(event.date)}</span>
        </div>
        <h3 className="font-grotesk mt-2 text-[17px] font-bold leading-[1.15] tracking-[-0.03em] text-[#151518] text-balance line-clamp-3 sm:line-clamp-none sm:mt-2.5 sm:text-[23px] sm:leading-[1.1] sm:tracking-[-0.035em]">
          <Link href={detailsHref} className="after:absolute after:inset-0 hover:text-primary">
            {event.title}
          </Link>
        </h3>
                <div className="max-sm:hidden mt-1.5 line-clamp-2 text-[13px] leading-snug text-[#77736c]">{event.location}</div>
        <p
          className={
            showDescription
              ? "mb-2.5 mt-1.5 line-clamp-2 text-[12px] leading-[1.45] text-[#4a4a52] sm:mb-4 sm:mt-2 sm:line-clamp-3 sm:text-[14px] sm:leading-[1.5]"
              : "max-sm:hidden mb-4 mt-2 line-clamp-4 text-[14px] leading-[1.5] text-[#4a4a52]"
          }
        >
          {event.description}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-t border-[#f1ece6] pt-2.5 sm:pt-3.5">
          <span className="max-sm:hidden text-[12.5px] text-[#4a4a52]">
            {lifecycle === "upcoming" || !event.attendees ? (canRegister ? "Registration open" : "Event ended") : `${event.attendees}+ attended`}
          </span>
          <span className="text-[11.5px] text-[#4a4a52] sm:hidden">{event.attendees ? `${event.attendees}+ attended` : null}</span>
          <span className="flex items-center gap-2.5 sm:gap-3">
            {canRegister ? (
              registerExternal ? (
                <a href={registerHref} target="_blank" rel="noreferrer" className="max-sm:hidden relative z-10 text-[12.5px] font-semibold text-primary hover:underline sm:text-[13px]">
                  Register
                </a>
              ) : (
                <Link href={registerHref} className="max-sm:hidden relative z-10 text-[12.5px] font-semibold text-primary hover:underline sm:text-[13px]">
                  Register
                </Link>
              )
            ) : null}
            <span className="whitespace-nowrap text-[12.5px] font-semibold text-[#151518] sm:text-[13.5px] transition-transform duration-200 group-hover:translate-x-0.5">
              <span className="sm:hidden">Details</span>
              <span className="hidden sm:inline">View details</span> →
            </span>
          </span>
        </div>
      </div>
    </motion.article>
  );
}
