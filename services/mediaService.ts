import { supabase } from '../lib/supabase/client';

export class MediaService {
  async getAudioCategories() {
    const { data, error } = await supabase
      .from('audio_content')
      .select('category')
      .eq('is_active', true)
      .order('category');
    if (error) throw error;
    // Zwracamy unikalne kategorie
    return Array.from(new Set((data || []).map((item: any) => item.category)));
  }

  async getAudioTracks(category: string) {
    const { data, error } = await supabase
      .from('audio_content')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('title');
    if (error) throw error;
    return data;
  }
}

export const mediaService = new MediaService(); 