import { ROTATION, WORKOUTS, RECHARGE_WEEK, PROGRAM_WEEKS } from '../data/program.js';
import { today, addDays, diffDays, dow, mondayOf } from './util.js';

// train = lifting day · active = walk/skip day · rest = full rest
export function dayKind(profile, date) {
  const d = dow(date);
  if (profile.trainDays.includes(d)) return 'train';
  if (d === profile.restDay) return 'rest';
  return 'active';
}

export const finished = (state) => state.sessions.filter((s) => s.finishedAt);
export const finishedWorkouts = (state) => finished(state).filter((s) => WORKOUTS[s.type]);

// Next workout continues the A/B rotation from the last one done, whatever day it was.
export function nextWorkoutType(state) {
  const done = finishedWorkouts(state);
  if (!done.length) return ROTATION[0];
  const last = done[done.length - 1].type;
  return ROTATION[(ROTATION.indexOf(last) + 1) % ROTATION.length];
}

export const sessionsOn = (state, date) => finished(state).filter((s) => s.date === date);

export function programDay(profile, date = today()) {
  return Math.max(1, diffDays(date, profile.startDate) + 1);
}
export function programWeek(profile, date = today()) {
  return Math.ceil(programDay(profile, date) / 7);
}
export const isRechargeWeek = (profile, date = today()) => programWeek(profile, date) === RECHARGE_WEEK;
export const programTotalDays = PROGRAM_WEEKS * 7;

// Monday-to-Sunday dates of the week containing `date`.
export function weekDates(date = today()) {
  const mon = mondayOf(date);
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}
