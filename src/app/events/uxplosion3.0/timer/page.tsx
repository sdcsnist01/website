import type { Metadata } from "next";
import HackathonTimerProvider from "@/components/hackathon-timer/HackathonTimerProvider";
import HackathonTimerDisplay from "@/components/hackathon-timer/HackathonTimerDisplay";
import { uxplosionFontVariables } from "@/components/uxplosion/fonts";
import "@/styles/uxplosion.css";
import "@/styles/uxplosion-timer.css";

export const metadata: Metadata = {
  title: "Hackathon Timer | UXplosion 3.0",
  description: "UXplosion 3.0 hackathon stage timer.",
  robots: { index: false, follow: false },
};

export default function UxplosionTimerPage() {
  return (
    <div className={uxplosionFontVariables}>
      <HackathonTimerProvider>
        <HackathonTimerDisplay />
      </HackathonTimerProvider>
    </div>
  );
}
