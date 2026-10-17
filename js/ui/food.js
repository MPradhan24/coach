import { getState, update } from '../lib/store.js';
import { FOODS, MEALS, SWAPS, CRAVINGS, PLATE } from '../data/food.js';
import { targets } from '../lib/targets.js';
import { today, esc } from '../lib/util.js';
import { fmtSec } from '../lib/timer.js';
import { bar, openSheet, closeSheet, toast } from './common.js';

const CATS = ['Protein', 'Meals', 'Carbs', 'Snacks', 'Treats'];
let cat = 'Protein';

export function foodTotals(s, date) {
  const log = s.foodLog[date] || {};
  let kcal = 0, p = 0;
  for (const [id, qty] of Object.entries(log)) {
    const f = FOODS.find((x) => x.id === id);
    if (f) { kcal += f.kcal * qty; p += f.p * qty; }
  }
  return { kcal: Math.round(kcal), p: Math.round(p) };
}

export function render() {
  const s = getState(), t = today();
  const tg = targets(s);
  const tot = foodTotals(s, t);
  const log = s.foodLog[t] || {};
  const logged = Object.entries(log).filter(([, q]) => q > 0);
  const kLeft = tg.kcal - tot.kcal, pLeft = tg.protein - tot.p;

  return `
  <h1>Food</h1>
  <p class="muted">You don't need to be perfect. Hit protein, stay roughly in your calories, and eat mostly whole foods.</p>

  ${tg.recharge ? '<div class="card good"><h3>🔋 Recharge week</h3><p>Eat at maintenance this week (more food!). It resets hunger hormones and energy. Protein stays high. Back to the deficit next week.</p></div>' : ''}

  <div class="card">
    <div class="row between"><b>Protein</b><span class="num">${tot.p} / ${tg.protein} g</span></div>
    <div class="mt-s">${bar(tot.p / tg.protein, 'good')}</div>
    <div class="row between mt"><b>Calories</b><span class="num">${tot.kcal} / ${tg.kcal}</span></div>
    <div class="mt-s">${bar(tot.kcal / tg.kcal)}</div>
    <p class="muted mt-s">${pLeft > 0 ? `${pLeft} g protein to go` : 'Protein done ✓'} · ${kLeft >= 0 ? `${kLeft} kcal left` : `${-kLeft} kcal over. No drama, just walk a bit more`}</p>
  </div>

  <button class="btn btn-primary btn-block mt-s" data-act="craving">🆘 Craving SOS</button>

  <div class="section-title">Quick log</div>
  <div class="chips">${CATS.map((c) => `<button class="chip ${c === cat ? 'on' : ''}" data-act="food-cat" data-c="${c}">${c}</button>`).join('')}</div>
  <div class="card list mt-s">${FOODS.filter((f) => f.cat === cat).map((f) => {
    const q = log[f.id] || 0;
    return `<div><span class="grow">${esc(f.name)}<br><small class="muted">${f.kcal} kcal · ${f.p} g protein</small></span>
      ${q ? `<button class="btn btn-sm btn-ghost" data-act="food-add" data-id="${f.id}" data-d="-1" aria-label="Remove one">−</button><b class="num">${q}</b>` : ''}
      <button class="btn btn-sm ${q ? 'btn-ghost' : 'btn-primary'}" data-act="food-add" data-id="${f.id}" data-d="1" aria-label="Add one">+</button></div>`;
  }).join('')}</div>

  ${logged.length ? `<div class="section-title">Eaten today</div><div class="card list">${logged.map(([id, q]) => {
    const f = FOODS.find((x) => x.id === id);
    return `<div><span class="grow">${q}× ${esc(f.name)}</span><small class="muted num">${f.kcal * q} kcal · ${f.p * q} g</small></div>`;
  }).join('')}</div>` : ''}

  <div class="section-title">The plate rule</div>
  <div class="card plate"><div class="pie" aria-hidden="true"></div>
    <ul>${PLATE.map((x) => `<li><i style="background:${x.color}"></i><span><b>${x.part}:</b> ${esc(x.what)}</span></li>`).join('')}</ul></div>

  <div class="section-title">Meal ideas for your day</div>
  ${Object.entries(MEALS).map(([slot, list]) => `<details class="card"><summary style="cursor:pointer"><b>${slot}</b> <small class="muted">· ${list.length} options</small></summary>
    <div class="list mt-s">${list.map((m) => `<div><span class="grow"><b>${esc(m.name)}</b><br><small class="muted">${esc(m.items)}</small></span><small class="num muted" style="text-align:right">${m.kcal} kcal<br>${m.p} g P</small></div>`).join('')}</div></details>`).join('')}
  <p class="muted mt-s">A day like Breakfast egg bhurji + Lunch thali + Shake + Snack chana + Dinner paneer bhurji ≈ ${340 + 600 + 330 + 160 + 420} kcal, ${24 + 32 + 33 + 7 + 26} g protein.</p>

  <div class="section-title">Smart swaps</div>
  <div class="card list">${SWAPS.map((x) => `<div><span class="grow"><s class="muted">${esc(x.from)}</s><br>→ ${esc(x.to)}</span></div>`).join('')}</div>

  ${cravingInsights(s)}`;
}

function cravingInsights(s) {
  const c = s.cravings;
  if (c.length < 3) return '';
  const beat = c.filter((x) => x.outcome === 'beat').length;
  const byType = {}, byHour = {};
  for (const x of c) { byType[x.type] = (byType[x.type] || 0) + 1; const h = new Date(x.ts).getHours(); byHour[h] = (byHour[h] || 0) + 1; }
  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0][0];
  const topHour = +Object.entries(byHour).sort((a, b) => b[1] - a[1])[0][0];
  const hr = (h) => `${((h + 11) % 12) + 1} ${h < 12 ? 'am' : 'pm'}`;
  return `<div class="section-title">Your craving pattern</div><div class="card">
    <p>You beat <b>${beat} of ${c.length}</b> cravings. 💪</p>
    <p>Most common: <b>${CRAVINGS[topType].label.toLowerCase()}</b>, around <b>${hr(topHour)}–${hr((topHour + 1) % 24)}</b>.</p>
    <p class="muted">Plan a protein snack 30 minutes before that time, and keep a better option ready.</p></div>`;
}

let cvTimer = null, cvType = null;
function cravingSheet() {
  openSheet('Craving SOS', `<p>Cravings peak and fade in about <b>10 minutes</b>. Let's ride this one out. What do you want?</p>
    <div class="grid2 mt">${Object.entries(CRAVINGS).map(([k, c]) => `<button class="card" style="display:block" data-act="cv-type" data-k="${k}"><span style="font-size:1.8rem">${c.emoji}</span><br><b>${c.label}</b></button>`).join('')}</div>`);
}

export const actions = {
  'food-cat'(el) { cat = el.dataset.c; },
  'food-add'(el) {
    const t = today(), id = el.dataset.id, d = +el.dataset.d;
    update((s) => {
      const log = (s.foodLog[t] ||= {});
      log[id] = Math.max(0, (log[id] || 0) + d);
      if (!log[id]) delete log[id];
    });
    const s = getState(), tg = targets(s), tot = foodTotals(s, t);
    if (d > 0 && tot.p >= tg.protein && tot.p - FOODS.find((f) => f.id === id).p < tg.protein) {
      update((st) => { st.habits[t] = { ...(st.habits[t] || {}), protein: true }; });
      toast('Protein target hit 🎯');
    }
  },
  craving() { cravingSheet(); return false; },
  'cv-type'(el) {
    cvType = el.dataset.k;
    const c = CRAVINGS[cvType];
    const end = Date.now() + 600000;
    openSheet(`${c.emoji} ${c.label} craving`, `
      <div class="card soft center"><small class="muted">Wait it out. Drink a full glass of water now.</small>
        <div class="bigtimer" id="cv-time" style="font-size:3rem">10:00</div></div>
      <h3 class="mt">Better options</h3>
      <ul class="cues">${c.fixes.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      <div class="grid2 mt">
        <button class="btn btn-primary" data-act="cv-log" data-o="beat">💪 I beat it</button>
        <button class="btn btn-ghost" data-act="cv-log" data-o="swap">🔄 Had a swap</button>
      </div>
      <button class="btn btn-ghost btn-block mt-s" data-act="cv-log" data-o="gave">I had it anyway (that's okay)</button>`);
    clearInterval(cvTimer);
    cvTimer = setInterval(() => {
      const el2 = document.getElementById('cv-time');
      if (!el2) { clearInterval(cvTimer); return; }
      const left = Math.round((end - Date.now()) / 1000);
      el2.textContent = left > 0 ? fmtSec(left) : 'Still want it?';
      if (left <= 0) clearInterval(cvTimer);
    }, 500);
    return false;
  },
  'cv-log'(el) {
    clearInterval(cvTimer);
    const o = el.dataset.o;
    update((s) => s.cravings.push({ ts: Date.now(), type: cvType, outcome: o }));
    closeSheet();
    toast(o === 'beat' ? 'You\'re stronger than a craving 💪' : o === 'swap' ? 'Smart swap. That\'s how it\'s done.' : 'Logged. One treat doesn\'t undo anything. Back on track at the next meal.');
  },
};
