import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { TableRow } from '@/configs/supabase'
import { realtimeService } from '@/services/realtimeService'

type Progress = TableRow<'user_progress'>

export function useProgress(trackId: string, userId: string) {
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch initial progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('track_id', trackId)
          .eq('user_id', userId)
          .single()

        if (error) {
          throw error
        }

        setProgress(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error fetching progress'))
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [trackId, userId])

  // Subscribe to progress updates
  useEffect(() => {
    const handleUpdate = (payload: any) => {
      if (payload.new) {
        setProgress(payload.new as Progress)
      }
    }

    const channelName = `progress:${trackId}:${userId}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `track_id=eq.${trackId},user_id=eq.${userId}`,
        },
        handleUpdate
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [trackId, userId])

  // Update progress
  const updateProgress = useCallback(
    async (
      data: Pick<Progress, 'progress' | 'last_position' | 'completed' | 'notes'>
    ) => {
      try {
        if (!progress?.id) {
          // Create new progress record
          const { data: newProgress, error } = await supabase
            .from('user_progress')
            .insert({
              track_id: trackId,
              user_id: userId,
              ...data,
            })
            .select()
            .single()

          if (error) throw error
          setProgress(newProgress)
          return newProgress
        }

        // Update existing progress
        const { data: updatedProgress, error } = await supabase
          .from('user_progress')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', progress.id)
          .select()
          .single()

        if (error) throw error
        setProgress(updatedProgress)
        return updatedProgress
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error updating progress'))
        throw err
      }
    },
    [trackId, userId, progress]
  )

  // Update specific progress fields
  const updateLastPosition = useCallback(
    (position: number) => updateProgress({ last_position: position } as any),
    [updateProgress]
  )

  const updateCompletionProgress = useCallback(
    (percent: number) => updateProgress({ progress: percent } as any),
    [updateProgress]
  )

  const markCompleted = useCallback(
    () => updateProgress({ completed: true } as any),
    [updateProgress]
  )

  const addNote = useCallback(
    (note: string) =>
      updateProgress({
        notes: progress?.notes
          ? [...JSON.parse(progress.notes), note]
          : [note],
      } as any),
    [updateProgress, progress]
  )

  return {
    progress,
    loading,
    error,
    updateProgress,
    updateLastPosition,
    updateCompletionProgress,
    markCompleted,
    addNote,
  }
}

// Hook for getting user stats across all tracks
export function useUserStats(userId: string) {
  const [stats, setStats] = useState<{
    total_prayers: number
    total_time: number
    streak_days: number
    favorite_type: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_user_stats', {
          user_id: userId,
        })

        if (error) throw error
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error fetching stats'))
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  return { stats, loading, error }
}
