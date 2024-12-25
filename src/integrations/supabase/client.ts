import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynibjnazouypdvwgozih.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaWJqbmF6b3V5cGR2d2dvemloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NDAxMjcsImV4cCI6MjA0OTMxNjEyN30.wH1Q3NMSHagAK1feUaZOVSef6dL1HmbQnGVDMoyg7do';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});