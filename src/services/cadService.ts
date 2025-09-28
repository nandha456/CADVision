import { supabase } from '../lib/supabase';
import type { CADModel, SearchQuery } from '../types';

export class CADService {
  async searchModels(query: SearchQuery): Promise<CADModel[]> {
    let supabaseQuery = supabase
      .from('cad_models')
      .select('*');

    // Apply filters
    if (query.text) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query.text}%,description.ilike.%${query.text}%`);
    }

    if (query.category) {
      supabaseQuery = supabaseQuery.eq('category', query.category);
    }

    if (query.file_type) {
      supabaseQuery = supabaseQuery.eq('file_type', query.file_type);
    }

    if (query.tags && query.tags.length > 0) {
      supabaseQuery = supabaseQuery.overlaps('tags', query.tags);
    }

    const { data, error } = await supabaseQuery
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    return data || [];
  }

  async getAllModels(): Promise<CADModel[]> {
    const { data, error } = await supabase
      .from('cad_models')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch models: ${error.message}`);
    }

    return data || [];
  }

  async getModelById(id: string): Promise<CADModel | null> {
    const { data, error } = await supabase
      .from('cad_models')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch model: ${error.message}`);
    }

    return data;
  }

  async uploadModel(file: File, metadata: Partial<CADModel>): Promise<CADModel> {
    // First upload the file
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `cad-models/${fileName}`;

    const { data: fileData, error: fileError } = await supabase.storage
      .from('cad-files')
      .upload(filePath, file);

    if (fileError) {
      throw new Error(`File upload failed: ${fileError.message}`);
    }

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create database record
    const modelData = {
      name: metadata.name || file.name,
      filename: fileName,
      file_path: filePath,
      file_type: this.getFileType(file.name),
      category: metadata.category || 'Uncategorized',
      dimensions: metadata.dimensions || { length: 0, width: 0, height: 0 },
      file_size: file.size,
      description: metadata.description,
      tags: metadata.tags || [],
      metadata: metadata.metadata || {},
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('cad_models')
      .insert(modelData)
      .select()
      .single();

    if (error) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('cad-files').remove([filePath]);
      throw new Error(`Failed to save model metadata: ${error.message}`);
    }

    return data;
  }

  async deleteModel(id: string): Promise<void> {
    // Get model to find file path
    const model = await this.getModelById(id);
    if (!model) {
      throw new Error('Model not found');
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('cad-files')
      .remove([model.file_path]);

    if (storageError) {
      console.warn('Failed to delete file from storage:', storageError);
    }

    // Delete database record
    const { error } = await supabase
      .from('cad_models')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete model: ${error.message}`);
    }
  }

  async updateModel(id: string, updates: Partial<CADModel>): Promise<CADModel> {
    const { data, error } = await supabase
      .from('cad_models')
      .update({
        name: updates.name,
        category: updates.category,
        dimensions: updates.dimensions,
        description: updates.description,
        tags: updates.tags,
        metadata: updates.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update model: ${error.message}`);
    }

    return data;
  }

  private getFileType(filename: string): 'step' | 'stl' | 'obj' {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'step':
      case 'stp':
        return 'step';
      case 'stl':
        return 'stl';
      case 'obj':
        return 'obj';
      default:
        return 'stl';
    }
  }

  // Mock AI search functionality
  async visualSimilaritySearch(imageFile: File): Promise<CADModel[]> {
    // This would integrate with actual AI service
    console.log('Visual similarity search for:', imageFile.name);
    return this.getAllModels().then(models => models.slice(0, 5));
  }

  async semanticSearch(query: string): Promise<CADModel[]> {
    // This would integrate with actual NLP service
    console.log('Semantic search for:', query);
    return this.searchModels({ text: query });
  }
}