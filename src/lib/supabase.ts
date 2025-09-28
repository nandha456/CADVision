import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      cad_models: {
        Row: {
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
          thumbnail_url: string | null;
          description: string | null;
          tags: string[];
          metadata: Record<string, any>;
          user_id: string;
        };
        Insert: {
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
          thumbnail_url?: string | null;
          description?: string | null;
          tags?: string[];
          metadata?: Record<string, any>;
          user_id: string;
        };
        Update: {
          name?: string;
          filename?: string;
          file_path?: string;
          file_type?: 'step' | 'stl' | 'obj';
          category?: string;
          dimensions?: {
            length: number;
            width: number;
            height: number;
          };
          file_size?: number;
          thumbnail_url?: string | null;
          description?: string | null;
          tags?: string[];
          metadata?: Record<string, any>;
        };
      };
    };
  };
};