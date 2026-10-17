// App state lives in localStorage as one JSON blob; progress photos live in IndexedDB.

const KEY = 'coach.v1';

const DEFAULTS = () => ({
  profile: null,           // set by onboarding
  sessions: [],            // { id, date, type, mini, startedAt, finishedAt, sets: {exId: [{w,r,b,done}]}, swaps, activity }
  active: null,            // in-progress workout
  weighIns: [],            // { date, kg }
  waist: [],               // { date, cm }
  habits: {},              // { 'YYYY-MM-DD': { protein: true, ... } }
  foodLog: {},             // { 'YYYY-MM-DD': [{ id, qty }] }
  cravings: [],            // { ts, type, outcome }
  checkins: [],            // { date, energy, hunger, sleep, note }
  calAdjust: 0,
  seenMilestones: [],
});

let state;
try { state = { ...DEFAULTS(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
catch { state = DEFAULTS(); }

export const getState = () => state;
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { console.error('save failed', e); alertSaveFailed(); }
}
export function update(fn) { fn(state); save(); }
export function replaceState(next) { state = { ...DEFAULTS(), ...next }; save(); }
export function resetState() { state = DEFAULTS(); save(); }

let warned = false;
function alertSaveFailed() {
  if (warned) return;
  warned = true;
  document.dispatchEvent(new CustomEvent('coach:toast', { detail: 'Could not save. Phone storage may be full.' }));
}

// Ask the browser not to evict our data under storage pressure.
export const requestPersist = () => navigator.storage?.persist?.().catch(() => {});

// ── Photos (IndexedDB) ──
const DB_NAME = 'coach-photos';
function openDb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id' });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function tx(mode, fn) {
  const db = await openDb();
  return new Promise((res, rej) => {
    const t = db.transaction('photos', mode);
    const out = fn(t.objectStore('photos'));
    t.oncomplete = () => res(out?.result ?? out);
    t.onerror = () => rej(t.error);
  });
}
export const addPhoto = (photo) => tx('readwrite', (s) => s.put(photo));
export const deletePhoto = (id) => tx('readwrite', (s) => s.delete(id));
export const listPhotos = () => tx('readonly', (s) => s.getAll()).then((all) => all.sort((a, b) => a.date.localeCompare(b.date)));
