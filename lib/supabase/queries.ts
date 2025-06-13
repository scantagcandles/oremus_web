// Funkcje dla ODB Player
export async function getAudioTracks(category?: string) {
  const supabase = createClient()
  
  let query = supabase
    .from('audio_tracks')
    .select('*')
    .eq('is_active', true)
  
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getPlaylists() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('playlists')
    .select('*, playlist_tracks(*)')
    .or(`is_public.eq.true,user_id.eq.${user?.id}`)
  
  if (error) throw error
  return data
}

export async function trackPlayback(trackId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return
  
  const { error } = await supabase
    .from('playback_history')
    .insert({
      user_id: user.id,
      track_id: trackId,
      played_at: new Date().toISOString()
    })
  
  if (error) console.error('Error tracking playback:', error)
}