import { describe, expect, it } from "vitest";
import { extractClientIp, formatLocationSummary } from "./geoLocation";

describe("extractClientIp", () => {
  it("uses the first entry of X-Forwarded-For", () => {
    const ip = extractClientIp({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" });
    expect(ip).toBe("203.0.113.9");
  });

  it("falls back to X-Real-IP", () => {
    const ip = extractClientIp({ "x-real-ip": "198.51.100.7" });
    expect(ip).toBe("198.51.100.7");
  });

  it("strips the IPv4-mapped IPv6 prefix from the socket address", () => {
    const ip = extractClientIp({}, "::ffff:192.0.2.44");
    expect(ip).toBe("192.0.2.44");
  });

  it("returns undefined when no source is available", () => {
    expect(extractClientIp({})).toBeUndefined();
  });
});

describe("formatLocationSummary", () => {
  it("joins the available location parts", () => {
    const summary = formatLocationSummary({ city: "İstanbul", region: "İstanbul", country: "Türkiye" });
    expect(summary).toBe("İstanbul, İstanbul, Türkiye");
  });

  it("reports when the location is unknown", () => {
    expect(formatLocationSummary({ ip: "203.0.113.9" })).toBe("Konum belirlenemedi (IP: 203.0.113.9)");
  });
});
