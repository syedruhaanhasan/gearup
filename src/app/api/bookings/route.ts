import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { createBookingWithInventory } from "@/lib/booking-service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  serviceId: z.string().min(1),
  startAt: z.string().datetime(),
  parts: z.array(
    z.object({
      partId: z.string(),
      quantity: z.number().int().positive(),
    }),
  ).min(1, "At least one part is required"),
});

export async function GET(req: NextRequest) {
  const unauthorized = await assertAdmin(req);
  if (unauthorized) return unauthorized;

  const bookings = await prisma.booking.findMany({
    orderBy: { startAt: "asc" },
    include: {
      user: { select: { email: true, name: true } },
      service: true,
      mechanic: true,
    },
    take: 200,
  });
  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const booking = await createBookingWithInventory({
      email: parsed.data.email,
      name: parsed.data.name,
      serviceId: parsed.data.serviceId,
      startAt: new Date(parsed.data.startAt),
      partLines: parsed.data.parts,
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    const map: Record<string, number> = {
      INVALID_SERVICE: 400,
      NO_MECHANICS: 409,
      SLOT_TAKEN: 409,
      INSUFFICIENT_STOCK: 409,
      INVALID_PART: 400,
      PARTS_REQUIRED: 400,
    };
    const status = map[code] ?? 500;
    return NextResponse.json({ error: code }, { status });
  }
}
