import { describe, expect, it } from 'vitest';
import { MODE_SECONDS, formatClock, nextMode } from './focus.js';

describe('nextMode', () => {
  it('follows focus with a short break, and every fourth focus session with a long one', () => {
    expect([1, 2, 3, 4, 5, 8].map((sessions) => nextMode('work', sessions))).toEqual([
      'shortBreak', 'shortBreak', 'shortBreak', 'longBreak', 'shortBreak', 'longBreak',
    ]);
  });

  it('goes back to focus after any break', () => {
    expect(nextMode('shortBreak', 2)).toBe('work');
    expect(nextMode('longBreak', 4)).toBe('work');
  });
});

describe('formatClock', () => {
  it('pads minutes and seconds', () => {
    expect(formatClock(MODE_SECONDS.work)).toBe('25:00');
    expect(formatClock(65)).toBe('01:05');
    expect(formatClock(0)).toBe('00:00');
  });
});
