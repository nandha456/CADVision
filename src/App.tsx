import { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import LibraryGrid from './components/library/LibraryGrid';
import ThreeViewer from './components/viewer/ThreeViewer';
import UploadModal from './components/modals/UploadModal';
import { CADService } from './services/cadService';
import type { CADModel, SearchQuery } from './types';

const cadService = new CADService();

function App() {
  const [models, setModels] = useState<CADModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<CADModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<CADModel | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<SearchQuery>({});

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [models, searchQuery, filters]);

  const loadModels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For demo purposes, let's create some sample data if no models exist
      const fetchedModels = await cadService.getAllModels();
      
      if (fetchedModels.length === 0) {
        // Create sample models for demonstration
        const sampleModels: CADModel[] = [
          {
            id: '1',
            name: 'Mounting Bracket v2.1',
            filename: 'bracket_v2.1.step',
            file_path: 'cad-models/bracket_v2.1.step',
            file_type: 'step',
            category: 'Brackets',
            dimensions: { length: 150, width: 75, height: 25 },
            file_size: 2048000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            description: 'Heavy-duty mounting bracket for industrial applications',
            tags: ['industrial', 'mounting', 'steel'],
            metadata: { material: 'Steel', finish: 'Galvanized' },
          },
          {
            id: '2',
            name: 'Gear Assembly 24T',
            filename: 'gear_24t.stl',
            file_path: 'cad-models/gear_24t.stl',
            file_type: 'stl',
            category: 'Gears',
            dimensions: { length: 50, width: 50, height: 12 },
            file_size: 1536000,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString(),
            description: '24-tooth spur gear for mechanical transmissions',
            tags: ['mechanical', 'transmission', '3d-printed'],
            metadata: { teeth: 24, module: 2, material: 'PLA' },
          },
          {
            id: '3',
            name: 'Electronics Housing',
            filename: 'housing_v1.obj',
            file_path: 'cad-models/housing_v1.obj',
            file_type: 'obj',
            category: 'Housings',
            dimensions: { length: 100, width: 80, height: 40 },
            file_size: 3072000,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date(Date.now() - 172800000).toISOString(),
            description: 'Waterproof housing for electronic components',
            tags: ['electronics', 'waterproof', 'injection-molded'],
            metadata: { rating: 'IP67', material: 'ABS' },
          },
        ];
        setModels(sampleModels);
      } else {
        setModels(fetchedModels);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...models];

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(query) ||
        model.description?.toLowerCase().includes(query) ||
        model.category.toLowerCase().includes(query) ||
        model.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(model => model.category === filters.category);
    }

    // Apply file type filter
    if (filters.file_type) {
      filtered = filtered.filter(model => model.file_type === filters.file_type);
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(model =>
        filters.tags!.some(tag => model.tags.includes(tag))
      );
    }

    // Apply dimension filters
    if (filters.dimensions) {
      const { dimensions } = filters;
      filtered = filtered.filter(model => {
        const { length, width, height } = model.dimensions;
        return (
          (!dimensions.min_length || length >= dimensions.min_length) &&
          (!dimensions.max_length || length <= dimensions.max_length) &&
          (!dimensions.min_width || width >= dimensions.min_width) &&
          (!dimensions.max_width || width <= dimensions.max_width) &&
          (!dimensions.min_height || height >= dimensions.min_height) &&
          (!dimensions.max_height || height <= dimensions.max_height)
        );
      });
    }

    setFilteredModels(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: SearchQuery) => {
    setFilters(newFilters);
  };

  const handleModelSelect = (model: CADModel) => {
    setSelectedModel(model);
  };

  const handleModelEdit = (model: CADModel) => {
    // TODO: Implement model editing
    console.log('Edit model:', model);
  };

  const handleModelDelete = async (model: CADModel) => {
    if (window.confirm(`Are you sure you want to delete "${model.name}"?`)) {
      try {
        await cadService.deleteModel(model.id);
        setModels(prev => prev.filter(m => m.id !== model.id));
        if (selectedModel?.id === model.id) {
          setSelectedModel(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete model');
      }
    }
  };

  const handleUpload = async (file: File, metadata: Partial<CADModel>) => {
    try {
      const newModel = await cadService.uploadModel(file, metadata);
      setModels(prev => [newModel, ...prev]);
    } catch (err) {
      throw err; // Re-throw to be handled by the modal
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        onSearch={handleSearch}
        onUpload={() => setShowUploadModal(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onFilterChange={handleFilterChange} />
        
        <main className="flex-1 flex overflow-hidden">
          {/* Model Library */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  CAD Model Library
                </h2>
                <p className="text-sm text-gray-600">
                  {filteredModels.length} models found
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <LibraryGrid
                models={filteredModels}
                viewMode={viewMode}
                isLoading={isLoading}
                onModelSelect={handleModelSelect}
                onModelEdit={handleModelEdit}
                onModelDelete={handleModelDelete}
                selectedModelId={selectedModel?.id}
              />
            </div>
          </div>

          {/* 3D Viewer */}
          <div className="w-96 border-l border-gray-200 bg-white">
            <ThreeViewer
              model={selectedModel}
              className="h-full"
              onParameterChange={(params) => console.log('Parameters changed:', params)}
            />
          </div>
        </main>
      </div>

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}

export default App;