import { Resource } from '../../types';
import { Clock, Star, Eye, Tag } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onClick: () => void;
  onInteraction?: (type: string) => void;
}

export function ResourceCard({ resource, onClick, onInteraction }: ResourceCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer group"
    >
      {resource.thumbnail_url && (
        <div className="h-48 overflow-hidden">
          <img
            src={resource.thumbnail_url}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {resource.title}
            </h3>
          </div>
          <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md whitespace-nowrap">
            {resource.content_type}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {resource.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500">
              +{resource.tags.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {resource.view_count.toLocaleString()}
            </div>
            {resource.rating_count > 0 && (
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                {resource.rating_avg.toFixed(1)}
              </div>
            )}
          </div>
          {resource.estimated_time > 0 && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {resource.estimated_time} min
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
