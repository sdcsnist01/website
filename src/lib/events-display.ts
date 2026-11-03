/** Display helpers for event cards, from the Claude Design reference status table (#events). */

export type StatusKey = "live" | "upcoming" | "past";

export const STATUS_STYLE: Record<StatusKey, { label: string; bg: string; fg: string; border: string; dot: string; pulse: boolean }> = {
  live: { label: "LIVE NOW", bg: "#d9272e", fg: "#ffffff", border: "#d9272e", dot: "#ffffff", pulse: true },
  upcoming: { label: "UPCOMING", bg: "#ffffff", fg: "#b01f1f", border: "#f0b8b8", dot: "#d9272e", pulse: false },
  past: { label: "PAST", bg: "#e9e4de", fg: "#5e5a54", border: "#d8d2cf", dot: "#9a958e", pulse: false },
};

/** "2026-09-27" → "Sep 27, 2026". Returns the input unchanged when it isn't a calendar date (e.g. "TBD"). */
export function formatEventDate(value: string): string {
  const parsed = new Date(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function eventYear(value: string): string {
  return /^\d{4}/.test(value) ? value.slice(0, 4) : "TBD";
}
