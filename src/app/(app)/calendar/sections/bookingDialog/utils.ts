// src/app/(app)/calendar/sections/bookingDialog/utils.ts
import type { WeeklyAvailability } from "../Section6TrainerAvailability";

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

export function calcEnd(start: Date, duration: number) {
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + duration);
  return end;
}

export function addHours(d: Date, hours: number) {
  const x = new Date(d);
  x.setHours(x.getHours() + hours);
  return x;
}

export function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function addMonths(d: Date, months: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

export function ymd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function minutesToHHMM(min: number) {
  const hh = String(Math.floor(min / 60)).padStart(2, "0");
  const mm = String(min % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function hhmmToMinutes(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  return (hh || 0) * 60 + (mm || 0);
}

export function jsDayToKey(jsDay: number): keyof WeeklyAvailability {
  const map: Record<number, keyof WeeklyAvailability> = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
  };
  return map[jsDay];
}