import { useState } from 'react';
import { Calendar, Download, CreditCard as Edit3, Trash2, Tag, Ruler } from 'lucide-react';
import type { CADModel } from '../../types';

interface ModelCardProps {
  model: CADModel;
  viewMode: 'grid' | 'list';
  onSelect: (model: CADModel) => void;
  onEdit: (model: CADModel) => void;
  onDelete: (model: CADModel) => void;
  isSelected?: boolean;
}

export default function ModelCard({ 
  model, 
  viewMode, 
  onSelect, 
  onEdit, 
  onDelete, 
  isSelected = false 
}: ModelCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'step': return 'bg-blue-100 text-blue-800';
      case 'stl': return 'bg-green-100 text-green-800';
      case 'obj': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`flex items-center p-4 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer ${
          isSelected ? 'border-blue-500 shadow-md bg-blue-50' : ''
        }`}
        onClick={() => onSelect(model)}
      >
        {/* Thumbnail */}
        <div className="w-16 h-16 flex-shrink-0 mr-4">
          {!imageError && model.thumbnail_url ? (
            <img
              src={model.thumbnail_url}
              alt={model.name}
              className="w-full h-full object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <div className={`px-2 py-1 rounded text-xs font-medium ${getFileTypeColor(model.file_type)}`}>
                {model.file_type.toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">{model.name}</h3>
            <div className="flex items-center space-x-1 ml-4">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(model); }}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(model); }}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
            <span className="flex items-center">
              <Ruler className="w-3 h-3 mr-1" />
              {model.dimensions.length}×{model.dimensions.width}×{model.dimensions.height}mm
            </span>
            <span>{formatFileSize(model.file_size)}</span>
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(model.created_at)}
            </span>
          </div>
          
          {model.tags && model.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Tag className="w-3 h-3 text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {model.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {model.tags.length > 3 && (
                  <span className="text-xs text-gray-400">+{model.tags.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group ${
        isSelected ? 'border-blue-500 shadow-lg' : ''
      }`}
      onClick={() => onSelect(model)}
    >
      {/* Thumbnail */}
      <div className="aspect-square w-full p-4">
        {!imageError && model.thumbnail_url ? (
          <img
            src={model.thumbnail_url}
            alt={model.name}
            className="w-full h-full object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${getFileTypeColor(model.file_type)}`}>
              {model.file_type.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900 truncate">{model.name}</h3>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(model); }}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(model); }}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-2">{model.category}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center">
            <Ruler className="w-3 h-3 mr-1" />
            {model.dimensions.length}×{model.dimensions.width}×{model.dimensions.height}mm
          </span>
          <span>{formatFileSize(model.file_size)}</span>
        </div>

        {model.tags && model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {model.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {model.tags.length > 2 && (
              <span className="text-xs text-gray-400 py-1">+{model.tags.length - 2}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(model.created_at)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); /* Handle download */ }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}