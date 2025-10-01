Demo Guide

Seed Content (Manual)

1. In WordPress, create a few published posts (e.g., “Seed Round Checklist”, “Hiring Plan Template”).
2. For each post, set the “Recommendation Metadata” metabox fields:
   - Industry: e.g., Fintech, SaaS
   - Stage: e.g., Pre-seed, Seed, Series A
   - Region: e.g., US, EU, APAC
   - Tags: comma-separated keywords
   - Difficulty: Beginner/Intermediate/Advanced
3. Admin → Recommendations → click “Refresh Embeddings”.

User Preferences (Auth)

- Log in to WordPress in the browser on the same domain; visit the React app Settings and save preferences.

Anonymous Sessions

- For quick testing without auth, open Home, and interact with “Personalized For You”. Click items to record interactions.

Verify API

- GET `{WP_BASE}/wp-json/pre/v1/recommendations?limit=6&industry=SaaS&stage=Seed&region=US`
- Should return a JSON array with title, excerpt, permalink, score, explanations.

Troubleshooting

- HTML instead of JSON: your frontend target URL is not pointing to WordPress. Fix `VITE_WP_BASE_URL` or proxy.
- Empty list: ensure posts exist, are published, and have metadata set. Refresh embeddings.
