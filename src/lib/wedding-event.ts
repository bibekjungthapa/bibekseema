// Single source of truth for the wedding event: the countdown and the
// "add to calendar" buttons both read from here so the date can never drift.
// Browser-safe: no Node APIs and no env vars, so it can be imported from a route.

export const WEDDING_START = new Date("2026-12-03T10:00:00+05:45");
export const WEDDING_END = new Date("2026-12-03T14:00:00+05:45");

export const EVENT = {
  title: "Wedding of Bibek Thapa ♥ Seema Poudel",
  location: "Ramalaya, Basbari, Kathmandu, Nepal",
  description:
    "Bibek Thapa ♥ Seema Poudel\n\nYou are invited to celebrate our wedding.\n\nThursday, 3 December 2026 - 10:00 AM onwards\nRamalaya, Basbari, Kathmandu, Nepal",
} as const;

/** Calendar tools expect UTC basic format, e.g. 20261203T041500Z. */
export const toIcsUtc = (d: Date) =>
  d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

// RFC 5545 text escaping: backslash, semicolon and comma are prefixed with a
// backslash, and real newlines become the two-character sequence \n.
const escapeText = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

// RFC 5545 folds content lines at 75 octets: a break is CRLF followed by a space.
// Measured in octets, not characters, so the ♥ (3 octets in UTF-8) can't push a line over.
const MAX_OCTETS = 74;
const octets = (s: string) => new TextEncoder().encode(s).length;

const fold = (line: string) => {
  if (octets(line) <= MAX_OCTETS) return line;
  const chunks: string[] = [];
  let current = "";
  let used = 0;
  for (const ch of line) {
    const size = octets(ch);
    // Continuation lines spend one octet on the leading space.
    const budget = chunks.length === 0 ? MAX_OCTETS : MAX_OCTETS - 1;
    if (used + size > budget) {
      chunks.push(current);
      current = ch;
      used = size;
    } else {
      current += ch;
      used += size;
    }
  }
  if (current) chunks.push(current);
  return chunks.map((c, i) => (i === 0 ? c : " " + c)).join("\r\n");
};

/** Build the .ics file contents a guest's calendar app can import. */
export function buildIcs(now = new Date()): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bibek Thapa and Seema Poudel//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:wedding-bibek-seema-2026-12-03@invitation",
    `DTSTAMP:${toIcsUtc(now)}`,
    `DTSTART:${toIcsUtc(WEDDING_START)}`,
    `DTEND:${toIcsUtc(WEDDING_END)}`,
    `SUMMARY:${escapeText(EVENT.title)}`,
    `LOCATION:${escapeText(EVENT.location)}`,
    `DESCRIPTION:${escapeText(EVENT.description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P7D",
    "ACTION:DISPLAY",
    "DESCRIPTION:One week until the wedding of Bibek ♥ Seema",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** Offer the .ics file as a download named for the couple. */
export function downloadIcs() {
  const blob = new Blob([buildIcs()], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bibek-seema-wedding.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Google Calendar's prefilled "add event" screen. */
export function googleCalendarUrl() {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: EVENT.title,
    dates: `${toIcsUtc(WEDDING_START)}/${toIcsUtc(WEDDING_END)}`,
    details: EVENT.description,
    location: EVENT.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
