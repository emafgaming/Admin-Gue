import { redirect } from "next/navigation";
import AdminApp from "@/components/AdminApp";
import { getSession, publicAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin CariKostKita" };

export default async function AdminPage() {
  // Proteksi di server: tanpa session valid, halaman admin tidak pernah dirender.
  const found = await getSession();
  if (!found) redirect("/login");
  return <AdminApp initialAdmin={publicAdmin(found.admin)} />;
}
