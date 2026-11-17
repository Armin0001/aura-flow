// Pomodoro rules for the focus timer.

export const MODE_SECONDS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

/** After a focus session comes a break (every fourth one a long break); after any break, focus again. */
export function nextMode(mode, completedFocusSessions) {
  if (mode !== 'work') return 'work';
  return completedFocusSessions % 4 === 0 ? 'longBreak' : 'shortBreak';
}

/** 1500 → "25:00". */
export function formatClock(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
