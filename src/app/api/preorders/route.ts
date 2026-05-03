import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { createPartPreorder } from "@/lib/preorder-service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const unauthorized = await assertAdmin(req);
  if (unauthorized) return unauthorized;

  const preorders = await prisma.partPreorder.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { email: true, name: true } },
      part: { select: { name: true, priceCents: true } },
    },
  });
  return NextResponse.json({ preorders });
}

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  partId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const preorder = await createPartPreorder(parsed.data);
    return NextResponse.json({ preorder }, { status: 201 });
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    const status = code === "INVALID_PART" ? 400 : 500;
    return NextResponse.json({ error: code }, { status });
  }
}
