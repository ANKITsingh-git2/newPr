import { useState } from 'react';
import { Resource } from '../types';
import { SearchBar } from '../components/Search/SearchBar';
import { ResourceGrid } from '../components/Resources/ResourceGrid';
import { Library } from 'lucide-react';

interface BrowseViewProps {
  resources: Resource[];
  onResourceClick: (resource: Resource) => void;
}

export function BrowseView({ resources, onResourceClick }: BrowseViewProps) {
  const [filteredResources, setFilteredResources] = useState(resources);

  const handleSearch = (query: string, filters: any) => {
    let filtered = resources;

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.title.toLowerCase().includes(lowerQuery) ||
          r.description.toLowerCase().includes(lowerQuery) ||
          r.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    if (filters.content_type) {
      filtered = filtered.filter(r => r.content_type === filters.content_type);
    }

    if (filters.difficulty) {
      filtered = filtered.filter(r => r.difficulty_level === filters.difficulty);
    }

    if (filters.category) {
      filtered = filtered.filter(r => r.category === filters.category);
    }

    setFilteredResources(filtered);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Library className="w-8 h-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Browse Resources</h1>
      </div>

      <SearchBar onSearch={handleSearch} />

      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredResources.length} of {resources.length} resources
        </p>
      </div>

      <ResourceGrid
        resources={filteredResources}
        onResourceClick={onResourceClick}
      />
    </div>
  );
}
