"use client";

import { useState } from "react";
import EventRegistrationsDashboard from "@/components/admin/EventRegistrationsDashboard";
import MembershipPaymentsDashboard from "@/components/admin/MembershipPaymentsDashboard";

const TABS = [
  { id: "memberships", label: "Membership payments" },
  { id: "events", label: "Event registrations" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Switches between membership payments and paid event registrations on /admin/payments. */
export default function PaymentsTabs() {
  const [tab, setTab] = useState<TabId>("memberships");

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Payment type" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`payments-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`payments-panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`font-mono-ui rounded-full px-5 py-2.5 text-xs uppercase tracking-[1.5px] transition-colors ${
              tab === t.id ? "bg-primary text-white" : "border border-[#d8d2cf] bg-white text-on-surface-variant hover:bg-[#fdf0f0]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`payments-panel-${tab}`} aria-labelledby={`payments-tab-${tab}`}>
        {tab === "memberships" ? <MembershipPaymentsDashboard /> : <EventRegistrationsDashboard />}
      </div>
    </div>
  );
}
