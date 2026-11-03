export type EventLifecycle = "upcoming" | "live" | "past";

export function parseEventDate(date: string): Date | null {
  if (!date || date === "TBD") return null;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getEventLifecycle(date: string, isPast: boolean, isLive?: boolean): EventLifecycle {
  if (isLive) return "live";
  if (isPast) return "past";
  const parsed = parseEventDate(date);
  if (!parsed) return "upcoming";

  const start = new Date(parsed);
  start.setHours(0, 0, 0, 0);
  const end = new Date(parsed);
  end.setHours(23, 59, 59, 999);
  const now = new Date();

  if (now >= start && now <= end) return "live";
  if (now > end) return "past";
  return "upcoming";
}

export function getCountdownParts(date: string): { days: number; hours: number; label: string } | null {
  const parsed = parseEventDate(date);
  if (!parsed) return null;

  const start = new Date(parsed);
  start.setHours(9, 0, 0, 0);
  const diff = start.getTime() - Date.now();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return { days, hours, label: `${days}d ${hours}h` };
  return { days: 0, hours, label: `${Math.max(hours, 1)}h` };
}
