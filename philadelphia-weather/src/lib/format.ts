/**
 * Open-Meteo is queried with `timezone=America/New_York`, so every timestamp it
 * returns is already Philadelphia wall-clock with no offset ("2026-09-16T14:00").
 *
 * Passing that straight to `new Date()` would interpret it in the *rendering
 * machine's* zone, and formatting the result back into America/New_York would
 * then shift it a second time. Instead we read the digits and rebuild the
 * instant in UTC, so the wall-clock reading survives verbatim on a laptop in
 * Philadelphia, a CI box in UTC, or a serverless region in Oregon alike.
 */

const format = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" });

/** Rebuild a zone-less wall-clock string as the same reading in UTC. */
function asWallClock(value: string): Date {
  const [date, time = "00:00"] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes));
}

export const roundTemp = (value: number) => Math.round(value);

export function hourLabel(wallClock: string): string {
  return format({ hour: "numeric" }).format(asWallClock(wallClock));
}

export function clockLabel(wallClock: string): string {
  return format({ hour: "numeric", minute: "2-digit" }).format(
    asWallClock(wallClock),
  );
}

export function weekdayLabel(date: string): string {
  return format({ weekday: "short" }).format(asWallClock(date));
}

export function longDateLabel(wallClock: string): string {
  return format({ weekday: "long", month: "long", day: "numeric" }).format(
    asWallClock(wallClock),
  );
}

/** Minutes since local midnight, used to place marks on the sun arc. */
export function minutesIntoDay(wallClock: string): number {
  const [, time = "00:00"] = wallClock.split("T");
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
