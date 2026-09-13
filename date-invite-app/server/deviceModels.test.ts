import { describe, expect, it } from "vitest";
import { friendlyDeviceName } from "./deviceModels";

describe("friendlyDeviceName", () => {
  it("maps a known Samsung model code", () => {
    expect(friendlyDeviceName("SM-S918B")).toBe("Samsung Galaxy S23 Ultra");
  });

  it("falls back to the Samsung series family for unknown codes", () => {
    expect(friendlyDeviceName("SM-A546B")).toBe("Samsung Galaxy A serisi (SM-A546B)");
  });

  it("prefixes bare Pixel names with Google", () => {
    expect(friendlyDeviceName("Pixel 8 Pro")).toBe("Google Pixel 8 Pro");
  });

  it("strips surrounding quotes from client hint values", () => {
    expect(friendlyDeviceName('"SM-S928B"')).toBe("Samsung Galaxy S24 Ultra");
  });

  it("returns the raw value for unknown models", () => {
    expect(friendlyDeviceName("XYZ-999")).toBe("XYZ-999");
  });

  it("returns undefined for empty input", () => {
    expect(friendlyDeviceName(undefined)).toBeUndefined();
    expect(friendlyDeviceName("")).toBeUndefined();
  });
});
