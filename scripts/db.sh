#!/bin/bash

# Database management script for FM5

case "$1" in
  up)
    echo "Starting PostgreSQL database..."
    docker compose up -d postgres
    echo "Waiting for database to be ready..."
    until docker compose exec postgres pg_isready -U fm5_user -d fm5_dev >/dev/null 2>&1; do
      sleep 1
    done
    echo "Database is ready!"
    ;;
  down)
    echo "Stopping PostgreSQL database..."
    docker compose down
    ;;
  logs)
    docker compose logs postgres
    ;;
  shell)
    docker compose exec postgres psql -U fm5_user -d fm5_dev
    ;;
  reset)
    echo "Resetting database (this will delete all data)..."
    docker compose down -v
    docker compose up -d postgres
    ;;
  *)
    echo "Usage: $0 {up|down|logs|shell|reset}"
    echo "  up     - Start the database"
    echo "  down   - Stop the database"  
    echo "  logs   - Show database logs"
    echo "  shell  - Connect to database shell"
    echo "  reset  - Reset database (deletes all data)"
    exit 1
    ;;
esac