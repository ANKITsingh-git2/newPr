import { useState } from 'react';
import { Resource } from '../../types';
import { X, ExternalLink, Star, Clock, Tag, Bookmark, Share2 } from 'lucide-react';

interface ResourceDetailProps {
  resource: Resource;
  onClose: () => void;
  onRate: (rating: number) => void;
  onBookmark: () => void;
}

export function ResourceDetail({ resource, onClose, onRate, onBookmark }: ResourceDetailProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleRate = (value: number) => {
    setRating(value);
    onRate(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{resource.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {resource.thumbnail_url && (
            <img
              src={resource.thumbnail_url}
              alt={resource.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
              {resource.content_type}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
              {resource.category}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
              {resource.difficulty_level}
            </span>
          </div>

          <div className="flex items-center space-x-6 mb-6 text-sm text-gray-600">
            {resource.estimated_time > 0 && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {resource.estimated_time} minutes
              </div>
            )}
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
              {resource.rating_avg.toFixed(1)} ({resource.rating_count} ratings)
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 leading-relaxed">{resource.description}</p>
          </div>

          {resource.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Rate this resource</h3>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleRate(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoveredRating || rating) >= value
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {resource.author && (
            <div className="text-sm text-gray-600 mb-4">
              <span className="font-medium">Author:</span> {resource.author}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6 flex items-center justify-between">
          <div className="flex space-x-3">
            <button
              onClick={onBookmark}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>View Resource</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
