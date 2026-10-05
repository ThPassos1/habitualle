type HeaderStore = { get(name: string): string | null };

const buckets = new Map<string, number[]>();

export function clientKey(headers: HeaderStore) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  if (/^[\d.a-fA-F:]+$/.test(forwarded) && forwarded.length <= 45) return forwarded;
  return "local";
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5000) buckets.clear();
  const recent = (buckets.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}
