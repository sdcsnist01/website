import type { SupabaseClient } from "@supabase/supabase-js";

/** Bounds for the admin-entered membership fee, in whole rupees. */
export const MEMBERSHIP_FEE_MIN_INR = 1;
export const MEMBERSHIP_FEE_MAX_INR = 100000;

export type MembershipSettings = {
  feePaise: number;
  feeInr: number;
  currency: "INR";
  paymentsEnabled: boolean;
  updatedAt: string;
};

export type MembershipFeeChange = {
  id: number;
  previousFeeInr: number;
  newFeeInr: number;
  changedBy: string | null;
  changedAt: string;
};

export type MembershipPaymentStatusChange = {
  id: number;
  previousPaymentsEnabled: boolean;
  newPaymentsEnabled: boolean;
  changedBy: string | null;
  changedAt: string;
};

type SettingsRow = {
  fee_paise: number;
  currency: "INR";
  payments_enabled: boolean;
  updated_at: string;
};

type FeeHistoryRow = {
  id: number;
  previous_fee_paise: number;
  new_fee_paise: number;
  changed_by: string | null;
  changed_at: string;
};

export function toMembershipSettings(row: SettingsRow): MembershipSettings {
  return {
    feePaise: row.fee_paise,
    feeInr: row.fee_paise / 100,
    currency: row.currency,
    paymentsEnabled: row.payments_enabled,
    updatedAt: row.updated_at,
  };
}

/** Reads the single settings row. Throws if it is missing or unreadable. */
export async function getMembershipSettings(admin: SupabaseClient): Promise<MembershipSettings> {
  const { data, error } = await admin
    .from("membership_settings")
    .select("fee_paise, currency, payments_enabled, updated_at")
    .eq("id", "default")
    .single();

  if (error || !data) {
    throw new Error(`Membership settings unavailable: ${error?.message ?? "no row"}`);
  }
  return toMembershipSettings(data as SettingsRow);
}

export async function getMembershipFeeHistory(admin: SupabaseClient, limit = 50): Promise<MembershipFeeChange[]> {
  const { data, error } = await admin
    .from("membership_fee_history")
    .select("id, previous_fee_paise, new_fee_paise, changed_by, changed_at")
    .eq("settings_id", "default")
    .order("changed_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Fee history unavailable: ${error.message}`);
  }
  return ((data ?? []) as FeeHistoryRow[]).map((row) => ({
    id: row.id,
    previousFeeInr: row.previous_fee_paise / 100,
    newFeeInr: row.new_fee_paise / 100,
    changedBy: row.changed_by,
    changedAt: row.changed_at,
  }));
}

type PaymentStatusHistoryRow = {
  id: number;
  previous_payments_enabled: boolean;
  new_payments_enabled: boolean;
  changed_by: string | null;
  changed_at: string;
};

export async function getMembershipPaymentStatusHistory(
  admin: SupabaseClient,
  limit = 50,
): Promise<MembershipPaymentStatusChange[]> {
  const { data, error } = await admin
    .from("membership_payment_status_history")
    .select("id, previous_payments_enabled, new_payments_enabled, changed_by, changed_at")
    .eq("settings_id", "default")
    .order("changed_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Payment status history unavailable: ${error.message}`);
  }
  return ((data ?? []) as PaymentStatusHistoryRow[]).map((row) => ({
    id: row.id,
    previousPaymentsEnabled: row.previous_payments_enabled,
    newPaymentsEnabled: row.new_payments_enabled,
    changedBy: row.changed_by,
    changedAt: row.changed_at,
  }));
}

/**
 * Validates an admin update. The fee is entered in whole rupees and converted to paise.
 * `fee` may be omitted to change only the enabled flag.
 */
export function parseMembershipSettingsUpdate(
  body: unknown,
): { ok: true; feePaise: number | null; paymentsEnabled: boolean | null } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid settings payload." };
  }
  const { fee, paymentsEnabled } = body as { fee?: unknown; paymentsEnabled?: unknown };

  let feePaise: number | null = null;
  if (fee !== undefined) {
    if (typeof fee !== "number" || !Number.isInteger(fee)) {
      return { ok: false, error: "Fee must be a whole number of rupees." };
    }
    if (fee < MEMBERSHIP_FEE_MIN_INR || fee > MEMBERSHIP_FEE_MAX_INR) {
      return {
        ok: false,
        error: `Fee must be between ₹${MEMBERSHIP_FEE_MIN_INR} and ₹${MEMBERSHIP_FEE_MAX_INR}.`,
      };
    }
    feePaise = fee * 100;
  }

  let enabled: boolean | null = null;
  if (paymentsEnabled !== undefined) {
    if (typeof paymentsEnabled !== "boolean") {
      return { ok: false, error: "paymentsEnabled must be true or false." };
    }
    enabled = paymentsEnabled;
  }

  if (feePaise === null && enabled === null) {
    return { ok: false, error: "Nothing to update." };
  }
  return { ok: true, feePaise, paymentsEnabled: enabled };
}
