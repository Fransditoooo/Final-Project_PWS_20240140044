import crypto from "crypto";

export function generateApiKey() {
  return `ltk_${crypto.randomBytes(32).toString("hex")}`;
}

export function hashApiKey(apiKey) {
  const pepper = process.env.API_KEY_PEPPER || "";
  return crypto.createHash("sha256").update(`${pepper}:${apiKey}`).digest("hex");
}

export function safeLimit(value, fallback = 10, max = 50) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
}

export function safeOffset(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}
