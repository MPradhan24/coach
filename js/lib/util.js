// Dates are local 'YYYY-MM-DD' strings throughout (never UTC ISO, which shifts days in IST).

const pad = (n) => String(n).padStart(2, '0');
export const dateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

// ?today=YYYY-MM-DD overrides the date for testing (kept for the browser session).
const override = new URLSearchParams(location.search).get('today');
if (override) sessionStorage.setItem('coach.today', override);
export const today = () => sessionStorage.getItem('coach.today') || dateStr(new Date());

export const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return dateStr(d); };
export const diffDays = (a, b) => Math.round((parseDate(a) - parseDate(b)) / 86400000);
export const dow = (s) => parseDate(s).getDay(); // 0 = Sunday
export const mondayOf = (s) => addDays(s, -((dow(s) + 6) % 7));

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const fmtDate = (s, opts = { day: 'numeric', month: 'short' }) => parseDate(s).toLocaleDateString('en-IN', opts);

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const round = (n, step = 1) => +(Math.round(n / step) * step).toFixed(2);
export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
export const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
