import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

const ADMIN_SECRET = "wavespace2024";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string }>;
}) {
  const { secret } = await searchParams;

  if (secret !== ADMIN_SECRET) {
    redirect("/");
  }

  return <AdminDashboard />;
}
