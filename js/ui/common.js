import { EXERCISES, imgSrc } from '../data/exercises.js';
import { esc } from '../lib/util.js';

export function toast(msg, ms = 2600) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), ms);
}
document.addEventListener('coach:toast', (e) => toast(e.detail));

const sheet = () => document.getElementById('sheet');
export function openSheet(title, body) {
  const s = sheet();
  s.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2 style="margin:0">${esc(title)}</h2>
    <button class="x" data-act="sheet-close" aria-label="Close">×</button></div>${body}</div>`;
  if (!s.open) s.showModal();
}
export const closeSheet = () => sheet().open && sheet().close();
sheet().addEventListener('click', (e) => { if (e.target === sheet()) closeSheet(); });

export function exFigure(exId, cls = '') {
  const a = imgSrc(exId, 0), b = imgSrc(exId, 1);
  if (!a) return `<div class="exfig none ${cls}" aria-hidden="true">🧘</div>`;
  return `<div class="exfig ${cls}"><img src="${a}" alt="${esc(EXERCISES[exId].name)} start" loading="lazy"><img src="${b}" alt="" loading="lazy"></div>`;
}

export function exDetail(exId) {
  const e = EXERCISES[exId];
  return `${exFigure(exId)}
    ${e.imgNote ? `<p class="imgnote">ℹ️ ${esc(e.imgNote)}</p>` : ''}
    ${e.muscles ? `<p class="mt-s"><span class="pill accent">${esc(e.group)}</span> <span class="muted">${esc(e.muscles)}</span></p>` : ''}
    <ul class="cues">${e.cues.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    <p class="mt-s"><a href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.name + ' form')}" target="_blank" rel="noopener">▶ Watch a form video</a></p>`;
}

export const check = (act, on, label, sub = '', attrs = '') =>
  `<button class="check ${on ? 'on' : ''}" data-act="${act}" ${attrs} aria-pressed="${!!on}"><span class="box"></span><span class="grow">${label}${sub ? `<small class="muted">${sub}</small>` : ''}</span></button>`;

export const bar = (frac, cls = '') => `<div class="bar ${cls}"><i style="width:${Math.min(100, Math.max(0, frac * 100)).toFixed(1)}%"></i></div>`;

// Read a form's named inputs into an object (numbers where the input type is number).
export function formData(form) {
  const out = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    out[el.name] = el.type === 'number' ? (el.value === '' ? null : Number(el.value)) : el.value;
  }
  return out;
}
