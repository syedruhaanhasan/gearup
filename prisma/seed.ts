import {
  BookingStatus,
  MechanicStatus,
  PrismaClient,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, startOfDay } from "date-fns";

const prisma = new PrismaClient();

/** UTC wall-clock helpers (matches slot generator). */
function utcAt(base: Date, dayAdd: number, hour: number, minute = 0) {
  const d = startOfDay(addDays(base, dayAdd));
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  const adminEmail = "admin@gearup.local";
  const adminPass = process.env.ADMIN_SEED_PASSWORD ?? "Admin123!";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPass, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Shop Admin",
        passwordHash,
        role: "ADMIN",
      },
    });
  }

  const customerEmail = "customer@gearup.local";
  const customerPass = process.env.CUSTOMER_SEED_PASSWORD ?? "Shop123!";
  const existingCustomer = await prisma.user.findUnique({
    where: { email: customerEmail },
  });
  if (!existingCustomer) {
    const passwordHash = await bcrypt.hash(customerPass, 12);
    await prisma.user.create({
      data: {
        email: customerEmail,
        name: "Shop front demo",
        passwordHash,
        role: "CUSTOMER",
      },
    });
  }

  await prisma.shopSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      openTime: "09:00",
      closeTime: "18:00",
      slotStepMinutes: 60,
      timezone: "UTC",
    },
    update: {
      openTime: "09:00",
      closeTime: "18:00",
      slotStepMinutes: 60,
      timezone: "UTC",
    },
  });

  const mechanicNames = [
    "Alex Rivera",
    "Jordan Kim",
    "Sam Chen",
    "Priya Shah",
    "Marcus Webb",
  ];
  for (const name of mechanicNames) {
    const existing = await prisma.mechanic.findFirst({ where: { name } });
    if (!existing) {
      await prisma.mechanic.create({
        data: {
          name,
          status:
            name === "Alex Rivera"
              ? MechanicStatus.BUSY
              : MechanicStatus.AVAILABLE,
        },
      });
    }
  }
  await prisma.mechanic.updateMany({
    where: { name: "Alex Rivera" },
    data: { status: MechanicStatus.BUSY },
  });

  const services = [
    {
      name: "Tyre Change",
      description: "Remove and replace tyres, balance check.",
      durationMinutes: 60,
      priceCents: 12000,
      active: true,
    },
    {
      name: "Oil Change",
      description: "Drain and refill oil and filter.",
      durationMinutes: 45,
      priceCents: 7500,
      active: true,
    },
    {
      name: "Engine Check",
      description: "Diagnostics and visual inspection.",
      durationMinutes: 30,
      priceCents: 5000,
      active: true,
    },
    {
      name: "Brake Service",
      description: "Pads, rotors inspection and replacement.",
      durationMinutes: 90,
      priceCents: 18500,
      active: true,
    },
    {
      name: "AC Recharge",
      description: "Leak check and refrigerant top-up.",
      durationMinutes: 60,
      priceCents: 9900,
      active: true,
    },
    {
      name: "Wheel Alignment",
      description: "Four-wheel laser alignment (seasonal promo).",
      durationMinutes: 45,
      priceCents: 11000,
      active: false,
    },
  ];

  for (const s of services) {
    const found = await prisma.service.findFirst({ where: { name: s.name } });
    if (!found) {
      await prisma.service.create({ data: s });
    }
  }

  const parts = [
    {
      name: "Synthetic Oil 5W-30 (5L)",
      description: "Full synthetic motor oil.",
      priceCents: 5200,
      stockQuantity: 24,
      restockLeadDays: 3,
    },
    {
      name: "Brake Pads (Front Pair)",
      description: "Ceramic compound pads.",
      priceCents: 8900,
      stockQuantity: 0,
      restockLeadDays: 2,
    },
    {
      name: "Cabin Air Filter",
      description: "HEPA-grade replacement.",
      priceCents: 2400,
      stockQuantity: 18,
      restockLeadDays: 5,
    },
    {
      name: "Wiper Blades (Pair)",
      description: "All-season 24\" + 18\".",
      priceCents: 3200,
      stockQuantity: 30,
      restockLeadDays: 4,
    },
    {
      name: "12V Battery (60Ah)",
      description: "Maintenance-free starter battery.",
      priceCents: 14500,
      stockQuantity: 6,
      restockLeadDays: 7,
    },
    {
      name: "Spark Plugs (Set of 4)",
      description: "Iridium long-life.",
      priceCents: 4800,
      stockQuantity: 11,
      restockLeadDays: 3,
    },
    {
      name: "Coolant (Pre-mixed 4L)",
      description: "HOAT compatible.",
      priceCents: 2100,
      stockQuantity: 0,
      restockLeadDays: 1,
    },
    {
      name: "Tyre Valve Stems (Pack of 4)",
      description: "Rubber snap-in valves.",
      priceCents: 900,
      stockQuantity: 40,
      restockLeadDays: 2,
    },
  ];

  for (const p of parts) {
    const found = await prisma.part.findFirst({ where: { name: p.name } });
    if (!found) {
      await prisma.part.create({ data: p });
    }
  }

  if ((await prisma.timeSlotRule.count()) === 0) {
    const weekly = [
      { dayOfWeek: 0, openTime: "10:00", closeTime: "16:00", slotStepMin: 60 },
      { dayOfWeek: 1, openTime: "09:00", closeTime: "18:00", slotStepMin: 60 },
      { dayOfWeek: 2, openTime: "09:00", closeTime: "18:00", slotStepMin: 60 },
      { dayOfWeek: 3, openTime: "09:00", closeTime: "18:00", slotStepMin: 60 },
      { dayOfWeek: 4, openTime: "09:00", closeTime: "18:00", slotStepMin: 60 },
      { dayOfWeek: 5, openTime: "09:00", closeTime: "17:00", slotStepMin: 60 },
      { dayOfWeek: 6, openTime: "10:00", closeTime: "15:00", slotStepMin: 90 },
    ];
    await prisma.timeSlotRule.createMany({ data: weekly });
  }

  const today = new Date();
  const tyre = await prisma.service.findFirstOrThrow({
    where: { name: "Tyre Change" },
  });
  const oil = await prisma.service.findFirstOrThrow({
    where: { name: "Oil Change" },
  });
  const engine = await prisma.service.findFirstOrThrow({
    where: { name: "Engine Check" },
  });
  const brakeSvc = await prisma.service.findFirstOrThrow({
    where: { name: "Brake Service" },
  });

  const alex = await prisma.mechanic.findFirstOrThrow({
    where: { name: "Alex Rivera" },
  });
  const jordan = await prisma.mechanic.findFirstOrThrow({
    where: { name: "Jordan Kim" },
  });
  const sam = await prisma.mechanic.findFirstOrThrow({
    where: { name: "Sam Chen" },
  });

  const u1 = await prisma.user.upsert({
    where: { email: "demo.ali@example.com" },
    create: { email: "demo.ali@example.com", name: "Ali Khan" },
    update: { name: "Ali Khan" },
  });
  const u2 = await prisma.user.upsert({
    where: { email: "demo.sara@example.com" },
    create: { email: "demo.sara@example.com", name: "Sara Malik" },
    update: { name: "Sara Malik" },
  });
  const u3 = await prisma.user.upsert({
    where: { email: "demo.raj@example.com" },
    create: { email: "demo.raj@example.com", name: "Raj Patel" },
    update: { name: "Raj Patel" },
  });
  const u4 = await prisma.user.upsert({
    where: { email: "demo.noor@example.com" },
    create: { email: "demo.noor@example.com", name: "Noor Fatima" },
    update: { name: "Noor Fatima" },
  });

  const seedBookings: {
    notes: string;
    userId: string;
    serviceId: string;
    mechanicId: string;
    startAt: Date;
    endAt: Date;
    status: BookingStatus;
  }[] = [
    {
      notes: "seed:b1",
      userId: u1.id,
      serviceId: tyre.id,
      mechanicId: jordan.id,
      startAt: utcAt(today, 1, 10, 0),
      endAt: utcAt(today, 1, 11, 0),
      status: BookingStatus.CONFIRMED,
    },
    {
      notes: "seed:b2",
      userId: u2.id,
      serviceId: oil.id,
      mechanicId: sam.id,
      startAt: utcAt(today, 1, 14, 0),
      endAt: utcAt(today, 1, 14, 45),
      status: BookingStatus.CONFIRMED,
    },
    {
      notes: "seed:b3",
      userId: u3.id,
      serviceId: engine.id,
      mechanicId: alex.id,
      startAt: utcAt(today, 2, 11, 0),
      endAt: utcAt(today, 2, 11, 30),
      status: BookingStatus.PENDING,
    },
    {
      notes: "seed:b4",
      userId: u4.id,
      serviceId: brakeSvc.id,
      mechanicId: sam.id,
      startAt: utcAt(today, 3, 9, 0),
      endAt: utcAt(today, 3, 10, 30),
      status: BookingStatus.CONFIRMED,
    },
    {
      notes: "seed:b5",
      userId: u1.id,
      serviceId: oil.id,
      mechanicId: jordan.id,
      startAt: utcAt(today, -1, 15, 0),
      endAt: utcAt(today, -1, 15, 45),
      status: BookingStatus.COMPLETED,
    },
  ];

  for (const b of seedBookings) {
    const exists = await prisma.booking.findFirst({ where: { notes: b.notes } });
    if (!exists) {
      await prisma.booking.create({ data: b });
    }
  }

  const brakePads = await prisma.part.findFirst({
    where: { name: "Brake Pads (Front Pair)" },
  });
  if (brakePads) {
    const existingPo = await prisma.partPreorder.findFirst({
      where: {
        userId: u2.id,
        partId: brakePads.id,
        status: "OPEN",
      },
    });
    if (!existingPo) {
      await prisma.partPreorder.create({
        data: {
          userId: u2.id,
          partId: brakePads.id,
          quantity: 1,
          expectedBy: addDays(today, brakePads.restockLeadDays),
          status: "OPEN",
        },
      });
    }
  }

  const oilPart = await prisma.part.findFirst({
    where: { name: "Synthetic Oil 5W-30 (5L)" },
  });
  if (oilPart) {
    const hasLedger = await prisma.inventoryLedger.findFirst({
      where: { partId: oilPart.id, reason: "SEED_OPENING" },
    });
    if (!hasLedger) {
      await prisma.inventoryLedger.create({
        data: {
          partId: oilPart.id,
          delta: 10,
          reason: "SEED_OPENING",
        },
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    "Seed completed: demo users (admin@gearup.local, customer@gearup.local), mechanics, services, parts, rules, bookings, preorder, ledger.",
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
