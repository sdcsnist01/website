"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/ux/PageTransition";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  // UXplosion 3.0 ships its own branded nav/footer matching its design —
  // opts out of the site-wide chrome the same way /admin does.
  const isUxplosion = pathname.startsWith("/events/uxplosion3.0");

  if (isAdmin || isUxplosion) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </>
  );
}
