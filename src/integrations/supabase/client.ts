
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynibjnazouypdvwgozih.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaWJqbmF6b3V5cGR2d2dvemloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NDAxMjcsImV4cCI6MjA0OTMxNjEyN30.wH1Q3NMSHagAK1feUaZOVSef6dL1HmbQnGVDMoyg7do';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'supabase.auth.token',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit'
  }
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase client: Auth state changed:', event, session?.user?.id ? 'User logged in' : 'No user');
  
  if (event === 'SIGNED_OUT') {
    // Clear any auth data from localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('supabase.auth.token');
        console.log('Supabase client: Cleared auth data from localStorage');
      } catch (error) {
        console.error('Supabase client: Error clearing localStorage:', error);
      }
    }
  }
});
