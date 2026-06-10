import { NextResponse } from "next/server";

export function databaseErrorResponse(context: string, error: unknown) {
  console.error(context, error);
  const message = error instanceof Error ? error.message : JSON.stringify(error);
  const lowerMessage = message.toLowerCase();
  const friendlyMessage = lowerMessage.includes("fetch failed") || lowerMessage.includes("connecttimeout")
    ? "The app could not reach Supabase. Check the project URL, local DNS/network access, and Supabase project status."
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
