#!/bin/bash

# Exit on any error
set -e

echo "🚀 Deploying to Railway Preview environment..."

# Login to Railway CLI if not already logged in
if ! railway whoami &>/dev/null; then
  echo "🔑 Not logged in to Railway. Please login..."
  railway login
fi

# Link to the project with preview environment
echo "🔗 Linking to Railway project (preview environment)..."
railway link --environment preview

# Deploy the application
echo "📦 Deploying to Railway..."
railway up --detach

echo "✅ Preview deployment complete!"
echo "📝 You can check the status of your deployment with: railway status" 