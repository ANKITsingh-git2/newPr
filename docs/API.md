API Reference (WordPress REST)

Base URL
- {WP_BASE}/wp-json/pre/v1

Authentication
- Read endpoints are public by default.
- Preferences require logged-in user (cookie-based session). CORS/credentials are enabled in the plugin.

Endpoints
GET /recommendations
- Params: user_id?, session_id?, limit?, industry?, stage?, team_size?, funding?, region?, q?
- Returns: Array<{ id, title, excerpt, permalink, score, explanations }>
- Notes: Combines content-based scoring, behavioral popularity, simple rules, and placeholder embedding boost.

POST /interactions
- Body: { user_id?, session_id?, resource_id (number), action ('view'|'click'|'like'|'bookmark'|'dismiss'), weight?, detail? }
- Returns: { ok: true }
- Use to log clicks/views and improve recommendations.

POST /ingest (admin)
- Body: empty
- Returns: { updated: number }
- Recomputes lightweight keyword vectors for items.

GET /preferences (auth)
- Returns: User preferences stored in user meta.

POST /preferences (auth)
- Body: Partial preferences object to upsert.

Data Tables
- wp_pre_interactions: user/session interactions (resource_id, action, weight, created_at)
- wp_pre_embeddings: resource keyword vectors
- wp_pre_precomputed: cached recommendations per user_key


