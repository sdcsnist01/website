"use client";

import { useState } from "react";
import type { Event } from "@/types/events";

function loadCashfreeScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Cashfree) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const FIELD_CLASS =
  "w-full rounded-lg border border-[#d8d2cf] bg-white px-4 py-3 text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary focus-visible:ring-4 focus-visible:ring-primary/15";

type EventRegisterButtonProps = {
  event: Event;
  className?: string;
  label?: string;
};

export default function EventRegisterButton({
  event,
  className = "pressable mt-6 flex min-h-13 sm:mt-8 w-full items-center justify-center rounded-full bg-primary px-6 text-center text-base font-semibold text-white transition-colors hover:bg-primary-dim",
  label = "Secure your spot",
}: EventRegisterButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (event.isPast) return null;

  const isPaid = event.requiresPayment && (event.registrationFeePaise ?? 0) > 0;
  const feeInr = ((event.registrationFeePaise ?? 0) / 100).toFixed(0);
  const hasExternalLink = event.registrationUrl && event.registrationUrl !== "#";

  async function handlePaidRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const scriptLoaded = await loadCashfreeScript();
      if (!scriptLoaded || !window.Cashfree) {
        setError("Could not load payment gateway. Please try again.");
        return;
      }

      const orderRes = await fetch("/api/events/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug: event.id, name, email, phone }),
      });

      const orderData = (await orderRes.json().catch(() => ({}))) as {
        error?: string;
        paymentSessionId?: string;
        mode?: "sandbox" | "production";
      };
      if (!orderRes.ok || !orderData.paymentSessionId || !orderData.mode) {
        setError(orderData.error ?? "Failed to start payment.");
        return;
      }

      // Redirects this tab to Cashfree; Cashfree sends the registrant back to
      // /events/payment-status, where the server confirms the result.
      const result = await window.Cashfree({ mode: orderData.mode }).checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: "_self",
      });
      if (result?.error) {
        setError(result.error.message ?? "Could not open checkout. Please try again.");
      }
    } catch {
      setError("Something went wrong starting the payment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isPaid && hasExternalLink) {
    return (
      <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }

  if (!isPaid) {
    return (
      <a href="/join" className={className}>
        {label} · Become a member
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        Register · ₹{feeInr}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="register-dialog-title">
          <div className="glass-card w-full max-w-md rounded-xl p-6 shadow-[0_24px_60px_rgba(23,23,25,0.2)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 id="register-dialog-title" className="font-grotesk text-xl font-bold text-on-surface">
                  Register for event
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">{event.title}</p>
                <p className="font-grotesk mt-2 text-lg font-bold text-primary">₹{feeInr}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="pressable rounded-lg px-2 py-1 text-on-surface-variant hover:text-on-surface"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {message ? (
              <p role="status" className="rounded-lg border border-emerald-600/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {message}
              </p>
            ) : (
              <form onSubmit={handlePaidRegister} className="space-y-4">
                {error ? (
                  <p role="alert" className="rounded-lg border border-primary/30 bg-[#fdf0f0] px-4 py-3 text-sm text-[#7a1220]">
                    {error}
                  </p>
                ) : null}
                <div>
                  <label htmlFor="reg-name" className="mb-1.5 block text-sm font-semibold text-on-surface">
                    Full name
                  </label>
                  <input id="reg-name" required value={name} onChange={(e) => setName(e.target.value)} className={FIELD_CLASS} />
                </div>
                <div>
                  <label htmlFor="reg-email" className="mb-1.5 block text-sm font-semibold text-on-surface">
                    Email
                  </label>
                  <input id="reg-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={FIELD_CLASS} />
                </div>
                <div>
                  <label htmlFor="reg-phone" className="mb-1.5 block text-sm font-semibold text-on-surface">
                    Phone
                  </label>
                  <input
                    id="reg-phone"
                    required
                    type="tel"
                    inputMode="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={FIELD_CLASS}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="pressable flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-dim disabled:opacity-60"
                >
                  {loading ? "Opening checkout…" : `Pay ₹${feeInr}`}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
