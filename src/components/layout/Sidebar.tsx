import { useState } from 'react';
import { Filter, ChevronDown, ChevronRight } from 'lucide-react';
import type { SearchQuery } from '../../types';

interface SidebarProps {
  onFilterChange: (filters: SearchQuery) => void;
}

export default function Sidebar({ onFilterChange }: SidebarProps) {
  const [filters, setFilters] = useState<SearchQuery>({});
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    fileTypes: true,
    dimensions: false,
    tags: true,
  });

  const categories = [
    'Mechanical Parts',
    'Electronics',
    'Fasteners',
    'Brackets',
    'Housings',
    'Connectors',
    'Gears',
    'Bearings',
  ];

  const fileTypes = ['step', 'stl', 'obj'];

  const commonTags = [
    'automotive',
    'aerospace',
    'industrial',
    'prototype',
    '3d-printed',
    'cnc-machined',
    'injection-molded',
    'sheet-metal',
  ];

  const updateFilters = (newFilters: Partial<SearchQuery>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h2>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 mb-3"
          >
            Categories
            {expandedSections.categories ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {expandedSections.categories && (
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={filters.category === category}
                    onChange={(e) => updateFilters({ category: e.target.value })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* File Types */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('fileTypes')}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 mb-3"
          >
            File Types
            {expandedSections.fileTypes ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {expandedSections.fileTypes && (
            <div className="space-y-2">
              {fileTypes.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="file_type"
                    value={type}
                    checked={filters.file_type === type}
                    onChange={(e) => updateFilters({ file_type: e.target.value as any })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 uppercase">{type}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('tags')}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 mb-3"
          >
            Tags
            {expandedSections.tags ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {expandedSections.tags && (
            <div className="space-y-2">
              {commonTags.map((tag) => (
                <label key={tag} className="flex items-center">
                  <input
                    type="checkbox"
                    value={tag}
                    checked={filters.tags?.includes(tag) || false}
                    onChange={(e) => {
                      const currentTags = filters.tags || [];
                      const newTags = e.target.checked
                        ? [...currentTags, tag]
                        : currentTags.filter(t => t !== tag);
                      updateFilters({ tags: newTags });
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{tag}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Dimensions */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('dimensions')}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 mb-3"
          >
            Dimensions (mm)
            {expandedSections.dimensions ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {expandedSections.dimensions && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Length</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => updateFilters({
                      dimensions: {
                        ...filters.dimensions,
                        min_length: parseFloat(e.target.value) || undefined,
                      }
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => updateFilters({
                      dimensions: {
                        ...filters.dimensions,
                        max_length: parseFloat(e.target.value) || undefined,
                      }
                    })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => updateFilters({
                      dimensions: {
                        ...filters.dimensions,
                        min_width: parseFloat(e.target.value) || undefined,
                      }
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => updateFilters({
                      dimensions: {
                        ...filters.dimensions,
                        max_width: parseFloat(e.target.value) || undefined,
                      }
                    })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => updateFilters({
                      dimensions: {
                        ...filters.dimensions,
                        min_height: parseFloat(e.target.value) || undefined,
                      }
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => updateFilters({
                      dimensions: {
                        ...filters.dimensions,
                        max_height: parseFloat(e.target.value) || undefined,
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}