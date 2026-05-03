import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPrismaConnectionLikeError } from "@/lib/prisma-connection-error";
import { SESSION_COOKIE_NAME, signAccessToken } from "@/lib/jwt";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    let passwordOk = false;
    try {
      passwordOk = await bcrypt.compare(password, user.passwordHash);
    } catch {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    if (!passwordOk) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
    });

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);

    if (isPrismaConnectionLikeError(err)) {
      return NextResponse.json(
        {
          error:
            "Database connection failed. Check DATABASE_URL in .env (user, password, host, database name) and that PostgreSQL is running.",
        },
        { status: 503 },
      );
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Could not complete sign-in. Try again later." },
        { status: 500 },
      );
    }

    if (err instanceof Error && err.message.includes("JWT_SECRET")) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}
