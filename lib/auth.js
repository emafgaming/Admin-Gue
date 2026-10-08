import { cookies, headers } from "next/headers";
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

export async function login(identifier, password) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  try {
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ email: identifier, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new HttpError(res.status, data.message || "Email/username atau password salah.", data.errors || {});
    }

    const data = await res.json();
    const token = data.access_token || data.token;
    const admin = data.user;
    
    // Validate role
    if (!admin || !['admin', 'super_admin', 'moderator', 'marketing'].includes(admin.role)) {
        throw new HttpError(403, "Anda tidak memiliki akses ke halaman admin.");
    }
    
    return { token, admin, maxAge: SESSION_HOURS * 3600 };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, "Terjadi kesalahan sistem saat menghubungi backend.");
  }
}

export async function setSessionCookie(token, maxAge) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function getSession({ touch = false } = {}) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  
  // Actually verify token with Laravel
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  try {
      const res = await fetch(`${apiUrl}/user`, {
          headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "application/json"
          },
          // Cache validation can be short, but for simplicity we fetch per request (or you could cache it in a request scope)
          cache: "no-store"
      });
      if (!res.ok) return null;
      const data = await res.json();
      return { admin: data.data || data, session: { token } };
  } catch (err) {
      return null;
  }
}

export async function requireAdmin(roles) {
  const found = await getSession({ touch: true });
  if (!found) throw new HttpError(401, "Sesi berakhir. Silakan login kembali.");
  if (roles && !roles.includes(found.admin.role)) throw new HttpError(403, "Anda tidak memiliki izin untuk melakukan aksi ini.");
  return found;
}

export async function logout() {
  const found = await getSession();
  if (found) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      await fetch(`${apiUrl}/auth/logout`, {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${found.session.token}`,
              "Accept": "application/json"
          }
      }).catch(() => {});
  }
  await clearSessionCookie();
}
