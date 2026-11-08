"use client";

import { useState } from "react";
import { MEMBER_JOINING_YEARS, type MemberJoiningYear } from "@/lib/member-id";

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

      const scriptLoaded = await loadCashfreeScript();
      if (!scriptLoaded || !window.Cashfree) {
        setError("Could not load Cashfree checkout. Check your connection and try again.");
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
        orderId?: string;
        paymentSessionId?: string;
        mode?: "sandbox" | "production";
      };
      try {
        orderData = await orderRes.json();
      } catch {
        setError("Could not start the payment. Please try again.");
        return;
      }

      if (!orderRes.ok || !orderData.paymentSessionId || !orderData.mode) {
        setError(orderData.error ?? "Could not start the payment.");
        return;
      }

      // Redirects this tab to Cashfree; Cashfree sends the student back to
      // /join/payment-status, where the server confirms the result.
      const cashfree = window.Cashfree({ mode: orderData.mode });
      const result = await cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: "_self",
      });
      if (result?.error) {
        setError(result.error.message ?? "Could not open Cashfree checkout. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong starting the payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card space-y-5 rounded-xl p-6 sm:p-8 md:p-10">
      <div className="mb-2">
        <h2 className="font-grotesk text-2xl font-bold text-on-surface">Member details</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          One-time membership fee: <span className="font-bold text-primary">₹{feeInr}</span> via Cashfree
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
        {loading ? "Opening Cashfree…" : `Pay ₹${feeInr}`}
      </button>

      <p className="text-center text-xs text-on-surface-variant">
        Secure checkout via Cashfree (UPI, cards, net banking). Creates your SDC membership and a unique 6-digit member ID (e.g. 233101 for
        2023 batch) after successful payment.
      </p>
    </form>
  );
}
