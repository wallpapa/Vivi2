import express from 'express';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// Environment configuration with explicit defaults
const ENV = {
  NODE_ENV: process.env.NODE_ENV || process.env.RAILWAY_ENVIRONMENT || 'development',
  PORT: process.env.PORT || 8080,
  API_URL: process.env.VITE_API_URL || process.env.RAILWAY_STATIC_URL || `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`,
  RAILWAY_PUBLIC_DOMAIN: process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
};

// Log environment configuration at startup
console.log('=== Environment Configuration ===');
console.log(JSON.stringify(ENV, null, 2));
console.log('===============================');

// Convert __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client only if credentials are available
let supabase: SupabaseClient | null = null;
if (ENV.SUPABASE_URL && ENV.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('⚠️ Supabase credentials not provided - running without database functionality');
}

const app = express();
const port = parseInt(String(ENV.PORT), 10);

// CORS headers for cross-origin requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Basic health check - independent of Supabase
app.get('/api/health', (_req, res) => {
  console.log('Health check request received');
  try {
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: ENV.NODE_ENV,
      port: ENV.PORT,
      api_url: ENV.API_URL,
      version: process.version,
      memory: process.memoryUsage(),
      cwd: process.cwd(),
      pid: process.pid,
      railway_domain: ENV.RAILWAY_PUBLIC_DOMAIN,
      config: {
        node_env: ENV.NODE_ENV,
        api_url: ENV.API_URL,
        has_supabase: !!supabase
      }
    };
    
    console.log('Health check response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Serve static files from frontend build
const clientDistPath = path.join(__dirname, '../client/dist');
app.use('/app', express.static(clientDistPath));

// Root route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Vivi2 App</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #e0f7fa, #fff3e0);
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
          color: #333;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        p {
          font-size: 1.2rem;
        }
      </style>
    </head>
    <body>
      <div>
        <h1>🚀 Vivi2 Server is Running</h1>
        <p>Welcome to your deployed backend!</p>
        <a href="/app" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#0070f3;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">Go to Frontend</a>
      </div>
    </body>
    </html>
  `);
});

// Dashboard route - only available if Supabase is configured
app.get('/dashboard', async (req, res) => {
  if (!supabase) {
    return res.status(503).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Dashboard Unavailable</title>
        <style>
          body {
            font-family: sans-serif;
            margin: 2rem;
            background: #f4f4f4;
            text-align: center;
          }
          h1 { color: #d32f2f; }
        </style>
      </head>
      <body>
        <h1>⚠️ Dashboard Unavailable</h1>
        <p>The dashboard is currently unavailable because Supabase is not configured.</p>
        <p>Please set up Supabase credentials in the environment configuration.</p>
      </body>
      </html>
    `);
  }

  const { branch, doctor } = req.query;

  try {
    let query = supabase.from('payments').select('amount, created_at, branch, doctor');

    if (branch) {
      query = query.eq('branch', branch);
    }

    if (doctor) {
      query = query.eq('doctor', doctor);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const monthlyTotals: Record<string, number> = {};

    for (const entry of data) {
      const month = new Date(entry.created_at).toLocaleString('default', { month: 'short' });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + entry.amount;
    }

    const chartLabels = Object.keys(monthlyTotals);
    const chartValues = Object.values(monthlyTotals);

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Dashboard</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body {
            font-family: sans-serif;
            margin: 2rem;
            background: #f4f4f4;
          }
          h1 {
            color: #0070f3;
          }
          canvas {
            max-width: 600px;
            margin-top: 2rem;
          }
        </style>
      </head>
      <body>
        <h1>📊 Dashboard - Monthly Revenue</h1>
        <form id="filterForm" style="margin-bottom: 2rem;">
          <label>
            Branch:
            <select name="branch" id="branchSelect">
              <option value="">All</option>
              <option value="Ekkamai">Ekkamai</option>
              <option value="Siam">Siam</option>
            </select>
          </label>
          <label style="margin-left: 1rem;">
            Doctor:
            <select name="doctor" id="doctorSelect">
              <option value="">All</option>
              <option value="Dr.Kwankao">Dr.Kwankao</option>
              <option value="Dr.Nat">Dr.Nat</option>
            </select>
          </label>
          <button type="submit" style="margin-left: 1rem;">Filter</button>
        </form>
        <p style="color: #555;">Filtered by: Branch = ${branch || 'All'}, Doctor = ${doctor || 'All'}</p>
        <canvas id="myChart"></canvas>
        <script>
          // Set selected dropdown from query params
          const urlParams = new URLSearchParams(window.location.search);
          document.getElementById('branchSelect').value = urlParams.get('branch') || '';
          document.getElementById('doctorSelect').value = urlParams.get('doctor') || '';

          // Handle filter form submission
          document.getElementById('filterForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const branch = document.getElementById('branchSelect').value;
            const doctor = document.getElementById('doctorSelect').value;
            const query = new URLSearchParams({ branch, doctor }).toString();
            window.location.search = query;
          });

          const ctx = document.getElementById('myChart').getContext('2d');
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ${JSON.stringify(chartLabels)},
              datasets: [{
                label: 'Revenue (THB)',
                data: ${JSON.stringify(chartValues)},
                backgroundColor: '#0070f3'
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: {
                  display: true,
                  text: 'Monthly Revenue'
                }
              }
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Dashboard Error</title>
        <style>
          body {
            font-family: sans-serif;
            margin: 2rem;
            background: #f4f4f4;
            text-align: center;
          }
          h1 { color: #d32f2f; }
        </style>
      </head>
      <body>
        <h1>❌ Dashboard Error</h1>
        <p>An error occurred while fetching dashboard data:</p>
        <pre style="color: #d32f2f;">${error instanceof Error ? error.message : 'Unknown error'}</pre>
      </body>
      </html>
    `);
  }
});

// Catch-all route for SPA support
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running in ${ENV.NODE_ENV} mode on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`API URL: ${ENV.API_URL}`);
});