/**
 * Static rows for admin UI when the API returns nothing (offline / empty DB).
 * Shown only as a visual preview — not written to the database.
 */

/** Fake counts on /admin overview when the database has zero rows. */
export const DEMO_DASHBOARD_COUNTS = {
  parts: 8,
  services: 6,
  mechanics: 5,
  bookings: 12,
  preorders: 2,
  rules: 7,
};

export const DEMO_PARTS = [
  {
    id: "demo-part-1",
    name: "Engine Oil 5W-30 (4L)",
    description: "Full synthetic — sample row",
    priceCents: 4999,
    stockQuantity: 12,
    restockLeadDays: 2,
  },
  {
    id: "demo-part-2",
    name: "Air Filter (Cabin)",
    description: "HEPA replacement — sample row",
    priceCents: 1899,
    stockQuantity: 0,
    restockLeadDays: 5,
  },
  {
    id: "demo-part-3",
    name: "Brake Fluid DOT 4 (500ml)",
    description: "High boiling point — sample row",
    priceCents: 799,
    stockQuantity: 28,
    restockLeadDays: 3,
  },
];

export const DEMO_SERVICES = [
  {
    id: "demo-svc-1",
    name: "Oil Change (Standard)",
    durationMinutes: 45,
    priceCents: 6999,
    active: true,
  },
  {
    id: "demo-svc-2",
    name: "Tyre Rotation",
    durationMinutes: 30,
    priceCents: 3500,
    active: true,
  },
  {
    id: "demo-svc-3",
    name: "Full Diagnostics",
    durationMinutes: 60,
    priceCents: 9500,
    active: false,
  },
];

export const DEMO_MECHANICS = [
  {
    id: "demo-mech-1",
    name: "Rahul Verma",
    storedStatus: "AVAILABLE" as const,
    liveStatus: "AVAILABLE" as const,
  },
  {
    id: "demo-mech-2",
    name: "Aisha Khan",
    storedStatus: "BUSY" as const,
    liveStatus: "BUSY" as const,
  },
  {
    id: "demo-mech-3",
    name: "Chris Okafor",
    storedStatus: "AVAILABLE" as const,
    liveStatus: "AVAILABLE" as const,
  },
];

export const DEMO_BOOKINGS = [
  {
    id: "demo-book-1",
    startAt: new Date(Date.now() + 86400000).toISOString(),
    endAt: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    status: "CONFIRMED",
    user: { email: "customer1@example.com", name: "Sample Customer" },
    service: { name: "Oil Change", priceCents: 7500 },
    mechanic: { name: "Rahul Verma" },
  },
  {
    id: "demo-book-2",
    startAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    endAt: new Date(Date.now() + 2 * 86400000 + 5400000).toISOString(),
    status: "PENDING",
    user: { email: "walkin@example.com", name: null },
    service: { name: "Brake Service", priceCents: 18500 },
    mechanic: { name: "Aisha Khan" },
  },
];

export const DEMO_PREORDERS = [
  {
    id: "demo-po-1",
    quantity: 2,
    expectedBy: new Date(Date.now() + 4 * 86400000).toISOString(),
    status: "OPEN",
    createdAt: new Date().toISOString(),
    user: { email: "parts.wait@example.com", name: "Noor" },
    part: { name: "Brake Pads (Front)", priceCents: 8900 },
  },
];

export const DEMO_TIME_SLOT_RULES = [
  { id: "demo-rule-0", dayOfWeek: 0, openTime: "10:00", closeTime: "14:00", slotStepMin: 60, active: true },
  { id: "demo-rule-1", dayOfWeek: 1, openTime: "09:00", closeTime: "18:00", slotStepMin: 60, active: true },
  { id: "demo-rule-2", dayOfWeek: 2, openTime: "09:00", closeTime: "18:00", slotStepMin: 60, active: true },
  { id: "demo-rule-3", dayOfWeek: 3, openTime: "09:00", closeTime: "18:00", slotStepMin: 45, active: true },
  { id: "demo-rule-4", dayOfWeek: 4, openTime: "09:00", closeTime: "18:00", slotStepMin: 60, active: true },
  { id: "demo-rule-5", dayOfWeek: 5, openTime: "09:00", closeTime: "17:00", slotStepMin: 60, active: true },
  { id: "demo-rule-6", dayOfWeek: 6, openTime: "10:00", closeTime: "15:00", slotStepMin: 90, active: true },
];

export const DEMO_SHOP_SETTINGS = {
  openTime: "09:00",
  closeTime: "18:00",
  slotStepMinutes: 60,
  timezone: "UTC (preview)",
};
