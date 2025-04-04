import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Test the connection
const testConnection = async () => {
  try {
    const { error } = await supabase
      .from('health_check_logs')
      .select('count')
      .limit(1)
      .single()

    if (error) throw error
    console.log('Supabase connection successful')
  } catch (error) {
    console.error('Supabase connection failed:', error)
  }
}

testConnection() 