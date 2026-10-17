import { dayKind, sessionsOn, finishedWorkouts, weekDates } from './schedule.js';
import { today, addDays } from './util.js';

// done · missed · rest · pending (today, not yet done) · future · before (before the start date)
export function dayStatus(state, date) {
  const { profile } = state;
  if (date < profile.startDate) return 'before';
  if (sessionsOn(state, date).length) return 'done';
  const t = today();
  if (date > t) return 'future';
  if (dayKind(profile, date) === 'rest') return 'rest';
  return date === t ? 'pending' : 'missed';
}

// "Never miss twice": one missed day is forgiven; two missed in a row (rest days
// don't count either way) ends the streak. The streak counts done days.
export function streakInfo(state) {
  const t = today();
  let count = 0, misses = 0, d = t;
  while (d >= state.profile.startDate) {
    const st = dayStatus(state, d);
    if (st === 'done') { count++; misses = 0; }
    else if (st === 'missed') { if (++misses >= 2) break; }
    d = addDays(d, -1);
  }
  // At risk: the most recent scheduled day before today was missed.
  let prev = addDays(t, -1);
  while (prev >= state.profile.startDate && dayStatus(state, prev) === 'rest') prev = addDays(prev, -1);
  const atRisk = prev >= state.profile.startDate && dayStatus(state, prev) === 'missed';
  return { count, atRisk, best: Math.max(count, bestStreak(state)) };
}

function bestStreak(state) {
  let best = 0, count = 0, misses = 0;
  for (let d = state.profile.startDate; d <= today(); d = addDays(d, 1)) {
    const st = dayStatus(state, d);
    if (st === 'done') { count++; misses = 0; best = Math.max(best, count); }
    else if (st === 'missed' && ++misses >= 2) { count = 0; misses = 0; }
  }
  return best;
}

export function weekScore(state, date = today()) {
  const days = weekDates(date);
  const done = finishedWorkouts(state).filter((s) => days.includes(s.date)).length;
  return { done, goal: state.profile.trainDays.length };
}

export const activeDays = (state) => new Set(state.sessions.filter((s) => s.finishedAt).map((s) => s.date)).size;
