import HomeHero from "@/components/home/HomeHero";
import Reveal from "@/components/home/Reveal";
import CampusMoments from "@/components/home/CampusMoments";
import StatGrid from "@/components/ui/StatGrid";
import FloatWords from "@/components/ui/FloatWords";

/**
 * Existing site figures, kept as they were. They are not verified: the reference
 * data file marks its own stats as sample values. Replace with confirmed numbers.
 */
const STATS = [
  { value: "50k+", label: "Members" },
  { value: "120+", label: "Events" },
  { value: "45", label: "Chapters" },
  { value: "1M+", label: "Lines of code" },
];

export default function Home() {
  return (
    <main className="relative overflow-x-clip font-body">
      <HomeHero />

      <section
        aria-label="Community statistics"
        className="relative overflow-hidden bg-[#F4EFE7] px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-[88px]"
      >
        <FloatWords preset="stats" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(21,21,24,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(21,21,24,0.045) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "linear-gradient(90deg, transparent 0%, #000 30%, #000 70%, transparent 100%)",
          }}
        />
        <div className="relative mx-auto max-w-[1100px]">
          <Reveal>
            <div className="mb-8 h-0.5 w-[72px] bg-[#A91F29] sm:w-[120px] md:mb-11" aria-hidden />
            <StatGrid stats={STATS} />
          </Reveal>
        </div>
      </section>

      <CampusMoments />
{/*
      <section className="px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
        <Reveal>
          <div className="glass-card relative mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border border-outline-variant/10 p-6 sm:rounded-[2.5rem] sm:p-8 md:p-20">
            <video
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            >
              <source src="/videos/join-community-bg.mp4" type="video/mp4" />
            </video>
            <div className="pointer-events-none absolute inset-0 bg-black/65" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/50" />
            <div className="relative z-10 text-center">
              <h2 className="type-heading mb-4 text-3xl font-extrabold text-white sm:mb-6 sm:text-4xl md:text-5xl">
                Join the Community
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-base text-white/75 sm:mb-10 sm:text-lg">
                Become a member for event access, workshops, and exclusive community invites.
              </p>
              <Link
                href="/join"
                className="inline-flex rounded-xl bg-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-on-primary-fixed transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(217,32,47,0.4)]"
              >
                Join Now
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
*/}
    </main>
  );
}
