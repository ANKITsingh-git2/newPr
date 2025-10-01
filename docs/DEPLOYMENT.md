Deployment Guide

WordPress Plugin
1) Copy `wp-plugin/personalized-recs` to `[wp-root]/wp-content/plugins/`
2) Activate via WP Admin → Plugins
3) Optional: Settings → Permalinks → Save
4) Verify: `{WP_BASE}/wp-json/pre/v1/recommendations?limit=3` returns JSON

Shared Hosting Tips
- Works on typical cPanel/LAMP with PHP + MySQL. No root access required.
- Cron-like jobs: plugin schedules `pre_cron_precompute_recommendations` hourly via WP-Cron.
- Caching: API responses use `set_transient` for a few minutes; tune as needed.

React App
Local Dev
- Set `VITE_WP_BASE_URL` to your WP site OR run WP at `http://localhost:8000` for proxying.
```bash
export VITE_WP_BASE_URL="https://your-wp-site.com"
npm run dev
```

Build
```bash
npm run build
```
Outputs static assets in `dist/` which you can host on Netlify/Vercel or behind nginx.

CORS and Cookies
- The plugin adds CORS headers. If using preferences (auth-only), ensure you access WordPress via the same scheme (http/https) and domain consistency.
- The frontend uses `credentials: 'include'`.

Troubleshooting
- JSON parse error with `<!doctype`: the request hit your React dev server instead of WP. Fix `VITE_WP_BASE_URL` or Vite proxy target.
- 401 on `/preferences`: login to WP Admin first or use WP login on the same domain.
- Empty recs: add post metadata in the “Recommendation Metadata” metabox; click “Refresh Embeddings” in the admin page.


