import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Login Admin - CariKostKita", description: "Masuk ke Admin Panel CariKostKita." };

export default async function LoginPage() {
  if (await getSession()) redirect("/");
  return <LoginForm />;
}
