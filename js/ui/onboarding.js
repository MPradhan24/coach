import { getState, update, requestPersist } from '../lib/store.js';
import { targets, ACTIVITY } from '../lib/targets.js';
import { today, DAY_NAMES, esc, round } from '../lib/util.js';
import { formData, toast } from './common.js';

let step = 'form';
let draft = { trainDays: [1, 2, 4, 5], restDay: 0 };

export function render() {
  return step === 'form' ? form() : plan();
}

function form() {
  const d = draft;
  const dayChips = (key, multi) => DAY_NAMES.map((n, i) => {
    const on = multi ? d.trainDays.includes(i) : d.restDay === i;
    return `<button type="button" class="chip ${on ? 'on' : ''}" data-act="ob-day" data-key="${key}" data-day="${i}">${n}</button>`;
  }).join('');
  return `
  <h1>Hey 👋 I'm your coach.</h1>
  <p class="muted">Two minutes of setup, then I'll build your 12-week plan. Everything stays on this phone.</p>
  <form id="ob" class="card mt stack" onsubmit="return false">
    <div class="field"><label for="name">What should I call you?</label><input id="name" name="name" value="${esc(d.name || '')}" autocomplete="given-name" required></div>
    <div class="grid2">
      <div><label for="sex">Sex (for calorie maths)</label><select id="sex" name="sex">
        <option value="male" ${d.sex !== 'female' ? 'selected' : ''}>Male</option><option value="female" ${d.sex === 'female' ? 'selected' : ''}>Female</option></select></div>
      <div><label for="age">Age</label><input id="age" name="age" type="number" inputmode="numeric" min="14" max="90" value="${d.age ?? ''}" required></div>
    </div>
    <div class="grid2">
      <div><label for="heightCm">Height (cm)</label><input id="heightCm" name="heightCm" type="number" inputmode="decimal" min="120" max="230" value="${d.heightCm ?? ''}" required></div>
      <div><label for="startWeight">Weight now (kg)</label><input id="startWeight" name="startWeight" type="number" inputmode="decimal" step="0.1" min="35" max="250" value="${d.startWeight ?? ''}" required></div>
    </div>
    <div class="field"><label for="goalWeight">Goal weight (kg)</label><input id="goalWeight" name="goalWeight" type="number" inputmode="decimal" step="0.1" min="35" max="250" value="${d.goalWeight ?? ''}" required>
      <small>Not sure? Use your weight minus 10%. We can change it later.</small></div>
    <div class="field"><label for="activity">Outside of workouts, your day is…</label><select id="activity" name="activity">
      ${ACTIVITY.map((a) => `<option value="${a.id}" ${+d.activity === a.id ? 'selected' : ''}>${a.label}</option>`).join('')}</select></div>
    <div class="field"><label>Lifting days (pick 4)</label><div class="chips">${dayChips('trainDays', true)}</div></div>
    <div class="field"><label>Full rest day</label><div class="chips">${dayChips('restDay', false)}</div>
      <small>Other days are light "active recovery" days: a walk or some skipping.</small></div>
    <div class="grid2">
      <div><label for="workoutTime">Usual workout time</label><input id="workoutTime" name="workoutTime" type="time" value="${d.workoutTime || '18:30'}"></div>
      <div><label for="dbStep">Dumbbell jump (kg)</label><input id="dbStep" name="dbStep" type="number" inputmode="decimal" step="0.5" min="0.5" max="5" value="${d.dbStep ?? 2}"><small>Smallest weight increase your dumbbells allow</small></div>
    </div>
    <div class="field"><label for="why">Your why. What will be different in 12 weeks?</label>
      <textarea id="why" name="why" rows="3" placeholder="e.g. A flatter belly and a sharper jawline, and to feel confident in photos">${esc(d.why || '')}</textarea>
      <small>I'll show you this on the days you don't feel like it.</small></div>
    <button class="btn btn-primary btn-big" data-act="ob-next">Build my plan →</button>
  </form>`;
}

function plan() {
  const s = { profile: { ...draft, startDate: today() }, weighIns: [], calAdjust: 0 };
  const t = targets(s);
  const end12 = round(draft.startWeight * (1 - 0.0085) ** 12, 0.5);
  const days = draft.trainDays.map((i) => DAY_NAMES[i]).join(', ');
  return `
  <h1>Your 12-week plan, ${esc(draft.name)}</h1>
  <p class="muted">Aggressive enough to see real change in 8–12 weeks, safe enough to keep your muscle and your sanity.</p>
  <div class="card hero mt">
    <small>Expected by week 12</small>
    <h1 style="font-size:2.2rem;margin:4px 0">${draft.startWeight} → ~${end12} kg</h1>
    <small>Losing ${t.weeklyLoss[0]}–${t.weeklyLoss[1]} kg a week. Weeks 1–2 usually drop faster (water).</small>
  </div>
  <div class="card">
    <h2>Daily targets</h2>
    <div class="grid2">
      <div><small>Calories</small><h1>${t.kcal}</h1><small>You burn ≈ ${t.tdee}</small></div>
      <div><small>Protein</small><h1>${t.protein} g</h1><small>2 g per kg of goal weight</small></div>
      <div><small>Steps</small><h1>8–10k</h1><small>Burns 300+ kcal extra</small></div>
      <div><small>Water</small><h1>${t.water} L</h1><small>Helps cravings too</small></div>
    </div>
  </div>
  <div class="card">
    <h2>Training</h2>
    <p><b>${days}</b>: Upper A → Lower A → Upper B → Lower B, ~45 min each.</p>
    <p class="muted">Dumbbells, bench, bands, pull-up bar and skipping rope. Every exercise has photos, form cues and an auto-progression that tells you when to go heavier.</p>
    <p class="muted"><b>Week 7 is a recharge week:</b> eat at maintenance, train lighter. This is what gets you past the 1-month wall.</p>
  </div>
  <div class="card soft">
    <h3>The 3 rules</h3>
    <p>1. <b>Never miss twice.</b> One missed day is life. Two is a pattern.</p>
    <p>2. <b>Bad day? Do the 15-min mini workout.</b> It still counts.</p>
    <p>3. <b>Protein first</b> at every meal.</p>
  </div>
  <div class="row mt">
    <button class="btn btn-ghost" data-act="ob-back">← Edit</button>
    <button class="btn btn-primary grow" data-act="ob-start">I'm in. Let's go 💪</button>
  </div>`;
}

export const actions = {
  'ob-day'(el) {
    keepForm();
    const i = +el.dataset.day;
    if (el.dataset.key === 'restDay') {
      draft.restDay = i;
      draft.trainDays = draft.trainDays.filter((d) => d !== i);
    } else {
      draft.trainDays = draft.trainDays.includes(i) ? draft.trainDays.filter((d) => d !== i) : [...draft.trainDays, i].sort();
      if (draft.restDay === i) draft.restDay = null;
    }
  },
  'ob-next'() {
    const f = document.getElementById('ob');
    if (!f.reportValidity()) return false;
    keepForm();
    if (draft.trainDays.length < 3) { toast('Pick at least 3 lifting days'); return; }
    if (draft.goalWeight >= draft.startWeight) { toast('Goal weight should be below your current weight'); return; }
    step = 'plan';
    scrollTo(0, 0);
  },
  'ob-back'() { step = 'form'; },
  'ob-start'() {
    update((s) => {
      s.profile = { ...draft, startDate: today(), restDay: draft.restDay ?? -1 };
      s.weighIns = [{ date: today(), kg: draft.startWeight }];
    });
    requestPersist();
    location.hash = '#/today';
    toast('Day 1. Let\'s do this 🔥');
  },
};

function keepForm() {
  const f = document.getElementById('ob');
  if (!f) return;
  const d = formData(f);
  Object.assign(draft, d, { activity: Number(d.activity) });
}

export const needsOnboarding = () => !getState().profile;
