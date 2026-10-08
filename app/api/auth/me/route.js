import { handle, ok } from "@/lib/http";
import { publicAdmin, requireAdmin } from "@/lib/auth";

export const GET = handle(async () => {
  const { admin } = await requireAdmin();
  return ok({ admin: publicAdmin(admin) });
});
