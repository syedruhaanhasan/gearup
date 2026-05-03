import { addMinutes } from "date-fns";
import { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { broadcastMechanics } from "@/lib/realtime";
import { rangesOverlap } from "@/lib/time-helpers";

export type CreateBookingInput = {
  email: string;
  name?: string;
  serviceId: string;
  startAt: Date;
  partLines: { partId: string; quantity: number }[];
};

export async function createBookingWithInventory(input: CreateBookingInput) {
  const { email, name, serviceId, startAt, partLines } = input;

  if (!partLines || partLines.length === 0) {
    throw new Error("PARTS_REQUIRED");
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const service = await tx.service.findUnique({ where: { id: serviceId } });
      if (!service || !service.active) {
        throw new Error("INVALID_SERVICE");
      }

      const endAt = addMinutes(startAt, service.durationMinutes);

      const user = await tx.user.upsert({
        where: { email },
        create: { email, name: name ?? null, role: "CUSTOMER" },
        update: { name: name ?? undefined },
      });

      const mechanics = await tx.mechanic.findMany({
        orderBy: { id: "asc" },
        select: { id: true },
      });
      if (mechanics.length === 0) {
        throw new Error("NO_MECHANICS");
      }

      const overlaps = await tx.booking.findMany({
        where: {
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          OR: [
            {
              startAt: { lt: endAt },
              endAt: { gt: startAt },
            },
          ],
        },
        select: { mechanicId: true, startAt: true, endAt: true },
      });

      let chosen: string | null = null;
      for (const m of mechanics) {
        const busy = overlaps.some(
          (b) =>
            b.mechanicId === m.id &&
            rangesOverlap(startAt, endAt, b.startAt, b.endAt),
        );
        if (!busy) {
          chosen = m.id;
          break;
        }
      }
      if (!chosen) {
        throw new Error("SLOT_TAKEN");
      }

      let partsTotalCents = 0;

      for (const line of partLines) {
        if (line.quantity <= 0) continue;
        const part = await tx.part.findUnique({ where: { id: line.partId } });
        if (!part) throw new Error("INVALID_PART");

        if (part.stockQuantity >= line.quantity) {
          await tx.part.update({
            where: { id: part.id },
            data: { stockQuantity: { decrement: line.quantity } },
          });
          await tx.inventoryLedger.create({
            data: {
              partId: part.id,
              delta: -line.quantity,
              reason: "BOOKING_SALE",
              bookingId: "temp", // placeholder, will be updated after booking creation
            },
          });
          partsTotalCents += part.priceCents * line.quantity;
        } else {
          throw new Error("INSUFFICIENT_STOCK");
        }
      }

      const totalPriceCents = service.priceCents + partsTotalCents;

      const booking = await tx.booking.create({
        data: {
          userId: user.id,
          serviceId,
          mechanicId: chosen,
          startAt,
          endAt,
          status: BookingStatus.CONFIRMED,
          totalPriceCents,
        },
      });

      // Update ledger entries with real bookingId and create booking part lines
      for (const line of partLines) {
        if (line.quantity <= 0) continue;
        const part = await tx.part.findUnique({ where: { id: line.partId } });
        if (!part) continue;

        await tx.inventoryLedger.updateMany({
          where: { partId: part.id, reason: "BOOKING_SALE", bookingId: "temp" },
          data: { bookingId: booking.id },
        });

        await tx.bookingPartLine.create({
          data: {
            bookingId: booking.id,
            partId: part.id,
            quantity: line.quantity,
            unitPriceCents: part.priceCents,
          },
        });
      }

      return booking;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );

  broadcastMechanics();
  return result;
}
