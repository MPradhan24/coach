import { getState } from '../lib/store.js';
import { EXERCISES } from '../data/exercises.js';
import { WORKOUTS, ROTATION, WARMUPS } from '../data/program.js';
import { history, describeSets } from '../lib/progression.js';
import { nextWorkoutType } from '../lib/schedule.js';
import { esc, fmtDate, DAY_NAMES } from '../lib/util.js';
import { exFigure, exDetail, openSheet } from './common.js';
import { startWorkout } from './workout.js';

const GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Mobility', 'Stretch'];
let filter = 'Chest';

export function render() {
  const s = getState();
  const next = nextWorkoutType(s);
  const days = s.profile.trainDays.map((d) => DAY_NAMES[d]);
  return `
  <h1>Workouts</h1>
  <p class="muted">Upper/Lower split, 4× a week (${days.join(' · ')}). Workouts go in order. If you miss a day, just do the next one in line.</p>

  ${ROTATION.map((id) => {
    const w = WORKOUTS[id];
    return `<details class="card" ${id === next ? 'open' : ''}>
      <summary class="row between" style="cursor:pointer;list-style:none">
        <div><h2 style="margin:0">${w.name} ${id === next ? '<span class="pill accent">up next</span>' : ''}</h2><small class="muted">${w.focus}</small></div><span class="muted">▾</span>
      </summary>
      <div class="list mt-s">
        <div><span class="pill">5 min</span><span class="grow muted">Warm-up: ${WARMUPS[w.zone].map((x) => EXERCISES[x.ex].name).slice(0, 4).join(', ')}…</span></div>
        ${w.main.map((rx) => {
          const e = EXERCISES[rx.ex];
          return `<a href="#" data-act="lib-ex" data-ex="${rx.ex}">${exFigure(rx.ex, 'exthumb')}
            <span class="grow"><b>${esc(e.name)}</b><br><small class="muted">${rx.sets} × ${rx.reps[0]}–${rx.reps[1]}${e.type === 'time' ? 's' : ''}${e.perSide ? ' / side' : ''}</small></span></a>`;
        }).join('')}
        <div><span class="pill accent">Finisher</span><span class="grow muted">${esc(w.finisher.name)}</span></div>
      </div>
      <button class="btn btn-primary btn-block mt-s" data-act="plan-start" data-type="${id}">Start ${w.name}</button>
    </details>`;
  }).join('')}

  <div class="section-title">Exercise library</div>
  <div class="chips">${GROUPS.map((g) => `<button class="chip ${g === filter ? 'on' : ''}" data-act="lib-filter" data-g="${g}">${g}</button>`).join('')}</div>
  <div class="card list mt-s">${Object.entries(EXERCISES).filter(([, e]) => e.group === filter).map(([id, e]) => `
    <a href="#" data-act="lib-ex" data-ex="${id}">${exFigure(id, 'exthumb')}<span class="grow"><b>${esc(e.name)}</b><br><small class="muted">${esc(e.muscles || e.cues[0])}</small></span></a>`).join('')}
  </div>`;
}

export const actions = {
  'lib-filter'(el) { filter = el.dataset.g; },
  'lib-ex'(el, ev) {
    ev.preventDefault();
    const id = el.dataset.ex, e = EXERCISES[id];
    const h = history(getState(), id).slice(0, 6);
    openSheet(e.name, exDetail(id) + (h.length ? `<h3 class="mt">Your history</h3><div class="list">${h.map((x) =>
      `<div><span class="muted" style="width:60px">${fmtDate(x.date)}</span><span class="grow num">${esc(describeSets(e, x.sets))}</span></div>`).join('')}</div>` : ''));
    return false;
  },
  'plan-start'(el) {
    if (getState().active && !confirm('You have a workout in progress. Replace it?')) return false;
    startWorkout(el.dataset.type);
    return false;
  },
};
