import { supabase } from '@/lib/supabase/client'
import { TableRow } from '@/configs/supabase'

export type Favorite = TableRow<'user_favorites'>

import { useState, useEffect, useCallback } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { TableRow } from '@/configs/supabase'

export type Favorite = TableRow<'user_favorites'>

export class FavoriteService {
  static async getUserFavorites(userId: string) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        *,
        audio_tracks (
          id,
          title,
          type,
          duration,
          language
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data
  }

  static async addFavorite(userId: string, trackId: string) {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        track_id: trackId,
      })
      .select()
      .single()

    if (error) {
      // Ignore duplicate favorites
      if (error.code === '23505') {
        return null
      }
      throw error
    }

    return data
  }

  static async removeFavorite(userId: string, trackId: string) {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('track_id', trackId)

    if (error) {
      throw error
    }

    return true
  }

  static async isFavorite(userId: string, trackId: string) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('track_id', trackId)
      .single()

    if (error) {
      // Not found is okay here
      if (error.code === 'PGRST116') {
        return false
      }
      throw error
    }

    return Boolean(data)
  }
}

// Hook for managing favorites
export function useFavorites(userId: string) {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await FavoriteService.getUserFavorites(userId)
        setFavorites(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error fetching favorites'))
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [userId])

  const addFavorite = useCallback(
    async (trackId: string) => {
      try {
        const favorite = await FavoriteService.addFavorite(userId, trackId)
        if (favorite) {
          setFavorites((prev) => [...prev, favorite])
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error adding favorite'))
        throw err
      }
    },
    [userId]
  )

  const removeFavorite = useCallback(
    async (trackId: string) => {
      try {
        await FavoriteService.removeFavorite(userId, trackId)
        setFavorites((prev) =>
          prev.filter((fav) => fav.track_id !== trackId)
        )
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error removing favorite'))
        throw err
      }
    },
    [userId]
  )

  const checkIsFavorite = useCallback(
    async (trackId: string) => {
      try {
        return await FavoriteService.isFavorite(userId, trackId)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error checking favorite'))
        return false
      }
    },
    [userId]
  )

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    checkIsFavorite,
  }
}
