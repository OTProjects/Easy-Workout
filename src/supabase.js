import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project URL and anon key
// You can find these in your Supabase project settings
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-key'

// Create client even with placeholder credentials for development
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if we have valid credentials
export const hasValidCredentials = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseAnonKey !== 'placeholder-key' &&
         supabaseUrl.includes('supabase.co')
}