import { getState, update, replaceState, resetState } from '../lib/store.js';
import { EXERCISES } from '../data/exercises.js';
import { WORKOUTS } from '../data/program.js';
import { targets, weeklyAverages, ACTIVITY, currentWeight } from '../lib/targets.js';
import { programWeek, programDay, finishedWorkouts } from '../lib/schedule.js';
import { streakInfo } from '../lib/streaks.js';
import { history, describeSets } from '../lib/progression.js';
import { today, addDays, DAY_NAMES, esc, round } from '../lib/util.js';
import { toast, formData, openSheet } from './common.js';

export function applyTheme() {
  const th = localStorage.getItem('coach.theme');
  if (th === 'light' || th === 'dark') document.documentElement.dataset.theme = th;
  else delete document.documentElement.dataset.theme;
}

export function render() {
  const s = getState(), p = s.profile, tg = targets(s);
  const theme = localStorage.getItem('coach.theme') || 'system';
  const chips = (key, multi) => DAY_NAMES.map((n, i) => {
    const on = multi ? p.trainDays.includes(i) : p.restDay === i;
    return `<button type="button" class="chip ${on ? 'on' : ''}" data-act="set-day" data-key="${key}" data-day="${i}">${n}</button>`;
  }).join('');

  return `
  <h1>More</h1>

  <div class="section-title">Your plan</div>
  <div class="card">
    <div class="grid2">
      <div><small class="muted">Calories</small><h2 style="margin:0">${tg.kcal}</h2></div>
      <div><small class="muted">Protein</small><h2 style="margin:0">${tg.protein} g</h2></div>
    </div>
    <p class="muted mt-s">Maintenance ≈ ${tg.tdee} kcal, deficit 25%${s.calAdjust ? `, adjusted ${s.calAdjust > 0 ? '+' : ''}${s.calAdjust}` : ''}. Floor: ${tg.floor} kcal (never lower).</p>
    ${s.calAdjust ? '<button class="btn btn-sm btn-ghost" data-act="cal-reset">Reset adjustment</button>' : ''}
  </div>

  <div class="section-title">Profile</div>
  <form id="pf" class="card stack" onsubmit="return false">
    <div class="grid2">
      <div><label for="name">Name</label><input id="name" name="name" value="${esc(p.name)}"></div>
      <div><label for="age">Age</label><input id="age" name="age" type="number" value="${p.age}"></div>
      <div><label for="heightCm">Height (cm)</label><input id="heightCm" name="heightCm" type="number" value="${p.heightCm}"></div>
      <div><label for="goalWeight">Goal weight</label><input id="goalWeight" name="goalWeight" type="number" step="0.1" value="${p.goalWeight}"></div>
    </div>
    <div><label for="activity">Daily activity</label><select id="activity" name="activity">${ACTIVITY.map((a) => `<option value="${a.id}" ${p.activity === a.id ? 'selected' : ''}>${a.label}</option>`).join('')}</select></div>
    <div><label>Lifting days</label><div class="chips">${chips('trainDays', true)}</div></div>
    <div><label>Full rest day</label><div class="chips">${chips('restDay', false)}</div></div>
    <div class="grid2">
      <div><label for="workoutTime">Workout time</label><input id="workoutTime" name="workoutTime" type="time" value="${p.workoutTime || '18:30'}"></div>
      <div><label for="dbStep">Dumbbell jump (kg)</label><input id="dbStep" name="dbStep" type="number" step="0.5" value="${p.dbStep ?? 2}"></div>
    </div>
    <div><label for="why">Your why</label><textarea id="why" name="why" rows="2">${esc(p.why || '')}</textarea></div>
    <button class="btn btn-primary btn-block" data-act="profile-save">Save profile</button>
  </form>

  <div class="section-title">Reminders</div>
  <div class="card">
    <p>Browsers can't reliably send scheduled reminders on their own, so this uses your phone's calendar. It adds a repeating event on your lifting days at ${p.workoutTime || '18:30'} with an alert 15 min before, plus a daily 7:30 am weigh-in reminder.</p>
    <button class="btn btn-primary btn-block" data-act="ics">📅 Add reminders to my calendar</button>
    <small class="muted">Opens a calendar file. On Android, choose Google Calendar to import it.</small>
  </div>

  <div class="section-title">Check in with your coach</div>
  <div class="card">
    <p>Every 2 weeks, copy this summary and paste it to Claude for a plan review.</p>
    <button class="btn btn-primary btn-block" data-act="coach-export">📋 Copy progress summary</button>
  </div>

  <div class="section-title">Backup</div>
  <div class="card">
    <p class="muted">Your data lives only on this phone. Back up once a week. If you clear browser data without a backup, it's gone. (Photos aren't included.)</p>
    <div class="grid2"><button class="btn btn-ghost" data-act="export">⬇ Export backup</button>
    <label class="btn btn-ghost" style="margin:0">⬆ Import<input type="file" accept="application/json,.json" data-change="import" hidden></label></div>
  </div>

  <div class="section-title">Appearance</div>
  <div class="card chips">${['system', 'light', 'dark'].map((t) => `<button class="chip ${theme === t ? 'on' : ''}" data-act="theme" data-t="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>

  <div class="section-title">Install on your phone</div>
  <div class="card soft"><p><b>Android (Chrome):</b> ⋮ menu → <i>Add to Home screen</i> / <i>Install app</i>.</p><p><b>iPhone (Safari):</b> Share → <i>Add to Home Screen</i>.</p><p class="muted">After the first load it works offline.</p></div>

  <div class="section-title">Danger zone</div>
  <div class="card"><button class="btn btn-ghost btn-block" style="color:var(--bad)" data-act="reset">Erase all data and start over</button></div>
  <p class="muted center mt">Exercise photos: free-exercise-db (public domain).</p>`;
}

function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

function icsFile(p) {
  const [hh, mm] = (p.workoutTime || '18:30').split(':');
  const BY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const start = today().replace(/-/g, '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Coach//Workout//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:coach-workout-${start}@coach`, `DTSTAMP:${stamp}`,
    `DTSTART:${start}T${hh}${mm}00`, 'DURATION:PT45M',
    `RRULE:FREQ=WEEKLY;BYDAY=${p.trainDays.map((d) => BY[d]).join(',')}`,
    'SUMMARY:💪 Workout (open Coach app)', 'DESCRIPTION:Never miss twice. Short on time? Do the 15-min mini workout.',
    'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', 'DESCRIPTION:Workout in 15 minutes', 'END:VALARM',
    'END:VEVENT',
    'BEGIN:VEVENT', `UID:coach-weigh-${start}@coach`, `DTSTAMP:${stamp}`,
    `DTSTART:${start}T073000`, 'DURATION:PT5M', 'RRULE:FREQ=DAILY',
    'SUMMARY:⚖️ Weigh in + check habits', 'DESCRIPTION:After the toilet, before food.',
    'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:Weigh in', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

// Plain-text progress report designed to be pasted into a chat with Claude.
function coachSummary(s) {
  const p = s.profile, tg = targets(s), t = today();
  const wk = programWeek(p);
  const lines = [
    `COACH APP SUMMARY · ${t} · day ${programDay(p)} / week ${wk} of 12`,
    `Profile: ${p.sex}, ${p.age}y, ${p.heightCm} cm. Start ${p.startWeight} kg → goal ${p.goalWeight} kg. Now ~${round(currentWeight(s), 0.1)} kg (7-day avg).`,
    `Targets: ${tg.kcal} kcal (adjust ${s.calAdjust || 0}), ${tg.protein} g protein. Lifting days: ${p.trainDays.map((d) => DAY_NAMES[d]).join(', ')}.`,
    `Streak: ${streakInfo(s).count} (best ${streakInfo(s).best}). Workouts done: ${finishedWorkouts(s).length}.`,
    '', 'Weekly average weight:', ...weeklyAverages(s).map((w) => `  wk ${w.week}: ${round(w.kg, 0.1)} kg`),
    s.waist.length ? `Waist: ${s.waist.map((w) => `${w.date} ${w.cm}cm`).join(', ')}` : 'Waist: not logged',
    '', 'Lifts (first → latest):',
    ...[...new Set(Object.values(WORKOUTS).flatMap((w) => w.main.map((m) => m.ex)))].map((id) => {
      const h = history(s, id);
      return h.length ? `  ${EXERCISES[id].name}: ${describeSets(EXERCISES[id], h.at(-1).sets)} → ${describeSets(EXERCISES[id], h[0].sets)} (${h.length} sessions)` : null;
    }).filter(Boolean),
  ];
  const last14 = Array.from({ length: 14 }, (_, i) => addDays(t, -i));
  const habitDays = last14.map((d) => s.habits[d] || {});
  lines.push('', 'Habits, last 14 days (days hit):', ...['protein', 'water', 'steps', 'sleep', 'nosugar'].map((h) => `  ${h}: ${habitDays.filter((x) => x[h]).length}/14`));
  const proteinDays = last14.map((d) => s.foodLog[d]).filter(Boolean).length;
  lines.push(`Food logged on ${proteinDays}/14 days.`);
  if (s.cravings.length) lines.push(`Cravings: ${s.cravings.length} total, beat ${s.cravings.filter((c) => c.outcome === 'beat').length}, swapped ${s.cravings.filter((c) => c.outcome === 'swap').length}.`);
  const ci = s.checkins.slice(-3);
  if (ci.length) lines.push('', 'Recent check-ins (energy/hunger/sleep 1-5):', ...ci.map((c) => `  ${c.date}: E${c.energy} H${c.hunger} S${c.sleep}${c.note ? ` · "${c.note}"` : ''}`));
  return lines.join('\n');
}

export const actions = {
  'set-day'(el) {
    const i = +el.dataset.day;
    update((s) => {
      const p = s.profile;
      if (el.dataset.key === 'restDay') { p.restDay = p.restDay === i ? -1 : i; p.trainDays = p.trainDays.filter((d) => d !== i); }
      else {
        p.trainDays = p.trainDays.includes(i) ? p.trainDays.filter((d) => d !== i) : [...p.trainDays, i].sort();
        if (p.restDay === i) p.restDay = -1;
      }
    });
  },
  'profile-save'() {
    const d = formData(document.getElementById('pf'));
    update((s) => Object.assign(s.profile, d, { activity: Number(d.activity) }));
    toast('Saved');
  },
  'cal-reset'() { update((s) => { s.calAdjust = 0; }); },
  theme(el) { localStorage.setItem('coach.theme', el.dataset.t); applyTheme(); },
  ics() { download('coach-reminders.ics', icsFile(getState().profile), 'text/calendar'); return false; },
  async 'coach-export'() {
    const text = coachSummary(getState());
    openSheet('Progress summary', `<textarea rows="16" style="font-family:ui-monospace,monospace;font-size:.8rem" readonly>${esc(text)}</textarea>`);
    navigator.clipboard?.writeText(text).then(() => toast('Copied. Paste it to Claude.'), () => toast('Select all and copy the text'));
    return false;
  },
  export() {
    download(`coach-backup-${today()}.json`, JSON.stringify({ app: 'coach', v: 1, exported: new Date().toISOString(), state: getState() }, null, 1), 'application/json');
    return false;
  },
  reset() {
    if (!confirm('Erase ALL data: workouts, weights, everything? This cannot be undone.')) return false;
    resetState();
    location.hash = '#/today';
  },
};

export const changes = {
  async import(el) {
    const file = el.files?.[0];
    if (!file) return false;
    try {
      const data = JSON.parse(await file.text());
      if (data.app !== 'coach' || !data.state?.profile) throw new Error('not a backup');
      if (!confirm(`Replace current data with the backup from ${data.exported?.slice(0, 10)}?`)) return false;
      replaceState(data.state);
      toast('Backup restored');
    } catch { toast('That file isn\'t a Coach backup'); return false; }
  },
};
