// Rest timer, beeps, vibration and screen wake lock for the workout player.

let audio;
export function beep(freq = 880, ms = 180, times = 1) {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < times; i++) {
      const o = audio.createOscillator(), g = audio.createGain();
      const t = audio.currentTime + i * (ms / 1000 + 0.08);
      o.frequency.value = freq; o.connect(g); g.connect(audio.destination);
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + ms / 1000);
      o.start(t); o.stop(t + ms / 1000);
    }
  } catch { /* audio not available */ }
}
export const buzz = (pattern = [200, 100, 200]) => navigator.vibrate?.(pattern);

let lock = null;
export async function keepAwake(on) {
  try {
    if (on && !lock && 'wakeLock' in navigator) {
      lock = await navigator.wakeLock.request('screen');
      lock.addEventListener('release', () => { lock = null; });
    } else if (!on && lock) { await lock.release(); lock = null; }
  } catch { lock = null; }
}
// Wake locks drop when the tab is hidden; re-acquire while a workout is running.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && document.body.classList.contains('fullscreen')) keepAwake(true);
});

export const fmtSec = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.floor(s % 60))).padStart(2, '0')}`;

// ── Rest timer (persists across page re-renders) ──
const bar = () => document.getElementById('restbar');
let rest = null, restTick = null;

export function startRest(seconds, label = 'Rest') {
  rest = { end: Date.now() + seconds * 1000, label };
  clearInterval(restTick);
  restTick = setInterval(renderRest, 250);
  renderRest();
}
export function stopRest() {
  rest = null; clearInterval(restTick); bar().hidden = true;
}
export function addRest(sec) { if (rest) { rest.end += sec * 1000; renderRest(); } }

function renderRest() {
  if (!rest) return;
  const left = Math.ceil((rest.end - Date.now()) / 1000);
  if (left <= 0) { beep(988, 200, 3); buzz([300, 120, 300]); stopRest(); return; }
  if (left === 3 || left === 2 || left === 1) { if (rest.lastBeep !== left) { rest.lastBeep = left; beep(660, 90); } }
  const b = bar();
  b.hidden = false;
  b.innerHTML = `<span class="grow">${rest.label}</span><b>${fmtSec(left)}</b>
    <button data-act="rest-add">+15s</button><button data-act="rest-skip">Skip</button>`;
}

// ── Interval timer (finishers) ──
// steps: [{label, sec}] repeated `rounds` times. onTick({label, left, round, idx, done})
export function intervalTimer(steps, rounds, onTick) {
  const seq = [];
  for (let r = 1; r <= rounds; r++) steps.forEach((s, i) => { if (!(r === rounds && i === steps.length - 1 && /rest/i.test(s.label))) seq.push({ ...s, round: r }); });
  let i = 0, end = 0, timer = null, paused = null;
  const total = seq.length;
  function go() {
    end = Date.now() + seq[i].sec * 1000;
    beep(seq[i].ex ? 1046 : 523, 250, seq[i].ex ? 2 : 1); buzz(150);
  }
  function tick() {
    const left = Math.ceil((end - Date.now()) / 1000);
    if (left <= 0) {
      i++;
      if (i >= total) { clearInterval(timer); beep(1175, 300, 3); buzz([300, 100, 300, 100, 300]); onTick({ done: true }); return; }
      go();
    } else if (left <= 3 && seq[i].lastBeep !== left) { seq[i].lastBeep = left; beep(660, 80); }
    onTick({ ...seq[i], left: Math.max(0, Math.ceil((end - Date.now()) / 1000)), idx: i, total });
  }
  return {
    start() { go(); timer = setInterval(tick, 200); tick(); },
    pause() { if (paused == null) { paused = end - Date.now(); clearInterval(timer); } },
    resume() { if (paused != null) { end = Date.now() + paused; paused = null; timer = setInterval(tick, 200); } },
    stop() { clearInterval(timer); },
    get paused() { return paused != null; },
  };
}
