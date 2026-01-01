export type Json =
  | string
  | number
  | boolean
  | null
  | { [key]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          date: string
          exercises: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          date: string
          exercises: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          exercises?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      personal_records: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          best_weight: number | null
          best_reps: number | null
          best_weight_date: string | null
          workout_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          best_weight?: number | null
          best_reps?: number | null
          best_weight_date?: string | null
          workout_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          best_weight?: number | null
          best_reps?: number | null
          best_weight_date?: string | null
          workout_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sync_queue: {
        Row: {
          id: string
          user_id: string
          operation: string
          table_name: string
          data: Json
          synced: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          operation: string
          table_name: string
          data: Json
          synced?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          operation?: string
          table_name?: string
          data?: Json
          synced?: boolean
          created_at?: string
        }
      }
    }
  }
}
