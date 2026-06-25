import { createClient } from "@supabase/supabase-js";
import { Agent, fetch as undiciFetch } from "undici";

const supabaseDispatcher = new Agent({
  connect: {
    timeout: 30000
  },
  headersTimeout: 30000,
  bodyTimeout: 30000
});

const fetchWithLongerTimeout: typeof fetch = (input, init) => {
  return undiciFetch(input as Parameters<typeof undiciFetch>[0], {
    ...(init as Parameters<typeof undiciFetch>[1]),
    dispatcher: supabaseDispatcher
  }) as unknown as ReturnType<typeof fetch>;
};

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      fetch: fetchWithLongerTimeout
    }
  });
}
