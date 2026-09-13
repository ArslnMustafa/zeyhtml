import { describe, expect, it } from "vitest";
import { allowedDateSelections, allowedDateTimes, formatDateRequestNotification, latestSelectableDate } from "./dateSubmission";

describe("date request notification", () => {
  it("lists the selected date, time, and menu choices for the owner", () => {
    const content = formatDateRequestNotification({
      selectedDate: "2026-08-25",
      selectedTime: "18:00",
      selections: ["Matcha", "Pizza"],
    });

    expect(content).toContain("Tarih: 2026-08-25");
    expect(content).toContain("Saat: 18:00");
    expect(content).toContain("Yemek ve içecek: Matcha, Pizza");
  });

  it("keeps only the defined menu options as allowed values", () => {
    expect(allowedDateSelections).toContain("Sushi");
    expect(allowedDateSelections).toContain("Sana bırakıyorum");
    expect(allowedDateSelections).toContain("Çikolatalı pasta ama çok çikolatalı");
    expect(allowedDateSelections).not.toContain("Limonata");
  });

  it("limits the schedule to the requested hours and date", () => {
    expect(allowedDateTimes).toEqual(["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]);
    expect(latestSelectableDate).toBe("2026-08-30");
  });
});
