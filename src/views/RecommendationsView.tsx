import { useEffect, useState } from 'react';
import { Resource, StartupProfile, UserInteraction } from '../types';
import { generateRecommendations } from '../utils/recommendations';
import { RecommendationCard } from '../components/Recommendations/RecommendationCard';
import { RecommendationWidget } from '../components/Recommendations/RecommendationWidget';
import { Sparkles, AlertCircle } from 'lucide-react';

// This flag checks if the WordPress URL is set in the environment variables.
const useLiveApi = !!(import.meta as any).env?.VITE_WP_BASE_URL;

interface RecommendationsViewProps {
  resources: Resource[];
  profile: StartupProfile | null;
  interactions: UserInteraction[];
  onResourceClick: (resource: Resource) => void;
}

export function RecommendationsView({
  resources,
  profile,
  interactions,
  onResourceClick
}: RecommendationsViewProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    // This effect now only runs for the dummy data mode.
    if (!useLiveApi && profile && profile.industry && profile.stage) {
      const recs = generateRecommendations(resources, profile, interactions);
      setRecommendations(recs);
    }
  }, [profile, resources, interactions]);

  // This message is shown for both live and dummy modes if the profile is incomplete.
  if (!profile || !profile.industry || !profile.stage) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Complete Your Profile
              </h3>
              <p className="text-yellow-800 mb-4">
                To receive personalized recommendations, please complete your startup profile
                with your industry and stage information.
              </p>
              <button
                onClick={() => window.location.hash = '#profile'}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                Go to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Sparkles className="w-8 h-8 text-blue-600 mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Your Recommendations
          </h1>
          <p className="text-gray-600 mt-1">
            Based on {profile.company_name || 'your profile'} - {profile.industry} • {profile.stage}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {header}
      {useLiveApi ? (
        // --- LIVE API MODE ---
        // It uses the widget that fetches data from WordPress.
        <RecommendationWidget
          industry={profile.industry}
          stage={profile.stage}
          region={profile.region}
        />
      ) : (
        // --- DUMMY DATA MODE ---
        // This is the original logic that uses local data.
        recommendations.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              No recommendations available yet. Start exploring resources to get personalized suggestions!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.resource.id}
                recommendation={rec}
                onClick={() => onResourceClick(rec.resource)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
