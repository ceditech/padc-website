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

async function getParams(context: { params: Promise<{ table: string; id: string }> | { table: string; id: string } }) {
  return context.params;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ table: string; id: string }> | { table: string; id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { table, id } = await getParams(context);
  const config = getAdminTableConfig(table);
  if (!config) {
    return NextResponse.json({ error: "Unknown table." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const record = sanitizeAdminRecord(config.key as AdminTableKey, body, { partial: true });
  const validationError = validateAdminRecord(config.key as AdminTableKey, record, { requireRequiredFields: false });

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  if (!Object.keys(record).length) {
    return NextResponse.json({ error: "No valid fields were provided." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(config.key).update(record).eq("id", id).select("*").single();

  if (error) {
    return databaseErrorResponse(`Unable to update ${config.singular}`, error);
  }

  return NextResponse.json({ row: data });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ table: string; id: string }> | { table: string; id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { table, id } = await getParams(context);
  const config = getAdminTableConfig(table);
  if (!config) {
    return NextResponse.json({ error: "Unknown table." }, { status: 404 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(config.key).delete().eq("id", id);

  if (error) {
    return databaseErrorResponse(`Unable to delete ${config.singular}`, error);
  }

  return NextResponse.json({ ok: true });
}
