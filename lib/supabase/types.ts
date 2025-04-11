export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string
          created_at: string
          user_id: string
          video_url: string
          pdf_url: string
          status: 'pending' | 'processing' | 'completed' | 'error'
          result: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          video_url: string
          pdf_url: string
          status?: 'pending' | 'processing' | 'completed' | 'error'
          result?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          video_url?: string
          pdf_url?: string
          status?: 'pending' | 'processing' | 'completed' | 'error'
          result?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 