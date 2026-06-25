import { NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { validationErrorResponse } from "@/lib/api-validation";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { driverInterestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = driverInterestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const data = parsed.data;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("driver_leads").insert({
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email.toLowerCase(),
    phone: data.phone || null,
    neighborhood: data.neighborhood || null,
    platforms: data.platforms || null,
    source: data.source || null,
    message: data.message || null,
    status: "new"
  });

  if (error) {
    return databaseErrorResponse("Unable to save driver interest", error);
  }

  return NextResponse.json({ ok: true });
}
