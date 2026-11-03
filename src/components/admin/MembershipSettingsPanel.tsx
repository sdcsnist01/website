"use client";

import { useEffect, useState } from "react";
import type {
  MembershipFeeChange,
  MembershipPaymentStatusChange,
  MembershipSettings,
} from "@/lib/membership-settings";

type SettingsPayload = {
  settings: MembershipSettings;
  history: MembershipFeeChange[];
  statusHistory: MembershipPaymentStatusChange[];
};

const inputClass =
  "w-full rounded-lg border border-[#d8d2cf] bg-white px-4 py-3 text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary focus-visible:ring-4 focus-visible:ring-primary/15";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export default function MembershipSettingsPanel() {
  const [data, setData] = useState<SettingsPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feeInput, setFeeInput] = useState("");
  const [enabledInput, setEnabledInput] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function applyPayload(payload: SettingsPayload) {
    setData(payload);
    setFeeInput(String(payload.settings.feeInr));
    setEnabledInput(payload.settings.paymentsEnabled);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/membership-settings", { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error ?? "Could not load membership settings.");
        return body as SettingsPayload;
      })
      .then((payload) => {
        if (!cancelled) applyPayload(payload);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Could not load membership settings.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaved(false);

    const fee = Number(feeInput);
    if (!Number.isInteger(fee)) {
      setSaveError("Fee must be a whole number of rupees.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/membership-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fee, paymentsEnabled: enabledInput }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "Could not save membership settings.");
      applyPayload(body as SettingsPayload);
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save membership settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <p role="alert" className="rounded-lg border border-primary/30 bg-[#fdf0f0] px-4 py-3 text-sm text-[#7a1220]">
        {loadError}
      </p>
    );
  }

  if (!data) {
    return <p className="text-sm text-on-surface-variant">Loading membership settings…</p>;
  }

  const { settings, history, statusHistory } = data;

  return (
    <div className="space-y-10">
      <section aria-labelledby="membership-fee-heading" className="glass-card space-y-6 rounded-xl p-6 sm:p-8">
        <div>
          <h2 id="membership-fee-heading" className="font-grotesk text-2xl font-bold text-on-surface">
            Membership fee
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Currently charged: <span className="font-bold text-primary">₹{settings.feeInr}</span>
            {" · "}
            {settings.paymentsEnabled ? "Payments open" : "Payments closed"}
            {" · "}Last updated {dateFormatter.format(new Date(settings.updatedAt))} IST
          </p>
          <p className="mt-2 text-xs text-on-surface-variant">
            A new fee applies to orders created after you save. Orders already created keep their original amount.
          </p>
        </div>

        <form onSubmit={handleSave} className="grid gap-5 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="font-mono-ui text-[11px] font-medium uppercase tracking-[1.5px] text-on-surface-variant">
              Fee (₹) *
            </span>
            <input
              required
              type="number"
              inputMode="numeric"
              min={1}
              max={100000}
              step={1}
              className={inputClass}
              value={feeInput}
              onChange={(e) => setFeeInput(e.target.value)}
            />
          </label>

          <label className="flex items-center gap-3 self-end rounded-lg border border-[#d8d2cf] bg-white px-4 py-3">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={enabledInput}
              onChange={(e) => setEnabledInput(e.target.checked)}
            />
            <span className="text-sm text-on-surface">Accept membership payments</span>
          </label>

          {saveError ? (
            <p role="alert" className="rounded-lg border border-primary/30 bg-[#fdf0f0] px-4 py-3 text-sm text-[#7a1220] md:col-span-2">
              {saveError}
            </p>
          ) : null}
          {saved ? (
            <p role="status" className="rounded-lg border border-[#cfe5d4] bg-[#f1faf3] px-4 py-3 text-sm text-[#1d5a2c] md:col-span-2">
              Membership settings saved.
            </p>
          ) : null}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="pressable font-mono-ui flex min-h-12 items-center justify-center rounded-full bg-primary px-8 text-sm uppercase tracking-[1.5px] text-white transition-colors hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      <section aria-labelledby="fee-history-heading" className="space-y-4">
        <h2 id="fee-history-heading" className="font-grotesk text-2xl font-bold text-on-surface">
          Fee change history
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No fee changes yet. The fee is still the initial ₹{settings.feeInr}.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#e4ddd6] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e4ddd6] font-mono-ui text-[11px] uppercase tracking-[1.5px] text-on-surface-variant">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">When (IST)</th>
                  <th scope="col" className="px-4 py-3 font-medium">Previous</th>
                  <th scope="col" className="px-4 py-3 font-medium">New</th>
                  <th scope="col" className="px-4 py-3 font-medium">Changed by</th>
                </tr>
              </thead>
              <tbody>
                {history.map((change) => (
                  <tr key={change.id} className="border-b border-[#f0ebe6] last:border-0">
                    <td className="px-4 py-3 text-on-surface">{dateFormatter.format(new Date(change.changedAt))}</td>
                    <td className="px-4 py-3 text-on-surface-variant">₹{change.previousFeeInr}</td>
                    <td className="px-4 py-3 font-medium text-on-surface">₹{change.newFeeInr}</td>
                    <td className="px-4 py-3 font-mono-ui text-xs text-on-surface-variant">
                      {change.changedBy ? `${change.changedBy.slice(0, 8)}…` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="status-history-heading" className="space-y-4">
        <h2 id="status-history-heading" className="font-grotesk text-2xl font-bold text-on-surface">
          Payments open/closed history
        </h2>
        {statusHistory.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            Payments have not been opened or closed yet. They are currently {settings.paymentsEnabled ? "open" : "closed"}.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#e4ddd6] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e4ddd6] font-mono-ui text-[11px] uppercase tracking-[1.5px] text-on-surface-variant">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">When (IST)</th>
                  <th scope="col" className="px-4 py-3 font-medium">Change</th>
                  <th scope="col" className="px-4 py-3 font-medium">Changed by</th>
                </tr>
              </thead>
              <tbody>
                {statusHistory.map((change) => (
                  <tr key={change.id} className="border-b border-[#f0ebe6] last:border-0">
                    <td className="px-4 py-3 text-on-surface">{dateFormatter.format(new Date(change.changedAt))}</td>
                    <td className="px-4 py-3 font-medium text-on-surface">
                      {change.newPaymentsEnabled ? "Payments opened" : "Payments closed"}
                    </td>
                    <td className="px-4 py-3 font-mono-ui text-xs text-on-surface-variant">
                      {change.changedBy ? `${change.changedBy.slice(0, 8)}…` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
