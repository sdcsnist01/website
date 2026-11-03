import { Space_Grotesk, Manrope, Baloo_2 } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-uxp-heading",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-uxp-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const baloo2 = Baloo_2({
  variable: "--font-uxp-bubble",
  weight: ["700", "800"],
  subsets: ["latin"],
});

/** CSS variable classes for the UXplosion 3.0 type system. */
export const uxplosionFontVariables = `${spaceGrotesk.variable} ${manrope.variable} ${baloo2.variable}`;
