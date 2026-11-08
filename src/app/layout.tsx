import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { cn } from "@/lib/utils";

// Fonts are loaded from Google Fonts in the browser rather than with next/font/google:
// next/font downloads fonts at build time, and that download fails in Next 16.3.3
// (both Turbopack and webpack), breaking production builds. The `site-fonts` and
// `uxp-fonts` classes in globals.css set the same --font-* variables next/font did.
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2" +
  "?family=Geist:wght@100..900" +
  "&family=Inter:wght@300;400;500;600;700" +
  "&family=Archivo:ital,wght@0,800;0,900;1,800;1,900" +
  "&family=Space+Grotesk:wght@500;600;700" +
  "&family=JetBrains+Mono:wght@400;500" +
  "&family=Manrope:wght@400;500;600;700" +
  "&family=Baloo+2:wght@700;800" +
  "&display=swap";

export const metadata: Metadata = {
  title: "SDC SNIST | Student Developers Community",
  description:
    "Building the Future with Student Developers at SNIST. Join us for hackathons, workshops, and networking.",
  openGraph: {
    title: "SDC SNIST",
    description: "Building the Future with Student Developers at SNIST.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans", "site-fonts")}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={GOOGLE_FONTS_HREF} rel="stylesheet" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
