import { useState, useEffect } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';
import { getSupabaseClient } from '../utils/supabaseClient';
import type { UseSupabaseReturn } from '../types';

export const useSupabase = (): UseSupabaseReturn => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Validate Supabase configuration
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || 
        SUPABASE_URL === 'https://placeholder.supabase.co' ||
        SUPABASE_ANON_KEY === 'placeholder_key_replace_with_your_actual_key') {
      setConfigError('Supabase credentials not configured. Please update your .env file with valid credentials.');
      setIsAuthReady(true);
      return;
    }

    try {
      // 2. Get singleton Supabase Client
      const supabaseClient = getSupabaseClient();
      setSupabase(supabaseClient);

      // 3. Set up user session (client-side ID only)
      const initSession = () => {
        // Use client-side session ID (no authentication required)
        const tempId = localStorage.getItem('temp_user_id') || crypto.randomUUID();
        localStorage.setItem('temp_user_id', tempId);
        setUserId(tempId);
        setIsAuthReady(true);
        // Dev-only logging
        try {
          if ((import.meta as any).env && (import.meta as any).env.MODE !== 'production') {
            console.log("✅ Using client-side session ID:", tempId.substring(0, 8) + "...");
          }
        } catch (e) {
          // ignore in non-vite environments
        }
      };

      initSession();
    } catch (error) {
      console.error("Supabase initialization error:", error);
      setConfigError(`Failed to initialize Supabase: ${(error as Error).message}`);
      setIsAuthReady(true);
    }
  }, []);

  return { supabase, userId, isAuthReady, configError };
};
