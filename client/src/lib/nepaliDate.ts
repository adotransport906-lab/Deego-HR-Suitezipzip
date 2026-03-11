import { NEPALI_MONTHS } from "./constants";

export interface NepaliDate {
  year: number;
  month: number;
  day: number;
  dayOfWeek: string;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Comprehensive Nepali calendar data (2080-2090 B.S.)
// Format: days in each month for each year
const NEPALI_CALENDAR: Record<number, number[]> = {
  2080: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
  2081: [31, 31, 31, 32, 31, 30, 30, 30, 29, 30, 30, 31],
  2082: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
  2083: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 31],
  2084: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
  2085: [31, 31, 31, 32, 31, 30, 30, 30, 29, 30, 30, 31],
  2086: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
  2087: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 31],
  2088: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
  2089: [31, 31, 31, 32, 31, 30, 30, 30, 29, 30, 30, 31],
  2090: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
  2091: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 31],
  2092: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
  2093: [31, 31, 31, 32, 31, 30, 30, 30, 29, 30, 30, 31],
  2094: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
  2095: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 31],
  2096: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
  2097: [31, 31, 31, 32, 31, 30, 30, 30, 29, 30, 30, 31],
  2098: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
  2099: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 31],
  2100: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
  2101: [31, 31, 31, 32, 31, 30, 30, 30, 29, 30, 30, 31],
  2102: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
  2103: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 31],
  2104: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
  2105: [31, 31, 31, 32, 31, 30, 30, 30, 29, 30, 30, 31],
  2106: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
  2107: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 31],
  2108: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
  2109: [31, 31, 31, 32, 31, 30, 30, 30, 29, 30, 30, 31],
  2110: [31, 31, 31, 31, 31, 30, 29, 30, 29, 30, 31, 31],
};

// Reference point: 2082-01-01 (Nepali) = 2025-04-13 (Gregorian)
const REFERENCE_DATE_BS = { year: 2082, month: 1, day: 1 };
const REFERENCE_DATE_AD = new Date(2025, 3, 13); // April 13, 2025 UTC

function getDaysInMonth(year: number, month: number): number {
  if (NEPALI_CALENDAR[year]?.[month - 1]) {
    return NEPALI_CALENDAR[year][month - 1];
  }
  // Fallback
  if (month === 6 || month === 8 || month === 10) return 30;
  if (month === 9) return 29;
  if (month === 12) return 32;
  return 31;
}

function getTotalDaysInYear(year: number): number {
  if (NEPALI_CALENDAR[year]) {
    return NEPALI_CALENDAR[year].reduce((sum, days) => sum + days, 0);
  }
  return 365;
}

function gregorianToBikramSambat(gregorianDate: Date): NepaliDate {
  // Create a copy and normalize to midnight UTC
  const date = new Date(gregorianDate.getFullYear(), gregorianDate.getMonth(), gregorianDate.getDate());

  // Calculate days difference from reference point
  const timeDiff = date.getTime() - REFERENCE_DATE_AD.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  let year = REFERENCE_DATE_BS.year;
  let month = REFERENCE_DATE_BS.month;
  let day = REFERENCE_DATE_BS.day;
  let remainingDays = daysDiff;

  if (remainingDays === 0) {
    return { year, month, day, dayOfWeek: DAYS_OF_WEEK[date.getDay()] };
  }

  if (remainingDays > 0) {
    // Move forward
    while (remainingDays > 0) {
      const daysInMonth = getDaysInMonth(year, month);
      const daysLeftInMonth = daysInMonth - day;

      if (remainingDays >= daysLeftInMonth) {
        remainingDays -= daysLeftInMonth + 1;
        day = 1;
        month++;
        if (month > 12) {
          month = 1;
          year++;
        }
      } else {
        day += remainingDays;
        remainingDays = 0;
      }
    }
  } else {
    // Move backward
    remainingDays = -remainingDays;
    while (remainingDays > 0) {
      if (remainingDays >= day) {
        remainingDays -= day;
        month--;
        if (month < 1) {
          month = 12;
          year--;
        }
        day = getDaysInMonth(year, month);
      } else {
        day -= remainingDays;
        remainingDays = 0;
      }
    }
  }

  // Calculate day of week in Nepali calendar
  let weekDayOffset = 3; // April 13, 2025 is Wednesday (3)
  let totalDays = 0;

  // Count days from reference to target date
  let tempYear = REFERENCE_DATE_BS.year;
  let tempMonth = REFERENCE_DATE_BS.month;
  let tempDay = REFERENCE_DATE_BS.day;

  while (tempYear < year || (tempYear === year && tempMonth < month) || (tempYear === year && tempMonth === month && tempDay < day)) {
    totalDays++;
    tempDay++;
    if (tempDay > getDaysInMonth(tempYear, tempMonth)) {
      tempDay = 1;
      tempMonth++;
      if (tempMonth > 12) {
        tempMonth = 1;
        tempYear++;
      }
    }
  }

  const dayOfWeekIndex = (weekDayOffset + totalDays) % 7;
  const dayOfWeek = DAYS_OF_WEEK[dayOfWeekIndex];

  return { year, month, day, dayOfWeek };
}

export function getCurrentNepaliDate(): NepaliDate {
  const now = new Date();
  // Use Nepal Time (UTC+5:45)
  const nepaliTime = new Date(now.getTime() + (5.75 * 60 * 60 * 1000));
  return gregorianToBikramSambat(nepaliTime);
}

export function getNepaliDate(gregorianDate: Date): NepaliDate {
  return gregorianToBikramSambat(gregorianDate);
}

export function formatNepaliDate(nepaliDate: NepaliDate): string {
  const monthName = NEPALI_MONTHS.find(m => m.value === nepaliDate.month)?.label || "Unknown";
  return `${nepaliDate.dayOfWeek}, ${nepaliDate.day} ${monthName} ${nepaliDate.year} BS`;
}

export function getDaysInNepaliMonth(year: number, month: number): number {
  return getDaysInMonth(year, month);
}

export function getMonthStartDayOfWeek(year: number, month: number): number {
  // Get the day of week for the 1st of the month
  const firstDay = gregorianToBikramSambat(new Date()); // Get any date
  
  // Calculate for the 1st of the month
  let tempYear = REFERENCE_DATE_BS.year;
  let tempMonth = REFERENCE_DATE_BS.month;
  let tempDay = REFERENCE_DATE_BS.day;

  let weekDayOffset = 3; // Wednesday (reference point)
  let totalDays = 0;

  while (tempYear < year || (tempYear === year && tempMonth < month) || (tempYear === year && tempMonth === month && tempDay < 1)) {
    totalDays++;
    tempDay++;
    if (tempDay > getDaysInMonth(tempYear, tempMonth)) {
      tempDay = 1;
      tempMonth++;
      if (tempMonth > 12) {
        tempMonth = 1;
        tempYear++;
      }
    }
  }

  return (weekDayOffset + totalDays) % 7;
}
