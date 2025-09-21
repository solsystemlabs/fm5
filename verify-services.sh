#!/bin/bash

echo "🔍 Verifying Docker Development Environment"
echo "=========================================="

# Check if Docker Compose services are running
echo "📋 Checking service status..."
docker compose ps

echo ""
echo "🐘 Testing PostgreSQL connection..."
docker exec fm5_postgres psql -U printmgmt_user -d printmgmt_dev -c "SELECT 'PostgreSQL is ready!' as status;"

echo ""
echo "🔴 Testing Redis connection..."
docker exec fm5_redis redis-cli ping

echo ""
echo "📦 Testing MinIO health..."
if curl -f -s http://localhost:9000/minio/health/live > /dev/null; then
    echo "MinIO is healthy!"
else
    echo "MinIO health check failed"
fi

echo ""
echo "🔍 Testing extensions..."
docker exec fm5_postgres psql -U printmgmt_user -d printmgmt_dev -c "SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'pg_stat_statements');"

echo ""
echo "✅ All services verified successfully!"
echo "Access points:"
echo "  - PostgreSQL: localhost:5432 (printmgmt_dev/printmgmt_user)"
echo "  - Redis: localhost:6379"
echo "  - MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"
echo "  - MinIO API: http://localhost:9000"