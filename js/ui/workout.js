import { getState, update, save } from '../lib/store.js';
import { EXERCISES } from '../data/exercises.js';
import { WORKOUTS, WARMUPS, COOLDOWNS } from '../data/program.js';
import { suggest, personalBests, e1rm, describeSets } from '../lib/progression.js';
import { isRechargeWeek } from '../lib/schedule.js';
import { streakInfo } from '../lib/streaks.js';
import { newMilestones } from '../lib/milestones.js';
import { quoteFor } from '../data/quotes.js';
import { startRest, stopRest, addRest, intervalTimer, fmtSec, keepAwake } from '../lib/timer.js';
import { today, esc, uid } from '../lib/util.js';
import { exFigure, exDetail, openSheet, closeSheet, toast, check } from './common.js';

const MINI_LIFTS = 3, MINI_SETS = 2;

export function startWorkout(type, mini = false) {
  update((s) => {
    s.active = { id: uid(), type, mini, date: today(), startedAt: Date.now(), step: 0, sets: {}, swaps: {}, checks: {}, finisherDone: false };
  });
  location.hash = '#/workout';
}

// The ordered list of screens for this workout.
function plan(a) {
  const w = WORKOUTS[a.type];
  const main = a.mini ? w.main.slice(0, MINI_LIFTS) : w.main;
  const warm = a.mini ? WARMUPS[w.zone].slice(0, 4) : WARMUPS[w.zone];
  const cool = a.mini ? COOLDOWNS[w.zone].slice(0, 3) : COOLDOWNS[w.zone];
  return [
    { kind: 'warmup', items: warm },
    ...main.map((rx) => ({ kind: 'lift', rx, exId: a.swaps[rx.ex] || rx.ex })),
    ...(a.mini ? [] : [{ kind: 'finisher', fin: w.finisher }]),
    { kind: 'cooldown', items: cool },
  ];
}

const rxText = (e, rx, n) => `${n} × ${rx.reps[0]}–${rx.reps[1]}${e.type === 'time' ? ' sec' : ' reps'}${e.perSide ? ' / side' : ''}`;

function ensureSets(s, a, step) {
  if (a.sets[step.exId]) return;
  const recharge = isRechargeWeek(s.profile);
  const sug = suggest(s, step.exId, step.rx, { recharge, setCount: a.mini ? MINI_SETS : undefined });
  a.sets[step.exId] = sug.sets.map((x) => ({ ...x, done: false }));
  save();
}

export function render() {
  const s = getState(), a = s.active;
  if (!a) { location.hash = '#/today'; return ''; }
  const steps = plan(a);
  a.step = Math.min(a.step, steps.length - 1);
  const step = steps[a.step];
  const w = WORKOUTS[a.type];
  const last = a.step === steps.length - 1;
  const nextLabel = last ? 'Finish workout 🎉' : steps[a.step + 1].kind === 'lift' ? 'Next exercise →' : steps[a.step + 1].kind === 'finisher' ? 'Finisher →' : 'Cool-down →';

  let body = '';
  if (step.kind === 'warmup' || step.kind === 'cooldown') body = checklistStep(a, step);
  else if (step.kind === 'finisher') body = finisherStep(a, step.fin);
  else { ensureSets(s, a, step); body = liftStep(s, a, step); }

  return `
  <div class="player-top">
    <button class="x" data-act="wo-exit" aria-label="Exit">×</button>
    <div class="grow"><b>${w.name}${a.mini ? ' · mini' : ''}</b><br><small class="muted">${a.step + 1} of ${steps.length} · started ${new Date(a.startedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small></div>
    ${isRechargeWeek(s.profile) ? '<span class="pill good">🔋 Recharge</span>' : ''}
  </div>
  <div class="steps">${steps.map((_, i) => `<i class="${i < a.step ? 'done' : i === a.step ? 'on' : ''}"></i>`).join('')}</div>
  ${body}
  <div class="navbtns">
    <button class="btn-ghost" data-act="wo-prev" ${a.step === 0 ? 'disabled' : ''}>← Back</button>
    <button class="btn-primary" data-act="wo-next">${nextLabel}</button>
  </div>`;
}

function checklistStep(a, step) {
  const key = step.kind;
  const done = a.checks[key] || {};
  const title = key === 'warmup' ? 'Warm-up' : 'Cool-down';
  const intro = key === 'warmup' ? 'Gets blood into the joints so you lift more and don\'t get hurt. ~5 min.' : 'Hold each stretch, breathe slowly. ~3 min. This is also where you calm down.';
  return `<h1>${title}</h1><p class="muted">${intro}</p>
    <div class="card list">${step.items.map((it, i) => {
      const e = EXERCISES[it.ex];
      return `<div>${exFigure(it.ex, 'exthumb')}
        <div class="grow"><button class="link" style="color:var(--text);text-align:left" data-act="ex-info" data-ex="${it.ex}">${esc(e.name)}</button><br><small class="muted">${esc(it.dose)}</small></div>
        <button class="tick btn-sm ${done[i] ? 'btn-primary' : 'btn-ghost'}" data-act="wo-check" data-key="${key}" data-i="${i}" aria-label="Done">${done[i] ? '✓' : '○'}</button></div>`;
    }).join('')}</div>`;
}

function liftStep(s, a, step) {
  const e = EXERCISES[step.exId];
  const sets = a.sets[step.exId];
  const sug = suggest(s, step.exId, step.rx, { recharge: isRechargeWeek(s.profile), setCount: sets.length });
  const swapped = step.exId !== step.rx.ex;
  const col2 = e.type === 'weight' ? 'kg' : e.bands ? 'band' : '';
  const col3 = e.type === 'time' ? 'sec' : 'reps';
  const rows = sets.map((x, i) => {
    let c2;
    if (e.type === 'weight') c2 = `<input type="number" inputmode="decimal" step="0.5" min="0" max="50" value="${x.w ?? ''}" data-change="set-val" data-i="${i}" data-f="w" aria-label="Set ${i + 1} kg">`;
    else if (e.bands) c2 = `<select data-change="set-val" data-i="${i}" data-f="b" aria-label="Set ${i + 1} band">${e.bands.map((b, bi) => `<option value="${bi}" ${+x.b === bi ? 'selected' : ''}>${esc(b.replace(' band', ''))}</option>`).join('')}</select>`;
    else c2 = '<span class="muted center">body</span>';
    return `<div class="set ${x.done ? 'done' : ''}"><span class="n">${i + 1}</span>${c2}
      <input type="number" inputmode="numeric" min="0" max="999" value="${x.r ?? ''}" data-change="set-val" data-i="${i}" data-f="r" aria-label="Set ${i + 1} ${col3}">
      <button class="tick" data-act="set-done" data-i="${i}" aria-label="Set ${i + 1} done">${x.done ? '✓' : ''}</button></div>`;
  }).join('');
  return `
    ${exFigure(step.exId)}
    ${e.imgNote ? `<p class="imgnote">ℹ️ ${esc(e.imgNote)}</p>` : ''}
    <div class="row between mt-s"><h1 style="margin:0">${esc(e.name)}</h1></div>
    <p class="muted">${esc(e.muscles)} · <b>${rxText(e, step.rx, sets.length)}</b> · rest ${e.rest}s ${swapped ? '<span class="pill">swapped</span>' : ''}</p>
    <div class="coachnote">${sug.last ? `<b>Last time:</b> ${esc(sug.last)}<br>` : ''}${esc(sug.note)}</div>
    <div class="card mt">
      <div class="set head"><span class="center">Set</span><span class="center">${col2}</span><span class="center">${col3}</span><span></span></div>
      ${rows}
      <div class="row between mt"><button class="link" data-act="set-add">+ Add set</button>${sets.length > 1 ? '<button class="link" style="color:var(--muted)" data-act="set-remove">− Remove set</button>' : ''}</div>
    </div>
    <div class="row mt">
      <button class="btn btn-ghost grow" data-act="ex-info" data-ex="${step.exId}">📖 Form tips</button>
      <button class="btn btn-ghost grow" data-act="wo-swap">🔄 Swap</button>
    </div>`;
}

// ── Finisher (interval timer) ──
let iv = null;
function finisherStep(a, fin) {
  const total = fin.rounds * fin.steps.reduce((t, x) => t + x.sec, 0);
  const moves = [...new Set(fin.steps.filter((x) => x.ex).map((x) => x.ex))];
  return `<h1>Finisher: ${esc(fin.name)}</h1><p class="muted">${esc(fin.note)} About ${Math.round(total / 60)} min.</p>
    <div class="card interval" id="iv">
      <div class="interval-label" id="iv-label">${a.finisherDone ? 'Done ✓' : 'Ready?'}</div>
      <div class="bigtimer" id="iv-time">${fmtSec(fin.steps[0].sec)}</div>
      <div class="center muted" id="iv-round">${fin.rounds} rounds · ${fin.steps.map((x) => `${x.sec}s ${x.ex ? x.label.toLowerCase() : 'rest'}`).join(' / ')}</div>
      <div class="row mt"><button class="btn btn-primary grow" id="iv-btn" data-act="iv-toggle">${iv ? (iv.paused ? '▶ Resume' : '⏸ Pause') : '▶ Start'}</button>
      ${iv ? '<button class="btn btn-ghost" data-act="iv-stop">Stop</button>' : ''}</div>
    </div>
    <div class="card list mt">${moves.map((id) => `<div>${exFigure(id, 'exthumb')}<div class="grow"><button class="link" style="color:var(--text)" data-act="ex-info" data-ex="${id}">${esc(EXERCISES[id].name)}</button></div></div>`).join('')}</div>
    <div class="mt">${check('fin-done', a.finisherDone, 'I did the finisher')}</div>`;
}

function onIntervalTick(t) {
  const label = document.getElementById('iv-label');
  if (!label) return;
  const box = document.getElementById('iv');
  if (t.done) {
    iv = null;
    update((s) => { s.active.finisherDone = true; });
    rerender();
    toast('Finisher done. Beast mode 🔥');
    return;
  }
  box.classList.toggle('work', !!t.ex);
  box.classList.toggle('rest', !t.ex);
  label.textContent = t.label;
  document.getElementById('iv-time').textContent = fmtSec(t.left);
  document.getElementById('iv-round').textContent = `Round ${t.round} · ${t.idx + 1}/${t.total}`;
}

function rerender() { document.dispatchEvent(new Event('coach:render')); }

export function unmount() {
  iv?.stop(); iv = null;
  keepAwake(false);
}
export function mount() { keepAwake(true); }

// ── Finish ──
function finish() {
  const s = getState(), a = s.active;
  const before = personalBests(s);
  const sets = {};
  for (const [id, xs] of Object.entries(a.sets)) {
    const done = xs.filter((x) => x.done);
    if (done.length) sets[id] = done;
  }
  const doneCount = Object.values(sets).reduce((n, xs) => n + xs.length, 0);
  if (!doneCount && !confirm('No sets ticked off. Finish anyway?')) return false;
  const session = { id: a.id, date: a.date, type: a.type, mini: a.mini, startedAt: a.startedAt, finishedAt: Date.now(), sets, swaps: a.swaps, finisher: a.finisherDone };
  const prs = [];
  for (const [id, xs] of Object.entries(sets)) {
    const e = EXERCISES[id];
    if (e.type !== 'weight' || !before[id]) continue;
    const top = Math.max(...xs.map((x) => e1rm(x.w, x.r)));
    if (top > before[id].score + 0.01) prs.push({ id, text: describeSets(e, xs) });
  }
  let fresh = [];
  update((st) => {
    st.sessions.push(session);
    st.active = null;
    fresh = newMilestones(st);
  });
  stopRest();
  lastSummary = { session, prs, fresh, doneCount };
  location.hash = '#/done';
  return false;
}

let lastSummary = null;
export function renderDone() {
  const s = getState();
  if (!lastSummary) { location.hash = '#/today'; return ''; }
  const { session, prs, fresh, doneCount } = lastSummary;
  const mins = Math.max(1, Math.round((session.finishedAt - session.startedAt) / 60000));
  const st = streakInfo(s);
  return `<div class="center" style="padding-top:24px">
    <div class="confetti">🎉</div>
    <h1>Workout done!</h1>
    <p class="muted">${esc(WORKOUTS[session.type].name)}${session.mini ? ' (mini)' : ''} · ${mins} min · ${doneCount} sets</p>
  </div>
  <div class="card hero mt center"><small>Streak</small><h1 style="color:#fff;font-size:2.6rem;margin:0">🔥 ${st.count}</h1><small>Best: ${st.best} days</small></div>
  ${prs.length ? `<div class="card good"><h3>📈 New personal bests</h3>${prs.map((p) => `<p><b>${esc(EXERCISES[p.id].name)}</b>: ${esc(p.text)}</p>`).join('')}</div>` : ''}
  ${fresh.length ? `<div class="card"><h3>🏅 Unlocked</h3><div class="badges">${fresh.map((m) => `<div class="badge"><b>${m.emoji}</b>${esc(m.label)}</div>`).join('')}</div></div>` : ''}
  <div class="card soft"><h3>Next 60 minutes</h3><p>🥤 Have your shake (whey + milk + ½ banana + berries).<br>💧 Big glass of water.<br>🍽️ Next meal: protein first.</p></div>
  <div class="card"><p class="quote">${esc(quoteFor(session.date))}</p></div>
  <a class="btn btn-primary btn-big mt" href="#/today">Back to Today</a>`;
}

export const actions = {
  'wo-exit'() { location.hash = '#/today'; return false; },
  'wo-prev'() { update((s) => { s.active.step--; }); scrollTo(0, 0); },
  'wo-next'() {
    const a = getState().active;
    const steps = plan(a);
    if (a.step >= steps.length - 1) return finish();
    iv?.stop(); iv = null;
    update((s) => { s.active.step++; });
    scrollTo(0, 0);
  },
  'wo-check'(el) {
    const { key, i } = el.dataset;
    update((s) => { const c = (s.active.checks[key] ||= {}); c[i] = !c[i]; });
  },
  'set-done'(el) {
    const s = getState(), a = s.active, step = plan(a)[a.step];
    const i = +el.dataset.i, set = a.sets[step.exId][i];
    set.done = !set.done;
    save();
    if (set.done) {
      const all = a.sets[step.exId].every((x) => x.done);
      const e = EXERCISES[step.exId];
      if (!all) startRest(e.rest, `Rest · next: set ${i + 2}`);
      else { startRest(Math.min(e.rest, 60), 'Exercise done ✓ · move on'); }
    }
  },
  'set-add'() {
    const a = getState().active, step = plan(a)[a.step];
    const xs = a.sets[step.exId];
    xs.push({ ...xs[xs.length - 1], done: false });
    save();
  },
  'set-remove'() {
    const a = getState().active, step = plan(a)[a.step];
    a.sets[step.exId].pop();
    save();
  },
  'wo-swap'() {
    const a = getState().active, step = plan(a)[a.step];
    const opts = [step.rx.ex, ...(EXERCISES[step.rx.ex].swaps || [])];
    openSheet('Swap exercise', `<p class="muted">Use a swap if something hurts, feels wrong, or you want variety. Progress is tracked separately for each exercise.</p>
      <div class="list">${opts.map((id) => `<button class="btn-block" style="background:none;justify-content:flex-start;text-align:left" data-act="swap-pick" data-ex="${id}">
        ${exFigure(id, 'exthumb')}<span class="grow"><b>${esc(EXERCISES[id].name)}</b>${id === step.rx.ex ? ' <span class="pill">original</span>' : ''}<br><small class="muted">${esc(EXERCISES[id].muscles || '')}</small></span>${id === step.exId ? '✓' : ''}</button>`).join('')}</div>`);
    return false;
  },
  'swap-pick'(el) {
    const a = getState().active, step = plan(a)[a.step];
    update((s) => {
      if (el.dataset.ex === step.rx.ex) delete s.active.swaps[step.rx.ex];
      else s.active.swaps[step.rx.ex] = el.dataset.ex;
    });
    closeSheet();
  },
  'ex-info'(el) { openSheet(EXERCISES[el.dataset.ex].name, exDetail(el.dataset.ex)); return false; },
  'rest-add'() { addRest(15); return false; },
  'rest-skip'() { stopRest(); return false; },
  'iv-toggle'() {
    const a = getState().active, fin = WORKOUTS[a.type].finisher;
    if (!iv) { iv = intervalTimer(fin.steps, fin.rounds, onIntervalTick); iv.start(); }
    else if (iv.paused) iv.resume();
    else iv.pause();
  },
  'iv-stop'() { iv?.stop(); iv = null; },
  'fin-done'() { update((s) => { s.active.finisherDone = !s.active.finisherDone; }); },
};

export const changes = {
  'set-val'(el) {
    const a = getState().active, step = plan(a)[a.step];
    const set = a.sets[step.exId][+el.dataset.i];
    const v = el.value === '' ? null : Number(el.value);
    set[el.dataset.f] = v;
    // Changing weight on set 1 carries down to the untouched sets below it.
    if (el.dataset.f === 'w' || el.dataset.f === 'b') {
      a.sets[step.exId].forEach((x, j) => { if (j > +el.dataset.i && !x.done) x[el.dataset.f] = v; });
    }
    save();
    return el.dataset.f !== 'r'; // re-render only when other rows changed
  },
};
