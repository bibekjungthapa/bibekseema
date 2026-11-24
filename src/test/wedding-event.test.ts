import { describe, expect, it } from "vitest";

import {
  EVENT,
  WEDDING_END,
  WEDDING_START,
  buildIcs,
  googleCalendarUrl,
  toIcsUtc,
} from "@/lib/wedding-event";

const STAMP = new Date("2026-11-24T16:00:00Z");

describe("Wedding calendar event", () => {
  it("saves 10:00 AM Nepal time on Thursday 3 December 2026", () => {
    // Nepal is UTC+05:45, so 10:00 AM local is 04:15 UTC.
    expect(toIcsUtc(WEDDING_START)).toBe("20261203T041500Z");
    expect(toIcsUtc(WEDDING_END)).toBe("20261203T081500Z");
  });

  it("writes a VEVENT with the couple, the time and the venue", () => {
    const ics = buildIcs(STAMP);
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART:20261203T041500Z");
    expect(ics).toContain("DTEND:20261203T081500Z");
    expect(ics).toContain("SUMMARY:Wedding of Bibek Thapa ♥ Seema Poudel");
    expect(ics).toContain("LOCATION:Ramalaya\\, Basbari\\, Kathmandu\\, Nepal");
    expect(ics).toContain("DTSTAMP:20261124T160000Z");
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  });

  it("names the couple with love in the event description", () => {
    const ics = buildIcs(STAMP);
    expect(ics).toContain("Bibek Thapa ♥ Seema Poudel");
    // Re-join the folded content lines before reading the description back.
    const unfolded = ics.split("\r\n ").join("").replace(/\r\n/g, "\n");
    expect(unfolded).toContain("Thursday\\, 3 December 2026");
    expect(unfolded).toContain("Ramalaya\\, Basbari\\, Kathmandu\\, Nepal");
  });

  it("folds every content line to at most 75 octets", () => {
    for (const line of buildIcs(STAMP).split("\r\n")) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it("opens Google Calendar with the same start and end", () => {
    const url = new URL(googleCalendarUrl());
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("dates")).toBe("20261203T041500Z/20261203T081500Z");
    expect(url.searchParams.get("location")).toBe(EVENT.location);
    expect(url.searchParams.get("text")).toBe(EVENT.title);
  });
});
