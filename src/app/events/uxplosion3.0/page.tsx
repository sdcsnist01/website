import type { Metadata } from "next";
import UxplosionLanding from "@/components/uxplosion/UxplosionLanding";
import { uxplosionFontVariables } from "@/components/uxplosion/fonts";
import "@/styles/uxplosion.css";

export const metadata: Metadata = {
  title: "UXplosion 3.0 | SDC SNIST",
  description:
    "UXplosion 3.0 — a UI/UX learning experience from SDC SNIST that builds week by week and culminates in a final design hackathon.",
  openGraph: {
    title: "UXplosion 3.0 | SDC SNIST",
    description:
      "A UI/UX learning experience that builds week by week and culminates in the final design challenge.",
    type: "website",
  },
};

export default function UxplosionPage() {
  return (
    <div className={uxplosionFontVariables}>
      <UxplosionLanding />
    </div>
  );
}
