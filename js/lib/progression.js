import { EXERCISES } from '../data/exercises.js';
import { finished } from './schedule.js';

// Most recent finished sessions that logged this exercise, newest first.
export function history(state, exId) {
  return finished(state)
    .filter((s) => s.sets?.[exId]?.some((x) => x.done))
    .map((s) => ({ date: s.date, sets: s.sets[exId].filter((x) => x.done) }))
    .reverse();
}

export function describeSets(e, sets) {
  if (!sets?.length) return '';
  if (e.type === 'weight') return `${sets[0].w} kg × ${sets.map((x) => x.r).join(', ')}`;
  if (e.type === 'time') return sets.map((x) => `${x.r}s`).join(', ');
  const band = e.bands && sets[0].b != null ? `${e.bands[sets[0].b]} · ` : '';
  return band + sets.map((x) => x.r).join(', ') + ' reps';
}

// Double progression: work inside the rep range; once every set reaches the top,
// move up (heavier dumbbell, harder band, less assistance) and restart at the bottom.
// Returns { sets: [{w, r, b}], note, last }.
export function suggest(state, exId, rx, { recharge = false, setCount } = {}) {
  const e = EXERCISES[exId];
  const [lo, hi] = rx.reps;
  const n = setCount ?? (recharge ? Math.max(2, rx.sets - 1) : rx.sets);
  const step = state.profile?.dbStep || 2;
  const prev = history(state, exId)[0];
  const lastText = prev ? describeSets(e, prev.sets) : '';
  const allTop = prev && prev.sets.length >= Math.min(n, rx.sets) && prev.sets.every((x) => x.r >= hi);
  const lastR = (i) => prev?.sets[Math.min(i, prev.sets.length - 1)]?.r;
  let note = '', w = null, b = null, reps;

  if (!prev) {
    reps = () => lo;
    note = e.type === 'weight' ? 'First time: choose a weight where you could do 2–3 more reps. Write it down, beat it next time.'
      : e.type === 'time' ? 'First time: hold with good form, stop before it gets ugly.'
      : 'First time: good form over big numbers.';
    if (e.type === 'weight') w = e.start;
    if (e.bands) b = 0;
  } else if (recharge) {
    w = prev.sets[0].w ?? null;
    b = prev.sets[0].b ?? (e.bands ? 0 : null);
    reps = () => lo;
    note = 'Recharge week: same weight, one less set, stop 3 reps before failure.';
  } else if (e.type === 'weight') {
    const lastW = prev.sets[0].w ?? e.start;
    if (allTop) {
      w = Math.min(25, lastW + step);
      reps = () => lo;
      note = `🎉 You hit ${hi} on every set last time. Go up to ${w} kg.`;
    } else {
      w = lastW;
      reps = (i) => Math.min(hi, (lastR(i) ?? lo - 1) + 1);
      note = 'Same weight. Beat last time by 1 rep per set.';
    }
  } else if (e.bands) {
    const lastB = prev.sets[0].b ?? 0;
    if (allTop && lastB < e.bands.length - 1) {
      b = lastB + 1;
      reps = () => lo;
      note = `🎉 Top of the range. Level up to: ${e.bands[b]}.`;
    } else {
      b = lastB;
      reps = (i) => allTop ? hi : Math.min(hi, (lastR(i) ?? lo - 1) + 1);
      note = allTop ? 'Hardest level already. Step further back or slow down to a 3-second lowering.' : 'Beat last time by 1 rep per set.';
    }
  } else if (e.type === 'time') {
    reps = (i) => Math.min(hi + 15, (lastR(i) ?? lo - 5) + 5);
    note = allTop ? 'Strong! Add 5 seconds or swap to a harder variation.' : 'Add 5 seconds to each hold.';
  } else {
    reps = (i) => (lastR(i) ?? lo - 1) + 1;
    note = allTop ? 'Top of the range. Slow the tempo or try the harder swap.' : 'Beat last time by 1 rep per set.';
  }

  return { sets: Array.from({ length: n }, (_, i) => ({ w, b, r: reps(i) })), note, last: lastText };
}

// Estimated 1-rep max (Epley) for PR tracking on weighted lifts.
export const e1rm = (w, r) => (w && r ? w * (1 + r / 30) : 0);

export function personalBests(state) {
  const best = {};
  for (const s of finished(state)) {
    for (const [exId, sets] of Object.entries(s.sets || {})) {
      const e = EXERCISES[exId];
      if (!e || e.type !== 'weight') continue;
      for (const x of sets) {
        if (!x.done) continue;
        const score = e1rm(x.w, x.r);
        if (!best[exId] || score > best[exId].score) best[exId] = { score, w: x.w, r: x.r, date: s.date };
      }
    }
  }
  return best;
}
