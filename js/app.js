import { getState } from './lib/store.js';
import { allImageUrls } from './data/exercises.js';
import { closeSheet } from './ui/common.js';
import * as onboarding from './ui/onboarding.js';
import * as today from './ui/today.js';
import * as workout from './ui/workout.js';
import * as plan from './ui/plan.js';
import * as food from './ui/food.js';
import * as progress from './ui/progress.js';
import * as settings from './ui/settings.js';

const done = { render: workout.renderDone };
const ROUTES = { today, plan, food, progress, settings, workout, done };
const FULLSCREEN = new Set(['workout', 'done']);

const actions = { 'sheet-close': () => { closeSheet(); return false; } };
const changes = {};
for (const m of [onboarding, today, workout, plan, food, progress, settings]) {
  Object.assign(actions, m.actions);
  Object.assign(changes, m.changes);
}

const app = document.getElementById('app');
const tabs = document.getElementById('tabs');
let current = null, currentName = null;

function routeName() {
  if (!getState().profile) return 'onboarding';
  const name = location.hash.replace(/^#\/?/, '').split('/')[0] || 'today';
  return ROUTES[name] ? name : 'today';
}

function render() {
  const name = routeName();
  const page = name === 'onboarding' ? onboarding : ROUTES[name];
  const same = name === currentName;
  const y = scrollY;
  if (!same) current?.unmount?.();
  const html = page.render();
  if (routeName() !== name) return; // render redirected
  app.innerHTML = html;
  current = page; currentName = name;
  document.body.classList.toggle('fullscreen', FULLSCREEN.has(name) || name === 'onboarding');
  tabs.hidden = FULLSCREEN.has(name) || name === 'onboarding';
  tabs.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.tab === name));
  if (same) scrollTo(0, y); else scrollTo(0, 0);
  page.mount?.();
}

async function run(handler, el, ev) {
  const r = await handler(el, ev);
  if (r !== false) render();
}

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el || !actions[el.dataset.act]) return;
  if (el.tagName === 'A' || el.type === 'submit' || el.closest('form')) ev.preventDefault();
  run(actions[el.dataset.act], el, ev);
});
document.addEventListener('change', (ev) => {
  const el = ev.target.closest('[data-change]');
  if (el && changes[el.dataset.change]) run(changes[el.dataset.change], el, ev);
});
document.addEventListener('coach:render', render);
addEventListener('hashchange', render);
// Re-render when returning to the app (the date may have changed overnight).
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !document.querySelector(':focus')) render(); });

settings.applyTheme();
render();

// ── Offline: service worker + pre-cache every exercise image ──
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW failed', e));
}
if ('caches' in window) {
  const warm = async () => {
    const c = await caches.open('coach-img-v1');
    for (const url of allImageUrls()) {
      if (!(await c.match(url))) { try { await c.add(url); } catch { /* offline: try next launch */ } }
    }
  };
  (window.requestIdleCallback || setTimeout)(() => warm(), { timeout: 4000 });
}
