export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          settings?: Json;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          settings?: Json;
        };
      };
      agents: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          model_provider: string;
          model_name: string;
          system_prompt: string | null;
          config: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          model_provider?: string;
          model_name?: string;
          system_prompt?: string | null;
          config?: Json;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          model_provider?: string;
          model_name?: string;
          system_prompt?: string | null;
          config?: Json;
          is_active?: boolean;
        };
      };
      conversations: {
        Row: {
          id: string;
          agent_id: string;
          user_id: string;
          title: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          user_id: string;
          title?: string | null;
          metadata?: Json;
        };
        Update: {
          title?: string | null;
          metadata?: Json;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          metadata?: Json;
        };
        Update: never;
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          key_hash: string;
          last_used_at: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          key_hash: string;
          expires_at?: string | null;
        };
        Update: never;
      };
    };
  };
}

export type Agent = Database["public"]["Tables"]["agents"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];