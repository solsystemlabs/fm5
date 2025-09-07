#!/bin/bash

# Development environment setup script for FM5

echo "🚀 Setting up FM5 development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Docker is running"
echo "✅ Node.js $(node -v) is installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please review and update the .env file with your settings"
fi

# Start database
echo "🐘 Starting PostgreSQL database..."
docker compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker compose exec -T postgres pg_isready -U fm5_user -d fm5_dev >/dev/null 2>&1; do
    sleep 1
done

echo "✅ Database is ready"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Push database schema
echo "🗃️  Pushing database schema..."
npm run db:push

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "To start development (automatically starts database):"
echo "  npm run dev"
echo ""
echo "Other useful commands:"
echo "  npm run db:studio    - Open Prisma Studio"
echo "  npm run test         - Run tests"
echo "  npm run lint         - Run linting"
echo "  npm run build        - Build for production"
echo "  npm run deploy       - Deploy to Cloudflare Workers"
echo ""