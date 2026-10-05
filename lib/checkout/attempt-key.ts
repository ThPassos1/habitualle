const ATTEMPT_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function isAttemptKey(value: string) {
  return ATTEMPT_KEY.test(value.trim().toLowerCase());
}

export function normalizeAttemptKey(value: unknown) {
  if (typeof value !== "string") return null;
  const key = value.trim().toLowerCase();
  return isAttemptKey(key) ? key : null;
}
