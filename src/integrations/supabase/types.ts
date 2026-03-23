export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string
          featured_image: string | null
          id: string
          org_id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["page_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          featured_image?: string | null
          id?: string
          org_id: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["page_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          featured_image?: string | null
          id?: string
          org_id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["page_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      award_recipients: {
        Row: {
          award_id: string
          awarded_at: string
          id: string
          member_id: string
          notes: string | null
          season_id: string | null
        }
        Insert: {
          award_id: string
          awarded_at?: string
          id?: string
          member_id: string
          notes?: string | null
          season_id?: string | null
        }
        Update: {
          award_id?: string
          awarded_at?: string
          id?: string
          member_id?: string
          notes?: string | null
          season_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "award_recipients_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "award_recipients_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "award_recipients_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      awards: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          org_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          org_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "awards_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bracket_matches: {
        Row: {
          bracket_id: string
          created_at: string
          id: string
          match_number: number
          round_number: number
          scheduled_date: string | null
          status: Database["public"]["Enums"]["match_status"]
          team1_id: string | null
          team1_score: number | null
          team2_id: string | null
          team2_score: number | null
          venue: string | null
          winner_id: string | null
        }
        Insert: {
          bracket_id: string
          created_at?: string
          id?: string
          match_number: number
          round_number: number
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          team1_id?: string | null
          team1_score?: number | null
          team2_id?: string | null
          team2_score?: number | null
          venue?: string | null
          winner_id?: string | null
        }
        Update: {
          bracket_id?: string
          created_at?: string
          id?: string
          match_number?: number
          round_number?: number
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          team1_id?: string | null
          team1_score?: number | null
          team2_id?: string | null
          team2_score?: number | null
          venue?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bracket_matches_bracket_id_fkey"
            columns: ["bracket_id"]
            isOneToOne: false
            referencedRelation: "brackets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bracket_matches_team1_id_fkey"
            columns: ["team1_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bracket_matches_team2_id_fkey"
            columns: ["team2_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bracket_matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      brackets: {
        Row: {
          config: Json | null
          created_at: string
          division_id: string
          id: string
          is_reseeding: boolean
          name: string
          status: Database["public"]["Enums"]["bracket_status"]
          team_count: number
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          division_id: string
          id?: string
          is_reseeding?: boolean
          name: string
          status?: Database["public"]["Enums"]["bracket_status"]
          team_count?: number
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          division_id?: string
          id?: string
          is_reseeding?: boolean
          name?: string
          status?: Database["public"]["Enums"]["bracket_status"]
          team_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brackets_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          league_id: string
          name: string
          rules: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          league_id: string
          name: string
          rules?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          league_id?: string
          name?: string
          rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          channel: Database["public"]["Enums"]["communication_channel"]
          id: string
          member_id: string
          message: string
          sent_at: string
          status: Database["public"]["Enums"]["delivery_status"]
          subject: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["communication_channel"]
          id?: string
          member_id: string
          message: string
          sent_at?: string
          status?: Database["public"]["Enums"]["delivery_status"]
          subject?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["communication_channel"]
          id?: string
          member_id?: string
          message?: string
          sent_at?: string
          status?: Database["public"]["Enums"]["delivery_status"]
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      conferences: {
        Row: {
          created_at: string
          division_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          division_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          division_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "conferences_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinary_records: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          member_id: string
          notes: string | null
          reason: string
          start_date: string
          type: Database["public"]["Enums"]["disciplinary_type"]
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          member_id: string
          notes?: string | null
          reason: string
          start_date: string
          type: Database["public"]["Enums"]["disciplinary_type"]
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          member_id?: string
          notes?: string | null
          reason?: string
          start_date?: string
          type?: Database["public"]["Enums"]["disciplinary_type"]
        }
        Relationships: [
          {
            foreignKeyName: "disciplinary_records_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      divisions: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          name: string
          qb_cap: number | null
          season_id: string
          status: Database["public"]["Enums"]["division_status"]
          team_cap: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          name: string
          qb_cap?: number | null
          season_id: string
          status?: Database["public"]["Enums"]["division_status"]
          team_cap?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          name?: string
          qb_cap?: number | null
          season_id?: string
          status?: Database["public"]["Enums"]["division_status"]
          team_cap?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "divisions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "divisions_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          menu_order: number
          org_id: string
          show_in_menu: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url: string
          id?: string
          menu_order?: number
          org_id: string
          show_in_menu?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          menu_order?: number
          org_id?: string
          show_in_menu?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          created_at: string
          dns_provider: string | null
          domain: string
          id: string
          org_id: string
          ssl_status: Database["public"]["Enums"]["ssl_status"]
          status: Database["public"]["Enums"]["domain_status"]
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          dns_provider?: string | null
          domain: string
          id?: string
          org_id: string
          ssl_status?: Database["public"]["Enums"]["ssl_status"]
          status?: Database["public"]["Enums"]["domain_status"]
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          dns_provider?: string | null
          domain?: string
          id?: string
          org_id?: string
          ssl_status?: Database["public"]["Enums"]["ssl_status"]
          status?: Database["public"]["Enums"]["domain_status"]
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domains_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          member_id: string
          name: string
          phone: string
          relationship: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          name: string
          phone: string
          relationship?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          name?: string
          phone?: string
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      fields: {
        Row: {
          created_at: string
          id: string
          location_id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fields_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          away_score: number | null
          away_team_id: string | null
          created_at: string
          division_id: string
          field_id: string | null
          home_score: number | null
          home_team_id: string | null
          id: string
          notes: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          status: Database["public"]["Enums"]["game_status"]
          updated_at: string
        }
        Insert: {
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string
          division_id: string
          field_id?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          notes?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          updated_at?: string
        }
        Update: {
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string
          division_id?: string
          field_id?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          notes?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          created_at: string
          id: string
          name: string
          org_id: string
          settings: Json | null
          sport_type: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          org_id: string
          settings?: Json | null
          sport_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          settings?: Json | null
          sport_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leagues_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          created_at: string
          google_maps_url: string | null
          id: string
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          google_maps_url?: string | null
          id?: string
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          google_maps_url?: string | null
          id?: string
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      member_notes: {
        Row: {
          author_id: string | null
          category: Database["public"]["Enums"]["note_category"]
          created_at: string
          id: string
          member_id: string
          text: string
        }
        Insert: {
          author_id?: string | null
          category?: Database["public"]["Enums"]["note_category"]
          created_at?: string
          id?: string
          member_id: string
          text: string
        }
        Update: {
          author_id?: string | null
          category?: Database["public"]["Enums"]["note_category"]
          created_at?: string
          id?: string
          member_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_notes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_ratings: {
        Row: {
          defensive: number | null
          id: string
          member_id: string
          offensive: number | null
          qb: number | null
          season_id: string
          updated_at: string
        }
        Insert: {
          defensive?: number | null
          id?: string
          member_id: string
          offensive?: number | null
          qb?: number | null
          season_id: string
          updated_at?: string
        }
        Update: {
          defensive?: number | null
          id?: string
          member_id?: string
          offensive?: number | null
          qb?: number | null
          season_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_ratings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_ratings_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      member_tag_assignments: {
        Row: {
          id: string
          member_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          member_id: string
          tag_id: string
        }
        Update: {
          id?: string
          member_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_tag_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "member_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      member_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          org_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          org_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_tags_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          last_name: string
          org_id: string
          phone: string | null
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          last_name: string
          org_id: string
          phone?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          last_name?: string
          org_id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          org_id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["page_status"]
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          org_id: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["page_status"]
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          org_id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["page_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      player_game_stats: {
        Row: {
          created_at: string
          game_id: string
          id: string
          member_id: string
          stat_key: string
          team_id: string
          value: number
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          member_id: string
          stat_key: string
          team_id: string
          value?: number
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          member_id?: string
          stat_key?: string
          team_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_game_stats_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_game_stats_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_game_stats_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_forms: {
        Row: {
          capacity: number | null
          closes_at: string | null
          created_at: string
          id: string
          name: string
          opens_at: string | null
          season_id: string
          status: Database["public"]["Enums"]["registration_status"]
          type: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          closes_at?: string | null
          created_at?: string
          id?: string
          name: string
          opens_at?: string | null
          season_id: string
          status?: Database["public"]["Enums"]["registration_status"]
          type?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          closes_at?: string | null
          created_at?: string
          id?: string
          name?: string
          opens_at?: string | null
          season_id?: string
          status?: Database["public"]["Enums"]["registration_status"]
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_forms_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_submissions: {
        Row: {
          data: Json | null
          form_id: string
          id: string
          member_id: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string
          team_name: string | null
        }
        Insert: {
          data?: Json | null
          form_id: string
          id?: string
          member_id?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string
          team_name?: string | null
        }
        Update: {
          data?: Json | null
          form_id?: string
          id?: string
          member_id?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string
          team_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registration_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "registration_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_submissions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          league_id: string
          name: string
          registration_open: boolean
          start_date: string | null
          status: Database["public"]["Enums"]["season_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          league_id: string
          name: string
          registration_open?: boolean
          start_date?: string | null
          status?: Database["public"]["Enums"]["season_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          league_id?: string
          name?: string
          registration_open?: boolean
          start_date?: string | null
          status?: Database["public"]["Enums"]["season_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasons_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      standing_overrides: {
        Row: {
          created_at: string
          created_by: string | null
          division_id: string
          field: string
          id: string
          new_value: string
          old_value: string | null
          reason: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          division_id: string
          field: string
          id?: string
          new_value: string
          old_value?: string | null
          reason?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          division_id?: string
          field?: string
          id?: string
          new_value?: string
          old_value?: string | null
          reason?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "standing_overrides_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standing_overrides_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      standings_profiles: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          league_id: string
          name: string
          points_config: Json | null
          sort_criteria: Json | null
          tiebreak_rules: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          league_id: string
          name: string
          points_config?: Json | null
          sort_criteria?: Json | null
          tiebreak_rules?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          league_id?: string
          name?: string
          points_config?: Json | null
          sort_criteria?: Json | null
          tiebreak_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "standings_profiles_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      stat_definitions: {
        Row: {
          abbreviation: string
          category: Database["public"]["Enums"]["stat_category"]
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          label: string
          org_id: string
          stat_key: string
        }
        Insert: {
          abbreviation: string
          category: Database["public"]["Enums"]["stat_category"]
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          label: string
          org_id: string
          stat_key: string
        }
        Update: {
          abbreviation?: string
          category?: Database["public"]["Enums"]["stat_category"]
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          label?: string
          org_id?: string
          stat_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "stat_definitions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stat_tracking_config: {
        Row: {
          category_id: string
          enabled: boolean
          id: string
          stat_definition_id: string
        }
        Insert: {
          category_id: string
          enabled?: boolean
          id?: string
          stat_definition_id: string
        }
        Update: {
          category_id?: string
          enabled?: boolean
          id?: string
          stat_definition_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stat_tracking_config_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stat_tracking_config_stat_definition_id_fkey"
            columns: ["stat_definition_id"]
            isOneToOne: false
            referencedRelation: "stat_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      team_players: {
        Row: {
          id: string
          jersey_number: number | null
          joined_at: string
          member_id: string
          role: Database["public"]["Enums"]["roster_role"]
          team_id: string
        }
        Insert: {
          id?: string
          jersey_number?: number | null
          joined_at?: string
          member_id: string
          role?: Database["public"]["Enums"]["roster_role"]
          team_id: string
        }
        Update: {
          id?: string
          jersey_number?: number | null
          joined_at?: string
          member_id?: string
          role?: Database["public"]["Enums"]["roster_role"]
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_players_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          conference_id: string | null
          created_at: string
          division_id: string
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          team_photo_url: string | null
          updated_at: string
        }
        Insert: {
          conference_id?: string | null
          created_at?: string
          division_id: string
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          team_photo_url?: string | null
          updated_at?: string
        }
        Update: {
          conference_id?: string | null
          created_at?: string
          division_id?: string
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          team_photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_conference_id_fkey"
            columns: ["conference_id"]
            isOneToOne: false
            referencedRelation: "conferences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waivers: {
        Row: {
          created_at: string
          document_url: string | null
          expiry_date: string | null
          id: string
          member_id: string
          signed_date: string | null
          status: Database["public"]["Enums"]["waiver_status"]
          waiver_type: string
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          member_id: string
          signed_date?: string | null
          status?: Database["public"]["Enums"]["waiver_status"]
          waiver_type: string
        }
        Update: {
          created_at?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          member_id?: string
          signed_date?: string | null
          status?: Database["public"]["Enums"]["waiver_status"]
          waiver_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "waivers_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_award_org_id: { Args: { _award_id: string }; Returns: string }
      get_bracket_org_id: { Args: { _bracket_id: string }; Returns: string }
      get_category_org_id: { Args: { _category_id: string }; Returns: string }
      get_division_org_id: { Args: { _division_id: string }; Returns: string }
      get_form_org_id: { Args: { _form_id: string }; Returns: string }
      get_game_org_id: { Args: { _game_id: string }; Returns: string }
      get_league_org_id: { Args: { _league_id: string }; Returns: string }
      get_location_org_id: { Args: { _location_id: string }; Returns: string }
      get_member_org_id: { Args: { _member_id: string }; Returns: string }
      get_org_role: {
        Args: { _org_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["org_role"]
      }
      get_season_org_id: { Args: { _season_id: string }; Returns: string }
      get_team_org_id: { Args: { _team_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      bracket_status: "setup" | "active" | "completed"
      communication_channel: "email" | "sms"
      delivery_status: "sent" | "failed" | "pending"
      disciplinary_type: "warning" | "suspension" | "ban"
      division_status: "setup" | "active" | "completed"
      domain_status: "pending_dns" | "active" | "error"
      game_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "postponed"
      gender_type: "male" | "female" | "other"
      match_status: "upcoming" | "in_progress" | "completed"
      member_status: "active" | "inactive" | "pending"
      note_category:
        | "general"
        | "phone_call"
        | "meeting"
        | "issue"
        | "follow_up"
      org_role: "owner" | "admin" | "manager" | "staff" | "viewer"
      page_status: "draft" | "published" | "archived"
      registration_status: "draft" | "open" | "closed" | "archived"
      roster_role: "player" | "captain" | "coach"
      season_status:
        | "draft"
        | "registration"
        | "active"
        | "completed"
        | "archived"
      ssl_status: "pending" | "active" | "error"
      stat_category:
        | "passing"
        | "rushing"
        | "receiving"
        | "defense"
        | "special_teams"
        | "general"
      submission_status: "pending" | "approved" | "rejected" | "waitlisted"
      waiver_status: "signed" | "unsigned" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      bracket_status: ["setup", "active", "completed"],
      communication_channel: ["email", "sms"],
      delivery_status: ["sent", "failed", "pending"],
      disciplinary_type: ["warning", "suspension", "ban"],
      division_status: ["setup", "active", "completed"],
      domain_status: ["pending_dns", "active", "error"],
      game_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "postponed",
      ],
      gender_type: ["male", "female", "other"],
      match_status: ["upcoming", "in_progress", "completed"],
      member_status: ["active", "inactive", "pending"],
      note_category: ["general", "phone_call", "meeting", "issue", "follow_up"],
      org_role: ["owner", "admin", "manager", "staff", "viewer"],
      page_status: ["draft", "published", "archived"],
      registration_status: ["draft", "open", "closed", "archived"],
      roster_role: ["player", "captain", "coach"],
      season_status: [
        "draft",
        "registration",
        "active",
        "completed",
        "archived",
      ],
      ssl_status: ["pending", "active", "error"],
      stat_category: [
        "passing",
        "rushing",
        "receiving",
        "defense",
        "special_teams",
        "general",
      ],
      submission_status: ["pending", "approved", "rejected", "waitlisted"],
      waiver_status: ["signed", "unsigned", "expired"],
    },
  },
} as const
