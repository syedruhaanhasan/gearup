import { MechanicStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { broadcastMechanics } from "@/lib/realtime";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.nativeEnum(MechanicStatus).optional(),
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

  const updated = await prisma.mechanic.update({
    where: { id },
    data: parsed.data,
  });
  broadcastMechanics();
  return NextResponse.json({ mechanic: updated });
}
