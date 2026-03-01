# Static Seed Validation Dashboard (GitHub Pages)

This is a **static** version of the Flask prototype UI, built to run on **GitHub Pages**.

## Key difference vs Flask
GitHub Pages cannot run Python/Flask routes (like `/data`), so the live data is **simulated in the browser**.

- Flask version: `/data` generated JSON in Python.
- Static version: `assets/app.js` generates the same JSON structure in JavaScript.

## Files
- `index.html` (login)
- `home.html`
- `upload.html`
- `live.html` (updates every 1 second)
- `analytics.html`
- `validation.html`
- `assets/styles.css`
- `assets/app.js`

## Deploy to GitHub Pages
1) Put these files in your repository root.
2) GitHub → Settings → Pages
3) Source: **Deploy from a branch**
4) Branch: `main` (or your branch), Folder: `/ (root)`
5) Save, then open the Pages URL.
