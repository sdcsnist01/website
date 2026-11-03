import { Event } from "@/types/events";
import ClockIcon from "@/components/ui/clock-icon";
import SectionHeader from "@/components/ui/SectionHeader";

interface EventAgendaProps {
  event: Event;
}

export default function EventAgenda({ event }: EventAgendaProps) {
  if (!event.agenda || event.agenda.length === 0) return null;

  return (
    <section aria-labelledby="agenda-heading" className="bg-surface-container-low/60 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <SectionHeader
          align="center"
          eyebrow="AGENDA"
          title={<span id="agenda-heading">Sessions &amp; speakers</span>}
        />

        <ol className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 min-[360px]:gap-3 sm:block sm:space-y-4">
          {event.agenda.map((item) => (
            <li key={`${item.time}-${item.title}`} className="glass-card h-full rounded-xl p-3 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                <div className="font-mono-ui inline-flex w-fit max-w-full items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-2.5 py-1 text-[9.5px] tracking-[0.3px] text-white sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[1px]">
                  <ClockIcon size={11} strokeWidth={2} color="#fff" className="shrink-0 !cursor-default" />
                  {item.time}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-grotesk text-[15px] font-bold leading-snug text-on-surface sm:text-xl">{item.title}</h3>
                  <p className="mt-0.5 break-words text-[13px] font-semibold text-primary sm:mt-1 sm:text-sm">{item.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
