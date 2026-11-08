"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type StatusResponse = {
  status?: "pending" | "paid" | "failed" | "cancelled";
  eventTitle?: string | null;
  eventSlug?: string | null;
  error?: string;
};

// Poll while a payment is still processing (UPI can take a little while).
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20;

export default function EventPaymentStatus() {
  const orderId = useSearchParams().get("order_id");
  const [data, setData] = useState<StatusResponse | null>(null);
  const [polls, setPolls] = useState(0);

  useEffect(() => {
    if (!orderId) return;
    if (data?.status && data.status !== "pending") return;
    if (polls >= MAX_POLLS) return;

    let cancelled = false;
    const timer = setTimeout(
      async () => {
        try {
          const res = await fetch(`/api/events/payment-status?order_id=${encodeURIComponent(orderId)}`, {
            cache: "no-store",
          });
          const body = (await res.json().catch(() => ({}))) as StatusResponse;
          if (!cancelled) setData(res.ok ? body : { ...data, error: body.error ?? "Could not check the payment." });
        } catch {
          if (!cancelled) setData((prev) => ({ ...prev, error: "Could not check the payment. Check your connection." }));
        } finally {
          if (!cancelled) setPolls((n) => n + 1);
        }
      },
      polls === 0 ? 0 : POLL_INTERVAL_MS,
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderId, data, polls]);

  const eventHref = data?.eventSlug ? `/events/${data.eventSlug}` : "/events";

  if (!orderId) {
    return (
      <StatusCard eyebrow="PAYMENT" title="No payment to show">
        <p>This page shows the result of an event registration payment.</p>
        <ActionLink href="/events" label="Browse events" />
      </StatusCard>
    );
  }

  if (data?.status === "paid") {
    return (
      <StatusCard eyebrow="REGISTRATION CONFIRMED" title="You're registered!">
        <p>
          Your payment was successful
          {data.eventTitle ? (
            <>
              {" "}and your spot for <span className="font-semibold text-on-surface">{data.eventTitle}</span> is confirmed
            </>
          ) : null}
          . See you there!
        </p>
        <ActionLink href={eventHref} label="Back to event" />
      </StatusCard>
    );
  }

  if (data?.status === "failed" || data?.status === "cancelled") {
    return (
      <StatusCard eyebrow="PAYMENT NOT COMPLETED" title={data.status === "failed" ? "Payment failed" : "Payment cancelled"}>
        <p>You are not registered yet. If money left your account, it will be refunded by your bank or Cashfree.</p>
        <ActionLink href={eventHref} label="Try again" />
      </StatusCard>
    );
  }

  const stillPolling = polls < MAX_POLLS;
  return (
    <StatusCard eyebrow="PAYMENT PENDING" title={stillPolling ? "Confirming your payment…" : "Payment still processing"}>
      {stillPolling ? (
        <p role="status">This usually takes a few seconds. Please don&apos;t close this page.</p>
      ) : (
        <>
          <p role="status">
            Cashfree hasn&apos;t confirmed the payment yet. If you paid, your registration will be confirmed automatically
            once it does. Check again in a few minutes.
          </p>
          <button
            type="button"
            onClick={() => setPolls(0)}
            className="pressable font-mono-ui mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 text-sm uppercase tracking-[1.5px] text-white transition-colors hover:bg-primary-dim"
          >
            Check again
          </button>
        </>
      )}
      {data?.error ? (
        <p role="alert" className="mt-4 rounded-lg border border-primary/30 bg-[#fdf0f0] px-4 py-3 text-sm text-[#7a1220]">
          {data.error}
        </p>
      ) : null}
    </StatusCard>
  );
}

function StatusCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl border border-primary/30 p-8 text-center md:p-12">
      <p className="font-mono-ui text-xs tracking-[2px] text-primary">{eyebrow}</p>
      <h1 className="font-grotesk mt-4 text-3xl font-bold text-on-surface">{title}</h1>
      <div className="mt-4 text-on-surface-variant">{children}</div>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="pressable font-mono-ui mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 text-sm uppercase tracking-[1.5px] text-white transition-colors hover:bg-primary-dim"
    >
      {label}
    </Link>
  );
}
