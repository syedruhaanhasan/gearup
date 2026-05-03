import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const putSchema = z.object({
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotStepMinutes: z.number().int().min(5).max(240),
  timezone: z.string().min(1).optional(),
});

export async function GET() {
  const settings = await prisma.shopSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      openTime: "10:00",
      closeTime: "19:00",
      slotStepMinutes: 60,
      timezone: "UTC",
    },
    update: {},
  });
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const unauthorized = await assertAdmin(req);
  if (unauthorized) return unauthorized;

  const json = await req.json().catch(() => null);
  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const settings = await prisma.shopSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      openTime: parsed.data.openTime,
      closeTime: parsed.data.closeTime,
      slotStepMinutes: parsed.data.slotStepMinutes,
      timezone: parsed.data.timezone ?? "UTC",
    },
    update: {
      openTime: parsed.data.openTime,
      closeTime: parsed.data.closeTime,
      slotStepMinutes: parsed.data.slotStepMinutes,
      timezone: parsed.data.timezone,
    },
  });
  return NextResponse.json({ settings });
}
