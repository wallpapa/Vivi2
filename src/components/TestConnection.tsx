import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestConnection() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase.from('health_check_logs').select('count')
      if (error) throw error
      console.log('Connection successful:', data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
} 