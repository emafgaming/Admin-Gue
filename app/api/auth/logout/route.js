import { handle, ok } from "@/lib/http";
import { logout } from "@/lib/auth";

export const POST = handle(async () => {
  await logout();
  return ok({ success: true });
});
