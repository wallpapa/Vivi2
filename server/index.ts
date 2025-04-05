import express from 'express';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// Environment configuration with explicit defaults
const ENV = {
  NODE_ENV: process.env.NODE_ENV || process.env.RAILWAY_ENVIRONMENT || 'development',
  PORT: process.env.PORT || 8080,
  API_URL: process.env.VITE_API_URL || `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost:8080'}`,
  RAILWAY_PUBLIC_DOMAIN: process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
};

// Log environment configuration at startup
console.log('=== Environment Configuration ===');
console.log('NODE_ENV:', ENV.NODE_ENV);
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
console.log('VITE_API_URL:', process.env.VITE_API_URL);
console.log('RAILWAY_PUBLIC_DOMAIN:', process.env.RAILWAY_PUBLIC_DOMAIN);
console.log('API_URL:', ENV.API_URL);
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
        has_supabase: !!supabase,
        railway_env: process.env.RAILWAY_ENVIRONMENT
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
          h1 { color: #0070f3; }
          canvas { max-width: 600px; margin-top: 2rem; }
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
          const urlParams = new URLSearchParams(window.location.search);
          document.getElementById('branchSelect').value = urlParams.get('branch') || '';
          document.getElementById('doctorSelect').value = urlParams.get('doctor') || '';
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
                title: { display: true, text: 'Monthly Revenue' }
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

// Admin report route
app.get('/admin/report', async (req, res) => {
  if (!supabase) {
    return res.status(503).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Report Unavailable</title>
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
        <h1>⚠️ Report Unavailable</h1>
        <p>The report is currently unavailable because Supabase is not configured.</p>
        <p>Please set up Supabase credentials in the environment configuration.</p>
      </body>
      </html>
    `);
  }

  try {
    const { data, error } = await supabase
      .from('payments')
      .select('id, created_at, amount, patient_name, doctor, branch')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    const rows = data.map((r) => `
      <tr>
        <td>${r.created_at}</td>
        <td>${r.patient_name || '-'}</td>
        <td>${r.doctor || '-'}</td>
        <td>${r.branch || '-'}</td>
        <td style="text-align:right;">${r.amount.toLocaleString()}</td>
      </tr>
    `).join('');

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Transaction Report</title>
        <style>
          body {
            font-family: sans-serif;
            margin: 2rem;
            background: #fff;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2rem;
          }
          th, td {
            padding: 8px 12px;
            border-bottom: 1px solid #ccc;
          }
          th {
            background: #0070f3;
            color: white;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <h1>📁 รายงานการชำระเงินล่าสุด</h1>
        <table>
          <thead>
            <tr>
              <th>วันที่</th>
              <th>ชื่อคนไข้</th>
              <th>แพทย์</th>
              <th>สาขา</th>
              <th style="text-align:right;">ยอดเงิน</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Report Error</title>
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
        <h1>❌ Report Error</h1>
        <p>An error occurred while fetching report data:</p>
        <pre style="color: #d32f2f;">${error instanceof Error ? error.message : 'Unknown error'}</pre>
      </body>
      </html>
    `);
  }
});

// Admin commission route
app.get('/admin/commission', async (req, res) => {
  if (!supabase) {
    return res.status(503).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Commission Unavailable</title>
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
        <h1>⚠️ Commission Unavailable</h1>
        <p>The commission page is currently unavailable because Supabase is not configured.</p>
        <p>Please set up Supabase credentials in the environment configuration.</p>
      </body>
      </html>
    `);
  }

  try {
    const { data, error } = await supabase
      .from('commissions')
      .select('staff_name, staff_type, total_earnings, month')
      .order('month', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    const rows = data.map((r) => `
      <tr>
        <td>${r.month}</td>
        <td>${r.staff_name}</td>
        <td>${r.staff_type}</td>
        <td style="text-align:right;">${r.total_earnings?.toLocaleString() || 0}</td>
      </tr>
    `).join('');

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Commission Summary</title>
        <style>
          body {
            font-family: sans-serif;
            margin: 2rem;
            background: #fafafa;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2rem;
          }
          th, td {
            padding: 8px 12px;
            border-bottom: 1px solid #ddd;
          }
          th {
            background: #28a745;
            color: white;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <h1>💰 Commission Overview</h1>
        <table>
          <thead>
            <tr>
              <th>เดือน</th>
              <th>ชื่อบุคลากร</th>
              <th>ประเภท</th>
              <th style="text-align:right;">รายได้รวม (บาท)</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Commission error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Commission Error</title>
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
        <h1>❌ Commission Error</h1>
        <p>An error occurred while fetching commission data:</p>
        <pre style="color: #d32f2f;">${error instanceof Error ? error.message : 'Unknown error'}</pre>
      </body>
      </html>
    `);
  }
});

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../client')));

// Catch-all route for SPA support
app.get('*', (_req, res) => {
  const indexPath = path.join(__dirname, '../client/index.html');
  console.log('Serving index.html from:', indexPath);
  res.sendFile(indexPath);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running in ${ENV.NODE_ENV} mode on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`API URL: ${ENV.API_URL}`);
  console.log(`Static files served from: ${path.join(__dirname, '../client')}`);
});