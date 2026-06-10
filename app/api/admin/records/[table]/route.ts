import { NextResponse } from "next/server";
import {
  getAdminTableConfig,
  sanitizeAdminRecord,
  validateAdminRecord,
  type AdminTableKey
} from "@/lib/admin-tables";
import { requireAdmin } from "@/lib/admin-auth";
import { databaseErrorResponse } from "@/lib/api-error";
import { getSupabaseAdmin } from "@/lib/supabase/server";

async function getTable(context: { params: Promise<{ table: string }> | { table: string } }) {
  const params = await context.params;
  return params.table;
}

export async function GET(_request: Request, context: { params: Promise<{ table: string }> | { table: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const table = await getTable(context);
  const config = getAdminTableConfig(table);
  if (!config) {
    return NextResponse.json({ error: "Unknown table." }, { status: 404 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(config.key)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return databaseErrorResponse(`Unable to read ${config.label}`, error);
  }

  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(request: Request, context: { params: Promise<{ table: string }> | { table: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const table = await getTable(context);
  const config = getAdminTableConfig(table);
  if (!config) {
    return NextResponse.json({ error: "Unknown table." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const record = sanitizeAdminRecord(config.key as AdminTableKey, body);
  const validationError = validateAdminRecord(config.key as AdminTableKey, record);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(config.key).insert(record).select("*").single();

  if (error) {
    return databaseErrorResponse(`Unable to create ${config.singular}`, error);
  }

  return NextResponse.json({ row: data }, { status: 201 });
}
