import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ynibjnazouypdvwgozih.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaWJqbmF6b3V5cGR2d2dvemloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NDAxMjcsImV4cCI6MjA0OTMxNjEyN30.wH1Q3NMSHagAK1feUaZOVSef6dL1HmbQnGVDMoyg7do";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    }
  }
);