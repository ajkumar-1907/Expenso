import { createClient } from "@supabase/supabase-js";

// Replace these with your own values from Supabase dashboard → Project Settings → API
const supabaseUrl = "https://htoymddwlvzefttucuow.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0b3ltZGR3bHZ6ZWZ0dHVjdW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTE1MjYsImV4cCI6MjA3NTQyNzUyNn0.nUkX5ZCXNcQsppDXOpGGWTJ03BM4ovtqb0xbTmKClvY";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
