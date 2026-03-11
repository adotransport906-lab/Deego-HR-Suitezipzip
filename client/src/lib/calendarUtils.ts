import { getDaysInNepaliMonth, getMonthStartDayOfWeek } from "./nepaliDate";

export interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  dayOfWeek: string;
}

export function getMonthCalendar(year: number, month: number): CalendarDay[] {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysInMonth = getDaysInNepaliMonth(year, month);
  const startDay = getMonthStartDayOfWeek(year, month);
  
  const days: CalendarDay[] = [];

  // Add empty days for days before month starts
  for (let i = 0; i < startDay; i++) {
    days.push({
      day: 0,
      isCurrentMonth: false,
      dayOfWeek: DAYS[i]
    });
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      day,
      isCurrentMonth: true,
      dayOfWeek: DAYS[(startDay + day - 1) % 7]
    });
  }

  // Add empty days to fill the last week
  while (days.length % 7 !== 0) {
    days.push({
      day: 0,
      isCurrentMonth: false,
      dayOfWeek: DAYS[days.length % 7]
    });
  }

  return days;
}
