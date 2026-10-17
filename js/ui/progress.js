import { getState, update, addPhoto, listPhotos, deletePhoto } from '../lib/store.js';
import { EXERCISES } from '../data/exercises.js';
import { WORKOUTS } from '../data/program.js';
import { projected, currentWeight, trendAdvice } from '../lib/targets.js';
import { programDay, programTotalDays, programWeek, finishedWorkouts } from '../lib/schedule.js';
import { dayStatus, streakInfo } from '../lib/streaks.js';
import { history, personalBests } from '../lib/progression.js';
import { milestones } from '../lib/milestones.js';
import { today, addDays, diffDays, fmtDate, esc, mondayOf, uid, round, avg } from '../lib/util.js';
import { toast, openSheet, closeSheet } from './common.js';

let photoUrls = [];

export function render() {
  const s = getState(), p = s.profile, t = today();
  const cur = currentWeight(s);
  const lost = round(p.startWeight - cur, 0.1);
  const waist0 = s.waist[0]?.cm, waistN = s.waist.at(-1)?.cm;
  const st = streakInfo(s);
  const advice = trendAdvice(s);
  const workouts = finishedWorkouts(s).length;

  return `
  <h1>Progress</h1>
  <div class="card hero">
    <div class="row between"><small>12-week transformation</small><small>Week ${programWeek(p)}</small></div>
    <div class="grid2 mt-s">
      <div><h1 style="color:#fff;margin:0">${lost > 0 ? '−' : ''}${Math.abs(lost)} kg</h1><small>since day 1 (7-day avg)</small></div>
      <div><h1 style="color:#fff;margin:0">${waist0 && waistN ? `${round(waist0 - waistN, 0.5)} cm` : '—'}</h1><small>off your waist</small></div>
      <div><h1 style="color:#fff;margin:0">${workouts}</h1><small>workouts done</small></div>
      <div><h1 style="color:#fff;margin:0">${st.best}</h1><small>best streak (days)</small></div>
    </div>
  </div>

  <div class="section-title">Weight</div>
  <div class="card">
    ${weightChart(s)}
    <div class="legend"><span><i style="background:var(--muted)"></i>daily</span><span><i style="background:var(--accent)"></i>7-day average</span><span><i style="background:var(--good)"></i>plan</span></div>
    ${advice ? `<p class="mt-s">${esc(advice.text)}</p>` : '<p class="muted mt-s">Trend advice starts in week 3, once there\'s enough data (weeks 1–2 are mostly water weight).</p>'}
    <div class="row mt"><input id="wt" type="number" inputmode="decimal" step="0.1" placeholder="Today's weight (kg)" aria-label="Weight in kg"><button class="btn btn-primary" data-act="log-weight">Log</button></div>
  </div>

  <div class="section-title">Waist (every 2 weeks)</div>
  <div class="card">
    <p class="muted">Tape around your belly button, relaxed, after breathing out. Often drops when the scale doesn't.</p>
    ${s.waist.length ? `<div class="list">${s.waist.slice(-5).reverse().map((w) => `<div><span class="grow">${fmtDate(w.date)}</span><b class="num">${w.cm} cm</b></div>`).join('')}</div>` : ''}
    <div class="row mt-s"><input id="wa" type="number" inputmode="decimal" step="0.5" placeholder="Waist (cm)" aria-label="Waist in cm"><button class="btn btn-primary" data-act="log-waist">Log</button></div>
  </div>

  <div class="section-title">Progress photos</div>
  <div class="card">
    <p class="muted">Front + side, same spot, same light, every 4 weeks. Stored only on this phone.</p>
    <div id="photos"><p class="muted">Loading…</p></div>
    <label class="btn btn-primary btn-block mt-s" style="margin:8px 0 0">📸 Add photo<input id="ph" type="file" accept="image/*" capture="user" data-change="photo-add" hidden></label>
  </div>

  <div class="section-title">Consistency · ${programDay(p)} days in</div>
  <div class="card">${heatmap(s)}
    <div class="legend"><span><i style="background:var(--good);height:10px"></i>done</span><span><i style="background:var(--bad);opacity:.55;height:10px"></i>missed</span><span><i style="border:1px dashed var(--border);height:10px"></i>rest</span></div></div>

  <div class="section-title">Strength gains</div>
  <div class="card list">${liftRows(s) || '<p class="muted">Finish a workout to see your lifts here.</p>'}</div>

  <div class="section-title">Badges</div>
  <div class="card"><div class="badges">${milestones(s).map((m) => `<div class="badge ${m.on ? '' : 'locked'}"><b>${m.emoji}</b>${esc(m.label)}</div>`).join('')}</div></div>`;
}

export async function mount() {
  photoUrls.forEach(URL.revokeObjectURL);
  photoUrls = [];
  const box = document.getElementById('photos');
  if (!box) return;
  let photos = [];
  try { photos = await listPhotos(); } catch { box.innerHTML = '<p class="muted">Photos aren\'t available in this browser.</p>'; return; }
  if (!photos.length) { box.innerHTML = ''; return; }
  const url = (ph) => { const u = URL.createObjectURL(ph.blob); photoUrls.push(u); return u; };
  const first = photos[0], last = photos.at(-1);
  box.innerHTML = `
    ${photos.length > 1 ? `<div class="compare"><figure style="margin:0"><img src="${url(first)}" alt="First photo"><figcaption class="center muted">${fmtDate(first.date)} · day ${diffDays(first.date, getState().profile.startDate) + 1}</figcaption></figure>
      <figure style="margin:0"><img src="${url(last)}" alt="Latest photo"><figcaption class="center muted">${fmtDate(last.date)} · day ${diffDays(last.date, getState().profile.startDate) + 1}</figcaption></figure></div>` : ''}
    <div class="photos mt-s">${photos.map((ph) => `<figure><img src="${url(ph)}" alt="Progress photo ${fmtDate(ph.date)}" data-act="photo-open" data-id="${ph.id}"><figcaption>${fmtDate(ph.date)}</figcaption></figure>`).join('')}</div>`;
}

function weightChart(s) {
  const p = s.profile;
  const W = 340, H = 180, L = 32, R = 8, T = 10, B = 22;
  const end = addDays(p.startDate, Math.max(programTotalDays, diffDays(today(), p.startDate) + 7));
  const span = diffDays(end, p.startDate);
  const pts = s.weighIns.map((w) => ({ x: diffDays(w.date, p.startDate), y: w.kg, date: w.date }));
  const rolling = pts.map((pt) => ({ x: pt.x, y: avg(s.weighIns.filter((w) => w.date <= pt.date && w.date > addDays(pt.date, -7)).map((w) => w.kg)) }));
  const plan = Array.from({ length: Math.ceil(span / 7) + 1 }, (_, i) => ({ x: i * 7, y: projected(p, addDays(p.startDate, i * 7)) }));
  const ys = [...pts.map((x) => x.y), ...plan.map((x) => x.y)];
  const yMin = Math.floor(Math.min(...ys) - 1), yMax = Math.ceil(Math.max(...ys) + 1);
  const X = (x) => L + (x / span) * (W - L - R), Y = (y) => T + (1 - (y - yMin) / (yMax - yMin)) * (H - T - B);
  const path = (arr) => arr.map((pt, i) => `${i ? 'L' : 'M'}${X(pt.x).toFixed(1)},${Y(pt.y).toFixed(1)}`).join('');
  const ticks = [yMin, round((yMin + yMax) / 2, 0.5), yMax];
  const weeks = [0, 4, 8, 12].filter((w) => w * 7 <= span);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Weight chart">
    ${ticks.map((v) => `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--border)"/><text x="${L - 4}" y="${Y(v) + 3}" text-anchor="end">${v}</text>`).join('')}
    ${weeks.map((w, i) => `<text x="${X(w * 7)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === weeks.length - 1 ? 'end' : 'middle'}">${w ? `wk ${w}` : 'start'}</text>`).join('')}
    <path d="${path(plan)}" fill="none" stroke="var(--good)" stroke-width="2" stroke-dasharray="5 4"/>
    ${pts.map((pt) => `<circle cx="${X(pt.x)}" cy="${Y(pt.y)}" r="2.5" fill="var(--muted)" opacity=".6"/>`).join('')}
    ${rolling.length > 1 ? `<path d="${path(rolling)}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>` : ''}
  </svg>`;
}

function heatmap(s) {
  const p = s.profile, t = today();
  const start = mondayOf(p.startDate);
  const weeks = Math.max(12, Math.ceil((diffDays(t, start) + 1) / 7));
  const cells = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(start, i);
    const st = dayStatus(s, d);
    cells.push(`<i class="${['done', 'missed', 'rest'].includes(st) ? st : ''} ${d === t ? 'today' : ''}" title="${fmtDate(d)}: ${st}"></i>`);
  }
  return `<div class="row between" style="font-size:.7rem;color:var(--muted);margin-bottom:4px">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => `<span style="flex:1;text-align:center">${d}</span>`).join('')}</div><div class="heat">${cells.join('')}</div>`;
}

function liftRows(s) {
  const pb = personalBests(s);
  const mainIds = [...new Set(Object.values(WORKOUTS).flatMap((w) => w.main.map((m) => m.ex)))];
  return mainIds.filter((id) => pb[id]).map((id) => {
    const first = history(s, id).at(-1);
    return `<div><span class="grow"><b>${esc(EXERCISES[id].name)}</b><br><small class="muted">Best: ${pb[id].w} kg × ${pb[id].r}</small></span>
      <span class="num">${first.sets[0].w} → <b>${pb[id].w} kg</b></span></div>`;
  }).join('');
}

// Shrink photos before storing to keep the database small.
function shrink(file, max = 1080) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      c.toBlob((b) => (b ? res(b) : rej(new Error('encode failed'))), 'image/jpeg', 0.82);
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

function logMeasure(key, field, inputId, lo, hi, msg) {
  const v = parseFloat(document.getElementById(inputId).value);
  if (!(v > lo && v < hi)) { toast('Enter a valid number'); return false; }
  update((s) => {
    s[key] = s[key].filter((x) => x.date !== today());
    s[key].push({ date: today(), [field]: v });
    s[key].sort((a, b) => a.date.localeCompare(b.date));
  });
  toast(msg);
}

export const actions = {
  'log-weight'() { return logMeasure('weighIns', 'kg', 'wt', 30, 300, 'Weight logged'); },
  'log-waist'() { return logMeasure('waist', 'cm', 'wa', 40, 200, 'Waist logged'); },
  'photo-open'(el) {
    const src = el.getAttribute('src');
    openSheet('Progress photo', `<img src="${src}" alt="" style="width:100%;border-radius:12px">
      <button class="btn btn-ghost btn-block mt" data-act="photo-del" data-id="${el.dataset.id}">Delete photo</button>`);
    return false;
  },
  async 'photo-del'(el) {
    if (!confirm('Delete this photo?')) return false;
    await deletePhoto(el.dataset.id);
    closeSheet();
    mount();
    return false;
  },
};

export const changes = {
  async 'photo-add'(el) {
    const file = el.files?.[0];
    if (!file) return false;
    try {
      const blob = await shrink(file);
      await addPhoto({ id: uid(), date: today(), blob });
      toast('Photo saved 📸');
      mount();
    } catch { toast('Could not save that photo'); }
    return false;
  },
};
