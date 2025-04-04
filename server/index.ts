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
const port = process.env.PORT || 3001

// Validate required environment variables
const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingEnvVars.length > 0) {
  console.error('=== Environment Variable Error ===')
  console.error('Missing required environment variables:')
  missingEnvVars.forEach(varName => {
    console.error(`- ${varName}`)
  })
  console.error('Please ensure all required environment variables are set in Railway')
  console.error('================================')
  process.exit(1)
}

// Initialize Supabase client with error handling
let supabase
try {
  supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false
      }
    }
  )
  console.log('Supabase client initialized successfully')
} catch (error) {
  console.error('=== Supabase Initialization Error ===')
  console.error('Failed to initialize Supabase client:', error)
  console.error('Please check your Supabase credentials')
  console.error('================================')
  process.exit(1)
}

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

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

app.use(express.json())

// Serve static files from the React app
app.use(express.static(join(__dirname, '../dist')))

// Basic health check
app.get('/api/health', async (req, res) => {
  const response = { 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  }
  
  // Send response immediately
  res.json(response)
  
  // Log health check in background without blocking response
  try {
    await logHealthCheck('basic', 'ok', response)
  } catch (error) {
    console.error('Failed to log health check:', error)
  }
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
      apiUrl: !!process.env.VITE_API_URL,
      nodeEnv: process.env.NODE_ENV || 'development'
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
app.listen(port, () => {
  console.log('=== Server Startup Information ===')
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Port: ${port}`)
  console.log(`Supabase URL: ${process.env.VITE_SUPABASE_URL ? 'Configured' : 'Missing'}`)
  console.log(`Supabase Key: ${process.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}`)
  console.log(`API URL: ${process.env.VITE_API_URL || 'Not configured'}`)
  console.log(`Server running at http://localhost:${port}`)
  console.log(`Health check: http://localhost:${port}/api/health`)
  console.log(`Detailed health check: http://localhost:${port}/api/health/detailed`)
  console.log('================================')
}) 