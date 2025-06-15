import { supabase } from '@/lib/supabase/client'
import { TableRow } from '@/configs/supabase'

export type AudioTrack = TableRow<'audio_tracks'>

export class AudioService {
  private static AUDIO_BUCKET = 'audio-files'

  static async getTrack(trackId: string): Promise<AudioTrack | null> {
    const { data, error } = await supabase
      .from('audio_tracks')
      .select('*')
      .eq('id', trackId)
      .single()

    if (error) {
      console.error('Error fetching track:', error)
      return null
    }

    return data
  }

  static async getTracksByType(type: AudioTrack['type']) {
    const { data, error } = await supabase
      .from('audio_tracks')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tracks:', error)
      return []
    }

    return data
  }

  static async uploadTrack(
    file: File,
    metadata: Omit<AudioTrack, 'id' | 'url' | 'created_at'>
  ) {
    const fileExt = file.name.split('.').pop()
    const filePath = `${Date.now()}-${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from(this.AUDIO_BUCKET)
      .upload(filePath, file)

    if (uploadError) {
      throw new Error('Error uploading file')
    }

    const { data: { publicUrl } } = supabase.storage
      .from(this.AUDIO_BUCKET)
      .getPublicUrl(filePath)

    const { data, error } = await supabase
      .from('audio_tracks')
      .insert({
        ...metadata,
        url: publicUrl,
      })
      .select()
      .single()

    if (error) {
      // Cleanup the uploaded file
      await supabase.storage
        .from(this.AUDIO_BUCKET)
        .remove([filePath])
      throw error
    }

    return data
  }

  static async deleteTrack(trackId: string) {
    const track = await this.getTrack(trackId)
    if (!track) return

    // Extract filename from URL
    const url = new URL(track.url)
    const filePath = url.pathname.split('/').pop()

    if (filePath) {
      await supabase.storage
        .from(this.AUDIO_BUCKET)
        .remove([filePath])
    }

    const { error } = await supabase
      .from('audio_tracks')
      .delete()
      .eq('id', trackId)

    if (error) {
      throw error
    }
  }

  static async updateMetadata(
    trackId: string,
    metadata: Partial<Omit<AudioTrack, 'id' | 'url' | 'created_at'>>
  ) {
    const { data, error } = await supabase
      .from('audio_tracks')
      .update(metadata)
      .eq('id', trackId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  static async updateTranscript(trackId: string, transcriptUrl: string) {
    return this.updateMetadata(trackId, { transcript_url: transcriptUrl })
  }

  static async updateInteractiveSegments(
    trackId: string,
    segments: AudioTrack['interactive_segments']
  ) {
    return this.updateMetadata(trackId, { interactive_segments: segments })
  }

  static async updateChapters(
    trackId: string,
    chapters: AudioTrack['chapters']
  ) {
    return this.updateMetadata(trackId, { chapters })
  }
}
