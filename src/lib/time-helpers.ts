import {
  addDays,
  addMinutes,
  isBefore,
  max as maxDate,
  min as minDate,
  startOfDay,
} from "date-fns";

export function parseHHmm(hm: string): { hours: number; minutes: number } {
  const [h, m] = hm.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) {
    throw new Error(`Invalid time: ${hm}`);
  }
  return { hours: h, minutes: m };
}

export function setDayTime(day: Date, hm: string): Date {
  const { hours, minutes } = parseHHmm(hm);
  const d = startOfDay(day);
  d.setUTCHours(hours, minutes, 0, 0);
  return d;
}

export function iterDays(from: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(startOfDay(from), i));
}

export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function clampSlotSearchStart(now: Date): Date {
  return now;
}

/** First instant we allow booking from (skip past times today). */
export function earliestCandidateStart(
  day: Date,
  open: Date,
  now: Date,
): Date {
  const dayStart = startOfDay(day);
  const todayStart = startOfDay(now);
  if (dayStart.getTime() === todayStart.getTime()) {
    return maxDate([open, now]);
  }
  return open;
}

export function buildSlotStarts(
  day: Date,
  openHm: string,
  closeHm: string,
  stepMinutes: number,
  serviceDurationMin: number,
  now: Date,
): Date[] {
  const open = setDayTime(day, openHm);
  const close = setDayTime(day, closeHm);
  if (!isBefore(open, close)) return [];

  const startFrom = earliestCandidateStart(day, open, now);
  const slots: Date[] = [];
  let cursor = open;
  while (addMinutes(cursor, serviceDurationMin) <= close) {
    const slotEnd = addMinutes(cursor, serviceDurationMin);
    if (!isBefore(cursor, startFrom)) {
      slots.push(cursor);
    }
    cursor = addMinutes(cursor, stepMinutes);
  }
  return slots;
}

export { addMinutes, minDate, maxDate, startOfDay, addDays, isBefore };
