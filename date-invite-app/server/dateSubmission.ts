export const allowedDateSelections = [
  "Matcha",
  "Pizza",
  "Sushi",
  "Burger",
  "Sana bırakıyorum",
  "Çikolatalı pasta ama çok çikolatalı",
] as const;

export const allowedDateTimes = ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"] as const;
export const latestSelectableDate = "2026-08-30";

export function formatDateRequestNotification(input: {
  selectedDate: string;
  selectedTime: string;
  selections: string[];
}) {
  return [
    "Romantik date isteği onaylandı.",
    `Tarih: ${input.selectedDate}`,
    `Saat: ${input.selectedTime}`,
    `Yemek ve içecek: ${input.selections.join(", ")}`,
  ].join("\n");
}
