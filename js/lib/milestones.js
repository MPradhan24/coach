import { finishedWorkouts, programWeek } from './schedule.js';
import { streakInfo, activeDays } from './streaks.js';
import { personalBests, history, e1rm } from './progression.js';
import { currentWeight } from './targets.js';
import { RECHARGE_WEEK } from '../data/program.js';

export function milestones(state) {
  const workouts = finishedWorkouts(state).length;
  const { best } = streakInfo(state);
  const days = activeDays(state);
  const lost = state.profile.startWeight - currentWeight(state);
  // Lifts where the best set beats the first session's best set.
  const pb = personalBests(state);
  const prs = Object.keys(pb).filter((id) => {
    const first = history(state, id).at(-1);
    return pb[id].score > Math.max(...first.sets.map((x) => e1rm(x.w, x.r))) + 0.01;
  }).length;
  const week = programWeek(state.profile);
  return [
    { id: 'first', emoji: '🌱', label: 'First workout', on: workouts >= 1 },
    { id: 's7', emoji: '🔥', label: '7-day streak', on: best >= 7 },
    { id: 'w10', emoji: '💪', label: '10 workouts', on: workouts >= 10 },
    { id: 's14', emoji: '⚡', label: '14-day streak', on: best >= 14 },
    { id: 'kg2', emoji: '📉', label: '−2 kg', on: lost >= 2 },
    { id: 'd31', emoji: '🏆', label: 'Beat your 1-month record', on: days >= 31 },
    { id: 'w25', emoji: '🦾', label: '25 workouts', on: workouts >= 25 },
    { id: 'pr5', emoji: '📈', label: 'Progress on 5 lifts', on: prs >= 5 },
    { id: 'recharge', emoji: '🔋', label: 'Reached recharge week', on: week >= RECHARGE_WEEK },
    { id: 'kg5', emoji: '🎯', label: '−5 kg', on: lost >= 5 },
    { id: 's30', emoji: '👑', label: '30-day streak', on: best >= 30 },
    { id: 'w48', emoji: '🏁', label: '12 weeks done', on: workouts >= 48 },
  ];
}

// Milestones unlocked since last check (marks them seen).
export function newMilestones(state) {
  const fresh = milestones(state).filter((m) => m.on && !state.seenMilestones.includes(m.id));
  state.seenMilestones.push(...fresh.map((m) => m.id));
  return fresh;
}
