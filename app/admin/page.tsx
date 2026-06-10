import { redirect } from "next/navigation";
import { AdminDashboard, type AdminRowsByTable } from "@/components/admin/admin-dashboard";
import { adminTableKeys } from "@/lib/admin-tables";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";

async function getRows(table: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false }).limit(100);

  if (error) {
    return [];
  }

  return data ?? [];
}

export default async function AdminPage() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) redirect("/admin/login");

  const entries = await Promise.all(adminTableKeys.map(async (key) => [key, await getRows(key)] as const));
  const initialRows = Object.fromEntries(entries) as AdminRowsByTable;

  return <AdminDashboard initialRows={initialRows} />;
}
