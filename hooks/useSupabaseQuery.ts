import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/configs/supabase'
import { SupabaseResponse, Tables, TableRow } from '@/configs/supabase'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

type QueryState<T> = {
  loading: boolean
  error: string | null
  data: T | null
}

type TableName = keyof Tables
type WhereClause = Record<string, any>

export function useSupabaseQuery<T extends TableName>(table: T) {
  const [state, setState] = useState<QueryState<TableRow<T>[]>>({
    loading: false,
    error: null,
    data: null,
  })

  const fetchData = useCallback(
    async (
      whereClause?: WhereClause,
      options?: {
        limit?: number
        offset?: number
        orderBy?: { column: string; ascending?: boolean }
      }
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        let query = supabase.from(table).select('*') as PostgrestFilterBuilder<
          any,
          any,
          any[]
        >

        // Apply where clauses
        if (whereClause) {
          Object.entries(whereClause).forEach(([key, value]) => {
            query = query.eq(key, value)
          })
        }

        // Apply pagination and ordering
        if (options?.limit) {
          query = query.limit(options.limit)
        }
        if (options?.offset) {
          query = query.range(
            options.offset,
            options.offset + (options.limit || 10) - 1
          )
        }
        if (options?.orderBy) {
          query = query.order(options.orderBy.column, {
            ascending: options.orderBy.ascending ?? true,
          })
        }

        const { data, error } = await query

        if (error) {
          throw error
        }

        setState({ loading: false, error: null, data })
      } catch (error: any) {
        setState({
          loading: false,
          error: handleSupabaseError(error),
          data: null,
        })
      }
    },
    [table]
  )

  const insert = useCallback(
    async (data: Partial<TableRow<T>>): Promise<SupabaseResponse<TableRow<T>>> => {
      try {
        const result = await supabase
          .from(table)
          .insert(data)
          .select()
          .single()

        if (result.error) {
          throw result.error
        }

        return { data: result.data, error: null }
      } catch (error: any) {
        return { data: null, error }
      }
    },
    [table]
  )

  const update = useCallback(
    async (
      id: string,
      data: Partial<TableRow<T>>
    ): Promise<SupabaseResponse<TableRow<T>>> => {
      try {
        const result = await supabase
          .from(table)
          .update(data)
          .eq('id', id)
          .select()
          .single()

        if (result.error) {
          throw result.error
        }

        return { data: result.data, error: null }
      } catch (error: any) {
        return { data: null, error }
      }
    },
    [table]
  )

  const remove = useCallback(
    async (id: string): Promise<SupabaseResponse<null>> => {
      try {
        const { error } = await supabase.from(table).delete().eq('id', id)

        if (error) {
          throw error
        }

        return { data: null, error: null }
      } catch (error: any) {
        return { data: null, error }
      }
    },
    [table]
  )
  const mutate = useCallback(
    async (data: Partial<TableRow<T>>, id?: string): Promise<SupabaseResponse<TableRow<T>>> => {
      if (id) {
        return update(id, data);
      } else {
        return insert(data);
      }
    },
    [insert, update]
  );

  return {
    ...state,
    fetchData,
    insert,
    update,
    remove,
    mutate,
  }
}
