import { describe, expect, it } from 'vitest';
import { buildMonthGrid, daysUntil, dueDateBadge, parseLocalDate, toLocalDateString } from './dates.js';

// vitest.config.js runs these tests in America/New_York, west of UTC, where the old
// new Date("YYYY-MM-DD") parsing put every due date on the previous day.
describe('test environment', () => {
  it('runs west of UTC', () => {
    expect(new Date(2026, 0, 15).getTimezoneOffset()).toBe(300);
  });
});

describe('parseLocalDate', () => {
  it('reads "YYYY-MM-DD" as local midnight on that day', () => {
    const date = parseLocalDate('2026-11-17');
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2026, 10, 17, 0]);
  });

  it('round-trips with toLocalDateString', () => {
    expect(toLocalDateString(parseLocalDate('2028-02-29'))).toBe('2028-02-29');
  });
});

describe('dueDateBadge', () => {
  const morning = new Date(2026, 10, 17, 9, 30); // 17 Nov 2026, 09:30 local

  it('says a task due today is due today, even west of UTC', () => {
    expect(dueDateBadge('2026-11-17', morning)).toEqual({ label: 'Due Today', tone: 'today' });
  });

  it('is the same late in the evening, when UTC is already on the next day', () => {
    expect(dueDateBadge('2026-11-17', new Date(2026, 10, 17, 23, 30)).tone).toBe('today');
  });

  it('labels tomorrow, later days and overdue tasks', () => {
    expect(dueDateBadge('2026-11-18', morning)).toEqual({ label: 'Due Tomorrow', tone: 'tomorrow' });
    expect(dueDateBadge('2026-11-24', morning)).toEqual({ label: 'Due in 7d', tone: 'later' });
    expect(dueDateBadge('2026-11-14', morning)).toEqual({ label: 'Overdue by 3d', tone: 'overdue' });
  });

  it('returns null for a task without a due date', () => {
    expect(dueDateBadge('', morning)).toBeNull();
    expect(dueDateBadge(undefined, morning)).toBeNull();
  });
});

describe('daysUntil', () => {
  it('counts calendar days across the end of daylight saving time (a 25-hour day)', () => {
    // Clocks went back on 1 Nov 2026 in New York. Math.ceil on the raw hours made this 3.
    expect(daysUntil('2026-11-02', new Date(2026, 9, 31, 12, 0))).toBe(2);
  });

  it('counts calendar days across the start of daylight saving time (a 23-hour day)', () => {
    // Clocks went forward on 8 Mar 2026 in New York.
    expect(daysUntil('2026-03-09', new Date(2026, 2, 7, 12, 0))).toBe(2);
  });

  it('crosses month and year boundaries', () => {
    expect(daysUntil('2027-01-01', new Date(2026, 11, 31, 18, 0))).toBe(1);
  });
});

describe('buildMonthGrid', () => {
  it('starts with a blank cell for each weekday before the 1st', () => {
    // 1 May 2026 is a Friday, so Sunday to Thursday are blank.
    const grid = buildMonthGrid(2026, 4);
    expect(grid.slice(0, 5)).toEqual([null, null, null, null, null]);
    expect(toLocalDateString(grid[5])).toBe('2026-05-01');
    expect(grid).toHaveLength(5 + 31);
  });

  it('has no blanks for a month that starts on Sunday', () => {
    // 1 November 2026 is a Sunday.
    expect(buildMonthGrid(2026, 10)[0].getDate()).toBe(1);
  });

  it('knows February has 29 days in a leap year', () => {
    expect(buildMonthGrid(2028, 1).filter(Boolean)).toHaveLength(29);
    expect(buildMonthGrid(2026, 1).filter(Boolean)).toHaveLength(28);
  });
});
