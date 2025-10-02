Personalized Recommendations Platform (React + WordPress)

Overview
This project delivers personalized, interpretable recommendations for startup resources. The frontend is a Vite + React TypeScript app. The backend is a lightweight WordPress plugin exposing REST endpoints, storing interactions, and providing admin tooling.

Key Features
- Interpretable recommendations: “Based on your stage and region, we recommend …”
- Signals: startup profile, behavioral (clicks, views), contextual (trending)
- Algorithms: content-based, collaborative boost, embedding-like keyword vectors, rule-based tweaks
- Infra: WordPress plugin with REST API, metadata metaboxes, precomputation via WP-Cron
- Frontend: Recommendation widget, preferences UI, tracking

Monorepo Layout
- wp-plugin/personalized-recs: WordPress plugin
- src/: React application source
- src/lib/wpApi.ts: WP REST client
- src/components/Recommendations/RecommendationWidget.tsx: recommendations UI
- src/views/SettingsView.tsx: user preferences hooked to WP

Quick Start
1) WordPress
- Copy `wp-plugin/personalized-recs` into your WordPress `wp-content/plugins/`.
- Activate in WP Admin → Plugins.
- Optional: Settings → Permalinks → Save changes (refresh rewrite).
- Verify JSON: `https://your-wp-site.com/wp-json/pre/v1/recommendations?limit=3`

2) Frontend (.env)
- Create `.env` at the project root:
  - VITE_WP_BASE_URL=https://your-wp-site.com
- Or run WP locally on `http://localhost:8000` to use Vite’s proxy.

3) Run React
```bash
npm install
npm run dev
```
Open the app URL shown by Vite and you should see a “Personalized For You” section in Home, powered by WordPress.

Building
```bash
npm run build
npm run preview
```

Deploying the Plugin
```bash
cd wp-plugin
zip -r personalized-recs.zip personalized-recs
```
Upload the ZIP via WP Admin → Plugins → Add New → Upload.






