import { Resource } from '../../types';
import { ResourceCard } from './ResourceCard';

interface ResourceGridProps {
  resources: Resource[];
  onResourceClick: (resource: Resource) => void;
  loading?: boolean;
}

export function ResourceGrid({ resources, onResourceClick, loading }: ResourceGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-5 animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-4" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No resources found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onClick={() => onResourceClick(resource)}
        />
      ))}
    </div>
  );
}
