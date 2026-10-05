export function webhookUrl() {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (!site.startsWith("https://")) return undefined;
  try {
    const url = new URL(site);
    if (url.username || url.password || url.search || url.hash || (url.pathname !== "/" && url.pathname !== "")) return undefined;
    return `${url.origin}/api/payments/webhook`;
  } catch {
    return undefined;
  }
}
