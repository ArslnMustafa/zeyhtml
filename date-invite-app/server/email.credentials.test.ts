import { describe, expect, it } from "vitest";
import { verifyResendCredentials } from "./email";

describe("Resend credentials", () => {
  it("authenticates with the Resend domains endpoint", async () => {
    await expect(verifyResendCredentials()).resolves.toBe(true);
  }, 15_000);
});
