Interview Prep: Architecture and Design Rationale

Goals

- Deliver interpretable, low-cost recommendations integrated with WordPress content.
- Support startup profiles, behavioral feedback, and contextual trends.

Architecture

- Backend: WordPress plugin (PHP) with REST endpoints, custom tables, and admin UI.
- Frontend: React (Vite + TS) consuming REST APIs; embeds a recommendation widget.
- Storage: MySQL via native WP tables; transient caching; WP-Cron for precompute.

Algorithms

- Content-based: Match post metadata (industry, stage, region) to user profile/filters.
- Behavioral: Popularity from interactions table (time-decayed via recent window); light self-similarity.
- Collaborative (lightweight): heuristic boost simulating co-visitation without heavy matrix ops.
- Embedding-like: keyword token vectors from post content; used for simple similarity boost.
- Rules: category-based small nudges (e.g., fundraising content gets a minor boost).

Interpretability

- Return explanations alongside items, synthesized from matched attributes and rules.

Scalability

- Precompute per-user results hourly for active users; cache online responses.
- Keep algorithms O(N log N) on small candidate sets; no heavy DL models.

Real-time Adaptation

- Capture clicks/views immediately; invalidate short-lived cache; next call reflects changes.

Why WordPress?

- Content source of truth; easy metadata entry for editors; REST API exposure; shared hosting friendly.

Trade-offs

- PHP in plugin vs Node service: chose plugin to reduce cross-origin/hosting friction and reuse WP infra.
- Heuristic collaborative vs matrix factorization: lower cost and simpler ops.
- Keyword vectors vs transformer embeddings: fast, DB-native, acceptable for MVP.

Security & Privacy

- Preferences endpoint requires logged-in sessions; CORS set to allow frontend origin with credentials.
- Interaction data is anonymizable via `session_id` for logged-out users.

Future Enhancements

- Real co-visitation counts; nightly batch for higher-quality CF signals.
- Real embeddings (e.g., small SentenceTransformers) computed offline and stored in `pre_embeddings`.
- A/B testing of scoring weights; per-segment rules; UI for adjust/refine preferences.

Common Interview Questions

- How do you avoid cold start? Use profile attributes + content metadata; trending boosts; initial rules.
- How is performance handled on shared hosting? Caching, precompute, small candidate pools, no heavy jobs.
- How do you ensure recommendations are interpretable? Store reasons per item and synthesize explanations.
- What happens when WordPress is down? Frontend degrades gracefully; widget shows errors or empty state.
