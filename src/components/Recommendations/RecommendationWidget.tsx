import { useEffect, useState } from 'react';
import { fetchRecommendations, postInteraction, RecItem } from '../../lib/wpApi';

interface RecommendationWidgetProps {
  userId?: number;
  sessionId?: string;
  limit?: number;
  industry?: string;
  stage?: string;
  region?: string;
  query?: string;
}

export function RecommendationWidget({ userId, sessionId, limit = 6, industry, stage, region, query }: RecommendationWidgetProps) {
  const [items, setItems] = useState<RecItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchRecommendations({ user_id: userId, session_id: sessionId, limit, industry, stage, region, q: query })
      .then((data) => { if (!cancelled) setItems(data); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId, sessionId, limit, industry, stage, region, query]);

  const handleClick = async (id: number) => {
    try {
      await postInteraction({ user_id: userId, session_id: sessionId, resource_id: id, action: 'click', weight: 1 });
    } catch {}
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading recommendations…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Failed to load recommendations: {error}</div>;
  }

  if (!items.length) {
    return <div className="p-6 text-gray-500">No recommendations yet.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <a key={item.id} href={item.permalink} onClick={() => handleClick(item.id)} className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
            <div className="text-lg font-semibold text-gray-900 mb-1">{item.title}</div>
            <div className="text-sm text-gray-600 mb-2 line-clamp-3">{item.excerpt}</div>
            <div className="text-xs text-blue-700">{item.explanations}</div>
          </a>
        ))}
      </div>
    </div>
  );
}


