import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

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

console.log('=== Environment Variables Check ===')
console.log('All required environment variables are set:')
requiredEnvVars.forEach(varName => {
  console.log(`- ${varName}: ${process.env[varName] ? '✓' : '✗'}`)
})
console.log('================================')

export {} 