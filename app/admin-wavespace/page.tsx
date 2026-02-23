import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin | Wavespace",
};

export default async function AdminPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ secret?: string }>;
}>) {
  const { secret } = await searchParams;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || secret !== adminSecret) {
    redirect("/");
  }

  return <AdminDashboard />;
}
