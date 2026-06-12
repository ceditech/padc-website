import { NextResponse } from "next/server";
import {
  getAdminTableConfig,
  adminSelectColumns,
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

  if (config.key === "board_members") {
    if (record.email) record.email = record.email.toLowerCase();
  }

  if (!Object.keys(record).length) {
    return NextResponse.json({ error: "No valid fields were provided." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (config.key === "board_members" && record.email) {
    const { data: existing } = await supabase
      .from("board_members")
      .select("email,user_id")
      .eq("id", id)
      .maybeSingle();

    if (existing?.user_id && existing.email?.toLowerCase() !== record.email) {
      const { error: authEmailError } = await supabase.auth.admin.updateUserById(existing.user_id, {
        email: record.email
      });
      if (authEmailError) {
        return NextResponse.json({ error: "Unable to update the board member login email." }, { status: 502 });
      }
    }
  }
  const { data, error } = await supabase.from(config.key).update(record).eq("id", id).select(adminSelectColumns(config.key)).single();

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
  let authUserId: string | null = null;
  if (config.key === "board_members") {
    const { data: member } = await supabase.from("board_members").select("user_id").eq("id", id).maybeSingle();
    authUserId = member?.user_id ?? null;
  }
  const { error } = await supabase.from(config.key).delete().eq("id", id);

  if (error) {
    return databaseErrorResponse(`Unable to delete ${config.singular}`, error);
  }

  if (authUserId) {
    await supabase.auth.admin.deleteUser(authUserId);
  }

  return NextResponse.json({ ok: true });
}
