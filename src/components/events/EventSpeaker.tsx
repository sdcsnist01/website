import type { Event } from "@/types/events";
import SectionHeader from "@/components/ui/SectionHeader";

interface EventSpeakerProps {
  event: Event;
}

export default function EventSpeaker({ event }: EventSpeakerProps) {
  if (!event.speaker) return null;

  return (
    <section aria-labelledby="speakers-heading" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <SectionHeader align="center" eyebrow="SPEAKERS" title={<span id="speakers-heading">Who is leading</span>} />
        <article className="glass-card rounded-xl p-8 lg:p-10">
          <p className="text-center text-lg leading-relaxed text-on-surface-variant">{event.speaker}</p>
          <div className="mt-6 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" aria-hidden />
        </article>
      </div>
    </section>
  );
}
