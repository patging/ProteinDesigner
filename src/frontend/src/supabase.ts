import { createClient } from "@supabase/supabase-js";

const supabaseURL = "https://sdgijnrgcbyupslsncyw.supabase.co";

const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ2lqbnJnY2J5dXBzbHNuY3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTcsImV4cCI6MjA4NzQzNzk1N30.q5CNYourLPM1qCdJWbdMzUbqM9-yDQU8014Awsc6Qco";


export const supabase = createClient(supabaseURL, supabaseAnonKey)