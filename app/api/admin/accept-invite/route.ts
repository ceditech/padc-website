import { NextResponse } from "next/server";
import { adminCookieName, adminSessionMaxAge, createAdminSessionValue } from "@/lib/admin-auth";
import { validatePasswordStrength } from "@/lib/password";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const accessToken = typeof body?.accessToken === "string" ? body.accessToken : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const confirmation = typeof body?.confirmation === "string" ? body.confirmation : "";
  const passwordError = validatePasswordStrength(password);

  if (!accessToken) return NextResponse.json({ error: "This invitation link is invalid or expired." }, { status: 400 });
  if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
  if (password !== confirmation) return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  const user = authData.user;
  if (authError || !user?.email) {
    return NextResponse.json({ error: "This invitation link is invalid or expired." }, { status: 401 });
  }

  const { data: member, error: memberError } = await supabase
    .from("board_members")
    .select("id,first_name,last_name,email,status,auth_status")
    .eq("user_id", user.id)
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (memberError || !member || member.status !== "active" || !["invited", "active"].includes(member.auth_status)) {
    return NextResponse.json({ error: "This account is not authorized for dashboard access." }, { status: 403 });
  }

  const { error: passwordUpdateError } = await supabase.auth.admin.updateUserById(user.id, { password });
  if (passwordUpdateError) {
    return NextResponse.json({ error: "Unable to set the password. Please request a new invitation." }, { status: 502 });
  }

  const now = new Date().toISOString();
  await supabase
    .from("board_members")
    .update({ auth_status: "active", invitation_accepted_at: now, last_login_at: now })
    .eq("id", member.id);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    adminCookieName(),
    createAdminSessionValue({
      role: "board_member",
      userId: member.id,
      email: member.email,
      name: [member.first_name, member.last_name].filter(Boolean).join(" ")
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: adminSessionMaxAge()
    }
  );
  return response;
}
