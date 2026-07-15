# Dhiblawe WaterFlow — Session Log

## Changes Made (Jul 15, 2026)

### 1. Removed "Prepared By" from PDF Footer
- `server/src/routes/pdf.js` — replaced `report_prepared_by` line with company phone + "Nairobi, Kenya"
- `settings.html` — removed "Prepared By" form field and all JS references
- `server/src/routes/settings.js` — removed `'report_prepared_by'` from allowed settings

### 2. Added "Outstanding" Status (Default)
- `server/src/routes/trips.js` — default status changed from `'Unpaid'` to `'Outstanding'`. Auto-deposit logic only triggers when status is `'Outstanding'`. Balance calc includes both `'Outstanding'` and `'Unpaid'`
- `trips.html` — added Status dropdown to form (Outstanding/Paid/Unpaid/Company Fleet/Free). Added to filter dropdown
- `reports.html` — added Outstanding to By Status filter and client statement row coloring
- `server/src/routes/pdf.js`, `reports.js`, `payments.js`, `deposits.js` — all outstanding/balance queries now include `'Outstanding'`
- `assets/css/main.css` — added `.badge-outstanding` (orange), changed `.badge-unpaid` to red

### 3. Deployment Setup (Netlify + Render)
- `netlify.toml` — Netlify config. Set `API_BASE` env var in Netlify dashboard to your Render URL
- `assets/js/env.js` — sets `window.API_BASE` from Netlify env var during build
- Added `<script src="assets/js/env.js">` to all 12 HTML pages
- `server/package.json` — added `"start": "node src/index.js"` script
- `.gitignore` — added `server/data/`

## Deployment Steps (when you return)

### Backend → Render (https://dashboard.render.com)
1. New Web Service → connect GitHub repo `Adeyanju-Adeola24/dhiblawe-waterflow`
2. Name: `dhiblawe-api`
3. Root Directory: `server`
4. Build: `npm install`
5. Start: `npm start`
6. Env vars: `JWT_SECRET` = any random string
7. Deploy → copy URL

### Frontend → Netlify (https://app.netlify.com)
1. New site → import from GitHub
2. Publish directory: `.`
3. Build command: leave blank (netlify.toml handles it)
4. After deploy, add env var: `API_BASE` = `https://dhiblawe-api.onrender.com`
5. Trigger redeploy

## GitHub
- Repo: https://github.com/Adeyanju-Adeola24/dhiblawe-waterflow
- Live (after Netlify deploy): https://dhiblawe-waterflow.netlify.app
