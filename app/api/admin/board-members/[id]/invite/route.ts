import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { databaseErrorResponse } from "@/lib/api-error";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = getSupabaseAdmin();
  const { data: member, error: memberError } = await supabase
    .from("board_members")
    .select("id,first_name,last_name,email,status,user_id,auth_status")
    .eq("id", id)
    .maybeSingle();

  if (memberError) return databaseErrorResponse("Unable to read board member", memberError);
  if (!member?.email) return NextResponse.json({ error: "This board member needs an email address." }, { status: 400 });
  if (member.status !== "active") {
    return NextResponse.json({ error: "Only active board members can receive portal access." }, { status: 400 });
  }
  if (member.auth_status === "active") {
    return NextResponse.json({ error: "This board member already has active portal access." }, { status: 409 });
  }

  if (member.user_id) {
    await supabase.auth.admin.deleteUser(member.user_id);
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const email = member.email.trim().toLowerCase();
  const { data: invite, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/admin/accept-invite`,
    data: {
      board_member_id: member.id,
      full_name: [member.first_name, member.last_name].filter(Boolean).join(" ")
    }
  });

  if (inviteError || !invite.user) {
    return NextResponse.json(
      { error: "Unable to send the invitation. Check Supabase Auth email and redirect settings." },
      { status: 502 }
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("board_members")
    .update({
      email,
      user_id: invite.user.id,
      auth_status: "invited",
      invited_at: new Date().toISOString()
    })
    .eq("id", member.id)
    .select("id,created_at,first_name,last_name,role,organization,email,phone,bio,status,auth_status,user_id")
    .single();

  if (updateError) {
    await supabase.auth.admin.deleteUser(invite.user.id);
    return databaseErrorResponse("Unable to link the invitation", updateError);
  }

  return NextResponse.json({ row: updated });
}
