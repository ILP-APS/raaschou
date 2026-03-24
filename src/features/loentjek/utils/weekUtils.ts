import { startOfWeek, endOfWeek, addWeeks, getISOWeek, getISOWeekYear, format, addDays } from "date-fns";
import { da } from "date-fns/locale";

export interface WeekRange {
  start: Date;
  end: Date;
  weekNumber: number;
  year: number;
}

export const DEFAULT_SCHEDULE = {
  monday: 7.5,
  tuesday: 7.5,
  wednesday: 7.5,
  thursday: 7.5,
  friday: 7.0,
  saturday: 0,
  sunday: 0,
};

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export function getCurrentWeekRange(): WeekRange {
  return getWeekRangeFromDate(new Date());
}

export function getWeekRangeFromDate(date: Date): WeekRange {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return {
    start,
    end,
    weekNumber: getISOWeek(date),
    year: getISOWeekYear(date),
  };
}

export function shiftWeek(current: WeekRange, direction: number): WeekRange {
  const shifted = addWeeks(current.start, direction);
  return getWeekRangeFromDate(shifted);
}

export function getWeekDays(weekRange: WeekRange): Date[] {
  // Return Mon-Fri
  return Array.from({ length: 5 }, (_, i) => addDays(weekRange.start, i));
}

export function formatWeekLabel(weekRange: WeekRange): string {
  const start = format(weekRange.start, "d. MMM", { locale: da });
  const end = format(addDays(weekRange.start, 4), "d. MMM yyyy", { locale: da });
  return `Uge ${weekRange.weekNumber} · ${start} – ${end}`;
}

export function formatDateStr(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDayHeader(date: Date): string {
  return format(date, "EEEE d. MMMM", { locale: da });
}

export function getExpectedHours(
  dayOfWeek: number,
  schedule?: Record<string, number | null>
): number {
  const key = DAY_KEYS[dayOfWeek];
  if (schedule && key in schedule && schedule[key] != null) {
    return schedule[key] as number;
  }
  return (DEFAULT_SCHEDULE as any)[key] ?? 0;
}

export type DayCellStatus = "ok" | "missing" | "partial" | "no-work" | "absence";

export function getDayCellStatus(
  registered: number,
  expected: number,
  hasAbsence: boolean
): DayCellStatus {
  if (expected === 0) return "no-work";
  if (hasAbsence) return "absence";
  if (registered === 0) return "missing";
  if (registered >= expected) return "ok";
  return "partial";
}
