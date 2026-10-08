import { handle, ok, readBody } from "@/lib/http";
import { HttpError, publicAdmin, requireAdmin } from "@/lib/auth";
import { getDb, mutate } from "@/lib/db";
import * as svc from "@/lib/service";

/**
 * REST API Admin. Semua endpoint wajib login. Setiap mutasi mengembalikan
 * snapshot data terbaru ("data") sehingga UI selalu konsisten dengan server.
 */
const routes = [
  ["GET", "data", async ({ admin, session }) => {
    const laravelUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
    const res = await fetch(`${laravelUrl}/admin/bff/load-all`, {
      headers: { "Authorization": `Bearer ${session.token}`, "Accept": "application/json" }
    });
    if (!res.ok) return { data: svc.loadAll(getDb(), admin) }; // Fallback to db.json if Laravel fails
    const json = await res.json();
    return { data: json.data };
  }],
  ["GET", "stats", async (_c, { url }) => ({ stats: svc.computeStats(getDb(), url.searchParams.get("period") || "bulanan") }), ["super_admin", "admin", "marketing"]],
  ["GET", "sessions", async ({ admin, session }) => ({ sessions: svc.listSessions(getDb(), admin, session.token) })],
  ["GET", "global-search", async ({ admin }, { url }) => svc.globalSearch(getDb(), admin, url.searchParams.get("q"))],
  ["GET", "search", async ({ admin }, { url }) => svc.globalSearch(getDb(), admin, url.searchParams.get("q"))],

  ["POST", "kosts", async (auth, { body }) => write(auth, (db) => ({ kost: svc.createKost(db, auth.admin, body) })), ["super_admin", "admin"]],
  ["PATCH", "kosts/:id", async (auth, { body, params }) => write(auth, (db) => ({ kost: svc.updateKost(db, auth.admin, params.id, body) })), ["super_admin", "admin", "moderator"]],
  ["DELETE", "kosts/:id", async (auth, { params }) => write(auth, (db) => svc.deleteKost(db, auth.admin, params.id)), ["super_admin", "admin"]],
  ["POST", "kosts/:id/status", async (auth, { body, params }) => write(auth, (db) => ({ kost: svc.setKostStatus(db, auth.admin, params.id, body.status, body.reason) }), { method: 'PATCH', path: `/admin/kosts/${params.id}/status`, body }), ["super_admin", "admin", "moderator"]],
  ["POST", "kosts/:id/archive", async (auth, { params }) => write(auth, (db) => ({ kost: svc.archiveKost(db, auth.admin, params.id) })), ["super_admin", "admin"]],
  ["POST", "kosts/:id/restore", async (auth, { params }) => write(auth, (db) => ({ kost: svc.restoreKost(db, auth.admin, params.id) })), ["super_admin", "admin"]],
  ["DELETE", "kosts/:id/permanent", async (auth, { params }) => write(auth, (db) => svc.permanentDeleteKost(db, auth.admin, params.id)), ["super_admin"]],
  ["POST", "kosts/bulk", async (auth, { body }) => write(auth, (db) => svc.bulkKostAction(db, auth.admin, body)), ["super_admin", "admin", "moderator"]],

  ["PATCH", "owners/:id", async (auth, { body, params }) => write(auth, (db) => ({ owner: svc.updateOwner(db, auth.admin, params.id, body) })), ["super_admin", "admin"]],
  ["DELETE", "owners/:id", async (auth, { params }) => write(auth, (db) => svc.deleteOwner(db, auth.admin, params.id)), ["super_admin", "admin"]],
  ["POST", "owners/:id/action", async (auth, { body, params }) => write(auth, (db) => ({ owner: svc.ownerAction(db, auth.admin, params.id, body) })), ["super_admin", "admin", "moderator"]],
  ["POST", "owners/:id/archive", async (auth, { params }) => write(auth, (db) => ({ owner: svc.archiveOwner(db, auth.admin, params.id) })), ["super_admin", "admin"]],
  ["POST", "owners/:id/restore", async (auth, { params }) => write(auth, (db) => ({ owner: svc.restoreOwner(db, auth.admin, params.id) })), ["super_admin", "admin"]],
  ["DELETE", "owners/:id/permanent", async (auth, { body, params }) => write(auth, (db) => svc.permanentDeleteOwner(db, auth.admin, params.id, body)), ["super_admin"]],
  ["POST", "owners/:id/permanent", async (auth, { body, params }) => write(auth, (db) => svc.permanentDeleteOwner(db, auth.admin, params.id, body)), ["super_admin"]],
  ["POST", "owners/bulk", async (auth, { body }) => write(auth, (db) => svc.bulkOwnerAction(db, auth.admin, body)), ["super_admin", "admin", "moderator"]],

  ["PATCH", "users/:id", async (auth, { body, params }) => write(auth, (db) => ({ user: svc.updateUser(db, auth.admin, params.id, body) })), ["super_admin", "admin"]],
  ["DELETE", "users/:id", async (auth, { params }) => write(auth, (db) => svc.deleteUser(db, auth.admin, params.id)), ["super_admin", "admin"]],
  ["POST", "users/:id/status", async (auth, { body, params }) => write(auth, (db) => ({ user: svc.setUserStatus(db, auth.admin, params.id, body.status) }), { method: 'PATCH', path: `/admin/users/${params.id}/status`, body }), ["super_admin", "admin"]],
  ["POST", "users/:id/archive", async (auth, { params }) => write(auth, (db) => ({ user: svc.archiveUser(db, auth.admin, params.id) })), ["super_admin", "admin"]],
  ["POST", "users/:id/restore", async (auth, { params }) => write(auth, (db) => ({ user: svc.restoreUser(db, auth.admin, params.id) })), ["super_admin", "admin"]],
  ["DELETE", "users/:id/permanent", async (auth, { params }) => write(auth, (db) => svc.permanentDeleteUser(db, auth.admin, params.id)), ["super_admin"]],
  ["POST", "users/:id/permanent", async (auth, { params }) => write(auth, (db) => svc.permanentDeleteUser(db, auth.admin, params.id)), ["super_admin"]],
  ["POST", "users/bulk", async (auth, { body }) => write(auth, (db) => svc.bulkUserAction(db, auth.admin, body)), ["super_admin", "admin"]],

  ["PATCH", "reports/:id", async (auth, { body, params }) => write(auth, (db) => ({ report: svc.updateReport(db, auth.admin, params.id, body) })), ["super_admin", "admin", "moderator"]],

  ["POST", "ads", async (auth, { body }) => write(auth, (db) => ({ ad: svc.createAd(db, auth.admin, body) }), { method: 'POST', path: '/admin/ads', body }), ["super_admin", "marketing"]],
  ["PATCH", "ads/:id", async (auth, { body, params }) => write(auth, (db) => ({ ad: svc.updateAd(db, auth.admin, params.id, body) })), ["super_admin", "marketing"]],
  ["DELETE", "ads/:id", async (auth, { params }) => write(auth, (db) => svc.deleteAd(db, auth.admin, params.id)), ["super_admin", "marketing"]],
  ["POST", "ads/:id/toggle", async (auth, { params }) => write(auth, (db) => ({ ad: svc.toggleAd(db, auth.admin, params.id) }), { method: 'PATCH', path: `/admin/ads/${params.id}/status` }), ["super_admin", "marketing"]],
  ["POST", "ads/:id/archive", async (auth, { params }) => write(auth, (db) => ({ ad: svc.archiveAd(db, auth.admin, params.id) })), ["super_admin", "marketing"]],
  ["POST", "ads/:id/restore", async (auth, { params }) => write(auth, (db) => ({ ad: svc.restoreAd(db, auth.admin, params.id) })), ["super_admin", "marketing"]],
  ["DELETE", "ads/:id/permanent", async (auth, { params }) => write(auth, (db) => svc.permanentDeleteAd(db, auth.admin, params.id)), ["super_admin"]],

  ["PATCH", "settings/profile", async (auth, { body }) => write(auth, (db) => ({ profile: svc.updateProfile(db, auth.admin, body) }))],
  ["POST", "settings/password", async (auth, { body }) => write(auth, (db) => svc.changePassword(db, auth.admin, session.token, body))],
  ["PATCH", "settings/notifications", async (auth, { body }) => write(auth, (db) => ({ notifications: svc.updateNotifications(db, auth.admin, body) }))],
  ["PATCH", "settings/system", async (auth, { body }) => write(auth, (db) => ({ system: svc.updateSystem(db, auth.admin, body) })), ["super_admin"]],

  ["GET", "admins", async ({ admin }) => ({ admins: svc.listAdmins(getDb(), admin) }), ["super_admin"]],
  ["POST", "admins", async (auth, { body }) => write(auth, (db) => ({ admin: svc.createAdmin(db, auth.admin, body) })), ["super_admin"]],
  ["PATCH", "admins/:id", async (auth, { body, params }) => write(auth, (db) => ({ admin: svc.updateAdmin(db, auth.admin, params.id, body) })), ["super_admin"]],
  ["DELETE", "admins/:id", async (auth, { params }) => write(auth, (db) => svc.deleteAdmin(db, auth.admin, params.id)), ["super_admin"]],

  ["POST", "notifications/read", async (auth, { body }) => write(auth, (db) => svc.markNotificationRead(db, auth.admin, body.id))],
  ["POST", "notifications/read-all", async (auth) => write(auth, (db) => svc.markAllNotificationsRead(db, auth.admin))],

  ["DELETE", "sessions/:id", async (auth, { params }) => write(auth, (db) => svc.revokeSession(db, auth.admin, session.token, params.id))],
  ["POST", "sessions/revoke-others", async ({ admin, session }) => write(auth, (db) => ({ revoked: svc.revokeOtherSessions(db, auth.admin, session.token) }))],
];

async function write(auth, fn, laravelProxy = null) {
  const { admin, session } = auth;
  let result = {};
  
  if (laravelProxy) {
     const laravelUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
     try {
       const res = await fetch(`${laravelUrl}${laravelProxy.path}`, {
         method: laravelProxy.method,
         headers: { "Authorization": `Bearer ${session.token}`, "Content-Type": "application/json", "Accept": "application/json" },
         body: laravelProxy.body ? JSON.stringify(laravelProxy.body) : undefined
       });
       if (res.ok) result = await res.json();
       else result = mutate((db) => fn(db)) || {};
     } catch {
       result = mutate((db) => fn(db)) || {};
     }
  } else {
     result = mutate((db) => fn(db)) || {};
  }
  
  const laravelUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
  const dataRes = await fetch(`${laravelUrl}/admin/bff/load-all`, {
    headers: { "Authorization": `Bearer ${session.token}`, "Accept": "application/json" }
  }).catch(() => null);
  
  const db = getDb();
  const fresh = db.admins.find((a) => a.id === admin.id) || admin;
  
  let data;
  if (dataRes && dataRes.ok) {
     data = (await dataRes.json()).data;
  } else {
     data = svc.loadAll(db, fresh);
  }
  
  return { ...result, data, admin: publicAdmin(fresh) };
}

function match(method, segments) {
  for (const [m, pattern, fn, roles] of routes) {
    if (m !== method) continue;
    const parts = pattern.split("/");
    if (parts.length !== segments.length) continue;
    const params = {};
    const matched = parts.every((p, i) => (p.startsWith(":") ? ((params[p.slice(1)] = segments[i]), true) : p === segments[i]));
    if (matched) return { fn, roles, params };
  }
  return null;
}

async function dispatch(request, context) {
  const { slug } = await context.params;
  const method = request.method;
  const found = match(method, slug);
  if (!found) throw new HttpError(404, "Endpoint tidak ditemukan.");
  const auth = await requireAdmin(found.roles);
  const body = ["POST", "PATCH", "PUT"].includes(method) && request.headers.get("content-length") !== "0" ? await readBody(request).catch(() => ({})) : {};
  const result = await found.fn(auth, { body, params: found.params, url: new URL(request.url) });
  return ok({ success: true, ...result });
}

const handler = handle(dispatch);
export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
