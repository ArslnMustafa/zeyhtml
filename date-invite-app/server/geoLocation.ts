import type { IncomingHttpHeaders } from "http";

export type VisitorLocation = {
  summary: string;
  city?: string;
  region?: string;
  country?: string;
  ip?: string;
};

/**
 * Extracts the visitor IP from the request, honouring the proxy chain
 * (X-Forwarded-For / X-Real-IP) that reverse proxies such as Nginx set.
 */
export function extractClientIp(
  headers: IncomingHttpHeaders,
  socketRemoteAddress?: string,
): string | undefined {
  const forwardedFor = headers["x-forwarded-for"];
  const forwardedValue = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  if (forwardedValue) {
    const first = forwardedValue.split(",")[0]?.trim();
    if (first) {
      return normalizeIp(first);
    }
  }

  const realIp = headers["x-real-ip"];
  const realIpValue = Array.isArray(realIp) ? realIp[0] : realIp;
  if (realIpValue) {
    return normalizeIp(realIpValue.trim());
  }

  if (socketRemoteAddress) {
    return normalizeIp(socketRemoteAddress);
  }

  return undefined;
}

function normalizeIp(ip: string): string {
  // Strip the IPv4-mapped IPv6 prefix (e.g. ::ffff:1.2.3.4).
  return ip.replace(/^::ffff:/i, "");
}

function isPrivateOrLocal(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
    return true;
  }
  if (/^10\./.test(ip) || /^192\.168\./.test(ip)) {
    return true;
  }
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) {
    return true;
  }
  if (/^(fc|fd)/i.test(ip)) {
    return true;
  }
  return false;
}

export function formatLocationSummary(location: Omit<VisitorLocation, "summary">): string {
  const parts = [location.city, location.region, location.country].filter(Boolean);
  if (parts.length === 0) {
    return location.ip ? `Konum belirlenemedi (IP: ${location.ip})` : "Konum belirlenemedi";
  }
  return parts.join(", ");
}

/**
 * Best-effort IP -> approximate location lookup using the free, key-less
 * ipwho.is service. Returns undefined on any failure so notifications still
 * get sent without location details.
 */
export async function lookupVisitorLocation(
  ip: string | undefined,
  timeoutMs = 2500,
): Promise<VisitorLocation | undefined> {
  if (!ip || isPrivateOrLocal(ip)) {
    return undefined;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,city,region,country`,
      { signal: controller.signal },
    );
    if (!response.ok) {
      return undefined;
    }

    const data = (await response.json()) as {
      success?: boolean;
      city?: string;
      region?: string;
      country?: string;
    };

    if (data.success === false) {
      return undefined;
    }

    const location = {
      city: data.city || undefined,
      region: data.region || undefined,
      country: data.country || undefined,
      ip,
    };

    return { ...location, summary: formatLocationSummary(location) };
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}
