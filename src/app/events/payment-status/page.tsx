import { Suspense } from "react";
import EventPaymentStatus from "@/components/events/EventPaymentStatus";

export const metadata = {
  title: "Event payment | SDC SNIST",
  robots: { index: false, follow: false },
};

export default function EventPaymentStatusPage() {
  return (
    <main className="relative overflow-x-clip bg-background pb-16 pt-24 font-body text-on-surface sm:pt-28">
      <section className="relative mx-auto max-w-3xl px-4 sm:px-6">
        {/* useSearchParams in the client component needs a Suspense boundary. */}
        <Suspense fallback={<p className="text-center text-on-surface-variant">Loading payment status…</p>}>
          <EventPaymentStatus />
        </Suspense>
      </section>
    </main>
  );
}
