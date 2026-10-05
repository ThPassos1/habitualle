const encoder = new TextEncoder();

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() ?? "";
  if (secret.length < 32) return null;
  return secret;
}

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}

export async function signAdminSession() {
  const secret = sessionSecret();
  if (!secret) return null;
  const payload = bytesToBase64Url(encoder.encode(JSON.stringify({ v: 1, exp: Date.now() + 12 * 60 * 60 * 1000 })));
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function adminSessionValid(token: string | undefined) {
  const secret = sessionSecret();
  if (!secret || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  const expected = await hmac(secret, parts[0]);
  if (!safeEqual(expected, parts[1])) return false;
  try {
    const json = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[0]))) as { exp?: unknown };
    return typeof json.exp === "number" && Number.isFinite(json.exp) && json.exp > Date.now();
  } catch {
    return false;
  }
}

export async function signOrderView(orderId: string) {
  const secret = sessionSecret();
  const id = orderId.trim().toUpperCase();
  if (!secret || !/^HB-\d{4,6}$/.test(id)) return "";
  return hmac(secret, `order:${id}`);
}

export async function orderViewValid(orderId: string, token: string) {
  if (!token || token.length > 200) return false;
  const expected = await signOrderView(orderId);
  return Boolean(expected) && safeEqual(expected, token);
}

export const adminCookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
