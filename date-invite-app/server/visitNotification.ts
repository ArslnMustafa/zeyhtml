import { friendlyDeviceName } from "./deviceModels";
import type { VisitorLocation } from "./geoLocation";

export type VisitorDevice = {
  summary: string;
  deviceModel?: string;
  os?: string;
  browser?: string;
};

function detectOs(userAgent: string): string | undefined {
  const iosMatch = userAgent.match(/(?:iPhone|iPad|iPod)(?:.*?OS (\d+)[._](\d+)(?:[._](\d+))?)?/);
  if (iosMatch) {
    const version = [iosMatch[1], iosMatch[2], iosMatch[3]].filter(Boolean).join(".");
    return version ? `iOS ${version}` : "iOS";
  }

  const androidMatch = userAgent.match(/Android (\d+(?:\.\d+)*)/);
  if (androidMatch) {
    return `Android ${androidMatch[1]}`;
  }
  if (/Android/.test(userAgent)) {
    return "Android";
  }

  const macMatch = userAgent.match(/Mac OS X (\d+)[._](\d+)(?:[._](\d+))?/);
  if (macMatch) {
    const version = [macMatch[1], macMatch[2], macMatch[3]].filter(Boolean).join(".");
    return `macOS ${version}`;
  }

  const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
  if (windowsMatch) {
    const map: Record<string, string> = {
      "10.0": "Windows 10/11",
      "6.3": "Windows 8.1",
      "6.2": "Windows 8",
      "6.1": "Windows 7",
    };
    return map[windowsMatch[1]] ?? `Windows (NT ${windowsMatch[1]})`;
  }

  if (/Linux/.test(userAgent)) {
    return "Linux";
  }

  return undefined;
}

function detectBrowser(userAgent: string): string | undefined {
  if (/EdgA?\/([\d.]+)/.test(userAgent)) {
    return `Edge ${RegExp.$1}`;
  }
  if (/SamsungBrowser\/([\d.]+)/.test(userAgent)) {
    return `Samsung Internet ${RegExp.$1}`;
  }
  if (/OPR\/([\d.]+)/.test(userAgent) || /Opera\/([\d.]+)/.test(userAgent)) {
    return `Opera ${RegExp.$1}`;
  }
  if (/Firefox\/([\d.]+)/.test(userAgent) || /FxiOS\/([\d.]+)/.test(userAgent)) {
    return `Firefox ${RegExp.$1}`;
  }
  if (/(?:CriOS|Chrome)\/([\d.]+)/.test(userAgent)) {
    return `Chrome ${RegExp.$1}`;
  }
  if (/Version\/([\d.]+).*Safari/.test(userAgent)) {
    return `Safari ${RegExp.$1}`;
  }
  if (/Safari/.test(userAgent)) {
    return "Safari";
  }
  return undefined;
}

function detectDeviceModel(userAgent: string, clientHintModel?: string | null): string | undefined {
  const hint = clientHintModel?.replace(/^"|"$/g, "").trim();
  if (hint) {
    return hint;
  }

  if (/iPhone/.test(userAgent)) {
    return "iPhone";
  }
  if (/iPad/.test(userAgent)) {
    return "iPad";
  }
  if (/iPod/.test(userAgent)) {
    return "iPod touch";
  }

  // Android User-Agent usually contains "; <MODEL> Build/" or "; <MODEL>)".
  const androidModel = userAgent.match(/Android [^;]+;\s*([^;)]+?)(?:\s+Build\/[^;)]*)?\)/);
  if (androidModel) {
    const model = androidModel[1].trim();
    if (model && !/^[a-z]{2}(-[A-Za-z]{2,})?$/.test(model) && model.toLowerCase() !== "k") {
      return model;
    }
  }

  return undefined;
}

export function describeVisitorDevice(
  userAgent?: string | null,
  clientHintModel?: string | null,
): VisitorDevice {
  const ua = (userAgent ?? "").trim();
  if (!ua) {
    return { summary: "Bilinmeyen cihaz (tarayıcı bilgisi alınamadı)" };
  }

  const rawModel = detectDeviceModel(ua, clientHintModel);
  const deviceModel = friendlyDeviceName(rawModel) ?? rawModel;
  const os = detectOs(ua);
  const browser = detectBrowser(ua);

  const parts = [deviceModel, os, browser].filter(Boolean);
  const summary = parts.length > 0 ? parts.join(" · ") : ua;

  return { summary, deviceModel, os, browser };
}

export function formatVisitNotification(
  page: string,
  device?: VisitorDevice,
  location?: VisitorLocation,
): string {
  const lines = [
    "Date davet sayfası ziyaret edildi.",
    `Açılan bölüm: ${page}`,
  ];

  if (device) {
    lines.push(`Cihaz: ${device.summary}`);
    if (device.deviceModel) {
      lines.push(`Cihaz modeli: ${device.deviceModel}`);
    }
    if (device.os) {
      lines.push(`İşletim sistemi: ${device.os}`);
    }
    if (device.browser) {
      lines.push(`Tarayıcı: ${device.browser}`);
    }
  }

  if (location) {
    lines.push(`Yaklaşık konum: ${location.summary}`);
  }

  lines.push("Bu bildirim tarayıcı oturumu başına yalnızca bir kez gönderilir.");
  return lines.join("\n");
}
