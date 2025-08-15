# FM5 Application Deployment Guide

This document provides comprehensive instructions for deploying the FM5 3D printing filament management application to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Infrastructure as Code](#infrastructure-as-code)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring and Logging](#monitoring-and-logging)
- [Security Configuration](#security-configuration)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- **Node.js** 20+ LTS
- **Docker** 24+ and Docker Compose v2
- **AWS CLI** v2 (for AWS deployment)
- **Terraform** 1.0+ (for infrastructure provisioning)
- **Git** 2.30+

### Required Accounts and Services

- GitHub account (for CI/CD)
- AWS account (for cloud deployment)
- Domain name (optional, for custom domain)
- Sentry account (for error tracking)
- Email service (SendGrid, Mailgun, etc.)

## Environment Setup

### Environment Variables

Create environment files based on the examples provided:

```bash
# Copy and customize environment files
cp .env.example .env.local
cp .env.production.example .env.production
```

### Required Environment Variables

#### Core Application
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
BETTER_AUTH_SECRET="your-32-character-secret-key"
BETTER_AUTH_URL="https://yourapp.com"
NODE_ENV="production"
```

#### Database Configuration
```env
DIRECT_URL="postgresql://user:password@host:5432/database"
DATABASE_CONNECTION_LIMIT=20
DATABASE_POOL_TIMEOUT=60000
```

#### Security
```env
CORS_ORIGINS="https://yourapp.com,https://www.yourapp.com"
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

#### File Storage
```env
S3_BUCKET="your-app-uploads"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_REGION="us-east-1"
```

#### Monitoring
```env
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"
LOG_LEVEL="info"
LOG_FORMAT="json"
```

## Local Development

### Using Docker Compose

1. **Start development environment:**
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

3. **Seed the database:**
   ```bash
   npm run db:seed
   ```

4. **Access the application:**
   - Application: http://localhost:3000
   - Database: localhost:5432
   - Redis: localhost:6379
   - MinIO: http://localhost:9001

### Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm run test
npm run test:e2e

# Build for production
npm run build

# Database operations
npx prisma migrate dev
npx prisma studio
npm run db:seed
```

## Production Deployment

### Option 1: Docker Deployment

#### Single Server Deployment

1. **Prepare the server:**
   ```bash
   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/fm5.git
   cd fm5
   ```

3. **Configure environment:**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your production values
   ```

4. **Deploy the application:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. **Run database migrations:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
   ```

#### Container Registry Deployment

1. **Build and push Docker image:**
   ```bash
   docker build -t your-registry/fm5:latest .
   docker push your-registry/fm5:latest
   ```

2. **Deploy to your container orchestration platform:**
   - Kubernetes: Use the manifests in `k8s/` directory
   - AWS ECS: Use the task definitions in `aws/` directory
   - Docker Swarm: Use the stack file in `docker/` directory

### Option 2: AWS Deployment with Terraform

#### Initial Setup

1. **Configure AWS CLI:**
   ```bash
   aws configure
   ```

2. **Create Terraform backend:**
   ```bash
   # Create S3 bucket for Terraform state
   aws s3 mb s3://fm5-terraform-state
   
   # Create DynamoDB table for state locking
   aws dynamodb create-table \
     --table-name fm5-terraform-locks \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
   ```

3. **Deploy infrastructure:**
   ```bash
   cd terraform
   terraform init
   terraform plan -var="environment=production"
   terraform apply -var="environment=production"
   ```

4. **Configure DNS (if using custom domain):**
   ```bash
   # Get ALB DNS name from Terraform output
   terraform output load_balancer_dns_name
   
   # Create CNAME record pointing your domain to the ALB
   ```

#### Environment-Specific Deployments

**Staging Environment:**
```bash
terraform workspace new staging
terraform apply -var="environment=staging" -var="db_instance_class=db.t3.micro"
```

**Production Environment:**
```bash
terraform workspace new production
terraform apply -var="environment=production" -var="db_instance_class=db.t3.small"
```

### Option 3: Platform-as-a-Service Deployment

#### Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Configure environment variables in Vercel dashboard**

#### Railway Deployment

1. **Connect your GitHub repository to Railway**
2. **Configure environment variables**
3. **Deploy automatically on push to main branch**

## Infrastructure as Code

### Terraform Modules

The Terraform configuration includes:

- **VPC and Networking**: Subnets, route tables, NAT gateways
- **Application Load Balancer**: HTTPS termination, health checks
- **ECS Fargate**: Container orchestration
- **RDS PostgreSQL**: Managed database with backups
- **ElastiCache Redis**: Session store and caching
- **S3 Buckets**: File uploads and static assets
- **CloudFront**: CDN for static content
- **Route53**: DNS management
- **ACM**: SSL certificate management
- **IAM**: Roles and policies
- **CloudWatch**: Logging and monitoring

### Terraform Commands

```bash
# Initialize Terraform
terraform init

# Plan changes
terraform plan -var-file="production.tfvars"

# Apply changes
terraform apply -var-file="production.tfvars"

# Destroy infrastructure (BE CAREFUL!)
terraform destroy -var-file="production.tfvars"

# Show current state
terraform show

# Import existing resources
terraform import aws_instance.example i-1234567890abcdef0
```

### Terraform Variables File (production.tfvars)

```hcl
environment = "production"
aws_region = "us-east-1"
domain_name = "yourapp.com"
db_instance_class = "db.t3.small"
redis_node_type = "cache.t3.small"
ecs_desired_capacity = 3
enable_deletion_protection = true
enable_monitoring = true
```

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline includes:

1. **Security Scan**: Trivy vulnerability scanning
2. **Testing**: Unit tests, integration tests, E2E tests
3. **Build**: Docker image build and push
4. **Deploy**: Automated deployment to staging/production

### Manual Deployment

If you need to deploy manually:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Build Docker image:**
   ```bash
   docker build -t fm5:latest .
   ```

3. **Push to registry:**
   ```bash
   docker tag fm5:latest your-registry/fm5:latest
   docker push your-registry/fm5:latest
   ```

4. **Deploy to target environment:**
   ```bash
   # Update ECS service
   aws ecs update-service --cluster fm5-production --service fm5-app --force-new-deployment
   
   # Or update Kubernetes deployment
   kubectl set image deployment/fm5-app app=your-registry/fm5:latest
   ```

### Rollback Procedure

```bash
# Get previous image tag
docker images your-registry/fm5

# Rollback to previous version
aws ecs update-service --cluster fm5-production --service fm5-app --task-definition fm5-app:PREVIOUS_REVISION

# Or for Kubernetes
kubectl rollout undo deployment/fm5-app
```

## Monitoring and Logging

### Health Checks

- **Application Health**: `/api/health`
- **Database Health**: Included in health endpoint
- **Metrics**: `/api/metrics` (Prometheus format)

### Monitoring Stack

1. **Prometheus**: Metrics collection
2. **Grafana**: Visualization and dashboards
3. **AlertManager**: Alert routing and management
4. **Sentry**: Error tracking and performance monitoring

### Log Aggregation

```bash
# View application logs
docker-compose logs -f app

# View specific service logs
kubectl logs -f deployment/fm5-app

# Search logs with grep
docker-compose logs app | grep ERROR
```

### Alert Configuration

Configure alerts for:
- Application downtime
- High error rates
- Database connection issues
- High memory/CPU usage
- Disk space low
- SSL certificate expiration

## Security Configuration

### SSL/TLS Setup

1. **Using Let's Encrypt:**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Obtain certificate
   sudo certbot --nginx -d yourapp.com -d www.yourapp.com
   ```

2. **Using AWS ACM:**
   - Certificates are automatically provisioned via Terraform
   - Automatic renewal included

### Security Headers

The NGINX configuration includes:
- HSTS (HTTP Strict Transport Security)
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

### Rate Limiting

- API endpoints: 100 requests per 15 minutes per IP
- Login endpoints: 5 attempts per 15 minutes per IP
- File uploads: 20 uploads per hour per IP

## Backup and Recovery

### Database Backups

1. **Automated backups:**
   ```bash
   # Run backup script
   ./scripts/backup.sh
   ```

2. **Manual backup:**
   ```bash
   pg_dump -h your-db-host -U username -d database_name > backup.sql
   ```

3. **Restore from backup:**
   ```bash
   psql -h your-db-host -U username -d database_name < backup.sql
   ```

### File Storage Backups

- S3 versioning enabled for file uploads
- Cross-region replication configured
- Lifecycle policies for cost optimization

### Disaster Recovery

1. **RTO (Recovery Time Objective)**: 4 hours
2. **RPO (Recovery Point Objective)**: 1 hour
3. **Backup retention**: 30 days for production

### Recovery Procedures

1. **Database recovery:**
   ```bash
   # Stop application
   docker-compose down
   
   # Restore database
   ./scripts/restore.sh backup_file.sql
   
   # Start application
   docker-compose up -d
   ```

2. **Full environment recovery:**
   ```bash
   # Recreate infrastructure
   cd terraform
   terraform apply
   
   # Deploy application
   docker-compose -f docker-compose.prod.yml up -d
   
   # Restore database
   ./scripts/restore.sh
   ```

## Troubleshooting

### Common Issues

#### Application Won't Start

1. **Check logs:**
   ```bash
   docker-compose logs app
   ```

2. **Verify environment variables:**
   ```bash
   docker-compose config
   ```

3. **Check database connectivity:**
   ```bash
   docker-compose exec app npx prisma db push
   ```

#### Database Connection Issues

1. **Check database status:**
   ```bash
   docker-compose ps postgres
   ```

2. **Test connection:**
   ```bash
   docker-compose exec postgres psql -U username -d database
   ```

3. **Verify network connectivity:**
   ```bash
   docker-compose exec app ping postgres
   ```

#### High Memory Usage

1. **Check container resources:**
   ```bash
   docker stats
   ```

2. **Analyze memory leaks:**
   ```bash
   # Enable Node.js memory profiling
   NODE_OPTIONS="--max-old-space-size=4096" npm start
   ```

#### SSL Certificate Issues

1. **Check certificate expiration:**
   ```bash
   openssl x509 -in /etc/ssl/certs/domain.crt -text -noout
   ```

2. **Renew Let's Encrypt certificate:**
   ```bash
   sudo certbot renew
   ```

### Performance Tuning

#### Database Optimization

```sql
-- Check slow queries
SELECT query, mean_time, calls, total_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Analyze table statistics
ANALYZE;

-- Update query planner statistics
VACUUM ANALYZE;
```

#### Application Performance

1. **Enable compression:**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **Optimize Docker images:**
   ```dockerfile
   # Use multi-stage builds
   # Minimize layers
   # Use specific base image tags
   ```

### Contact and Support

- **Development Team**: dev@yourcompany.com
- **Operations Team**: ops@yourcompany.com
- **Emergency Contact**: +1-555-0123

### Additional Resources

- [Application Documentation](./README.md)
- [API Documentation](./API.md)
- [Security Guidelines](./SECURITY.md)
- [Contributing Guidelines](./CONTRIBUTING.md)