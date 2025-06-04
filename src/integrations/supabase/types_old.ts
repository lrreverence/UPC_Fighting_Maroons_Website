export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {      achievement: {
        Row: {
          achievement_description: string | null
          team_id: string
          title: string
          year: number
        }
        Insert: {
          achievement_description?: string | null
          team_id: string
          title: string
          year: number
        }
        Update: {
          achievement_description?: string | null
          team_id?: string
          title?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "achievement_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["team_id"]
          },        ]
      },
      athlete: {
        Row: {
          birthdate: string | null
          block: string | null
          course: string | null
          department: string | null
          email: string | null
          fname: string
          hometown: string | null
          image_url: string | null
          lname: string
          mname: string | null
          phone_number: string | null
          student_id: number
          team_id: string | null
          year_level: number | null
        }
        Insert: {
          birthdate?: string | null
          block?: string | null
          course?: string | null
          department?: string | null
          email?: string | null
          fname: string
          hometown?: string | null
          image_url?: string | null
          lname: string
          mname?: string | null
          phone_number?: string | null
          student_id: number
          team_id?: string | null
          year_level?: number | null
        }
        Update: {
          birthdate?: string | null
          block?: string | null
          course?: string | null
          department?: string | null
          email?: string | null
          fname?: string
          hometown?: string | null
          image_url?: string | null
          lname?: string
          mname?: string | null
          phone_number?: string | null
          student_id?: number
          team_id?: string | null
          year_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["team_id"]
          },        ]
      },      game: {
        Row: {
          end_time: string | null
          game_date: string
          game_id: string
          game_status: string | null
          location: string | null
          opponent_team: string | null
          start_time: string
          team_id: string
        }
        Insert: {
          end_time?: string | null
          game_date: string
          game_id: string
          game_status?: string | null
          location?: string | null
          opponent_team?: string | null
          start_time: string
          team_id: string
        }
        Update: {
          end_time?: string | null
          game_date?: string
          game_id?: string
          game_status?: string | null
          location?: string | null
          opponent_team?: string | null
          start_time?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["team_id"]
          },
        ]
      }
      game_participation: {
        Row: {
          game_id: string
          stat_description: string | null
          student_id: number
        }
        Insert: {
          game_id: string
          stat_description?: string | null
          student_id: number
        }
        Update: {
          game_id?: string
          stat_description?: string | null
          student_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_participation_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "game"
            referencedColumns: ["game_id"]
          },
          {
            foreignKeyName: "game_participation_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "athlete"
            referencedColumns: ["student_id"]
          },
        ]
      }
      news: {
        Row: {
          category: string | null
          created_at: string
          date: string
          excerpt: string | null
          id: string
          image: string | null
          reference_link: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          date: string
          excerpt?: string | null
          id?: string
          image?: string | null
          reference_link?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          date?: string
          excerpt?: string | null
          id?: string
          image?: string | null
          reference_link?: string | null          title?: string
        },
        Relationships: []
      },
      stats: {
        Row: {
          events: number | null
          losses: number | null
          medals: number | null
          points: number | null
          records: number | null
          team_id: string
          top_performer: string | null
          wins: number | null
        }
        Insert: {
          events?: number | null
          losses?: number | null
          medals?: number | null
          points?: number | null
          records?: number | null
          team_id: string
          top_performer?: string | null
          wins?: number | null
        }
        Update: {
          events?: number | null
          losses?: number | null
          medals?: number | null
          points?: number | null
          records?: number | null
          team_id?: string
          top_performer?: string | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stats_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "team"
            referencedColumns: ["team_id"]
          },        ]
      },      team: {
        Row: {
          coach_name: string
          sport: string
          team_id: string
          team_name: string
        }
        Insert: {
          coach_name: string
          sport: string
          team_id: string
          team_name: string
        }
        Update: {
          coach_name?: string
          sport?: string
          team_id?: string
          team_name?: string
        }
        Relationships: []
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
