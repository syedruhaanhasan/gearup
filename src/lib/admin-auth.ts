import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifyAccessToken } from "@/lib/jwt";

/**
 * Admin-only guard for API routes.
 * Accepts: valid JWT with role ADMIN (cookie or Bearer), or legacy Bearer ADMIN_API_KEY.
 */
export async function assertAdmin(req: NextRequest): Promise<Response | null> {
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  const legacyKey = process.env.ADMIN_API_KEY;
  if (legacyKey && bearer === legacyKey) {
    return null;
  }

  const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  const tokenCandidate =
    bearer && (!legacyKey || bearer !== legacyKey) ? bearer : cookieToken;

  if (!tokenCandidate) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await verifyAccessToken(tokenCandidate);
    if (payload.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
  } catch {
    return Response.json({ error: "Invalid session" }, { status: 401 });
  }
}
