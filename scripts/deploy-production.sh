#!/bin/bash

# Deploy to Production Environment
echo "🚀 Deploying FM5 to Production Environment"

# Safety confirmation
echo "⚠️  You are about to deploy to PRODUCTION."
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Production deployment cancelled"
    exit 1
fi

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Ensure tests pass before production deployment
echo "🧪 Running tests..."
npm run test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed - deployment cancelled"
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Create deployment tag
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TAG_NAME="production-$TIMESTAMP"

echo "🏷️  Creating deployment tag: $TAG_NAME"
git tag -a "$TAG_NAME" -m "Production deployment $TIMESTAMP"

# Deploy to production
echo "🌐 Deploying to Cloudflare Workers (Production)..."
wrangler deploy --env production

if [ $? -eq 0 ]; then
    echo "✅ Production deployment successful!"

    # Wait for deployment to be live
    echo "⏱️  Waiting for deployment to be live..."
    sleep 15

    # Run health check
    echo "🏥 Running health check..."
    HEALTH_URL="https://fm5-production.your-domain.workers.dev/health"

    if curl -f -s "$HEALTH_URL" > /dev/null; then
        echo "✅ Health check passed"
        curl -s "$HEALTH_URL" | jq .

        # Push the tag
        echo "📤 Pushing deployment tag..."
        git push origin "$TAG_NAME"

    else
        echo "❌ Health check failed"
        echo "Consider rolling back: wrangler rollback --name fm5-production"
        exit 1
    fi
else
    echo "❌ Production deployment failed"
    exit 1
fi

echo "🎉 Production deployment complete!"
echo "📋 Deployment tag created: $TAG_NAME"