import { isRechargeWeek, programWeek } from './schedule.js';
import { today, addDays, avg, round, diffDays } from './util.js';

export const ACTIVITY = [
  { id: 1.375, label: 'Desk job / mostly sitting' },
  { id: 1.45, label: 'On my feet some of the day' },
  { id: 1.55, label: 'Active job / lots of walking' },
];

export const WEEKLY_LOSS = 0.0085; // ~0.75–1 % of body weight per week

export function currentWeight(state) {
  const recent = state.weighIns.filter((w) => w.date > addDays(today(), -7)).map((w) => w.kg);
  return avg(recent) ?? state.weighIns.at(-1)?.kg ?? state.profile.startWeight;
}

export function bmr(p, kg) {
  return 10 * kg + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'female' ? -161 : 5);
}

export function targets(state, date = today()) {
  const p = state.profile;
  const kg = currentWeight(state);
  const base = bmr(p, kg);
  const tdee = base * p.activity;
  const floor = Math.max(p.sex === 'female' ? 1200 : 1500, base);
  const recharge = isRechargeWeek(p, date);
  const kcal = recharge ? round(tdee, 50) : round(Math.max(floor, tdee * 0.75 + (state.calAdjust || 0)), 50);
  return {
    kcal, tdee: round(tdee, 50), bmr: Math.round(base), floor: round(floor, 50), recharge,
    protein: round(2 * p.goalWeight, 5),
    water: Math.min(4, Math.max(2.5, round(kg * 0.035, 0.25))),
    steps: 9000,
    weeklyLoss: [round(kg * 0.0075, 0.1), round(kg * 0.01, 0.1)],
  };
}

// Projected weight on a given day at the target rate, used for the "plan vs actual" line.
export const projected = (p, date) => p.startWeight * (1 - WEEKLY_LOSS) ** (diffDays(date, p.startDate) / 7);

// Average weight per program week (only weeks with data).
export function weeklyAverages(state) {
  const by = {};
  for (const w of state.weighIns) {
    const wk = programWeek(state.profile, w.date);
    (by[wk] ||= []).push(w.kg);
  }
  return Object.entries(by).map(([wk, kgs]) => ({ week: +wk, kg: avg(kgs) })).sort((a, b) => a.week - b.week);
}

// Coach feedback on the trend. Ignores weeks 1–2 (water weight swings).
export function trendAdvice(state) {
  const wa = weeklyAverages(state).filter((w) => w.week < programWeek(state.profile));
  if (wa.length < 3 || wa.at(-1).week < 3) return null;
  const [a, b, c] = wa.slice(-3);
  const r1 = (a.kg - b.kg) / a.kg, r2 = (b.kg - c.kg) / b.kg;
  if (r1 > 0.012 && r2 > 0.012) {
    return { kind: 'fast', delta: 150, text: 'You\'ve lost more than 1.2 % per week for 2 weeks. Great, but too fast risks muscle and burnout. Add 150 kcal (one chapati + curd).' };
  }
  if (r1 < 0.0025 && r2 < 0.0025) {
    return { kind: 'stall', delta: -150, text: 'Weight has been flat for 2 weeks. First check: are you logging honestly and hitting your steps? If yes, cut 150 kcal or add 2,000 steps a day.' };
  }
  return { kind: 'ok', text: 'You\'re losing at a healthy pace. Don\'t change anything.' };
}
