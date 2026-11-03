"use client";

import { useState } from "react";
import { MEMBER_JOINING_YEARS, type MemberJoiningYear } from "@/lib/member-id";

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

const inputClass =
  "w-full rounded-lg border border-[#d8d2cf] bg-white px-4 py-3 text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary focus-visible:ring-4 focus-visible:ring-primary/15";

type BecomeMemberFormProps = {
  /** Current membership fee in whole rupees, read from the backend by the page. */
  feeInr: number;
  paymentsEnabled: boolean;
};

export default function BecomeMemberForm({ feeInr, paymentsEnabled }: BecomeMemberFormProps) {
  const [form, setForm] = useState({
    fullName: "",
    rollNumber: "",
    email: "",
    phone: "",
    joiningYear: "" as "" | `${MemberJoiningYear}`,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ memberId: string; membershipYear?: number; message: string } | null>(null);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!form.joiningYear) {
        setError("Select the year you joined college (batch year).");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setError("Could not load Razorpay. Check your connection and try again.");
        return;
      }

      const orderRes = await fetch("/api/membership/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          rollNumber: form.rollNumber,
          email: form.email,
          phone: form.phone,
          joiningYear: Number(form.joiningYear),
        }),
      });

      let orderData: {
        error?: string;
        keyId?: string;
        amount?: number;
        currency?: string;
        orderId?: string;
        userId?: string;
      };
      try {
        orderData = await orderRes.json();
      } catch {
        setError("Could not start Razorpay payment. Please try again.");
        return;
      }

      if (!orderRes.ok || !orderData.orderId || !orderData.keyId || !orderData.userId) {
        setError(orderData.error ?? "Could not start Razorpay payment.");
        return;
      }

      const userId = orderData.userId;

      const RazorpayCtor = window.Razorpay;
      if (!RazorpayCtor) {
        setError("Could not load Razorpay. Check your connection and try again.");
        return;
      }

      const amount = Number(orderData.amount);
      if (!Number.isFinite(amount)) {
        setError("Invalid Razorpay order amount.");
        return;
      }


      await new Promise<void>((resolve) => {
        const rzp = new RazorpayCtor({
          key: orderData.keyId!,
          amount,
          currency: orderData.currency ?? "INR",
          name: "SDC SNIST",
          description: `Annual Membership · ₹${feeInr}`,
          order_id: orderData.orderId!,
          prefill: {
            name: form.fullName,
            email: form.email,
            contact: form.phone,
          },
          theme: { color: "#d9272e" },
          handler: async (response) => {
            try {
              const verifyRes = await fetch("/api/membership/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  userId,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok) {
                setSuccess({
                  memberId: verifyData.memberId,
                  membershipYear: verifyData.membershipYear,
                  message: verifyData.message,
                });
              } else {
                setError(
                  verifyData.error ??
                    "Payment received but activation failed. Contact support with your Razorpay payment ID.",
                );
              }
            } catch {
              setError("Payment received but verification failed. Contact support with your Razorpay payment ID.");
            } finally {
              resolve();
            }
          },
          modal: {
            ondismiss: () => {
              resolve();
            },
          },
        });

        rzp.on("payment.failed", (res) => {
          setError(res.error?.description ?? "Razorpay payment failed. Please try again.");
          resolve();
        });

        rzp.open();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong starting Razorpay.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="glass-card rounded-xl border border-primary/30 p-8 text-center md:p-12">
        <p className="font-mono-ui text-xs tracking-[2px] text-primary">
          {success.membershipYear ? `${success.membershipYear} COHORT · ` : ""}MEMBERSHIP ACTIVE
        </p>
        <h2 className="font-grotesk mt-4 text-3xl font-bold text-on-surface">Welcome to SDC SNIST</h2>
        <p className="mt-4 text-on-surface-variant">{success.message}</p>
        <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
          {success.membershipYear ? (
            <p className="font-mono-ui mb-4 text-center text-xs uppercase tracking-[1.5px] text-primary">
              Class of {success.membershipYear}
            </p>
          ) : null}
          <p className="font-mono-ui text-xs uppercase tracking-[1.5px] text-on-surface-variant">Your member ID</p>
          <p className="font-grotesk mt-2 break-all text-xl font-bold tracking-wider text-primary sm:text-2xl sm:tracking-widest md:text-3xl">{success.memberId}</p>
        </div>
        <p className="mt-6 text-sm text-on-surface-variant">
          Save this ID. Keep the email you registered with for membership verification.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card space-y-5 rounded-xl p-6 sm:p-8 md:p-10">
      <div className="mb-2">
        <h2 className="font-grotesk text-2xl font-bold text-on-surface">Member details</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          One-time membership fee: <span className="font-bold text-primary">₹{feeInr}</span> via Razorpay
        </p>
      </div>

      {!paymentsEnabled ? (
        <p role="status" className="rounded-lg border border-[#d8d2cf] bg-white px-4 py-3 text-sm text-on-surface-variant">
          Membership payments are closed right now. Please check back later.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-lg border border-primary/30 bg-[#fdf0f0] px-4 py-3 text-sm text-[#7a1220]">{error}</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 md:col-span-2">
          <span className="font-mono-ui text-[11px] font-medium uppercase tracking-[1.5px] text-on-surface-variant">Full name *</span>
          <input required className={inputClass} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
        </label>
        <label className="block space-y-2">
          <span className="font-mono-ui text-[11px] font-medium uppercase tracking-[1.5px] text-on-surface-variant">Roll number *</span>
          <input required className={inputClass} value={form.rollNumber} onChange={(e) => update("rollNumber", e.target.value)} />
        </label>
        <label className="block space-y-2">
          <span className="font-mono-ui text-[11px] font-medium uppercase tracking-[1.5px] text-on-surface-variant">Year of joining *</span>
          <select
            required
            className={inputClass}
            value={form.joiningYear}
            onChange={(e) => update("joiningYear", e.target.value)}
          >
            <option value="" disabled>
              Select batch year
            </option>
            {MEMBER_JOINING_YEARS.map((year) => (
              <option key={year} value={year} className="bg-surface-container-low text-white">
                {year} batch → {String(year).slice(-2)}31…
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="font-mono-ui text-[11px] font-medium uppercase tracking-[1.5px] text-on-surface-variant">Phone *</span>
          <input required type="tel" className={inputClass} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </label>
        <label className="block space-y-2">
          <span className="font-mono-ui text-[11px] font-medium uppercase tracking-[1.5px] text-on-surface-variant">Email *</span>
          <input required type="email" className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !paymentsEnabled}
        className="pressable font-mono-ui flex min-h-13 w-full cursor-pointer items-center justify-center rounded-full bg-primary text-sm uppercase tracking-[1.5px] text-white transition-colors hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Opening Razorpay…" : `Pay ₹${feeInr} with Razorpay`}
      </button>

      <p className="text-center text-xs text-on-surface-variant">
        Secure checkout via Razorpay. Creates your SDC membership and a unique 6-digit member ID (e.g. 233101 for
        2023 batch) after successful payment.
      </p>
    </form>
  );
}
