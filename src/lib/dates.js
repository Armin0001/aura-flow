// Due dates are stored as "YYYY-MM-DD" strings meaning a day on the user's calendar.
// new Date("2026-11-17") would read that as midnight UTC, which west of UTC is still the
// previous evening, so a task due today showed as "Overdue by 1d" in the Americas.
// Everything here works with local calendar days instead.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Formats a Date as the local "YYYY-MM-DD" day it falls on. */
export function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parses "YYYY-MM-DD" as local midnight on that day (not UTC midnight). */
export function parseLocalDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Whole calendar days from today until the due date: 0 means due today, negative means overdue.
 * Rounding (rather than Math.ceil) keeps daylight-saving days, which are 23 or 25 hours long, from
 * adding or losing a day.
 */
export function daysUntil(isoDate, today = new Date()) {
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((parseLocalDate(isoDate) - startOfToday) / MS_PER_DAY);
}

/** The due-date badge for a task, or null when it has no due date. */
export function dueDateBadge(isoDate, today = new Date()) {
  if (!isoDate) return null;
  const days = daysUntil(isoDate, today);
  if (days < 0) return { label: `Overdue by ${-days}d`, tone: 'overdue' };
  if (days === 0) return { label: 'Due Today', tone: 'today' };
  if (days === 1) return { label: 'Due Tomorrow', tone: 'tomorrow' };
  return { label: `Due in ${days}d`, tone: 'later' };
}

/**
 * The cells of a month view starting on Sunday: one null per blank cell before the 1st, then a
 * Date for each day of the month. `month` is 0-based, like Date#getMonth.
 */
export function buildMonthGrid(year, month) {
  const blanks = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: blanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
}
