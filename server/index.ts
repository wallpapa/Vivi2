import express from 'express'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = parseInt(process.env.PORT || '8080', 10)  // Ensure port is a number

// Initialize Supabase client lazily
let supabaseClient: any = null;
const getSupabase = () => {
  if (!supabaseClient) {
    try {
      if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('Supabase credentials not configured - some features may be limited')
        return null
      }
      
      supabaseClient = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false
          }
        }
      )
      console.log('Supabase client initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
      return null
    }
  }
  return supabaseClient
}

// Log health check result to database
async function logHealthCheck(checkType: string, status: string, details: any, errorMessage?: string) {
  const supabase = getSupabase()
  if (!supabase) {
    console.warn('Skipping health check logging - Supabase not configured')
    return
  }
  
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

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

app.use(express.json())

// Serve static files from the React app
app.use(express.static(join(__dirname, '../dist')))

// Basic health check - independent of Supabase
app.get('/api/health', (_req, res) => {
  try {
    const response = { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001,
      api_url: process.env.VITE_API_URL || 'not set'
    }
    
    console.log('Health check response:', response)
    res.json(response)
    
    // Log health check in background without blocking
    logHealthCheck('basic', 'ok', response).catch(error => {
      console.error('Failed to log health check:', error)
    })
  } catch (error) {
    console.error('Health check error:', error)
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
})

// Detailed health check
app.get('/api/health/detailed', async (_req, res) => {
  const supabase = getSupabase()
  const response: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    envVars: {
      port: !!process.env.PORT,
      supabaseUrl: !!process.env.VITE_SUPABASE_URL,
      supabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
      apiUrl: !!process.env.VITE_API_URL,
      nodeEnv: process.env.NODE_ENV
    },
    metrics: {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  }

  // Only check Supabase if client is available
  if (supabase) {
    try {
      const { error: supabaseError } = await supabase
        .from('health_check')
        .select('count')
        .limit(1)

      response.supabase = {
        connected: !supabaseError,
        error: supabaseError?.message
      }
    } catch (error) {
      response.supabase = {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  } else {
    response.supabase = {
      connected: false,
      error: 'Supabase client not configured'
    }
  }

  res.json(response)
  
  // Log in background
  logHealthCheck('detailed', response.status, response).catch(error => {
    console.error('Failed to log detailed health check:', error)
  })
})

// Handle React routing
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'))
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log('=== Server Startup Information ===')
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Port: ${port}`)
  console.log(`API URL: ${process.env.VITE_API_URL || 'not set'}`)
  console.log(`Supabase: ${process.env.VITE_SUPABASE_URL ? 'configured' : 'not configured'}`)
  console.log(`Server running at http://0.0.0.0:${port}`)
  console.log(`Health check: http://0.0.0.0:${port}/api/health`)
  console.log(`Detailed health check: http://0.0.0.0:${port}/api/health/detailed`)
  console.log('================================')
}) 