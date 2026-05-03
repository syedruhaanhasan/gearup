import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const rules = await prisma.timeSlotRule.findMany({
    orderBy: { dayOfWeek: "asc" },
  });
  return NextResponse.json({ rules });
}

const postSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotStepMin: z.number().int().min(5).max(240).optional(),
  active: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const unauthorized = await assertAdmin(req);
  if (unauthorized) return unauthorized;

  const json = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const rule = await prisma.timeSlotRule.create({
    data: {
      dayOfWeek: parsed.data.dayOfWeek,
      openTime: parsed.data.openTime,
      closeTime: parsed.data.closeTime,
      slotStepMin: parsed.data.slotStepMin ?? null,
      active: parsed.data.active ?? true,
    },
  });
  return NextResponse.json({ rule }, { status: 201 });
}
