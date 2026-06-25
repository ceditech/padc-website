import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "padc_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

export type AdminSession = {
  expiresAt: number;
  role: "super_admin" | "board_member";
  userId?: string;
  email?: string;
  name?: string;
};

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createAdminSessionValue(session: Omit<AdminSession, "expiresAt">) {
  const payload = Buffer.from(JSON.stringify({ ...session, expiresAt: Date.now() + SESSION_TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionValue(value?: string) {
  if (!value || !getSecret()) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (!session.expiresAt || session.expiresAt < Date.now()) return null;
    if (session.role !== "super_admin" && session.role !== "board_member") return null;
    return session;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return Boolean(verifyAdminSessionValue(value));
}

export function adminCookieName() {
  return COOKIE_NAME;
}

export function adminSessionMaxAge() {
  return SESSION_TTL_MS / 1000;
}
