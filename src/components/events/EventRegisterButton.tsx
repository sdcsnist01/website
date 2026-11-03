"use client";

import { useState } from "react";
import type { Event } from "@/types/events";

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
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

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setError("Could not load payment gateway. Please try again.");
      setLoading(false);
      return;
    }

    const orderRes = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventSlug: event.id, name, email, phone }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      setError(orderData.error ?? "Failed to start payment.");
      setLoading(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "SDC SNIST",
      description: orderData.eventTitle,
      order_id: orderData.orderId,
      prefill: { name, email, contact: phone },
      theme: { color: "#d9272e" },
      handler: async (response) => {
        const verifyRes = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            registrationId: orderData.registrationId,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok) {
          setMessage(verifyData.message ?? "Registration confirmed!");
          setOpen(false);
        } else {
          setError(verifyData.error ?? "Payment received but verification failed. Contact support.");
        }
        setLoading(false);
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    });

    rzp.on("payment.failed", (res) => {
      setError(res.error.description);
      setLoading(false);
    });

    rzp.open();
    setLoading(false);
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
                    Phone <span className="font-normal text-on-surface-variant">(optional)</span>
                  </label>
                  <input id="reg-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={FIELD_CLASS} />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="pressable flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-dim disabled:opacity-60"
                >
                  {loading ? "Processing…" : `Pay ₹${feeInr} with Razorpay`}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
