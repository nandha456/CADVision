import { useState } from 'react';
import ModelCard from './ModelCard';
import type { CADModel } from '../../types';

interface LibraryGridProps {
  models: CADModel[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  onModelSelect: (model: CADModel) => void;
  onModelEdit: (model: CADModel) => void;
  onModelDelete: (model: CADModel) => void;
  selectedModelId?: string;
}

export default function LibraryGrid({
  models,
  viewMode,
  isLoading,
  onModelSelect,
  onModelEdit,
  onModelDelete,
  selectedModelId,
}: LibraryGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading models...</p>
        </div>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No models found</h3>
        <p className="text-sm text-gray-500 mb-4">Start by uploading your first CAD model</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Upload Model
        </button>
      </div>
    );
  }

  return (
    <div className={
      viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
        : 'space-y-2'
    }>
      {models.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          viewMode={viewMode}
          onSelect={onModelSelect}
          onEdit={onModelEdit}
          onDelete={onModelDelete}
          isSelected={model.id === selectedModelId}
        />
      ))}
    </div>
  );
}