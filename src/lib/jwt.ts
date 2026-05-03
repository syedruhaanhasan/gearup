import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const SESSION_COOKIE_NAME = "gear_session";

/** HS256 secret — min 32 chars recommended for production. */
export function getJwtSecretKey(): Uint8Array {
  const fromEnv = process.env.JWT_SECRET?.trim();
  const raw =
    fromEnv && fromEnv.length > 0
      ? fromEnv
      : process.env.NODE_ENV === "development"
        ? "dev-only-insecure-jwt-secret-change-me!!"
        : "";
  if (!raw) {
    throw new Error(
      "JWT_SECRET is missing or empty. Set a long random string in .env (required in production).",
    );
  }
  return new TextEncoder().encode(raw);
}

export type AccessTokenPayload = JWTPayload & {
  email: string;
  role: "ADMIN" | "CUSTOMER";
};

export async function signAccessToken(user: {
  id: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
}) {
  return new SignJWT({
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(
      (() => {
        const t = process.env.JWT_EXPIRES?.trim();
        return t && t.length > 0 ? t : "7d";
      })(),
    )
    .sign(getJwtSecretKey());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getJwtSecretKey());
  const email = typeof payload.email === "string" ? payload.email : "";
  const role: "ADMIN" | "CUSTOMER" =
    payload.role === "ADMIN" ? "ADMIN" : "CUSTOMER";
  const sub = typeof payload.sub === "string" ? payload.sub : "";
  return { ...payload, sub, email, role };
}
