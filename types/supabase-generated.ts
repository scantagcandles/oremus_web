export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          name: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
          name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          name?: string | null
          avatar_url?: string | null
        }
      }
      candles: {
        Row: {
          id: string
          user_id: string
          intention: string
          expires_at: string
          created_at: string
          nfc_id: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          intention: string
          expires_at: string
          created_at?: string
          nfc_id?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          intention?: string
          expires_at?: string
          created_at?: string
          nfc_id?: string | null
          is_active?: boolean
        }
      }
      masses: {
        Row: {
          id: string
          user_id: string
          intention: string
          scheduled_date: string
          created_at: string
          type: 'regular' | 'requiem' | 'thanksgiving'
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          priest_notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          intention: string
          scheduled_date: string
          created_at?: string
          type?: 'regular' | 'requiem' | 'thanksgiving'
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          priest_notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          intention?: string
          scheduled_date?: string
          created_at?: string
          type?: 'regular' | 'requiem' | 'thanksgiving'
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          priest_notes?: string | null
        }
      }
      audio_tracks: {
        Row: {
          id: string
          title: string
          url: string
          duration: number
          type: 'prayer' | 'course' | 'odb' | 'mass'
          language: string
          created_at: string
          is_premium: boolean
          transcript_url: string | null
          interactive_segments: {
            timestamp: number
            text: string
            response?: string
            type: 'listen' | 'respond' | 'meditate'
          }[] | null
          chapters: {
            timestamp: number
            title: string
          }[] | null
        }
        Insert: {
          id?: string
          title: string
          url: string
          duration: number
          type: 'prayer' | 'course' | 'odb' | 'mass'
          language: string
          created_at?: string
          is_premium?: boolean
          transcript_url?: string | null
          interactive_segments?: {
            timestamp: number
            text: string
            response?: string
            type: 'listen' | 'respond' | 'meditate'
          }[] | null
          chapters?: {
            timestamp: number
            title: string
          }[] | null
        }
        Update: {
          id?: string
          title?: string
          url?: string
          duration?: number
          type?: 'prayer' | 'course' | 'odb' | 'mass'
          language?: string
          created_at?: string
          is_premium?: boolean
          transcript_url?: string | null
          interactive_segments?: {
            timestamp: number
            text: string
            response?: string
            type: 'listen' | 'respond' | 'meditate'
          }[] | null
          chapters?: {
            timestamp: number
            title: string
          }[] | null
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          track_id: string
          progress: number
          completed: boolean
          created_at: string
          updated_at: string
          last_position: number
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          track_id: string
          progress?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
          last_position?: number
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          track_id?: string
          progress?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
          last_position?: number
          notes?: string | null
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          track_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          track_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          track_id?: string
          created_at?: string
        }
      }
      mass_intentions: {
        Row: {
          id: string
          content: string
          preferred_date: string
          preferred_time: string | null
          mass_type: string
          requestor_name: string
          requestor_email: string
          requestor_phone: string | null
          status: string
          scheduled_date: string | null
          scheduled_time: string | null
          priest_id: string | null
          church_id: string | null
          payment_id: string | null
          payment_amount: number
          payment_method: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          preferred_date: string
          preferred_time?: string | null
          mass_type: string
          requestor_name: string
          requestor_email: string
          requestor_phone?: string | null
          status?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          priest_id?: string | null
          church_id?: string | null
          payment_id?: string | null
          payment_amount: number
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          preferred_date?: string
          preferred_time?: string | null
          mass_type?: string
          requestor_name?: string
          requestor_email?: string
          requestor_phone?: string | null
          status?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          priest_id?: string | null
          church_id?: string | null
          payment_id?: string | null
          payment_amount?: number
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mass_intentions_church_id_fkey"
            columns: ["church_id"]
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mass_intentions_priest_id_fkey"
            columns: ["priest_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      churches: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          country: string
          timezone: string
          contact_email: string | null
          contact_phone: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          country?: string
          timezone?: string
          contact_email?: string | null
          contact_phone?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          country?: string
          timezone?: string
          contact_email?: string | null
          contact_phone?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          id: string
          parish_id: string
          title: string
          content: string
          start_date: string
          end_date: string | null
          is_published: boolean
          priority: "low" | "normal" | "high"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parish_id: string
          title: string
          content: string
          start_date: string
          end_date?: string | null
          is_published?: boolean
          priority?: "low" | "normal" | "high"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parish_id?: string
          title?: string
          content?: string
          start_date?: string
          end_date?: string | null
          is_published?: boolean
          priority?: "low" | "normal" | "high"
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      get_user_stats: {
        Args: { user_id: string }
        Returns: {
          total_prayers: number
          total_time: number
          streak_days: number
          favorite_type: string
        }
      }
    }
    Enums: {
      mass_type: 'regular' | 'requiem' | 'thanksgiving'
      mass_status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
      track_type: 'prayer' | 'course' | 'odb' | 'mass'
      segment_type: 'listen' | 'respond' | 'meditate'
      mass_intention_status: 'pending_payment' | 'paid' | 'rejected' | 'cancelled' | 'completed' | 'scheduled' | 'payment_failed'
    }
  }
}
