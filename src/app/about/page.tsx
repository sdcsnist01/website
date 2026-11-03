import Image from "next/image";
import FloatWords from "@/components/ui/FloatWords";
import TeamSection from "@/components/about/TeamSection";
import ArchiveSection from "@/components/about/ArchiveSection";
import { aboutPageContent, partnerLogosStub } from "@/data/about";

/** Copy and structure from the Claude Design reference (Landing.dc.html, about-data.js). */
const HERO_WORDS = ["UXPLOSION", "HASHITOUT", "HACKATHONS", "TECH TALKS", "BOOTCAMPS", "WORKSHOPS", "NETWORKING"];

const STORY = {
  eyebrow: "OUR STORY",
  title: "Why SDC exists.",
  pull: "Learn beyond the classroom. Build things that matter.",
  paragraphs: [
    { before: "Technology is best learned by ", mark: "building", after: ". SDC brings students together to explore new ideas, work on real projects, and learn from one another." },
    { before: "Through bootcamps, hackathons, technical events, and collaborative build sessions, members turn ", mark: "curiosity into practical skills", after: " and ideas into working projects." },
    { before: "Run by students, shaped by the community, and ", mark: "open to anyone", after: " willing to learn and build." },
  ],
};

export default function AboutPage() {
  const half = Math.ceil(partnerLogosStub.length / 2);
  const partnerRowOne = partnerLogosStub.slice(0, half);
  const partnerRowTwo = partnerLogosStub.slice(half);
  // 4 copies ensures track is wider than any viewport for seamless looping
  const rowOneFill = Array.from({ length: 4 }, () => partnerRowOne).flat();
  const rowTwoFill = Array.from({ length: 4 }, () => partnerRowTwo).flat();

  return (
    <main className="relative overflow-x-clip bg-background font-body text-on-surface">
      {/* Hero */}
      <section aria-labelledby="about-heading" className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pt-32 md:px-8 md:pb-28">
        {/* Decorations start below the header, so the nav sits on plain background as in the reference. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[120px] overflow-hidden">
        <FloatWords preset="about" />
        <div aria-hidden className="anim-drift-red pointer-events-none absolute -left-[12vw] -top-[16vw] h-[48vw] w-[48vw] min-h-[340px] min-w-[340px] rounded-full opacity-80" style={{ background: "radial-gradient(circle, rgba(229,37,41,0.26) 0%, rgba(229,37,41,0) 68%)" }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-[18vw] -right-[14vw] h-[46vw] w-[46vw] min-h-[320px] min-w-[320px] rounded-full" style={{ background: "radial-gradient(circle, rgba(253,236,234,1) 0%, rgba(253,236,234,0) 70%)" }} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(229,37,41,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(229,37,41,0.07) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at 40% 40%, #000 0%, transparent 72%)",
          }}
        />
        </div>

        <div className="relative mx-auto grid max-w-[1100px] items-center gap-10 md:grid-cols-2">
          <div>
            <div className="anim-fade-up mb-4 flex items-center gap-3" style={{ animationDelay: "0.05s" }}>
              <span className="h-0.5 w-7 bg-primary" aria-hidden />
              <span className="font-mono-ui text-xs tracking-[3px] text-[#a91f29]">ABOUT SDC</span>
            </div>
            <h1 id="about-heading" className="anim-fade-up font-grotesk text-[clamp(38px,5.6vw,76px)] font-bold leading-none tracking-[-0.035em] text-[#171719]">
              We don&apos;t just learn technology. <span className="text-primary">We build with it.</span>
            </h1>
            <p className="mt-7 max-w-[500px] text-pretty text-[clamp(16px,1.4vw,18px)] leading-[1.7] text-[#5c5c66]">
              SDC SNIST is a student developer community at SNIST. Members learn by building projects, sharing what they
              know, and working alongside peers who are just as curious.
            </p>
          </div>

          <ul aria-label="Community topics" style={{ animationDelay: "0.35s" }} className="anim-fade-up flex flex-wrap content-center gap-x-[22px] gap-y-[44px] py-3 md:min-h-[360px]">
            {HERO_WORDS.map((word, i) => {
              // Per-word offset, drift and colour, taken from the reference's hero word styles.
              const offset = [0, 28, 8, 40, 0, 20, 36][i % 7];
              const duration = [9, 11, 13, 10, 12, 14, 9][i % 7];
              const delay = [0, 1.2, 0.6, 2.1, 1.7, 0.3, 2.5][i % 7];
              const outlined = i % 3 === 2;
              return (
                <li
                  key={word}
                  className={`font-display-hero block whitespace-nowrap text-[clamp(20px,3.2vw,40px)] leading-[1.05] ${
                    i % 3 === 0 ? "text-primary" : outlined ? "text-transparent" : "text-[#151518]"
                  }`}
                  style={{
                    marginLeft: offset,
                    animation: `${i % 2 ? "driftXr" : "driftX"} ${duration}s ease-in-out ${delay}s infinite`,
                    WebkitTextStroke: outlined ? "1.5px #151518" : undefined,
                  }}
                >
                  {word}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Story (dark) */}
      <section aria-labelledby="story-heading" className="relative scroll-mt-16 overflow-hidden bg-[#171719] px-4 py-20 text-white sm:px-6 sm:py-28 md:px-8">
        <FloatWords preset="story" tone="dark" />
        <div aria-hidden className="pointer-events-none absolute -right-[6vw] -top-[8vw] h-[36vw] w-[36vw] min-h-[280px] min-w-[280px] rounded-full" style={{ background: "radial-gradient(circle, rgba(229,37,41,0.3) 0%, rgba(229,37,41,0) 66%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "56px 56px", maskImage: "linear-gradient(180deg, #000 0%, transparent 60%)" }} />

        <div className="relative mx-auto max-w-[1100px]">
          <div className="grid gap-10 md:grid-cols-[5fr_6fr] md:items-start md:gap-14">
            <div>
              <div className="mb-[18px] flex items-center gap-3">
                <span className="h-0.5 w-7 bg-[#ff5a5e]" aria-hidden />
                <span className="font-mono-ui text-xs tracking-[3px] text-[#ff8a8c]">{STORY.eyebrow}</span>
              </div>
              <h2 id="story-heading" className="font-grotesk text-[clamp(38px,5vw,66px)] font-bold leading-[0.98] tracking-[-0.035em]">
                Why SDC <span className="text-[#ff5a5e]">exists.</span>
              </h2>
              <p className="mt-6 max-w-[24ch] text-balance text-[clamp(17px,1.7vw,21px)] leading-[1.4] text-[#e6e6ea]">{STORY.pull}</p>
            </div>
            <div className="flex flex-col gap-[22px]">
              {STORY.paragraphs.map((p) => (
                <p key={p.before} className="max-w-[56ch] text-pretty text-[clamp(16.5px,1.4vw,18.5px)] leading-[1.75] text-[#c9c9d0]">
                  {p.before}
                  <span className="font-medium text-white shadow-[inset_0_-0.45em_0_rgba(229,37,41,0.38)]">{p.mark}</span>
                  {p.after}
                </p>
              ))}
              <p className="max-w-[56ch] text-pretty text-[clamp(16.5px,1.4vw,18.5px)] leading-[1.75] text-[#c9c9d0]">{aboutPageContent.foundingStory}</p>
            </div>
          </div>

        </div>
      </section>

      <TeamSection />

      <ArchiveSection />

      <section aria-labelledby="partners-heading" className="mx-auto mb-20 max-w-[1100px] px-4 sm:px-6 md:px-8">
        <div className="mb-10 text-center">
          <p id="partners-heading" className="font-mono-ui mb-4 text-xs tracking-[3px] text-[#77736c]">
            SUPPORTED BY INDUSTRY TITANS
          </p>
          <div className="mx-auto h-px w-24 bg-[#e4ddd2]" aria-hidden />
        </div>

        <div className="space-y-3">
          <div className="partner-marquee">
            <div className="partner-marquee-track">
              {rowOneFill.map((logo, index) => (
                <div key={`r1-${index}`} className="partner-pill">
                  <Image src={logo.src} alt={logo.alt} width={200} height={60} unoptimized style={{ height: "60px", width: "auto", maxWidth: "200px" }} className="object-contain" />
                </div>
              ))}
            </div>
          </div>

          <div className="partner-marquee">
            <div className="partner-marquee-track partner-marquee-track--reverse">
              {rowTwoFill.map((logo, index) => (
                <div key={`r2-${index}`} className="partner-pill">
                  <Image src={logo.src} alt={logo.alt} width={200} height={60} unoptimized style={{ height: "60px", width: "auto", maxWidth: "200px" }} className="object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
