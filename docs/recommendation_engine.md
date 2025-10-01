## Recommendation Engine Documentation

This document explains the inner workings of the personalized recommendation engine, including how user profile data is used, the algorithms chosen, and the trade-offs considered during its design.

### How Profile Data is Used

User profile data is a key input for personalizing recommendations. The engine uses two main sources of profile data:

1.  **WordPress User Meta:** For logged-in WordPress users, the engine can pull profile information stored in the user meta table. This can include fields like industry, stage, team size, funding, and region.

2.  **Frontend Profile Data:** The React frontend allows users to create and update a startup profile. This data is passed to the recommendation engine via the REST API and is used to tailor recommendations for both logged-in and anonymous users (using a session ID).

The engine uses this profile data to perform content-based filtering, matching the user's profile attributes (e.g., industry, stage) with the metadata of the recommendation candidates.

### Algorithms Chosen and Why

The recommendation engine uses a hybrid approach, combining several algorithms to provide relevant and diverse recommendations. This approach avoids the limitations of a single algorithm and provides a more robust recommendation system.

1.  **Content-Based Filtering:** This is the primary algorithm used by the engine. It matches the user's profile data and preferences with the metadata of the content (posts). For example, if a user's profile indicates they are in the 'Fintech' industry, the engine will boost the score of content tagged with 'Fintech'.
    *   **Why:** This algorithm is simple to implement, transparent, and doesn't suffer from the cold-start problem for new items. The recommendations are easily explainable to the user.

2.  **Behavioral Scoring (Popularity & User History):** The engine boosts the score of content that is popular (i.e., has received many interactions) and content that is similar to items the user has interacted with in the past.
    *   **Why:** This incorporates the wisdom of the crowd and personal user behavior, which can lead to the discovery of high-quality, relevant content that content-based filtering might miss.

3.  **Contextual Boosting (Trending):** The engine can boost the score of content that is currently trending, based on recent interactions or other signals.
    *   **Why:** This adds a real-time component to the recommendations, allowing the engine to react to current trends and surface timely content.

4.  **Rule-Based Augmentation:** The engine can apply rules to augment the scores of certain items. For example, a rule could boost the score of all content in the 'fundraising' category.
    *   **Why:** This provides a simple way to inject business logic and editorial control into the recommendation process.

5.  **Collaborative Filtering (Lightweight):** The engine includes a placeholder for a lightweight collaborative filtering approach. This would involve finding users with similar interaction patterns and recommending items that similar users have engaged with.
    *   **Why:** This can help with serendipitous discovery, recommending items that the user might not have discovered otherwise.

6.  **Embedding-Based Boosting (Placeholder):** The engine has a placeholder for using embeddings (vector representations of content) to calculate similarity. This would involve creating embeddings for all content and then finding content with embeddings similar to the user's interests.
    *   **Why:** This is a powerful technique for capturing semantic similarity and can lead to highly relevant recommendations.

### Trade-offs Considered

The design of the recommendation engine involved several trade-offs between compute, latency, and storage.

*   **Compute:**
    *   **Real-time vs. Pre-computation:** The engine uses a combination of real-time and pre-computed recommendations. Real-time computation provides the most up-to-date recommendations but can be computationally expensive. Pre-computation reduces the computational load at request time but can result in slightly stale recommendations. The engine uses a cron job to pre-compute recommendations for active users, and real-time computation for others.

*   **Latency:**
    *   **Caching:** The engine uses multiple layers of caching to ensure low latency. Recommendations are cached in a transient for a short period, and the results of expensive computations are cached to avoid re-computation.

*   **Storage:**
    *   **Custom Tables:** The engine uses custom database tables to store user interactions, content embeddings, and pre-computed recommendations. This increases the storage requirements of the application but is necessary for the efficient operation of the recommendation engine.
    *   **Embeddings:** Storing embeddings for all content can require a significant amount of storage. The current implementation uses a lightweight approach (keyword vectors) to minimize storage requirements, with the option to move to more complex embeddings in the future.
