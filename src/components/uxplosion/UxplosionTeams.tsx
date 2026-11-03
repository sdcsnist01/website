"use client";

import Reveal from "@/components/home/Reveal";
import UxplosionWinners from "./UxplosionWinners";

const TEAMS = [
  "SOUL REAPERS", "NeuroPixel", "Scout Regiment", "VisionX", "Innovix",
  "Ideaforge", "Optimizers", "Persona", "TriUx", "TrioPixels",
  "Team Nexora", "Helios", "Logic_Duo", "HackRats", "Syntax",
  "Smart store", "Zenova", "Paper & Pixels", "UX Forge", "FigmaForce",
  "Team Big 3", "AstraForge", "Team Faang", "Team Matrix", "Trio",
  "Cognitive flows", "Team Rocket", "TriNova", "out of sync", "Hopeless Guys",
  "ProtoPair", "Neural Ninjas", "Design Nova", "dviUX", "Cognitrix",
  "Dracula", "The Novion", "PixelNova", "Kreatiq", "The Mavericks",
  "Tech Verse", "Designhub", "DesignDuo", "DesignDrift", "Trinex",
  "Design Nexus", "Coreframe", "UXcuse Me", "HackHers", "Pixel Forge",
  "Northstar", "Horizon", "Dark Knight", "Codex", "design.md",
  "Team Paradise", "HackNova", "Beyond Zero", "CodeStorm", "Shanmukha",
  "Titans", "Devops", "Nexora", "Tech learners", "TEAM PARADISE",
  "UXinity", "BRAINWAVE", "UI UTOPIA", "Figma fanatics", "Beyond Pixels",
  "Aaya Sher", "TrioUx", "Tensor Titans", "FluxUI", "UInova",
  "Srivathsa", "Genx", "NEXAS", "Team Varanasi",
];

export default function UxplosionTeams() {
  return (
    <section id="teams" className="relative z-[2] px-4 py-16 sm:px-6 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1180px]">
        <Reveal>
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6FA8]">
            <span aria-hidden="true" className="text-sm">
              ✳
            </span>{" "}
            Teams
          </div>
          <h2
            className="mb-4 text-[clamp(28px,3.4vw,48px)] font-semibold leading-[1.06] tracking-[-0.026em]"
            style={{ fontFamily: "var(--font-uxp-heading)" }}
          >
            The winners are in.
          </h2>
          <p className="mb-12 max-w-[560px] text-[16px] leading-relaxed text-[#B8B2B7] md:mb-16">
            {TEAMS.length} teams competed at the hackathon finale. Congratulations to the top three.
          </p>
        </Reveal>

        <UxplosionWinners />
        <Reveal delay={0.05}>
          <div className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7A7278]">All teams</div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="ux-tm-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" style={{ position: "relative" }}>
            {TEAMS.map((name, i) => (
              <div key={`${i}-${name}`} className="ux-tm-row flex items-baseline gap-4 px-1 py-3">
                <span className="ux-tm-no w-8 flex-shrink-0 font-mono text-[11px] text-white/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="ux-tm-name text-[15px] font-medium text-[#D8D2D6]"
                  style={{ fontFamily: "var(--font-uxp-heading)" }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
