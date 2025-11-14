import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

// Create a singleton Supabase client to avoid multiple instances
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabaseInstance && SUPABASE_URL && SUPABASE_ANON_KEY &&
      SUPABASE_URL !== 'https://placeholder.supabase.co' &&
      SUPABASE_ANON_KEY !== 'placeholder_key_replace_with_your_actual_key') {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseInstance;
};