import { NextResponse } from "next/server";
import { ZodError } from "zod";

const labels: Record<string, string> = {
  name: "Name",
  email: "Email address",
  firstName: "First name",
  lastName: "Last name",
  organization: "Organization",
  inquiryType: "Type of inquiry",
  message: "Message",
  persona: "I am a",
  subject: "Subject"
};

export function validationErrorResponse(error: ZodError) {
  const issue = error.issues[0];
  const field = String(issue?.path[0] ?? "");
  const label = labels[field] ?? "This field";
  const message = issue?.message ?? "Please complete the required fields.";

  return NextResponse.json({ error: `${label}: ${message}` }, { status: 400 });
}
