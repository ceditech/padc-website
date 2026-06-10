import { NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { validationErrorResponse } from "@/lib/api-validation";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { partnerInquirySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = partnerInquirySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const data = parsed.data;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("partner_inquiries").insert({
    first_name: data.firstName,
    last_name: data.lastName,
    organization: data.organization,
    title: data.title || null,
    email: data.email.toLowerCase(),
    phone: data.phone || null,
    inquiry_type: data.inquiryType,
    message: data.message,
    status: "new"
  });

  if (error) {
    return databaseErrorResponse("Unable to save partner inquiry", error);
  }

  return NextResponse.json({ ok: true });
}
