import { handle, ok, readBody } from "@/lib/http";
import { HttpError, login, setSessionCookie } from "@/lib/auth";

export const POST = handle(async (request) => {
  const body = await readBody(request);
  const identifier = String(body.identifier || "").trim();
  const password = String(body.password || "");
  const fields = {};
  if (!identifier) fields.identifier = "Email atau username wajib diisi.";
  if (!password) fields.password = "Password wajib diisi.";
  if (Object.keys(fields).length) throw new HttpError(422, "Lengkapi data login.", fields);
  const { token, admin, maxAge } = await login(identifier, password);
  await setSessionCookie(token, maxAge);
  return ok({ admin });
});
