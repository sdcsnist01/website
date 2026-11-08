"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type StatusResponse = {
  status?: "pending" | "successful" | "failed" | "cancelled";
  memberId?: string | null;
  membershipYear?: number;
  error?: string;
};

// Poll while a payment is still processing (UPI can take a little while).
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20;

export default function MembershipPaymentStatus() {
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
          const res = await fetch(`/api/membership/payment-status?order_id=${encodeURIComponent(orderId)}`, {
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

  if (!orderId) {
    return (
      <StatusCard eyebrow="PAYMENT" title="No payment to show">
        <p>This page shows the result of a membership payment.</p>
        <BackToJoin label="Become a member" />
      </StatusCard>
    );
  }

  if (data?.status === "successful" && data.memberId) {
    return (
      <StatusCard eyebrow={`${data.membershipYear ? `${data.membershipYear} COHORT · ` : ""}MEMBERSHIP ACTIVE`} title="Welcome to SDC SNIST">
        <p>Your payment was successful and your membership is active.</p>
        <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
          <p className="font-mono-ui text-xs uppercase tracking-[1.5px] text-on-surface-variant">Your member ID</p>
          <p className="font-grotesk mt-2 break-all text-xl font-bold tracking-wider text-primary sm:text-2xl sm:tracking-widest md:text-3xl">
            {data.memberId}
          </p>
        </div>
        <p className="mt-6 text-sm">Save this ID. Keep the email you registered with for membership verification.</p>
      </StatusCard>
    );
  }

  if (data?.status === "failed" || data?.status === "cancelled") {
    return (
      <StatusCard eyebrow="PAYMENT NOT COMPLETED" title={data.status === "failed" ? "Payment failed" : "Payment cancelled"}>
        <p>No membership was activated. If money left your account, it will be refunded by your bank or Cashfree.</p>
        <BackToJoin label="Try again" />
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
            Cashfree hasn&apos;t confirmed the payment yet. If you paid, your membership will activate automatically once it
            does. Check again in a few minutes.
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

function BackToJoin({ label }: { label: string }) {
  return (
    <Link
      href="/join#membership"
      className="pressable font-mono-ui mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 text-sm uppercase tracking-[1.5px] text-white transition-colors hover:bg-primary-dim"
    >
      {label}
    </Link>
  );
}
