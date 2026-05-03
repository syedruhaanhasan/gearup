import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { getMechanicsLive } from "@/lib/mechanics-live";
import { prisma } from "@/lib/prisma";
import { broadcastMechanics } from "@/lib/realtime";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
});

export async function GET() {
  const mechanics = await getMechanicsLive();
  return NextResponse.json({ mechanics });
}

export async function POST(req: NextRequest) {
  const unauthorized = await assertAdmin(req);
  if (unauthorized) return unauthorized;

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const mechanic = await prisma.mechanic.create({
    data: { name: parsed.data.name },
  });
  broadcastMechanics();
  return NextResponse.json({ mechanic }, { status: 201 });
}
