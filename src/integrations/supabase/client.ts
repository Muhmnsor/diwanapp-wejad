import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynibjnazouypdvwgozih.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaWJqbmF6b3V5cGR2d2dvemloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM1MTg0NjAsImV4cCI6MjAxOTA5NDQ2MH0.SbUXk6cqZuazcGHGPdcUYGhyKh5tn0BBhF3YhXKI4PU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }
});