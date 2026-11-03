import type { Metadata } from "next";
import { Archivo, Inter, Geist, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  weight: ["800", "900"],
  style: ["italic", "normal"],
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

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
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${archivo.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
