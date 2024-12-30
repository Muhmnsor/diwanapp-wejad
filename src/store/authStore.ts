import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: any | null;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialize: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      set({ user });
      
      // Subscribe to auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user ?? null });
      });
    } catch (error) {
      console.error('Error initializing auth store:', error);
      set({ user: null });
    }
  },
}));