import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive(),
  priceCents: z.number().int().nonnegative(),
  active: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";
  if (all) {
    const unauthorized = await assertAdmin(req);
    if (unauthorized) return unauthorized;
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ services });
  }

  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ services });
}

export async function POST(req: NextRequest) {
  const unauthorized = await assertAdmin(req);
  if (unauthorized) return unauthorized;

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      durationMinutes: parsed.data.durationMinutes,
      priceCents: parsed.data.priceCents,
      active: parsed.data.active ?? true,
    },
  });
  return NextResponse.json({ service }, { status: 201 });
}
