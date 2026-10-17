# Coach: workout & food PWA

A personal coaching app: a 12-week fat-loss plan, a 4-day dumbbell/band program with guide photos, auto-progression, food and protein tracking, craving help, and streaks. Plain HTML/CSS/JS with no build step. All data stays on the phone.

## Try it on your laptop

```
python -m http.server 8765
```
Then open http://localhost:8765. (Opening `index.html` directly from the file system won't work, because ES modules need a server.)

Testing tip: add `?today=2026-11-02` to the URL to pretend it's another date (kept for the browser tab).

## Put it on your phone (GitHub Pages, free)

1. Create a free account at https://github.com and a new **public** repository, e.g. `coach`.
2. In this folder:
   ```
   git init
   git add .
   git commit -m "Coach app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/coach.git
   git push -u origin main
   ```
3. On GitHub, open the repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)` → Save.
4. After ~1 minute it's live at `https://<your-username>.github.io/coach/`.
5. Open that link in **Chrome on your phone** → ⋮ menu → **Install app / Add to Home screen**.
6. In the app: **More → Add reminders to my calendar** for workout alerts.

## Updating the app

Edit files, then `git add . && git commit -m "update" && git push`. The phone picks up changes on the next launch after it has been online once. If you change the file list in `sw.js`, bump `VERSION` there.

## Your data

- Everything is stored in the browser on your phone (localStorage + IndexedDB for photos). Nothing is uploaded.
- **Back up weekly:** More → Export backup. Clearing Chrome's site data without a backup erases it.
- Every 2 weeks: More → **Copy progress summary** and paste it into a chat with Claude for a plan review.

## Structure

```
index.html, manifest.webmanifest, sw.js   app shell, install manifest, offline cache
css/app.css                               all styles (light + dark)
js/app.js                                 router + event delegation
js/data/                                  exercises, program, quotes/tips, foods
js/lib/                                   storage, schedule, streaks, progression, targets, timers
js/ui/                                    one module per screen
img/ex/                                   exercise photos (free-exercise-db, public domain)
```
