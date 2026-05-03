import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function createPartPreorder(input: {
  email: string;
  name?: string;
  partId: string;
  quantity: number;
}) {
  const { email, name, partId, quantity } = input;
  if (quantity <= 0) throw new Error("INVALID_QTY");

  return prisma.$transaction(async (tx) => {
    const part = await tx.part.findUnique({ where: { id: partId } });
    if (!part) throw new Error("INVALID_PART");

    const user = await tx.user.upsert({
      where: { email },
      create: { email, name: name ?? null, role: "CUSTOMER" },
      update: { name: name ?? undefined },
    });

    const expectedBy = addDays(new Date(), part.restockLeadDays);

    return tx.partPreorder.create({
      data: {
        userId: user.id,
        partId: part.id,
        quantity,
        expectedBy,
        status: "OPEN",
      },
    });
  });
}
