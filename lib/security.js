import crypto from "node:crypto";

// Password di-hash dengan scrypt + salt acak. Plaintext tidak pernah disimpan.
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  try {
    const [scheme, salt, hash] = String(stored).split("$");
    if (scheme !== "scrypt") return false;
    const candidate = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

export const newToken = () => crypto.randomBytes(32).toString("hex");
export const newId = (prefix) => `${prefix}-${crypto.randomBytes(5).toString("hex")}`;
