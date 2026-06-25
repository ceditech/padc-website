import { NextResponse } from "next/server";
import { adminCookieName, adminSessionMaxAge, createAdminSessionValue } from "@/lib/admin-auth";
import { clearLoginRateLimit, checkLoginRateLimit } from "@/lib/login-rate-limit";
import { safeStringEqual } from "@/lib/password";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  const mode = body?.mode === "super_admin" ? "super_admin" : "board_member";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const rateLimitKey = `${forwardedFor || "local"}:${mode}:${email}`;
  const rateLimit = checkLoginRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    );
  }

  let session: Parameters<typeof createAdminSessionValue>[0] | null = null;

  if (mode === "super_admin") {
    const expected = process.env.ADMIN_PASSWORD || "";
    if (expected && safeStringEqual(password, expected)) {
      session = { role: "super_admin", name: "Super Admin" };
    }
  } else if (email && password) {
    const authClient = getSupabaseAdmin();
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({ email, password });
    const authUser = authData.user;

    if (!authError && authUser) {
      // signInWithPassword changes authClient to the member session. Use a
      // fresh service-role client for the server-side authorization lookup.
      const supabase = getSupabaseAdmin();
      const { data: member } = await supabase
        .from("board_members")
        .select("id,first_name,last_name,email,status,auth_status")
        .eq("user_id", authUser.id)
        .eq("email", email)
        .maybeSingle();

      if (member?.status === "active" && member.auth_status === "active") {
        session = {
          role: "board_member",
          userId: member.id,
          email: member.email,
          name: [member.first_name, member.last_name].filter(Boolean).join(" ")
        };
        await supabase.from("board_members").update({ last_login_at: new Date().toISOString() }).eq("id", member.id);
      }
    }
  }

  if (!session) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  clearLoginRateLimit(rateLimitKey);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName(), createAdminSessionValue(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminSessionMaxAge()
  });
  return response;
}
