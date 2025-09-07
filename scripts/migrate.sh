#!/bin/bash

# Database migration script for FM5

ENV=${1:-development}

case "$ENV" in
  development|dev)
    echo "Running migrations for development environment..."
    export DATABASE_URL="postgresql://fm5_user:fm5_password@localhost:5432/fm5_dev?schema=public"
    ;;
  test)
    echo "Running migrations for test environment..."
    export DATABASE_URL="postgresql://fm5_user:fm5_password@localhost:5432/fm5_test?schema=public"
    ;;
  staging)
    echo "Running migrations for staging environment..."
    if [ -z "$STAGING_DATABASE_URL" ]; then
      echo "Error: STAGING_DATABASE_URL environment variable not set"
      exit 1
    fi
    export DATABASE_URL="$STAGING_DATABASE_URL"
    ;;
  production)
    echo "Running migrations for production environment..."
    if [ -z "$PRODUCTION_DATABASE_URL" ]; then
      echo "Error: PRODUCTION_DATABASE_URL environment variable not set"
      exit 1
    fi
    export DATABASE_URL="$PRODUCTION_DATABASE_URL"
    ;;
  *)
    echo "Usage: $0 {development|test|staging|production}"
    echo "  development - Run migrations on local development database"
    echo "  test        - Run migrations on local test database"
    echo "  staging     - Run migrations on staging database (requires STAGING_DATABASE_URL)"
    echo "  production  - Run migrations on production database (requires PRODUCTION_DATABASE_URL)"
    exit 1
    ;;
esac

echo "Database URL: $DATABASE_URL"
echo "Generating Prisma client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy

echo "Migration completed for $ENV environment"