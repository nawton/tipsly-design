/**
 * Tipsly is a Swedish service: opening hours, auction deadlines and week
 * numbers are always evaluated in Stockholm time, no matter where the server
 * runs or where the visitor is.
 */

export const TIME_ZONE = "Europe/Stockholm";

const parts = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/**
 * Returns a Date whose local getters (getDay, getHours, …) read as the
 * current wall-clock time in Stockholm. Use it for display and comparisons
 * only, never as an absolute timestamp to send anywhere.
 */
export function stockholmNow(timestamp: number = Date.now()): Date {
  const p: Record<string, number> = {};
  for (const { type, value } of parts.formatToParts(new Date(timestamp))) {
    if (type !== "literal") p[type] = Number(value);
  }
  return new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}
