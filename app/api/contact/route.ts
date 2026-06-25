import { NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { validationErrorResponse } from "@/lib/api-validation";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { contactSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const data = parsed.data;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("contact_messages").insert({
    first_name: data.firstName,
    last_name: data.lastName,
    organization: data.organization || null,
    email: data.email.toLowerCase(),
    phone: data.phone || null,
    persona: data.persona,
    subject: data.subject,
    message: data.message,
    status: "new"
  });

  if (error) {
    return databaseErrorResponse("Unable to save contact message", error);
  }

  return NextResponse.json({ ok: true });
}
