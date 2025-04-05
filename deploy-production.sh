#!/bin/bash

# Exit on any error
set -e

echo "🚀 Deploying to Railway Production environment..."

# Login to Railway CLI if not already logged in
if ! railway whoami &>/dev/null; then
  echo "🔑 Not logged in to Railway. Please login..."
  railway login
fi

# Link to the project with production environment
echo "🔗 Linking to Railway project (production environment)..."
railway link --environment production

# Deploy the application
echo "📦 Deploying to Railway..."
railway up --detach

echo "✅ Production deployment complete!"
echo "📝 You can check the status of your deployment with: railway status"
echo "🌐 Your application should be available at: https://vivi2-production.up.railway.app" 