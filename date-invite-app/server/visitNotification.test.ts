import { describe, expect, it } from "vitest";
import { describeVisitorDevice, formatVisitNotification } from "./visitNotification";

describe("visit notification", () => {
  it("creates a minimal notification without device details", () => {
    const content = formatVisitNotification("Ana sayfa");

    expect(content).toContain("Date davet sayfası ziyaret edildi.");
    expect(content).toContain("Açılan bölüm: Ana sayfa");
    expect(content).not.toContain("IP");
  });

  it("includes device details when available", () => {
    const device = describeVisitorDevice(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    );
    const content = formatVisitNotification("Ana sayfa", device);

    expect(content).toContain("Cihaz modeli: iPhone");
    expect(content).toContain("İşletim sistemi: iOS 17.5");
    expect(content).toContain("Tarayıcı: Safari 17.5");
  });
});

describe("describeVisitorDevice", () => {
  it("parses an iPhone Safari user agent", () => {
    const device = describeVisitorDevice(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    );

    expect(device.deviceModel).toBe("iPhone");
    expect(device.os).toBe("iOS 17.5");
    expect(device.browser).toBe("Safari 17.5");
  });

  it("parses an Android Chrome user agent with a model", () => {
    const device = describeVisitorDevice(
      "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    );

    expect(device.deviceModel).toBe("Samsung Galaxy S23 Ultra");
    expect(device.os).toBe("Android 14");
    expect(device.browser).toContain("Chrome");
  });

  it("prefers the client hint model when provided", () => {
    const device = describeVisitorDevice(
      "Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      '"Pixel 8 Pro"',
    );

    expect(device.deviceModel).toBe("Google Pixel 8 Pro");
  });

  it("handles a missing user agent", () => {
    const device = describeVisitorDevice(undefined);
    expect(device.summary).toContain("Bilinmeyen cihaz");
  });
});
