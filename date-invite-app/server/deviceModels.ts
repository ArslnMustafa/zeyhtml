// Maps raw device model codes (mostly from Android User-Agent / client hints)
// to human readable marketing names. Web browsers never expose the exact
// marketing model for Apple devices, so those stay as "iPhone" / "iPad".

const EXACT_MODEL_NAMES: Record<string, string> = {
  // Google Pixel
  "Pixel 6": "Google Pixel 6",
  "Pixel 6 Pro": "Google Pixel 6 Pro",
  "Pixel 6a": "Google Pixel 6a",
  "Pixel 7": "Google Pixel 7",
  "Pixel 7 Pro": "Google Pixel 7 Pro",
  "Pixel 7a": "Google Pixel 7a",
  "Pixel 8": "Google Pixel 8",
  "Pixel 8 Pro": "Google Pixel 8 Pro",
  "Pixel 8a": "Google Pixel 8a",
  "Pixel 9": "Google Pixel 9",
  "Pixel 9 Pro": "Google Pixel 9 Pro",
  "Pixel 9 Pro XL": "Google Pixel 9 Pro XL",

  // Samsung Galaxy S series
  "SM-G991B": "Samsung Galaxy S21",
  "SM-G996B": "Samsung Galaxy S21+",
  "SM-G998B": "Samsung Galaxy S21 Ultra",
  "SM-S901B": "Samsung Galaxy S22",
  "SM-S906B": "Samsung Galaxy S22+",
  "SM-S908B": "Samsung Galaxy S22 Ultra",
  "SM-S911B": "Samsung Galaxy S23",
  "SM-S916B": "Samsung Galaxy S23+",
  "SM-S918B": "Samsung Galaxy S23 Ultra",
  "SM-S921B": "Samsung Galaxy S24",
  "SM-S926B": "Samsung Galaxy S24+",
  "SM-S928B": "Samsung Galaxy S24 Ultra",
  "SM-S931B": "Samsung Galaxy S25",
  "SM-S936B": "Samsung Galaxy S25+",
  "SM-S938B": "Samsung Galaxy S25 Ultra",

  // Samsung Galaxy Z (fold/flip)
  "SM-F926B": "Samsung Galaxy Z Fold3",
  "SM-F711B": "Samsung Galaxy Z Flip3",
  "SM-F936B": "Samsung Galaxy Z Fold4",
  "SM-F721B": "Samsung Galaxy Z Flip4",
  "SM-F946B": "Samsung Galaxy Z Fold5",
  "SM-F731B": "Samsung Galaxy Z Flip5",
  "SM-F956B": "Samsung Galaxy Z Fold6",
  "SM-F741B": "Samsung Galaxy Z Flip6",

  // Xiaomi / Redmi
  "2201123G": "Xiaomi 12",
  "2210132G": "Xiaomi 12T",
  "23013RK75G": "Xiaomi 13",
  "23127PN0CG": "Xiaomi 14",

  // OnePlus
  "CPH2449": "OnePlus 11",
  "CPH2581": "OnePlus 12",
  "CPH2573": "OnePlus 12R",
};

// Samsung model-code prefixes -> series family (fallback when the exact code
// is not in the table above).
const SAMSUNG_SERIES: Array<[RegExp, string]> = [
  [/^SM-S9\d{2}/, "Samsung Galaxy S serisi"],
  [/^SM-F\d{3}/, "Samsung Galaxy Z serisi"],
  [/^SM-N\d{3}/, "Samsung Galaxy Note serisi"],
  [/^SM-A\d{3}/, "Samsung Galaxy A serisi"],
  [/^SM-M\d{3}/, "Samsung Galaxy M serisi"],
  [/^SM-T\d{3}/, "Samsung Galaxy Tab serisi"],
];

export function friendlyDeviceName(rawModel?: string | null): string | undefined {
  const model = rawModel?.replace(/^"|"$/g, "").trim();
  if (!model) {
    return undefined;
  }

  const exact = EXACT_MODEL_NAMES[model];
  if (exact) {
    return exact;
  }

  if (/^Pixel/i.test(model)) {
    return `Google ${model}`;
  }

  for (const [pattern, family] of SAMSUNG_SERIES) {
    if (pattern.test(model)) {
      return `${family} (${model})`;
    }
  }

  return model;
}
