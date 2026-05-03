export const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const MechanicStatus = {
  AVAILABLE: "AVAILABLE",
  BUSY: "BUSY",
} as const;

export type MechanicStatus = (typeof MechanicStatus)[keyof typeof MechanicStatus];

export const UserRole = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
