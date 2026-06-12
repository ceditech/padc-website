import { NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { validationErrorResponse } from "@/lib/api-validation";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { newsletterSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = newsletterSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const supabase = getSupabaseAdmin();
  const subscriber = {
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    source: "website",
    status: "active"
  };
  let { error } = await supabase.from("newsletter_subscribers").upsert(subscriber, { onConflict: "email" });

  if (error?.message.toLowerCase().includes("fetch failed")) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    ({ error } = await supabase.from("newsletter_subscribers").upsert(subscriber, { onConflict: "email" }));
  }

  if (error) {
    return databaseErrorResponse("Unable to subscribe", error);
  }

  return NextResponse.json({ ok: true });
}
