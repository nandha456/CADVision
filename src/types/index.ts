export interface CADModel {
  id: string;
  name: string;
  filename: string;
  file_path: string;
  file_type: 'step' | 'stl' | 'obj';
  category: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  file_size: number;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  description?: string;
  tags: string[];
  metadata: Record<string, any>;
}

export interface SearchQuery {
  text?: string;
  category?: string;
  file_type?: string;
  tags?: string[];
  dimensions?: {
    min_length?: number;
    max_length?: number;
    min_width?: number;
    max_width?: number;
    min_height?: number;
    max_height?: number;
  };
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface ViewerState {
  model: CADModel | null;
  isLoading: boolean;
  error: string | null;
  editMode: boolean;
  parameters: {
    scale: number;
    rotation: { x: number; y: number; z: number };
    position: { x: number; y: number; z: number };
  };
}