#!/bin/bash

# FM5 Secret Management Script
# Automatically manages Cloudflare Workers secrets for staging and production environments
# Usage: ./scripts/manage-secrets.sh <action> <environment>
#   action: push, pull, list, delete
#   environment: staging, production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory for relative paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to display usage
usage() {
    echo -e "${BLUE}FM5 Secret Management Script${NC}"
    echo ""
    echo "Usage: $0 <action> <environment>"
    echo ""
    echo "Actions:"
    echo -e "  ${GREEN}push${NC}     - Push secrets from .env.<environment> to Cloudflare Workers"
    echo -e "  ${GREEN}pull${NC}     - Pull secrets from Cloudflare Workers (display only)"
    echo -e "  ${GREEN}list${NC}     - List all secrets in the environment"
    echo -e "  ${GREEN}delete${NC}   - Delete a specific secret from the environment"
    echo ""
    echo "Environments:"
    echo -e "  ${GREEN}staging${NC}      - Uses .env.staging file"
    echo -e "  ${GREEN}production${NC}   - Uses .env.production file"
    echo ""
    echo "Examples:"
    echo "  $0 push staging"
    echo "  $0 list production"
    echo "  $0 delete staging JWT_SECRET"
    echo ""
    exit 1
}

# Function to check if required tools are installed
check_dependencies() {
    if ! command -v wrangler &> /dev/null; then
        echo -e "${RED}Error: wrangler CLI is not installed${NC}"
        echo "Please install with: npm install -g wrangler"
        exit 1
    fi
}

# Function to validate environment
validate_environment() {
    local env="$1"
    if [[ "$env" != "staging" && "$env" != "production" ]]; then
        echo -e "${RED}Error: Invalid environment '$env'${NC}"
        echo "Valid environments: staging, production"
        exit 1
    fi

    local env_file="$PROJECT_ROOT/.env.$env"
    if [[ ! -f "$env_file" ]]; then
        echo -e "${RED}Error: Environment file '$env_file' not found${NC}"
        exit 1
    fi
}

# Function to load environment variables from file
load_env_file() {
    local env="$1"
    local env_file="$PROJECT_ROOT/.env.$env"

    echo -e "${BLUE}Loading environment variables from $env_file${NC}"

    # Read the .env file and extract key-value pairs (ignore comments and empty lines)
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue

        # Remove leading/trailing whitespace
        key=$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        value=$(echo "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

        # Remove quotes from value if present
        value=$(echo "$value" | sed 's/^"//;s/"$//')

        # Store in associative array
        ENV_VARS["$key"]="$value"
    done < "$env_file"
}

# Function to push secrets to Cloudflare Workers
push_secrets() {
    local env="$1"

    echo -e "${BLUE}Pushing secrets to $env environment...${NC}"

    # Define secrets that should be pushed to Cloudflare Workers
    local secrets=(
        "JWT_SECRET"
        "BETTER_AUTH_SECRET"
        "BETTER_AUTH_URL"
        "RESEND_API_KEY"
        "XATA_API_KEY"
        "XATA_DATABASE_URL"
    )

    local success_count=0
    local total_count=${#secrets[@]}

    for secret in "${secrets[@]}"; do
        if [[ -n "${ENV_VARS[$secret]}" ]]; then
            echo -e "${YELLOW}Setting $secret...${NC}"
            if echo "${ENV_VARS[$secret]}" | wrangler secret put "$secret" --env "$env" >/dev/null 2>&1; then
                echo -e "${GREEN}✓ $secret set successfully${NC}"
                ((success_count++))
            else
                echo -e "${RED}✗ Failed to set $secret${NC}"
            fi
        else
            echo -e "${YELLOW}⚠ $secret not found in .env.$env, skipping${NC}"
        fi
    done

    echo ""
    echo -e "${BLUE}Summary:${NC}"
    echo -e "${GREEN}Successfully set: $success_count/$total_count secrets${NC}"

    if [[ $success_count -eq $total_count ]]; then
        echo -e "${GREEN}✓ All secrets pushed successfully to $env environment${NC}"
    else
        echo -e "${YELLOW}⚠ Some secrets failed to push. Check the output above.${NC}"
        exit 1
    fi
}

# Function to list secrets in Cloudflare Workers
list_secrets() {
    local env="$1"

    echo -e "${BLUE}Listing secrets in $env environment...${NC}"
    wrangler secret list --env "$env"
}

# Function to delete a specific secret
delete_secret() {
    local env="$1"
    local secret_name="$2"

    if [[ -z "$secret_name" ]]; then
        echo -e "${RED}Error: Secret name is required for delete action${NC}"
        echo "Usage: $0 delete <environment> <secret_name>"
        exit 1
    fi

    echo -e "${YELLOW}Deleting secret '$secret_name' from $env environment...${NC}"
    if wrangler secret delete "$secret_name" --env "$env"; then
        echo -e "${GREEN}✓ Secret '$secret_name' deleted successfully${NC}"
    else
        echo -e "${RED}✗ Failed to delete secret '$secret_name'${NC}"
        exit 1
    fi
}

# Function to display current secrets (without values for security)
pull_secrets() {
    local env="$1"

    echo -e "${BLUE}Current secrets in $env environment:${NC}"
    echo -e "${YELLOW}(Values are not displayed for security)${NC}"
    echo ""

    # List secrets using wrangler
    list_secrets "$env"

    echo ""
    echo -e "${BLUE}To view the actual values, check your .env.$env file locally.${NC}"
}

# Main script logic
main() {
    local action="$1"
    local env="$2"
    local extra_arg="$3"

    # Show usage if no arguments provided
    if [[ $# -eq 0 ]]; then
        usage
    fi

    # Validate action
    case "$action" in
        push|pull|list|delete)
            ;;
        *)
            echo -e "${RED}Error: Invalid action '$action'${NC}"
            usage
            ;;
    esac

    # Check dependencies
    check_dependencies

    # Validate environment
    if [[ -z "$env" ]]; then
        echo -e "${RED}Error: Environment is required${NC}"
        usage
    fi
    validate_environment "$env"

    # Declare associative array for environment variables
    declare -A ENV_VARS

    # Load environment variables for push action
    if [[ "$action" == "push" ]]; then
        load_env_file "$env"
    fi

    # Execute the requested action
    case "$action" in
        push)
            push_secrets "$env"
            ;;
        pull)
            pull_secrets "$env"
            ;;
        list)
            list_secrets "$env"
            ;;
        delete)
            delete_secret "$env" "$extra_arg"
            ;;
    esac

    echo ""
    echo -e "${GREEN}✓ Operation completed successfully${NC}"
}

# Run main function with all arguments
main "$@"