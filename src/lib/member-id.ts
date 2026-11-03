import type { SupabaseClient } from "@supabase/supabase-js";

/** Fixed campus/chapter code used in every membership ID. */
export const MEMBER_ID_CHAPTER_CODE = "31";

/** Supported college joining years for membership IDs. */
export const MEMBER_JOINING_YEARS = [2023, 2024, 2025, 2026] as const;
export type MemberJoiningYear = (typeof MEMBER_JOINING_YEARS)[number];

export function isMemberJoiningYear(value: unknown): value is MemberJoiningYear {
  return typeof value === "number" && (MEMBER_JOINING_YEARS as readonly number[]).includes(value);
}

/** Prefix for a joining year, e.g. 2023 → "2331", 2024 → "2431". */
export function memberIdPrefix(joiningYear: MemberJoiningYear): string {
  return `${String(joiningYear).slice(-2)}${MEMBER_ID_CHAPTER_CODE}`;
}

/**
 * 6-digit membership ID: YY31NN
 * - YY = joining year (23–26)
 * - 31 = chapter code
 * - NN = sequential 01–99 within that year
 */
export async function generateUniqueMemberId(
  admin: SupabaseClient,
  joiningYear: MemberJoiningYear,
): Promise<string> {
  const prefix = memberIdPrefix(joiningYear);

  const { data, error } = await admin
    .from("sdc_members")
    .select("member_id")
    .like("member_id", `${prefix}%`);

  if (error) {
    throw new Error(error.message || "Could not allocate a membership ID");
  }

  let maxSeq = 0;
  for (const row of data ?? []) {
    const id = row.member_id;
    if (typeof id !== "string" || id.length !== 6 || !id.startsWith(prefix)) continue;
    const seq = Number.parseInt(id.slice(4), 10);
    if (Number.isFinite(seq) && seq > maxSeq) maxSeq = seq;
  }

  const next = maxSeq + 1;
  if (next > 99) {
    throw new Error(`No membership ID slots left for the ${joiningYear} batch (max 99).`);
  }

  return `${prefix}${String(next).padStart(2, "0")}`;
}
