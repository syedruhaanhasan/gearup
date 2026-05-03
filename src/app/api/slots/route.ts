import { NextRequest, NextResponse } from "next/server";
import { computeAvailableSlots } from "@/lib/slots";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("serviceId");
  const fromParam = searchParams.get("from");
  const days = Number(searchParams.get("days") ?? "7");

  if (!serviceId) {
    return NextResponse.json({ error: "serviceId required" }, { status: 400 });
  }

  const from = fromParam ? new Date(fromParam) : new Date();
  if (Number.isNaN(from.getTime())) {
    return NextResponse.json({ error: "invalid from" }, { status: 400 });
  }

  const slots = await computeAvailableSlots({
    serviceId,
    from,
    horizonDays: Math.min(Math.max(days, 1), 30),
    maxSlots: 80,
  });

  return NextResponse.json({ slots });
}
