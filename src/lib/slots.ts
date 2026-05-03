import { addMinutes } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  addDays,
  buildSlotStarts,
  iterDays,
  rangesOverlap,
  startOfDay,
} from "@/lib/time-helpers";

export type SlotSuggestion = {
  startAt: string;
  endAt: string;
  mechanicId: string;
};

async function loadOverlapWindows(from: Date, to: Date, mechanicIds: string[]) {
  return prisma.booking.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      mechanicId: { in: mechanicIds },
      startAt: { lt: to },
      endAt: { gt: from },
    },
    select: { mechanicId: true, startAt: true, endAt: true },
  });
}

function mechanicFreeForWindow(
  mechanicId: string,
  start: Date,
  end: Date,
  bookings: { mechanicId: string; startAt: Date; endAt: Date }[],
): boolean {
  return !bookings.some(
    (b) =>
      b.mechanicId === mechanicId &&
      rangesOverlap(start, end, b.startAt, b.endAt),
  );
}

/**
 * Returns upcoming assignable slots across the next `horizonDays` days.
 * Picks the lexicographically first free mechanic for each slot to keep behaviour deterministic.
 */
export async function computeAvailableSlots(params: {
  serviceId: string;
  from: Date;
  horizonDays: number;
  maxSlots?: number;
}): Promise<SlotSuggestion[]> {
  const { serviceId, from, horizonDays, maxSlots = 64 } = params;
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });
  if (!service || !service.active) {
    return [];
  }

  const settings = await prisma.shopSettings.findUnique({
    where: { id: "default" },
  });
  if (!settings) {
    return [];
  }

  const mechanics = await prisma.mechanic.findMany({ select: { id: true } });
  if (mechanics.length === 0) {
    return [];
  }
  const mechanicIds = mechanics.map((m) => m.id);

  const duration = service.durationMinutes;
  const step = settings.slotStepMinutes;
  const openHm = settings.openTime;
  const closeHm = settings.closeTime;

  const days = iterDays(startOfDay(from), horizonDays);
  const windowEnd = addDays(days[days.length - 1] ?? startOfDay(from), 1);
  const bookings = await loadOverlapWindows(from, windowEnd, mechanicIds);

  const results: SlotSuggestion[] = [];

  outer: for (const day of days) {
    const slotStarts = buildSlotStarts(
      day,
      openHm,
      closeHm,
      step,
      duration,
      from,
    );
    for (const start of slotStarts) {
      const end = addMinutes(start, duration);
      for (const mid of mechanicIds) {
        if (mechanicFreeForWindow(mid, start, end, bookings)) {
          results.push({
            startAt: start.toISOString(),
            endAt: end.toISOString(),
            mechanicId: mid,
          });
          bookings.push({ mechanicId: mid, startAt: start, endAt: end });
          if (results.length >= maxSlots) break outer;
          break;
        }
      }
    }
  }

  return results;
}
