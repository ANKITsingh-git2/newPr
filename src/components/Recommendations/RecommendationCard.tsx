import { RecommendationResult } from '../../types';
import { Lightbulb, Star, Clock } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: RecommendationResult;
  onClick: () => void;
}

export function RecommendationCard({ recommendation, onClick }: RecommendationCardProps) {
  const { resource, score, reasoning } = recommendation;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer border-l-4 border-blue-500"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {resource.title}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                {resource.content_type}
              </span>
              {resource.estimated_time > 0 && (
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {resource.estimated_time} min
                </div>
              )}
            </div>
          </div>
          <div className="ml-3 flex flex-col items-end">
            <div className="flex items-center bg-green-50 px-2 py-1 rounded">
              <Star className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm font-semibold text-green-600">
                {(score * 100).toFixed(0)}% match
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {resource.description}
        </p>

        <div className="bg-blue-50 rounded-lg p-3 mb-3">
          <div className="flex items-start">
            <Lightbulb className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-900">
              <span className="font-medium">Why this?</span> {reasoning}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {resource.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
