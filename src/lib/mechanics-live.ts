import { MechanicStatus } from "@/lib/db-enums";
import { prisma } from "@/lib/prisma";

export type LiveMechanic = {
  id: string;
  name: string;
  storedStatus: MechanicStatus;
  liveStatus: "AVAILABLE" | "BUSY";
};

export async function getMechanicsLive(): Promise<LiveMechanic[]> {
  const now = new Date();
  const mechanics = await prisma.mechanic.findMany({ orderBy: { name: "asc" } });
  const activeBookings = await prisma.booking.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      startAt: { lte: now },
      endAt: { gt: now },
    },
    select: { mechanicId: true },
  });
  const busyFromSchedule = new Set(activeBookings.map((b) => b.mechanicId));

  return mechanics.map((m) => {
    const busy =
      m.status === MechanicStatus.BUSY || busyFromSchedule.has(m.id);
    return {
      id: m.id,
      name: m.name,
      storedStatus: m.status,
      liveStatus: busy ? "BUSY" : "AVAILABLE",
    };
  });
}
