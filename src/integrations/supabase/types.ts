export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string
          id: string
          title: string
          year: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          title: string
          year: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          title?: string
          year?: string
        }
        Relationships: []
      }
      athletes: {
        Row: {
          achievements: string | null
          course: string
          created_at: string
          hometown: string
          id: string
          image_url: string | null
          name: string
          position: string
          sport: string
          year: string
        }
        Insert: {
          achievements?: string | null
          course: string
          created_at?: string
          hometown: string
          id?: string
          image_url?: string | null
          name: string
          position: string
          sport: string
          year: string
        }
        Update: {
          achievements?: string | null
          course?: string
          created_at?: string
          hometown?: string
          id?: string
          image_url?: string | null
          name?: string
          position?: string
          sport?: string
          year?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          created_at: string
          date: string
          id: string
          opponent: string
          sport: string
          time: string
          venue: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          opponent: string
          sport: string
          time: string
          venue: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          opponent?: string
          sport?: string
          time?: string
          venue?: string
        }
        Relationships: []
      }      
      news: {
        Row: {
          category: string
          created_at: string
          date: string
          excerpt: string
          id: string
          image: string
          reference_link: string | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          date: string
          excerpt: string
          id?: string
          image: string
          reference_link?: string | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          excerpt?: string
          id?: string
          image?: string
          reference_link?: string | null
          title?: string
        }
        Relationships: []
      }
      stats: {
        Row: {
          created_at: string
          events: number | null
          id: string
          losses: number | null
          medals: number | null
          points: number | null
          records: number | null
          title: string
          top_performer: string
          wins: number | null
        }
        Insert: {
          created_at?: string
          events?: number | null
          id?: string
          losses?: number | null
          medals?: number | null
          points?: number | null
          records?: number | null
          title: string
          top_performer: string
          wins?: number | null
        }
        Update: {
          created_at?: string
          events?: number | null
          id?: string
          losses?: number | null
          medals?: number | null
          points?: number | null
          records?: number | null
          title?: string
          top_performer?: string
          wins?: number | null
        }
        Relationships: []
      }
      stats_details: {
        Row: {
          created_at: string
          id: string
          key: string
          stats_id: string | null
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          stats_id?: string | null
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          stats_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "stats_details_stats_id_fkey"
            columns: ["stats_id"]
            isOneToOne: false
            referencedRelation: "stats"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
