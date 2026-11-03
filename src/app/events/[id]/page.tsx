import { Metadata } from "next";
import { notFound } from "next/navigation";
import EventAgenda from "@/components/events/EventAgenda";
import EventCard from "@/components/events/EventCard";
import EventDetails from "@/components/events/EventDetails";
import EventGallery from "@/components/events/EventGallery";
import EventHero from "@/components/events/EventHero";
import EventSpeaker from "@/components/events/EventSpeaker";
import EventRegisterButton from "@/components/events/EventRegisterButton";
import SectionHeader from "@/components/ui/SectionHeader";
import { getEventById, getRelatedEvents } from "@/lib/events-service";

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return { title: "Event Not Found" };
  }

  return {
    title: `${event.title} | SDC SNIST Events`,
    description: event.description,
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const relatedEvents = await getRelatedEvents(event.id, 3);

  return (
    <div className="overflow-x-clip bg-background pb-20 font-body text-on-surface">
      <EventHero event={event} />

      <section aria-label="Event details" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 md:py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <div className="space-y-12 lg:w-2/3">
            <article>
              <h2 className="font-grotesk text-3xl font-bold text-on-surface">About this event</h2>
              <div className="mt-6 space-y-6 text-on-surface-variant">
                {(event.longDescription || event.description).split("\n\n").map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="text-pretty text-lg leading-relaxed">
                    {paragraph}
                  </p>
                ))}

                {event.tags?.length ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono-ui rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] tracking-[1px] text-primary"
                      >
                        #{tag.replace(/\s+/g, "")}
                      </span>
                    ))}
                  </div>
                ) : null}

                {event.whatYouWillLearn?.length ? (
                  <div>
                    <h3 className="font-grotesk mb-4 mt-8 text-xl font-bold text-on-surface">What you will learn</h3>
                    <ul className="list-disc space-y-2 pl-6">
                      {event.whatYouWillLearn.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {event.whoShouldAttend?.length ? (
                  <div>
                    <h3 className="font-grotesk mb-4 mt-8 text-xl font-bold text-on-surface">Who should attend</h3>
                    <ul className="list-disc space-y-2 pl-6">
                      {event.whoShouldAttend.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </article>
          </div>

          <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-28">
              <EventDetails event={event} />
            </div>
          </div>
        </div>
      </section>

      {event.agenda?.length ? <EventAgenda event={event} /> : event.speaker ? <EventSpeaker event={event} /> : null}
      {event.galleryImages?.length ? <EventGallery images={event.galleryImages} title={event.title} /> : null}

      {!event.isPast ? (
        <section id="register" aria-labelledby="register-heading" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6 md:px-8 md:py-20">
          <div className="relative overflow-hidden rounded-xl bg-primary px-6 py-16 text-center sm:px-12 md:py-20">
            <h2 id="register-heading" className="font-grotesk relative mb-5 text-balance text-3xl font-bold text-white sm:text-4xl">
              Register for this event
            </h2>
            <p className="relative mx-auto mb-10 max-w-2xl text-pretty text-lg text-white/90">
              Secure your spot now and join us for an unforgettable experience with industry experts and fellow developers.
            </p>

            <EventRegisterButton
              event={event}
              label="Register now"
              className="relative mx-auto inline-flex min-h-13 items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-on-surface shadow-[0_12px_28px_rgba(23,23,25,0.2)] transition-transform duration-300 hover:-translate-y-0.5"
            />
          </div>
        </section>
      ) : null}

      {relatedEvents.length > 0 ? (
        <section aria-labelledby="related-heading" className="mx-auto max-w-7xl border-t border-[#e4ddd6] px-4 py-10 sm:px-6 md:px-8 md:py-16">
          <SectionHeader
            eyebrow="KEEP EXPLORING"
            title={<span id="related-heading">Related events</span>}
            subtitle="Check out similar events you might be interested in."
          />
          <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 min-[360px]:gap-3.5 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {relatedEvents.map((relatedEvent) => (
              <EventCard key={relatedEvent.id} event={relatedEvent} showDescription />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
