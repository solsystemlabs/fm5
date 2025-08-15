#!/bin/bash

# Database Backup Script for Production
# Creates automated backups with retention policy

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${S3_BACKUP_BUCKET:-}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Send notification to Slack
send_slack_notification() {
    local message="$1"
    local color="${2:-good}"
    
    if [[ -n "$SLACK_WEBHOOK" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"attachments\":[{\"color\":\"$color\",\"text\":\"$message\"}]}" \
            "$SLACK_WEBHOOK" || warn "Failed to send Slack notification"
    fi
}

# Create backup
create_backup() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="$BACKUP_DIR/fm5_backup_$timestamp.sql"
    
    log "Creating backup: $backup_file"
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Extract database connection details
    local db_url="$DATABASE_URL"
    local db_name=$(echo "$db_url" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    local db_host=$(echo "$db_url" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    local db_port=$(echo "$db_url" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    local db_user=$(echo "$db_url" | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
    
    export PGPASSWORD=$(echo "$db_url" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    
    # Create backup with custom format for better compression and selective restore
    if pg_dump -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" \
        --format=custom --verbose --clean --no-acl --no-owner -f "$backup_file"; then
        
        # Compress backup
        gzip "$backup_file"
        local compressed_file="${backup_file}.gz"
        
        log "Backup created and compressed: $compressed_file"
        
        # Upload to S3 if configured
        if [[ -n "$S3_BUCKET" ]]; then
            upload_to_s3 "$compressed_file"
        fi
        
        send_slack_notification "Database backup completed successfully: $(basename "$compressed_file")"
        
        return 0
    else
        error "Failed to create database backup"
    fi
}

# Upload backup to S3
upload_to_s3() {
    local backup_file="$1"
    local s3_key="backups/$(basename "$backup_file")"
    
    log "Uploading backup to S3: s3://$S3_BUCKET/$s3_key"
    
    if command -v aws >/dev/null 2>&1; then
        if aws s3 cp "$backup_file" "s3://$S3_BUCKET/$s3_key"; then
            log "Backup uploaded to S3 successfully"
        else
            warn "Failed to upload backup to S3"
        fi
    else
        warn "AWS CLI not installed, skipping S3 upload"
    fi
}

# Clean up old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    
    # Clean local backups
    find "$BACKUP_DIR" -name "fm5_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # Clean S3 backups if configured
    if [[ -n "$S3_BUCKET" ]] && command -v aws >/dev/null 2>&1; then
        local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)
        aws s3 ls "s3://$S3_BUCKET/backups/" | while read -r line; do
            local file_date=$(echo "$line" | awk '{print $1}')
            local file_name=$(echo "$line" | awk '{print $4}')
            
            if [[ "$file_date" < "$cutoff_date" ]]; then
                log "Deleting old S3 backup: $file_name"
                aws s3 rm "s3://$S3_BUCKET/backups/$file_name"
            fi
        done
    fi
    
    log "Cleanup completed"
}

# Verify backup integrity
verify_backup() {
    local backup_file="$1"
    
    log "Verifying backup integrity: $backup_file"
    
    # Decompress temporarily for verification
    local temp_file="/tmp/backup_verify_$$.sql"
    gunzip -c "$backup_file" > "$temp_file"
    
    # Check if backup is valid SQL
    if file "$temp_file" | grep -q "ASCII text"; then
        log "Backup verification passed"
        rm "$temp_file"
        return 0
    else
        error "Backup verification failed"
        rm "$temp_file"
        return 1
    fi
}

# Main execution
main() {
    log "Starting backup process..."
    
    # Check if DATABASE_URL is set
    if [[ -z "${DATABASE_URL:-}" ]]; then
        error "DATABASE_URL environment variable is not set"
    fi
    
    # Create backup
    if create_backup; then
        # Find the latest backup file
        local latest_backup=$(find "$BACKUP_DIR" -name "fm5_backup_*.sql.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
        
        if [[ -n "$latest_backup" ]]; then
            verify_backup "$latest_backup"
        fi
        
        # Cleanup old backups
        cleanup_old_backups
        
        log "Backup process completed successfully"
    else
        send_slack_notification "Database backup failed!" "danger"
        error "Backup process failed"
    fi
}

# Handle script termination
trap 'error "Backup script interrupted"' INT TERM

# Execute main function
main "$@"