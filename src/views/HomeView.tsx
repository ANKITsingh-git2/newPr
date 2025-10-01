import { Resource } from '../types';
import { TrendingUp, Clock, Award } from 'lucide-react';
import { ResourceCard } from '../components/Resources/ResourceCard';
import { RecommendationWidget } from '../components/Recommendations/RecommendationWidget';

interface HomeViewProps {
  resources: Resource[];
  onResourceClick: (resource: Resource) => void;
}

export function HomeView({ resources, onResourceClick }: HomeViewProps) {
  const trending = [...resources]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 3);

  const topRated = [...resources]
    .sort((a, b) => b.rating_avg - a.rating_avg)
    .slice(0, 3);

  const recent = [...resources].slice(0, 3);

  return (
    <div className="space-y-12">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 md:p-12 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to Visey
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-6">
          Personalized recommendations for startup success
        </p>
        <p className="text-lg text-blue-50 max-w-3xl">
          Discover resources tailored to your startup's industry, stage, and needs.
          Get actionable insights from articles, courses, tools, and templates trusted by founders.
        </p>
      </div>

      <section>
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Personalized For You</h2>
        </div>
        <RecommendationWidget limit={6} />
      </section>

      <section>
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trending.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onClick={() => onResourceClick(resource)}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center mb-6">
          <Award className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Top Rated</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topRated.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onClick={() => onResourceClick(resource)}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center mb-6">
          <Clock className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Recently Added</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recent.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onClick={() => onResourceClick(resource)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
