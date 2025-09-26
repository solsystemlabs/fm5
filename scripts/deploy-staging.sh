#!/bin/bash

# Deploy to Staging Environment
echo "🚀 Deploying FM5 to Staging Environment"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Deploy to staging
echo "🌐 Deploying to Cloudflare Workers (Staging)..."
wrangler deploy --env staging

if [ $? -eq 0 ]; then
    echo "✅ Staging deployment successful!"

    # Wait for deployment to be live
    echo "⏱️  Waiting for deployment to be live..."
    sleep 10

    # Run health check
    echo "🏥 Running health check..."
    HEALTH_URL="https://fm5-staging.your-domain.workers.dev/health"

    if curl -f -s "$HEALTH_URL" > /dev/null; then
        echo "✅ Health check passed"
        curl -s "$HEALTH_URL" | jq .
    else
        echo "❌ Health check failed"
        echo "Check the deployment logs: wrangler tail --env staging"
        exit 1
    fi
else
    echo "❌ Staging deployment failed"
    exit 1
fi

echo "🎉 Staging deployment complete!"