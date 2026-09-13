import { describe, expect, it } from "vitest";
import { formatVisitNotification } from "./visitNotification";

describe("visit notification", () => {
  it("creates a minimal notification without visitor-identifying details", () => {
    const content = formatVisitNotification("Ana sayfa");

    expect(content).toContain("Date davet sayfası ziyaret edildi.");
    expect(content).toContain("Açılan bölüm: Ana sayfa");
    expect(content).not.toContain("IP");
  });
});
