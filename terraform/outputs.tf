# Terraform Outputs for FM5 Infrastructure

# Network Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

# Load Balancer Outputs
output "load_balancer_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "load_balancer_zone_id" {
  description = "Zone ID of the load balancer"
  value       = aws_lb.main.zone_id
}

output "load_balancer_arn" {
  description = "ARN of the load balancer"
  value       = aws_lb.main.arn
}

# Database Outputs
output "database_endpoint" {
  description = "Database endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "database_port" {
  description = "Database port"
  value       = aws_db_instance.main.port
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}

output "database_username" {
  description = "Database username"
  value       = aws_db_instance.main.username
  sensitive   = true
}

output "database_password" {
  description = "Database password"
  value       = random_password.db_password.result
  sensitive   = true
}

# Redis Outputs
output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "redis_port" {
  description = "Redis port"
  value       = aws_elasticache_replication_group.main.port
}

# S3 Outputs
output "uploads_bucket_name" {
  description = "Name of the uploads S3 bucket"
  value       = aws_s3_bucket.uploads.bucket
}

output "uploads_bucket_arn" {
  description = "ARN of the uploads S3 bucket"
  value       = aws_s3_bucket.uploads.arn
}

output "logs_bucket_name" {
  description = "Name of the logs S3 bucket"
  value       = aws_s3_bucket.logs.bucket
}

# CloudFront Outputs
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

# Security Group Outputs
output "app_security_group_id" {
  description = "ID of the application security group"
  value       = aws_security_group.app.id
}

output "database_security_group_id" {
  description = "ID of the database security group"
  value       = aws_security_group.db.id
}

output "redis_security_group_id" {
  description = "ID of the Redis security group"
  value       = aws_security_group.redis.id
}

# SSL Certificate Outputs
output "ssl_certificate_arn" {
  description = "ARN of the SSL certificate"
  value       = aws_acm_certificate.main.arn
}

# IAM Outputs
output "ecs_execution_role_arn" {
  description = "ARN of the ECS execution role"
  value       = aws_iam_role.ecs_execution_role.arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task_role.arn
}

# Environment Variables for Application
output "environment_variables" {
  description = "Environment variables for the application"
  value = {
    DATABASE_URL = "postgresql://${aws_db_instance.main.username}:${random_password.db_password.result}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
    REDIS_URL    = "redis://${aws_elasticache_replication_group.main.primary_endpoint_address}:${aws_elasticache_replication_group.main.port}"
    S3_BUCKET    = aws_s3_bucket.uploads.bucket
    CDN_URL      = "https://${aws_cloudfront_distribution.main.domain_name}"
    NODE_ENV     = var.environment
  }
  sensitive = true
}

# Connection String for Database Migrations
output "database_connection_string" {
  description = "Database connection string for migrations"
  value       = "postgresql://${aws_db_instance.main.username}:${random_password.db_password.result}@${aws_db_instance.main.endpoint}:${aws_db_instance.main.port}/${aws_db_instance.main.db_name}"
  sensitive   = true
}

# Application URLs
output "application_url" {
  description = "Application URL"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_lb.main.dns_name}"
}

output "health_check_url" {
  description = "Health check URL"
  value       = "${var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_lb.main.dns_name}"}/api/health"
}

# Monitoring URLs
output "monitoring_urls" {
  description = "Monitoring and observability URLs"
  value = {
    cloudwatch_logs = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#logsV2:log-groups"
    cloudwatch_metrics = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#metricsV2:graph"
    rds_monitoring = "https://console.aws.amazon.com/rds/home?region=${var.aws_region}#database:id=${aws_db_instance.main.identifier};is-cluster=false"
  }
}

# Cost Estimation
output "estimated_monthly_cost" {
  description = "Estimated monthly cost breakdown (USD)"
  value = {
    rds_instance = var.db_instance_class == "db.t3.micro" ? "~$13" : "varies"
    elasticache  = var.redis_node_type == "cache.t3.micro" ? "~$15" : "varies"
    alb          = "~$16"
    nat_gateway  = "~$45 (per gateway)"
    s3_storage   = "~$0.023 per GB"
    cloudfront   = "~$0.085 per GB"
    data_transfer = "~$0.09 per GB"
    note         = "Actual costs may vary based on usage patterns"
  }
}

# Deployment Information
output "deployment_info" {
  description = "Deployment information and next steps"
  value = {
    terraform_state_bucket = "fm5-terraform-state"
    terraform_lock_table   = "fm5-terraform-locks"
    aws_region            = var.aws_region
    environment           = var.environment
    next_steps = [
      "1. Configure DNS records if using custom domain",
      "2. Deploy application using ECS or container orchestration",
      "3. Run database migrations",
      "4. Configure monitoring and alerting",
      "5. Set up backup procedures",
      "6. Configure CI/CD pipeline secrets"
    ]
  }
}