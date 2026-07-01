// Auto-generated Supabase types - will be replaced by `supabase gen types` after DB setup

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          plan: 'free' | 'pro';
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro';
          stripe_customer_id?: string | null;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro';
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          serial_config: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          description?: string | null;
          serial_config?: Json;
        };
        Update: {
          name?: string;
          description?: string | null;
          serial_config?: Json;
          updated_at?: string;
        };
      };
      macros: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          color: string;
          actions: Json;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          project_id: string;
          name: string;
          color?: string;
          actions: Json;
          sort_order?: number;
        };
        Update: {
          name?: string;
          color?: string;
          actions?: Json;
          sort_order?: number;
          updated_at?: string;
        };
      };
      discovered_devices: {
        Row: {
          id: string;
          project_id: string;
          slave_id: number;
          label: string | null;
          last_seen: string;
          supported_functions: number[];
          response_time_ms: number | null;
          metadata: Json;
        };
        Insert: {
          project_id: string;
          slave_id: number;
          label?: string | null;
          supported_functions?: number[];
          response_time_ms?: number | null;
          metadata?: Json;
        };
        Update: {
          label?: string | null;
          last_seen?: string;
          supported_functions?: number[];
          response_time_ms?: number | null;
          metadata?: Json;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          status: string;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
        };
        Update: {
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
        };
      };
    };
  };
}
