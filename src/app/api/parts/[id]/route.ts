import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative().optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  restockLeadDays: z.number().int().nonnegative().optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const unauthorized = await assertAdmin(req);
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const part = await prisma.part.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ part });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const unauthorized = await assertAdmin(req);
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  await prisma.part.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
