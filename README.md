# Vivi - Health Dashboard Application

A full-stack health monitoring dashboard built with React, Express, and Supabase.

## Features

- Real-time health monitoring
- Critical alerts and notifications
- Detailed system metrics
- Filterable health check logs
- Beautiful and responsive UI

## Tech Stack

- Frontend: React, Vite, TailwindCSS
- Backend: Express, Node.js
- Database: Supabase (PostgreSQL)
- Testing: Vitest, React Testing Library

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Supabase account and project

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://your-backend-service.railway.app
```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Deployment

### Deploying to Railway

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link your project:
   ```bash
   railway link
   ```

4. Deploy your application:
   ```bash
   railway up
   ```

5. Set environment variables in Railway dashboard:
   - Go to your project settings
   - Add the required environment variables from your `.env` file

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 