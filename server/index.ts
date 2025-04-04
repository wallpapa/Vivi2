import express from 'express'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = process.env.PORT || 3001

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

// Log health check result to database
async function logHealthCheck(checkType: string, status: string, details: any, errorMessage?: string) {
  try {
    const { error } = await supabase
      .from('health_check_logs')
      .insert({
        check_type: checkType,
        status,
        details,
        error_message: errorMessage
      })

    if (error) {
      console.error('Failed to log health check:', error)
    }
  } catch (error) {
    console.error('Error logging health check:', error)
  }
}

app.use(express.json())

// Serve static files from the React app
app.use(express.static(join(__dirname, '../dist')))

// Basic health check
app.get('/api/health', async (req, res) => {
  const response = { 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }
  
  await logHealthCheck('basic', 'ok', response)
  res.json(response)
})

// Detailed health check
app.get('/api/health/detailed', async (req, res) => {
  try {
    // Check Supabase connection
    const { data: supabaseHealth, error: supabaseError } = await supabase
      .from('health_check')
      .select('count')
      .limit(1)

    // Check environment variables
    const envVars = {
      port: !!process.env.PORT,
      supabaseUrl: !!process.env.VITE_SUPABASE_URL,
      supabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
      apiUrl: !!process.env.VITE_API_URL
    }

    // System metrics
    const metrics = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime()
    }

    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      supabase: {
        connected: !supabaseError,
        error: supabaseError?.message
      },
      envVars,
      metrics
    }

    await logHealthCheck('detailed', 'ok', response)
    res.json(response)
  } catch (error) {
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    await logHealthCheck('detailed', 'error', errorResponse, error instanceof Error ? error.message : 'Unknown error')
    res.status(500).json(errorResponse)
  }
})

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'))
})

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`)
}) 