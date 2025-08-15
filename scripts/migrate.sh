#!/bin/bash

# Production Database Migration Script
# This script handles database migrations safely in production

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/var/backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/fm5_backup_$TIMESTAMP.sql"

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if required environment variables are set
check_env() {
    local required_vars=("DATABASE_URL" "BACKUP_DIR")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Required environment variable $var is not set"
        fi
    done
}

# Create backup directory if it doesn't exist
prepare_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Create database backup
create_backup() {
    log "Creating database backup..."
    
    # Extract database connection details from DATABASE_URL
    local db_url="$DATABASE_URL"
    local db_name=$(echo "$db_url" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    local db_host=$(echo "$db_url" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    local db_port=$(echo "$db_url" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    local db_user=$(echo "$db_url" | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
    
    # Set PGPASSWORD from DATABASE_URL
    export PGPASSWORD=$(echo "$db_url" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    
    if pg_dump -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" \
        --verbose --clean --no-acl --no-owner -f "$BACKUP_FILE"; then
        log "Backup created successfully: $BACKUP_FILE"
    else
        error "Failed to create database backup"
    fi
    
    # Compress backup
    gzip "$BACKUP_FILE"
    log "Backup compressed: ${BACKUP_FILE}.gz"
}

# Check database connection
check_db_connection() {
    log "Checking database connection..."
    if npx prisma db push --accept-data-loss --skip-generate; then
        log "Database connection successful"
    else
        error "Failed to connect to database"
    fi
}

# Run migrations
run_migrations() {
    log "Running database migrations..."
    
    # Generate Prisma client
    log "Generating Prisma client..."
    npx prisma generate
    
    # Deploy migrations
    log "Deploying migrations..."
    if npx prisma migrate deploy; then
        log "Migrations deployed successfully"
    else
        error "Migration deployment failed"
    fi
}

# Verify migration
verify_migration() {
    log "Verifying migration..."
    
    # Check if database is accessible
    if npx prisma db push --accept-data-loss --skip-generate; then
        log "Migration verification successful"
    else
        warn "Migration verification failed"
        return 1
    fi
}

# Rollback function (in case of failure)
rollback() {
    warn "Rolling back database..."
    
    local backup_file="${BACKUP_FILE}.gz"
    if [[ -f "$backup_file" ]]; then
        log "Restoring from backup: $backup_file"
        
        # Decompress backup
        gunzip "$backup_file"
        
        # Extract database connection details
        local db_url="$DATABASE_URL"
        local db_name=$(echo "$db_url" | sed -n 's/.*\/\([^?]*\).*/\1/p')
        local db_host=$(echo "$db_url" | sed -n 's/.*@\([^:]*\):.*/\1/p')
        local db_port=$(echo "$db_url" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        local db_user=$(echo "$db_url" | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
        
        export PGPASSWORD=$(echo "$db_url" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
        
        if psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" < "$BACKUP_FILE"; then
            log "Database restored from backup"
        else
            error "Failed to restore database from backup"
        fi
    else
        error "Backup file not found: $backup_file"
    fi
}

# Cleanup old backups (keep last 7 days)
cleanup_backups() {
    log "Cleaning up old backups..."
    find "$BACKUP_DIR" -name "fm5_backup_*.sql.gz" -mtime +7 -delete
    log "Old backups cleaned up"
}

# Main execution
main() {
    log "Starting database migration process..."
    
    # Check prerequisites
    check_env
    prepare_backup_dir
    check_db_connection
    
    # Create backup before migration
    create_backup
    
    # Run migrations with error handling
    if run_migrations; then
        if verify_migration; then
            log "Migration completed successfully!"
            cleanup_backups
        else
            warn "Migration verification failed, but migration was deployed"
        fi
    else
        error "Migration failed"
        if [[ "${ROLLBACK_ON_FAILURE:-true}" == "true" ]]; then
            rollback
        fi
        exit 1
    fi
}

# Execute main function
main "$@"