import { handle, ok, readBody } from "@/lib/http";
import { HttpError, publicAdmin, requireAdmin } from "@/lib/auth";
import { getDb, mutate } from "@/lib/db";
import * as svc from "@/lib/service";

/**
 * REST API Admin. Semua endpoint wajib login. Setiap mutasi mengembalikan
 * snapshot data terbaru ("data") sehingga UI selalu konsisten dengan server.
 */
const routes = [
  ["GET", "data", async ({ admin }) => ({ data: svc.loadAll(getDb(), admin) })],
  ["GET", "stats", async (_c, { url }) => ({ stats: svc.computeStats(getDb(), url.searchParams.get("period") || "bulanan") }), ["super_admin", "admin", "marketing"]],
  ["GET", "sessions", async ({ admin, session }) => ({ sessions: svc.listSessions(getDb(), admin, session.token) })],
  ["GET", "global-search", async ({ admin }, { url }) => svc.globalSearch(getDb(), admin, url.searchParams.get("q"))],
  ["GET", "search", async ({ admin }, { url }) => svc.globalSearch(getDb(), admin, url.searchParams.get("q"))],

  ["POST", "kosts", async ({ admin }, { body }) => write(admin, (db) => ({ kost: svc.createKost(db, admin, body) })), ["super_admin", "admin"]],
  ["PATCH", "kosts/:id", async ({ admin }, { body, params }) => write(admin, (db) => ({ kost: svc.updateKost(db, admin, params.id, body) })), ["super_admin", "admin", "moderator"]],
  ["DELETE", "kosts/:id", async ({ admin }, { params }) => write(admin, (db) => svc.deleteKost(db, admin, params.id)), ["super_admin", "admin"]],
  ["POST", "kosts/:id/status", async ({ admin }, { body, params }) => write(admin, (db) => ({ kost: svc.setKostStatus(db, admin, params.id, body.status, body.reason) })), ["super_admin", "admin", "moderator"]],
  ["POST", "kosts/:id/archive", async ({ admin }, { params }) => write(admin, (db) => ({ kost: svc.archiveKost(db, admin, params.id) })), ["super_admin", "admin"]],
  ["POST", "kosts/:id/restore", async ({ admin }, { params }) => write(admin, (db) => ({ kost: svc.restoreKost(db, admin, params.id) })), ["super_admin", "admin"]],
  ["DELETE", "kosts/:id/permanent", async ({ admin }, { params }) => write(admin, (db) => svc.permanentDeleteKost(db, admin, params.id)), ["super_admin"]],
  ["POST", "kosts/bulk", async ({ admin }, { body }) => write(admin, (db) => svc.bulkKostAction(db, admin, body)), ["super_admin", "admin", "moderator"]],

  ["PATCH", "owners/:id", async ({ admin }, { body, params }) => write(admin, (db) => ({ owner: svc.updateOwner(db, admin, params.id, body) })), ["super_admin", "admin"]],
  ["DELETE", "owners/:id", async ({ admin }, { params }) => write(admin, (db) => svc.deleteOwner(db, admin, params.id)), ["super_admin", "admin"]],
  ["POST", "owners/:id/action", async ({ admin }, { body, params }) => write(admin, (db) => ({ owner: svc.ownerAction(db, admin, params.id, body) })), ["super_admin", "admin", "moderator"]],
  ["POST", "owners/:id/archive", async ({ admin }, { params }) => write(admin, (db) => ({ owner: svc.archiveOwner(db, admin, params.id) })), ["super_admin", "admin"]],
  ["POST", "owners/:id/restore", async ({ admin }, { params }) => write(admin, (db) => ({ owner: svc.restoreOwner(db, admin, params.id) })), ["super_admin", "admin"]],
  ["DELETE", "owners/:id/permanent", async ({ admin }, { body, params }) => write(admin, (db) => svc.permanentDeleteOwner(db, admin, params.id, body)), ["super_admin"]],
  ["POST", "owners/:id/permanent", async ({ admin }, { body, params }) => write(admin, (db) => svc.permanentDeleteOwner(db, admin, params.id, body)), ["super_admin"]],
  ["POST", "owners/bulk", async ({ admin }, { body }) => write(admin, (db) => svc.bulkOwnerAction(db, admin, body)), ["super_admin", "admin", "moderator"]],

  ["PATCH", "users/:id", async ({ admin }, { body, params }) => write(admin, (db) => ({ user: svc.updateUser(db, admin, params.id, body) })), ["super_admin", "admin"]],
  ["DELETE", "users/:id", async ({ admin }, { params }) => write(admin, (db) => svc.deleteUser(db, admin, params.id)), ["super_admin", "admin"]],
  ["POST", "users/:id/status", async ({ admin }, { body, params }) => write(admin, (db) => ({ user: svc.setUserStatus(db, admin, params.id, body.status) })), ["super_admin", "admin"]],
  ["POST", "users/:id/archive", async ({ admin }, { params }) => write(admin, (db) => ({ user: svc.archiveUser(db, admin, params.id) })), ["super_admin", "admin"]],
  ["POST", "users/:id/restore", async ({ admin }, { params }) => write(admin, (db) => ({ user: svc.restoreUser(db, admin, params.id) })), ["super_admin", "admin"]],
  ["DELETE", "users/:id/permanent", async ({ admin }, { params }) => write(admin, (db) => svc.permanentDeleteUser(db, admin, params.id)), ["super_admin"]],
  ["POST", "users/:id/permanent", async ({ admin }, { params }) => write(admin, (db) => svc.permanentDeleteUser(db, admin, params.id)), ["super_admin"]],
  ["POST", "users/bulk", async ({ admin }, { body }) => write(admin, (db) => svc.bulkUserAction(db, admin, body)), ["super_admin", "admin"]],

  ["PATCH", "reports/:id", async ({ admin }, { body, params }) => write(admin, (db) => ({ report: svc.updateReport(db, admin, params.id, body) })), ["super_admin", "admin", "moderator"]],

  ["POST", "ads", async ({ admin }, { body }) => write(admin, (db) => ({ ad: svc.createAd(db, admin, body) })), ["super_admin", "marketing"]],
  ["PATCH", "ads/:id", async ({ admin }, { body, params }) => write(admin, (db) => ({ ad: svc.updateAd(db, admin, params.id, body) })), ["super_admin", "marketing"]],
  ["DELETE", "ads/:id", async ({ admin }, { params }) => write(admin, (db) => svc.deleteAd(db, admin, params.id)), ["super_admin", "marketing"]],
  ["POST", "ads/:id/toggle", async ({ admin }, { params }) => write(admin, (db) => ({ ad: svc.toggleAd(db, admin, params.id) })), ["super_admin", "marketing"]],
  ["POST", "ads/:id/archive", async ({ admin }, { params }) => write(admin, (db) => ({ ad: svc.archiveAd(db, admin, params.id) })), ["super_admin", "marketing"]],
  ["POST", "ads/:id/restore", async ({ admin }, { params }) => write(admin, (db) => ({ ad: svc.restoreAd(db, admin, params.id) })), ["super_admin", "marketing"]],
  ["DELETE", "ads/:id/permanent", async ({ admin }, { params }) => write(admin, (db) => svc.permanentDeleteAd(db, admin, params.id)), ["super_admin"]],

  ["PATCH", "settings/profile", async ({ admin }, { body }) => write(admin, (db) => ({ profile: svc.updateProfile(db, admin, body) }))],
  ["POST", "settings/password", async ({ admin, session }, { body }) => write(admin, (db) => svc.changePassword(db, admin, session.token, body))],
  ["PATCH", "settings/notifications", async ({ admin }, { body }) => write(admin, (db) => ({ notifications: svc.updateNotifications(db, admin, body) }))],
  ["PATCH", "settings/system", async ({ admin }, { body }) => write(admin, (db) => ({ system: svc.updateSystem(db, admin, body) })), ["super_admin"]],

  ["GET", "admins", async ({ admin }) => ({ admins: svc.listAdmins(getDb(), admin) }), ["super_admin"]],
  ["POST", "admins", async ({ admin }, { body }) => write(admin, (db) => ({ admin: svc.createAdmin(db, admin, body) })), ["super_admin"]],
  ["PATCH", "admins/:id", async ({ admin }, { body, params }) => write(admin, (db) => ({ admin: svc.updateAdmin(db, admin, params.id, body) })), ["super_admin"]],
  ["DELETE", "admins/:id", async ({ admin }, { params }) => write(admin, (db) => svc.deleteAdmin(db, admin, params.id)), ["super_admin"]],

  ["POST", "notifications/read", async ({ admin }, { body }) => write(admin, (db) => svc.markNotificationRead(db, admin, body.id))],
  ["POST", "notifications/read-all", async ({ admin }) => write(admin, (db) => svc.markAllNotificationsRead(db, admin))],

  ["DELETE", "sessions/:id", async ({ admin, session }, { params }) => write(admin, (db) => svc.revokeSession(db, admin, session.token, params.id))],
  ["POST", "sessions/revoke-others", async ({ admin, session }) => write(admin, (db) => ({ revoked: svc.revokeOtherSessions(db, admin, session.token) }))],
];

function write(admin, fn) {
  const result = mutate((db) => fn(db)) || {};
  const db = getDb();
  const fresh = db.admins.find((a) => a.id === admin.id) || admin;
  return { ...result, data: svc.loadAll(db, fresh), admin: publicAdmin(fresh) };
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
