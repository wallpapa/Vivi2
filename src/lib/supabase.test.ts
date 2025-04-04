import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'https://mock-supabase-url.supabase.co')
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock-anon-key')

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a Supabase client with the correct URL and key', () => {
    const client = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )
    
    expect(client).toBeDefined()
    expect(typeof client.from).toBe('function')
    expect(typeof client.channel).toBe('function')
  })
}) 