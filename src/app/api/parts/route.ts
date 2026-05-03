import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  stockQuantity: z.number().int().nonnegative(),
  restockLeadDays: z.number().int().nonnegative().optional(),
});

export async function GET() {
  const parts = await prisma.part.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ parts });
}

export async function POST(req: NextRequest) {
  const unauthorized = await assertAdmin(req);
  if (unauthorized) return unauthorized;

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const part = await prisma.part.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      priceCents: parsed.data.priceCents,
      stockQuantity: parsed.data.stockQuantity,
      restockLeadDays: parsed.data.restockLeadDays ?? 2,
    },
  });
  return NextResponse.json({ part }, { status: 201 });
}
