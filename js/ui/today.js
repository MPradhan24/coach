import { getState, update } from '../lib/store.js';
import { WORKOUTS, ACTIVE_REST_OPTIONS } from '../data/program.js';
import { quoteFor, tipFor } from '../data/quotes.js';
import { dayKind, nextWorkoutType, sessionsOn, programDay, programWeek, programTotalDays, isRechargeWeek, weekDates } from '../lib/schedule.js';
import { streakInfo, dayStatus, weekScore } from '../lib/streaks.js';
import { targets, trendAdvice } from '../lib/targets.js';
import { today, fmtDate, esc, uid, DAY_NAMES, dow, mondayOf, parseDate } from '../lib/util.js';
import { check, bar, openSheet, closeSheet, toast } from './common.js';
import { foodTotals } from './food.js';
import { startWorkout } from './workout.js';

export const HABITS = (t) => [
  { id: 'protein', label: `Protein ${t.protein} g`, sub: 'Protein first at every meal' },
  { id: 'water', label: `Water ${t.water} L`, sub: 'A glass before each meal' },
  { id: 'steps', label: '8,000+ steps', sub: 'Walk after meals, take calls standing' },
  { id: 'sleep', label: '7+ hours sleep', sub: 'Last night' },
  { id: 'nosugar', label: 'No sugary drinks or sweets', sub: 'Treats are planned, not random' },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function render() {
  const s = getState(), p = s.profile, t = today();
  const st = streakInfo(s);
  const tg = targets(s);
  const day = programDay(p), week = programWeek(p);
  const habitsToday = s.habits[t] || {};
  const doneToday = sessionsOn(s, t);
  const kind = dayKind(p, t);
  const next = nextWorkoutType(s);
  const ws = weekScore(s);
  const food = foodTotals(s, t);
  const weighedToday = s.weighIns.some((w) => w.date === t);
  const checkinDue = dow(t) === 0 && !s.checkins.some((c) => c.date >= mondayOf(t));
  // At most one calorie adjustment every 2 weeks, so the trend has time to respond.
  const advice = !s.lastAdjustWeek || week - s.lastAdjustWeek >= 2 ? trendAdvice(s) : null;

  return `
  <header class="top">
    <div class="grow">
      <small class="muted">${fmtDate(t, { weekday: 'long', day: 'numeric', month: 'long' })}</small>
      <h1>${greeting()}, ${esc(p.name)}</h1>
    </div>
    <div class="streak" title="Never-miss-twice streak"><b>🔥 ${st.count}</b><small class="muted">day streak</small></div>
  </header>

  <div class="card soft">
    <div class="row between"><b>${day <= programTotalDays ? `Day ${day} of ${programTotalDays}` : `Day ${day} · bonus round`}</b><span class="pill ${isRechargeWeek(p) ? 'good' : 'accent'}">${isRechargeWeek(p) ? '🔋 Recharge week' : `Week ${week}`}</span></div>
    <div class="mt-s">${bar(Math.min(1, day / programTotalDays))}</div>
  </div>

  ${st.atRisk && !doneToday.length ? `<div class="card warn">
    <h3>You missed last time. That's okay.</h3>
    <p>Rule #1: never miss twice. Even the 15-minute version keeps the streak alive.</p>
    ${p.why ? `<p class="muted">Your why: <i>"${esc(p.why)}"</i></p>` : ''}
  </div>` : ''}

  ${mainCard(s, { t, kind, next, doneToday })}

  <div class="card"><p class="quote">${esc(quoteFor(t))}</p></div>

  <div class="section-title">This week · ${ws.done}/${ws.goal} workouts</div>
  <div class="card">${weekStrip(s)}</div>

  <div class="section-title">Daily habits · ${Object.values(habitsToday).filter(Boolean).length}/5</div>
  <div class="card">${HABITS(tg).map((h) => check('habit', habitsToday[h.id], h.label, h.sub, `data-id="${h.id}"`)).join('')}</div>

  <div class="section-title">Fuel</div>
  <a class="card" href="#/food" style="display:block;color:inherit;text-decoration:none">
    <div class="row between"><b>Protein</b><span class="num">${food.p} / ${tg.protein} g</span></div>
    <div class="mt-s">${bar(food.p / tg.protein, 'good')}</div>
    <div class="row between mt"><b>Calories</b><span class="num">${food.kcal} / ${tg.kcal}</span></div>
    <div class="mt-s">${bar(food.kcal / tg.kcal)}</div>
    <small class="muted">${food.kcal ? 'Tap to log more' : 'Tap to log food. Even rough logging helps.'}</small>
  </a>
  <button class="btn btn-ghost btn-block mt-s" data-act="craving">🆘 I'm having a craving</button>

  ${!weighedToday ? `<div class="section-title">Morning weigh-in</div>
  <div class="card"><div class="row">
    <input id="wq" type="number" inputmode="decimal" step="0.1" placeholder="Weight (kg)" aria-label="Weight in kg">
    <button class="btn btn-primary" data-act="weigh-quick">Save</button></div>
    <small class="muted">After the toilet, before food. Daily ups and downs are water. The weekly average is what counts.</small></div>` : ''}

  ${checkinDue ? `<div class="card good mt"><h3>📋 Sunday check-in</h3><p>30 seconds: how did this week feel? I'll adjust your plan.</p>
    <button class="btn btn-primary" data-act="checkin">Start check-in</button></div>` : ''}

  ${advice && advice.kind !== 'ok' ? `<div class="card warn mt"><h3>Coach adjustment</h3><p>${esc(advice.text)}</p>
    <div class="row"><button class="btn btn-sm btn-primary" data-act="apply-adjust" data-delta="${advice.delta}">${advice.delta > 0 ? 'Add' : 'Cut'} ${Math.abs(advice.delta)} kcal</button>
    <button class="btn btn-sm btn-ghost" data-act="apply-adjust" data-delta="0">${advice.delta > 0 ? 'Keep as is' : 'I\'ll add steps instead'}</button></div></div>` : ''}

  <div class="section-title">Coach tip</div>
  <div class="card soft"><p>💡 ${esc(tipFor(t))}</p></div>`;
}

function mainCard(s, { t, kind, next, doneToday }) {
  if (s.active) {
    const w = WORKOUTS[s.active.type];
    return `<div class="card hero"><small>In progress</small><h2 style="margin:4px 0 12px">${w.name}${s.active.mini ? ' (mini)' : ''}</h2>
      <button class="btn btn-big" data-act="go-workout">Resume workout →</button>
      <button class="link mt-s" style="color:#fff" data-act="discard-workout">Discard</button></div>`;
  }
  if (doneToday.length) {
    const names = doneToday.map((x) => WORKOUTS[x.type]?.name || ACTIVE_REST_OPTIONS.find((o) => o.id === x.activity)?.label || 'Activity').join(' + ');
    return `<div class="card good"><div class="confetti" style="font-size:2.4rem;text-align:left">✅</div>
      <h2>Done today: ${esc(names)}</h2><p>That's a vote for the new you. Now: protein, water, sleep.</p>
      <button class="btn btn-sm btn-ghost" data-act="start" data-type="${next}">Train again anyway</button></div>`;
  }
  const w = WORKOUTS[next];
  if (kind === 'train') {
    return `<div class="card hero">
      <small>Today's workout</small>
      <h1 style="color:#fff;margin:2px 0">${w.name}</h1>
      <p style="margin-bottom:14px">${w.focus} · ~${w.mins} min</p>
      <button class="btn btn-big" data-act="start" data-type="${next}">Start workout</button>
      <button class="btn btn-block mt-s" style="background:rgba(255,255,255,.2);color:#fff" data-act="start" data-type="${next}" data-mini="1">Only 15 min? Do the mini version</button>
    </div>`;
  }
  if (kind === 'active') {
    return `<div class="card hero">
      <small>Active recovery day</small>
      <h2 style="color:#fff;margin:2px 0 6px">Move for 20–30 minutes</h2>
      <p>A brisk walk is the most underrated fat-loss tool. Keeps the streak alive too.</p>
      <button class="btn btn-big" data-act="log-active">Log my activity</button>
      <button class="btn btn-block mt-s" style="background:rgba(255,255,255,.2);color:#fff" data-act="start" data-type="${next}">Do ${w.name} instead</button>
    </div>`;
  }
  return `<div class="card soft"><h2>😴 Full rest day</h2>
    <p>Muscles grow when you rest. Sleep well, hit your protein, drink water. Tomorrow: <b>${w.name}</b>.</p>
    <button class="btn btn-sm btn-ghost" data-act="start" data-type="${next}">Train anyway</button></div>`;
}

function weekStrip(s) {
  const t = today();
  return `<div class="week">${weekDates(t).map((d) => {
    const st = dayStatus(s, d);
    const kind = dayKind(s.profile, d);
    const sym = st === 'done' ? '✓' : st === 'missed' ? '×' : kind === 'train' ? '💪' : kind === 'rest' ? 'z' : '🚶';
    return `<div><div class="d">${DAY_NAMES[parseDate(d).getDay()]}</div><div class="dot ${st === 'future' || st === 'before' ? (kind === 'rest' ? 'rest' : '') : st}" ${d === t ? 'style="outline:2px solid var(--accent);outline-offset:2px"' : ''}>${sym}</div></div>`;
  }).join('')}</div>`;
}

function checkinSheet() {
  const scale = (name, lo, hi) => `<label>${name}</label><div class="scale" data-scale="${name}">${[1, 2, 3, 4, 5].map((n) =>
    `<button class="chip" data-act="scale" data-name="${name}" data-v="${n}">${n}</button>`).join('')}</div>
    <div class="row between"><small class="muted">${lo}</small><small class="muted">${hi}</small></div>`;
  openSheet('Weekly check-in', `
    <div class="stack" id="ci">
      ${scale('Energy', 'Exhausted', 'Great')}
      ${scale('Hunger', 'Never hungry', 'Starving')}
      ${scale('Sleep', 'Terrible', 'Great')}
      <div><label for="cinote">Anything else? (optional)</label><textarea id="cinote" rows="2" placeholder="e.g. knee felt sore on lunges"></textarea></div>
      <button class="btn btn-primary btn-block" data-act="checkin-save">Save check-in</button>
    </div>`);
}

const ciDraft = {};
function checkinAdvice(c) {
  const out = [];
  if (c.Hunger >= 4) out.push('Hunger is high. Add 20 g protein at lunch (paneer, soya or Greek yogurt) and a big salad before dinner. Drink water first.');
  if (c.Energy <= 2) out.push('Energy is low. Eat your chapati/rice 1–2 hours before training, and protect your sleep. If it continues, I\'ll add 100 kcal.');
  if (c.Sleep <= 2) out.push('Poor sleep raises cravings by a lot. Screens off 30 min before bed, same bedtime every night, no tea after 4 pm.');
  if (!out.length) out.push('Everything looks solid. Keep doing exactly what you\'re doing.');
  return out;
}

export const actions = {
  start(el) { startWorkout(el.dataset.type, !!el.dataset.mini); return false; },
  'go-workout'() { location.hash = '#/workout'; return false; },
  'discard-workout'() { if (confirm('Discard the workout in progress?')) update((s) => { s.active = null; }); },
  habit(el) {
    const t = today(), id = el.dataset.id;
    update((s) => { s.habits[t] = { ...(s.habits[t] || {}), [id]: !(s.habits[t] || {})[id] }; });
    const n = Object.values(getState().habits[t]).filter(Boolean).length;
    if (n === 5) toast('All 5 habits done. Perfect day ⭐');
  },
  'weigh-quick'() {
    const v = parseFloat(document.getElementById('wq').value);
    if (!(v > 30 && v < 300)) { toast('Enter your weight in kg'); return false; }
    update((s) => { s.weighIns = s.weighIns.filter((w) => w.date !== today()); s.weighIns.push({ date: today(), kg: v }); s.weighIns.sort((a, b) => a.date.localeCompare(b.date)); });
    toast('Logged. Watch the weekly trend, not the daily number.');
  },
  'log-active'() {
    openSheet('What did you do?', `<div class="stack">${ACTIVE_REST_OPTIONS.map((o) => `
      <button class="card btn-block" style="text-align:left;display:block" data-act="active-save" data-id="${o.id}" data-mins="${o.mins}">
        <b>${o.label}</b><br><small class="muted">${o.desc}</small></button>`).join('')}</div>`);
    return false;
  },
  'active-save'(el) {
    const t = today(), now = Date.now();
    update((s) => s.sessions.push({ id: uid(), date: t, type: 'active', activity: el.dataset.id, mins: +el.dataset.mins, startedAt: now, finishedAt: now, sets: {} }));
    closeSheet();
    toast('Logged. Streak alive 🔥');
  },
  checkin() { checkinSheet(); return false; },
  scale(el) {
    ciDraft[el.dataset.name] = +el.dataset.v;
    el.parentElement.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c === el));
    return false;
  },
  'checkin-save'() {
    if (!ciDraft.Energy || !ciDraft.Hunger || !ciDraft.Sleep) { toast('Rate all three'); return false; }
    const c = { date: today(), energy: ciDraft.Energy, hunger: ciDraft.Hunger, sleep: ciDraft.Sleep, note: document.getElementById('cinote').value };
    update((s) => s.checkins.push(c));
    openSheet('Coach says', `<div class="stack">${checkinAdvice(ciDraft).map((a) => `<div class="card soft"><p>${esc(a)}</p></div>`).join('')}
      <button class="btn btn-primary btn-block" data-act="sheet-close">Got it</button></div>`);
  },
  'apply-adjust'(el) {
    const d = +el.dataset.delta;
    update((s) => { s.calAdjust = (s.calAdjust || 0) + d; s.lastAdjustWeek = programWeek(s.profile); });
    toast(d ? `Calorie target ${d > 0 ? 'raised' : 'lowered'} by ${Math.abs(d)} kcal` : 'Okay. I\'ll check again in 2 weeks.');
  },
};
