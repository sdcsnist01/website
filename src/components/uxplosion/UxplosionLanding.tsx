import UxplosionParticles from "./UxplosionParticles";
import UxplosionNav from "./UxplosionNav";
import UxplosionHero from "./UxplosionHero";
import UxplosionAbout from "./UxplosionAbout";
import UxplosionEssentials from "./UxplosionEssentials";
import UxplosionTimeline from "./UxplosionTimeline";
import UxplosionHackathon from "./UxplosionHackathon";
import UxplosionTeams from "./UxplosionTeams";
import UxplosionGallery from "./UxplosionGallery";
import UxplosionSpeaker from "./UxplosionSpeaker";
import UxplosionArchive from "./UxplosionArchive";
import UxplosionSponsors from "./UxplosionSponsors";
import UxplosionFaq from "./UxplosionFaq";
import UxplosionPricing from "./UxplosionPricing";
import UxplosionContact from "./UxplosionContact";
import UxplosionFooter from "./UxplosionFooter";

export default function UxplosionLanding() {
  return (
    <div className="ux-page relative overflow-x-clip bg-[#0A0A0C] font-[var(--font-uxp-body)] text-[#F5F3F4]">
      <div id="top" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[#0A0A0C]" />
      <UxplosionParticles />
      <UxplosionNav />

      <div className="relative z-[3]">
        <UxplosionHero />
        <UxplosionAbout />
        <UxplosionEssentials />
        <UxplosionTimeline />
        <UxplosionHackathon />
        <UxplosionTeams />
        <UxplosionGallery />
        <div className="sec-rule mx-auto h-px max-w-[1180px] bg-white/5" aria-hidden="true" />
        <UxplosionSpeaker />
        <UxplosionArchive />
        <UxplosionSponsors />
        <div className="sec-rule mx-auto h-px max-w-[1180px] bg-white/5" aria-hidden="true" />
        <UxplosionFaq />
        <UxplosionPricing />
        <UxplosionContact />
        <UxplosionFooter />
      </div>
    </div>
  );
}
