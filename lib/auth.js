import { cookies, headers } from "next/headers";
import { mutate, getDb } from "./db.js";
import { newToken, verifyPassword } from "./security.js";
import { SESSION_COOKIE, SESSION_HOURS } from "./constants.js";

export class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export const publicAdmin = (a) => {
  const { passwordHash, ...rest } = a;
  return rest;
};

function describeDevice(ua = "") {
  const os = /Windows/i.test(ua) ? "Windows" : /Android/i.test(ua) ? "Android" : /iPhone|iPad|iOS/i.test(ua) ? "iOS" : /Mac OS/i.test(ua) ? "macOS" : /Linux/i.test(ua) ? "Linux" : "Perangkat tidak dikenal";
  const browser = /Edg\//i.test(ua) ? "Edge" : /Chrome\//i.test(ua) ? "Chrome" : /Firefox\//i.test(ua) ? "Firefox" : /Safari\//i.test(ua) ? "Safari" : "Browser";
  return `${browser} di ${os}`;
}

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 10;

export async function login(identifier, password) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "local").split(",")[0].trim();
  const key = `${String(identifier).toLowerCase()}|${ip}`;

  const result = mutate((db) => {
    const attempt = db.loginAttempts[key];
    if (attempt && attempt.lockedUntil > Date.now()) {
      throw new HttpError(429, `Terlalu banyak percobaan login. Coba lagi dalam ${Math.ceil((attempt.lockedUntil - Date.now()) / 60000)} menit.`);
    }
    const id = String(identifier).trim().toLowerCase();
    const admin = db.admins.find((a) => a.email.toLowerCase() === id || a.username.toLowerCase() === id);
    // verifyPassword tetap dijalankan walau admin tidak ada agar waktu respons seragam.
    const ok = verifyPassword(password, admin ? admin.passwordHash : "scrypt$00$00") && admin && admin.active;

    if (!ok) {
      const next = { count: (attempt?.count || 0) + 1, lockedUntil: 0 };
      if (next.count >= MAX_ATTEMPTS) {
        next.lockedUntil = Date.now() + LOCK_MINUTES * 60000;
        next.count = 0;
      }
      db.loginAttempts[key] = next;
      db.audit.unshift({ id: newToken().slice(0, 10), adminId: admin?.id || null, adminName: admin?.name || String(identifier), activity: "Percobaan login gagal", target: `Akun: ${identifier}`, object: "Autentikasi", time: new Date().toISOString(), status: "Gagal" });
      return { failed: true };
    }
    delete db.loginAttempts[key];

    const token = newToken();
    const now = Date.now();
    db.sessions = db.sessions.filter((s) => s.expiresAt > now);
    db.sessions.push({ id: token.slice(0, 12), token, adminId: admin.id, device: describeDevice(h.get("user-agent") || ""), ip, createdAt: new Date(now).toISOString(), lastActive: new Date(now).toISOString(), expiresAt: now + SESSION_HOURS * 3600000 });
    db.audit.unshift({ id: newToken().slice(0, 10), adminId: admin.id, adminName: admin.name, activity: "Login ke Admin Panel", target: `Akun: ${admin.email}`, object: "Autentikasi", time: new Date(now).toISOString(), status: "Sukses" });
    return { token, admin: publicAdmin(admin), maxAge: SESSION_HOURS * 3600 };
  });
  if (result.failed) throw new HttpError(401, "Email/username atau password salah.");
  return result;
}

export async function setSessionCookie(token, maxAge) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

/** Mengembalikan { admin, session } bila session valid, selain itu null. */
export async function getSession({ touch = false } = {}) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const session = db.sessions.find((s) => s.token === token);
  if (!session || session.expiresAt < Date.now()) return null;
  const admin = db.admins.find((a) => a.id === session.adminId && a.active);
  if (!admin) return null;
  if (touch) session.lastActive = new Date().toISOString();
  return { admin, session };
}

/** Wajib login + (opsional) role tertentu. Melempar HttpError 401/403. */
export async function requireAdmin(roles) {
  const found = await getSession({ touch: true });
  if (!found) throw new HttpError(401, "Sesi berakhir. Silakan login kembali.");
  if (roles && !roles.includes(found.admin.role)) throw new HttpError(403, "Anda tidak memiliki izin untuk melakukan aksi ini.");
  return found;
}

export async function logout() {
  const found = await getSession();
  if (found) {
    mutate((db) => {
      db.sessions = db.sessions.filter((s) => s.token !== found.session.token);
      db.audit.unshift({ id: newToken().slice(0, 10), adminId: found.admin.id, adminName: found.admin.name, activity: "Logout dari Admin Panel", target: `Akun: ${found.admin.email}`, object: "Autentikasi", time: new Date().toISOString(), status: "Sukses" });
    });
  }
  await clearSessionCookie();
}
