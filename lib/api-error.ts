import { NextResponse } from "next/server";

export function databaseErrorResponse(context: string, error: unknown) {
  console.error(context, error);
  const details = typeof error === "object" && error !== null ? (error as Record<string, unknown>) : {};
  const message = error instanceof Error
    ? error.message
    : [details.message, details.details, details.hint, details.code].filter(Boolean).join(" ") || JSON.stringify(error);
  const lowerMessage = message.toLowerCase();
  const friendlyMessage = lowerMessage.includes("fetch failed") || lowerMessage.includes("connecttimeout")
    ? "The app could not reach Supabase. Check the project URL, local DNS/network access, and Supabase project status."
    : lowerMessage.includes("board_members") && lowerMessage.includes("password_hash") && lowerMessage.includes("column")
      ? "Board member authentication is not configured yet. Run supabase/migrations/20260612_add_board_member_auth.sql in the Supabase SQL editor."
    : lowerMessage.includes("newsletter_subscribers") && lowerMessage.includes("name") && lowerMessage.includes("column")
      ? "Newsletter setup is incomplete. Add the name column by running supabase/migrations/20260610_add_newsletter_subscriber_name.sql in the Supabase SQL editor."
    : lowerMessage.includes("could not find the table")
      ? "Supabase is connected, but the database tables are missing. Run supabase/schema.sql in the Supabase SQL editor."
      : "Unable to save your submission. Check the server log for details.";

  return NextResponse.json(
    {
      error: friendlyMessage
    },
    { status: 500 }
  );
}
