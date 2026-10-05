import "server-only";

const encoder = new TextEncoder();

async function digest(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

function safeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left[index] ^ right[index];
  return mismatch === 0;
}

export function adminConfigured() {
  const email = process.env.ADMIN_EMAIL?.trim() ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() ?? "";
  return email.includes("@") && password.length >= 12 && secret.length >= 32;
}

export async function adminCredentialsValid(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!adminConfigured()) return false;
  const [givenEmail, storedEmail, givenPassword, storedPassword] = await Promise.all([
    digest(email.trim().toLowerCase()),
    digest(expectedEmail),
    digest(password),
    digest(expectedPassword),
  ]);
  return safeEqual(givenEmail, storedEmail) && safeEqual(givenPassword, storedPassword);
}
